import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { SkipThrottle } from '@nestjs/throttler';
import { type Connection, ConnectionStates } from 'mongoose';
import { Public } from '../../shared/presentation/http/decorators/public.decorator';

@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Public()
  @SkipThrottle()
  @Get()
  async check(): Promise<{ status: 'ok'; database: 'up' }> {
    if (this.connection.readyState !== ConnectionStates.connected || !this.connection.db) {
      throw new ServiceUnavailableException('Database unavailable');
    }
    await this.connection.db.admin().ping();
    return { status: 'ok', database: 'up' };
  }
}
