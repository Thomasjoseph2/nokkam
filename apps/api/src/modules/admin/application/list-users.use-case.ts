import { Injectable } from '@nestjs/common';
import { UserRepository, type UserPage } from '../../users/domain/user.repository';

@Injectable()
export class ListUsersUseCase {
  constructor(private readonly users: UserRepository) {}

  execute(input: { limit: number; cursor?: string }): Promise<UserPage> {
    return this.users.list(input);
  }
}
