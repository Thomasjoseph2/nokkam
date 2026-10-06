import { RefreshSession } from './refresh-session';

const GRACE = 30_000;
const t0 = new Date('2026-10-01T10:00:00Z');
const at = (ms: number) => new Date(t0.getTime() + ms);

function issue() {
  return RefreshSession.issue({
    id: 's1',
    familyId: 'f1',
    userId: 'u1',
    tokenHash: 'h',
    now: t0,
    ttlMs: 60_000 * 60,
    userAgent: null,
    ip: null,
  });
}

describe('RefreshSession.stateAt', () => {
  it('is ACTIVE before expiry', () => {
    expect(issue().stateAt(at(1000), GRACE)).toBe('ACTIVE');
  });

  it('is EXPIRED at or after expiresAt', () => {
    expect(issue().stateAt(at(60_000 * 60), GRACE)).toBe('EXPIRED');
  });

  it('accepts a rotated token within the grace window, flags reuse after it', () => {
    const rotated = RefreshSession.restore({ ...issue().toProps(), rotatedAt: at(1000) });
    expect(rotated.stateAt(at(1000 + GRACE), GRACE)).toBe('ROTATED_IN_GRACE');
    expect(rotated.stateAt(at(1001 + GRACE), GRACE)).toBe('REUSED');
  });

  it('reports REVOKED regardless of other state', () => {
    const revoked = RefreshSession.restore({
      ...issue().toProps(),
      rotatedAt: at(1),
      revokedAt: at(2),
      revokedReason: 'LOGOUT',
    });
    expect(revoked.stateAt(at(3), GRACE)).toBe('REVOKED');
  });
});
