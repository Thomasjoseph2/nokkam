import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { FilterQuery, Model } from 'mongoose';
import { ConcurrentModificationError } from '../../../shared/application/errors';
import type { Email } from '../../../shared/domain/email';
import { decodeCursor, encodeCursor } from '../../../shared/infrastructure/database/cursor';
import { isDuplicateKeyError } from '../../../shared/infrastructure/database/mongo-errors';
import { MongoSessionContext } from '../../../shared/infrastructure/database/mongo-session-context';
import { User } from '../domain/user';
import { EmailAlreadyRegisteredError } from '../domain/user.errors';
import { type UserPage, UserRepository } from '../domain/user.repository';
import { UserMapper } from './user.mapper';
import { USER_MODEL, type UserRecord } from './user.schema';

@Injectable()
export class MongoUserRepository extends UserRepository {
  constructor(@InjectModel(USER_MODEL) private readonly model: Model<UserRecord>) {
    super();
  }

  async findById(id: string): Promise<User | null> {
    const record = await this.model
      .findById(id)
      .session(MongoSessionContext.current() ?? null)
      .lean<UserRecord>()
      .exec();
    return record ? UserMapper.toDomain(record) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const record = await this.model
      .findOne({ email: email.value })
      .session(MongoSessionContext.current() ?? null)
      .lean<UserRecord>()
      .exec();
    return record ? UserMapper.toDomain(record) : null;
  }

  async insert(user: User): Promise<void> {
    try {
      await this.model.create([UserMapper.toRecord(user)], {
        session: MongoSessionContext.current(),
      });
    } catch (error) {
      if (isDuplicateKeyError(error, 'email')) throw new EmailAlreadyRegisteredError();
      throw error;
    }
  }

  async update(user: User): Promise<void> {
    const { _id, version, ...fields } = UserMapper.toRecord(user);
    const result = await this.model
      .updateOne({ _id, version }, { $set: fields, $inc: { version: 1 } })
      .session(MongoSessionContext.current() ?? null)
      .exec();
    if (result.matchedCount === 0) throw new ConcurrentModificationError('User');
  }

  async list(params: { limit: number; cursor?: string }): Promise<UserPage> {
    const filter: FilterQuery<UserRecord> = {};
    const cursor = params.cursor ? decodeCursor(params.cursor) : null;
    if (cursor) {
      filter.$or = [
        { createdAt: { $lt: cursor.createdAt } },
        { createdAt: cursor.createdAt, _id: { $lt: cursor.id } },
      ];
    }
    const records = await this.model
      .find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(params.limit + 1)
      .lean<UserRecord[]>()
      .exec();

    const hasMore = records.length > params.limit;
    const page = hasMore ? records.slice(0, params.limit) : records;
    const last = page.at(-1);
    return {
      items: page.map((record) => UserMapper.toDomain(record)),
      nextCursor:
        hasMore && last ? encodeCursor({ createdAt: last.createdAt, id: last._id }) : null,
    };
  }
}
