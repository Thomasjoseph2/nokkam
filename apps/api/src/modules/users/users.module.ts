import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GetCurrentUserUseCase } from './application/get-current-user.use-case';
import { UserRepository } from './domain/user.repository';
import { MongoUserRepository } from './infrastructure/mongo-user.repository';
import { USER_MODEL, UserSchema } from './infrastructure/user.schema';
import { UsersController } from './presentation/users.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: USER_MODEL, schema: UserSchema }])],
  controllers: [UsersController],
  providers: [GetCurrentUserUseCase, { provide: UserRepository, useClass: MongoUserRepository }],
  exports: [UserRepository],
})
export class UsersModule {}
