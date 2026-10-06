import { Controller, Get, Query } from '@nestjs/common';
import type { AdminUserSummaryDto, CursorPageMeta } from '@nokkam/shared-types';
import { z } from 'zod';
import { UserRole } from '../../../shared/domain/user-role';
import { Roles } from '../../../shared/presentation/http/decorators/roles.decorator';
import { Envelope } from '../../../shared/presentation/http/interceptors/response-envelope.interceptor';
import { ZodValidationPipe } from '../../../shared/presentation/http/pipes/zod-validation.pipe';
import { UserPresenter } from '../../users/presentation/user.presenter';
import { ListUsersUseCase } from '../application/list-users.use-case';

const listUsersQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(25),
  cursor: z.string().max(200).optional(),
});

@Controller('admin/users')
@Roles(UserRole.ADMIN)
export class AdminUsersController {
  constructor(private readonly listUsers: ListUsersUseCase) {}

  @Get()
  async list(
    @Query(new ZodValidationPipe(listUsersQuery)) query: z.infer<typeof listUsersQuery>,
  ): Promise<Envelope<AdminUserSummaryDto[], CursorPageMeta>> {
    const page = await this.listUsers.execute(query);
    return new Envelope(page.items.map(UserPresenter.toAdminSummary), {
      nextCursor: page.nextCursor,
    });
  }
}
