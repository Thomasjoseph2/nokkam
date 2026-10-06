import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { MongoSessionContext } from '../../../shared/infrastructure/database/mongo-session-context';
import { RefreshSession, type SessionRevocationReason } from '../domain/refresh-session';
import { RefreshSessionRepository } from '../domain/refresh-session.repository';
import { REFRESH_SESSION_MODEL, type RefreshSessionRecord } from './refresh-session.schema';

@Injectable()
export class MongoRefreshSessionRepository extends RefreshSessionRepository {
  constructor(
    @InjectModel(REFRESH_SESSION_MODEL) private readonly model: Model<RefreshSessionRecord>,
  ) {
    super();
  }

  async insert(session: RefreshSession): Promise<void> {
    const { id, ...rest } = session.toProps();
    await this.model.create([{ _id: id, ...rest }], { session: MongoSessionContext.current() });
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshSession | null> {
    const record = await this.model
      .findOne({ tokenHash })
      .session(MongoSessionContext.current() ?? null)
      .lean<RefreshSessionRecord>()
      .exec();
    if (!record) return null;
    const { _id, ...rest } = record;
    return RefreshSession.restore({ id: _id, ...rest });
  }

  async markRotated(id: string, now: Date): Promise<boolean> {
    const result = await this.model
      .updateOne({ _id: id, rotatedAt: null, revokedAt: null }, { $set: { rotatedAt: now } })
      .session(MongoSessionContext.current() ?? null)
      .exec();
    return result.modifiedCount === 1;
  }

  async revokeFamily(familyId: string, reason: SessionRevocationReason, now: Date): Promise<void> {
    await this.model
      .updateMany(
        { familyId, revokedAt: null },
        { $set: { revokedAt: now, revokedReason: reason } },
      )
      .session(MongoSessionContext.current() ?? null)
      .exec();
  }

  async revokeAllForUser(
    userId: string,
    reason: SessionRevocationReason,
    now: Date,
  ): Promise<void> {
    await this.model
      .updateMany({ userId, revokedAt: null }, { $set: { revokedAt: now, revokedReason: reason } })
      .session(MongoSessionContext.current() ?? null)
      .exec();
  }
}
