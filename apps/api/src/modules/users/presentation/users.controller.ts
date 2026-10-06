import { Controller, Get } from '@nestjs/common';
import type { CurrentUserDto } from '@nokkam/shared-types';
import type { Actor } from '../../../shared/application/actor';
import { CurrentActor } from '../../../shared/presentation/http/decorators/current-actor.decorator';
import { GetCurrentUserUseCase } from '../application/get-current-user.use-case';
import { UserPresenter } from './user.presenter';

@Controller('users')
export class UsersController {
  constructor(private readonly getCurrentUser: GetCurrentUserUseCase) {}

  @Get('me')
  async me(@CurrentActor() actor: Actor): Promise<CurrentUserDto> {
    return UserPresenter.toCurrentUser(await this.getCurrentUser.execute(actor));
  }
}
