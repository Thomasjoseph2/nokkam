import { z } from 'zod';
import { RegistrableAccountType, type UserRole, type UserStatus } from './roles';

export const PASSWORD_MIN_LENGTH = 10;
export const PASSWORD_MAX_LENGTH = 128;

const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ message: 'Enter a valid email address' }).max(254));

const password = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(PASSWORD_MAX_LENGTH, `Password must be at most ${PASSWORD_MAX_LENGTH} characters`);

export const registerRequestSchema = z.object({
  email,
  password,
  displayName: z.string().trim().min(2, 'Name is too short').max(60, 'Name is too long'),
  accountType: z.enum([RegistrableAccountType.TESTER, RegistrableAccountType.BUSINESS_OWNER]),
});
export type RegisterRequest = z.infer<typeof registerRequestSchema>;

export const loginRequestSchema = z.object({
  email,
  // Do not enforce the password policy at login: policies change, old passwords must still work.
  password: z.string().min(1, 'Password is required').max(PASSWORD_MAX_LENGTH),
});
export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const verifyEmailRequestSchema = z.object({
  token: z.string().min(16).max(256),
});
export type VerifyEmailRequest = z.infer<typeof verifyEmailRequestSchema>;

/** The authenticated user's own view of their account. */
export interface CurrentUserDto {
  id: string;
  email: string;
  displayName: string;
  roles: UserRole[];
  status: UserStatus;
  emailVerified: boolean;
  createdAt: string;
}

export interface AuthSessionDto {
  user: CurrentUserDto;
  /** ISO timestamp when the access token expires. Tokens themselves live in HTTP-only cookies. */
  accessTokenExpiresAt: string;
}
