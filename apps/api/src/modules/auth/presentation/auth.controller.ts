import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import {
  type AuthSessionDto,
  type CurrentUserDto,
  type LoginRequest,
  loginRequestSchema,
  type RegisterRequest,
  registerRequestSchema,
  type VerifyEmailRequest,
  verifyEmailRequestSchema,
} from '@nokkam/shared-types';
import type { Actor, RequestMeta } from '../../../shared/application/actor';
import {
  CurrentActor,
  ReqMeta,
} from '../../../shared/presentation/http/decorators/current-actor.decorator';
import { Public } from '../../../shared/presentation/http/decorators/public.decorator';
import { ZodValidationPipe } from '../../../shared/presentation/http/pipes/zod-validation.pipe';
import { UserPresenter } from '../../users/presentation/user.presenter';
import { LoginUserUseCase } from '../application/login-user.use-case';
import { LogoutUseCase } from '../application/logout.use-case';
import { RefreshSessionUseCase } from '../application/refresh-session.use-case';
import type { AuthResult } from '../application/register-user.use-case';
import { RegisterUserUseCase } from '../application/register-user.use-case';
import { ResendVerificationEmailUseCase } from '../application/resend-verification-email.use-case';
import { VerifyEmailUseCase } from '../application/verify-email.use-case';
import { AuthCookies } from './auth-cookies';

/** Strict per-IP limits on credential endpoints (on top of the global limit). */
const CREDENTIALS_THROTTLE = { default: { limit: 10, ttl: 60_000 } };

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUser: RegisterUserUseCase,
    private readonly loginUser: LoginUserUseCase,
    private readonly refreshSession: RefreshSessionUseCase,
    private readonly logout: LogoutUseCase,
    private readonly verifyEmail: VerifyEmailUseCase,
    private readonly resendVerification: ResendVerificationEmailUseCase,
    private readonly cookies: AuthCookies,
  ) {}

  @Public()
  @Throttle(CREDENTIALS_THROTTLE)
  @Post('register')
  async register(
    @Body(new ZodValidationPipe(registerRequestSchema)) body: RegisterRequest,
    @ReqMeta() meta: RequestMeta,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthSessionDto> {
    return this.respond(res, await this.registerUser.execute(body, meta));
  }

  @Public()
  @Throttle(CREDENTIALS_THROTTLE)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(loginRequestSchema)) body: LoginRequest,
    @ReqMeta() meta: RequestMeta,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthSessionDto> {
    return this.respond(res, await this.loginUser.execute(body, meta));
  }

  @Public()
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @ReqMeta() meta: RequestMeta,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthSessionDto> {
    try {
      return this.respond(
        res,
        await this.refreshSession.execute(this.cookies.readRefreshToken(req), meta),
      );
    } catch (error) {
      this.cookies.clear(res);
      throw error;
    }
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async signOut(
    @Req() req: Request,
    @ReqMeta() meta: RequestMeta,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.logout.execute(this.cookies.readRefreshToken(req), meta);
    this.cookies.clear(res);
  }

  @Public()
  @Throttle(CREDENTIALS_THROTTLE)
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verify(
    @Body(new ZodValidationPipe(verifyEmailRequestSchema)) body: VerifyEmailRequest,
    @ReqMeta() meta: RequestMeta,
  ): Promise<CurrentUserDto> {
    return UserPresenter.toCurrentUser(await this.verifyEmail.execute(body.token, meta));
  }

  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('verify-email/resend')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resend(@CurrentActor() actor: Actor): Promise<void> {
    await this.resendVerification.execute(actor);
  }

  private respond(res: Response, result: AuthResult): AuthSessionDto {
    this.cookies.set(res, result.session);
    return {
      user: UserPresenter.toCurrentUser(result.user),
      accessTokenExpiresAt: result.session.accessTokenExpiresAt.toISOString(),
    };
  }
}
