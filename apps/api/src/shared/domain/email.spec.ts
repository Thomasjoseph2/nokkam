import { Email } from './email';
import { InvalidValueError } from './errors';

describe('Email', () => {
  it('normalises case and whitespace', () => {
    expect(Email.create('  Asha@Example.COM ').value).toBe('asha@example.com');
  });

  it.each(['', 'no-at-sign', 'a@b', 'two@@example.com', 'spa ce@example.com'])(
    'rejects %p',
    (raw) => {
      expect(() => Email.create(raw)).toThrow(InvalidValueError);
    },
  );

  it('compares by normalised value', () => {
    expect(Email.create('A@x.io').equals(Email.create('a@X.io'))).toBe(true);
  });
});
