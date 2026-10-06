import { Injectable } from '@nestjs/common';
import type { Actor } from '../../../shared/application/actor';
import { NotFoundError } from '../../../shared/application/errors';
import { UserRepository } from '../../users/domain/user.repository';
import { EmailVerificationSender } from './email-verification-sender';

@Injectable()
export class ResendVerificationEmailUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly verification: EmailVerificationSender,
  ) {}

  async execute(actor: Actor): Promise<void> {
    const user = await this.users.findById(actor.userId);
    if (!user) throw new NotFoundError('User');
    if (user.isEmailVerified) return;
    await this.verification.send(user);
  }
}
