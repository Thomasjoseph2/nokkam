import { InvalidValueError } from './errors';

// Pragmatic check; full RFC 5322 validation is not worth it. Deliverability is proven by verification.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Normalised (trimmed, lower-cased) email address. */
export class Email {
  private constructor(readonly value: string) {}

  static create(raw: string): Email {
    const normalised = raw.trim().toLowerCase();
    if (normalised.length > 254 || !EMAIL_PATTERN.test(normalised)) {
      throw new InvalidValueError('Invalid email address', [{ path: 'email', message: 'Invalid' }]);
    }
    return new Email(normalised);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
