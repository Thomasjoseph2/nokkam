import type {
  AuthSessionDto,
  CurrentUserDto,
  LoginRequest,
  RegisterRequest,
} from '@nokkam/shared-types';
import { apiFetch } from '@/lib/api/client';

export const authApi = {
  register: (body: RegisterRequest) =>
    apiFetch<AuthSessionDto>('/auth/register', { method: 'POST', body, skipRefresh: true }),
  login: (body: LoginRequest) =>
    apiFetch<AuthSessionDto>('/auth/login', { method: 'POST', body, skipRefresh: true }),
  logout: () => apiFetch<void>('/auth/logout', { method: 'POST', skipRefresh: true }),
  verifyEmail: (token: string) =>
    apiFetch<CurrentUserDto>('/auth/verify-email', {
      method: 'POST',
      body: { token },
      skipRefresh: true,
    }),
  resendVerification: () => apiFetch<void>('/auth/verify-email/resend', { method: 'POST' }),
};
