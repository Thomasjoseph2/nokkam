export interface AuditEntry {
  /** null for anonymous actions (e.g. failed login for unknown email). */
  actorId: string | null;
  /** Dot-namespaced action, e.g. "auth.login.succeeded". */
  action: string;
  resourceType?: string;
  resourceId?: string;
  /** Non-sensitive context only. Never put passwords, tokens or feedback text here. */
  metadata?: Record<string, string | number | boolean | null>;
  requestId?: string;
  ip?: string | null;
}

/** Append-only record of security- and business-relevant actions. */
export abstract class AuditLog {
  abstract record(entry: AuditEntry): Promise<void>;
}
