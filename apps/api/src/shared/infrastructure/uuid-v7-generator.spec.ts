import { uuidv7 } from './uuid-v7-generator';

describe('uuidv7', () => {
  it('produces RFC 9562 version 7 identifiers', () => {
    expect(uuidv7()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it('is time-ordered across milliseconds', () => {
    const earlier = uuidv7(1_700_000_000_000);
    const later = uuidv7(1_700_000_000_001);
    expect(earlier < later).toBe(true);
  });

  it('is unique within the same millisecond', () => {
    const ids = new Set(Array.from({ length: 1000 }, () => uuidv7(1_700_000_000_000)));
    expect(ids.size).toBe(1000);
  });
});
