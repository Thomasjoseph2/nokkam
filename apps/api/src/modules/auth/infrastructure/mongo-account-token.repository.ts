import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { MongoSessionContext } from '../../../shared/infrastructure/database/mongo-session-context';
import { AccountToken, type AccountTokenPurpose } from '../domain/account-token';
import { AccountTokenRepository } from '../domain/account-token.repository';
import { ACCOUNT_TOKEN_MODEL, type AccountTokenRecord } from './account-token.schema';

@Injectable()
export class MongoAccountTokenRepository extends AccountTokenRepository {
  constructor(@InjectModel(ACCOUNT_TOKEN_MODEL) private readonly model: Model<AccountTokenRecord>) {
    super();
  }

  async insert(token: AccountToken): Promise<void> {
    const { id, ...rest } = token.toProps();
    await this.model.create([{ _id: id, ...rest }], { session: MongoSessionContext.current() });
  }

  async findByHash(tokenHash: string, purpose: AccountTokenPurpose): Promise<AccountToken | null> {
    const record = await this.model
      .findOne({ tokenHash, purpose })
      .session(MongoSessionContext.current() ?? null)
      .lean<AccountTokenRecord>()
      .exec();
    if (!record) return null;
    const { _id, ...rest } = record;
    return AccountToken.restore({ id: _id, ...rest });
  }

  async consume(id: string, now: Date): Promise<boolean> {
    const result = await this.model
      .updateOne({ _id: id, consumedAt: null }, { $set: { consumedAt: now } })
      .session(MongoSessionContext.current() ?? null)
      .exec();
    return result.modifiedCount === 1;
  }

  async deleteOutstanding(userId: string, purpose: AccountTokenPurpose): Promise<void> {
    await this.model
      .deleteMany({ userId, purpose, consumedAt: null })
      .session(MongoSessionContext.current() ?? null)
      .exec();
  }
}
