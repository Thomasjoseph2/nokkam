import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { ListUsersUseCase } from './application/list-users.use-case';
import { AdminUsersController } from './presentation/admin-users.controller';

/** Platform administration. Every controller here is restricted with @Roles(ADMIN). */
@Module({
  imports: [UsersModule],
  controllers: [AdminUsersController],
  providers: [ListUsersUseCase],
})
export class AdminModule {}
