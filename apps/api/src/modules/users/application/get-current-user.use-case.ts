import { Injectable } from '@nestjs/common';
import type { Actor } from '../../../shared/application/actor';
import { NotFoundError } from '../../../shared/application/errors';
import type { User } from '../domain/user';
import { UserRepository } from '../domain/user.repository';

@Injectable()
export class GetCurrentUserUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(actor: Actor): Promise<User> {
    const user = await this.users.findById(actor.userId);
    if (!user) throw new NotFoundError('User');
    return user;
  }
}
