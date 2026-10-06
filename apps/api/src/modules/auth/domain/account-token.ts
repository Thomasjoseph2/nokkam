export const AccountTokenPurpose = {
  EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
  // PASSWORD_RESET will reuse the same mechanism.
} as const;
export type AccountTokenPurpose = (typeof AccountTokenPurpose)[keyof typeof AccountTokenPurpose];

export interface AccountTokenProps {
  id: string;
  userId: string;
  purpose: AccountTokenPurpose;
  tokenHash: string;
  createdAt: Date;
  expiresAt: Date;
  consumedAt: Date | null;
}

/** Single-use, expiring token delivered out-of-band (email link). */
export class AccountToken {
  private constructor(private readonly props: AccountTokenProps) {}

  static issue(input: {
    id: string;
    userId: string;
    purpose: AccountTokenPurpose;
    tokenHash: string;
    now: Date;
    ttlMs: number;
  }): AccountToken {
    return new AccountToken({
      id: input.id,
      userId: input.userId,
      purpose: input.purpose,
      tokenHash: input.tokenHash,
      createdAt: input.now,
      expiresAt: new Date(input.now.getTime() + input.ttlMs),
      consumedAt: null,
    });
  }

  static restore(props: AccountTokenProps): AccountToken {
    return new AccountToken({ ...props });
  }

  get id(): string {
    return this.props.id;
  }
  get userId(): string {
    return this.props.userId;
  }

  isUsableAt(now: Date): boolean {
    return this.props.consumedAt === null && now.getTime() < this.props.expiresAt.getTime();
  }

  toProps(): Readonly<AccountTokenProps> {
    return { ...this.props };
  }
}
