import { format } from '../format.ts';
import { describe, expect, test } from 'vitest';

describe('foramt()', () => {
  test('should format succesful', () => {
    const krwShort = format('KRW', '', { krwShortUnits: true });
    expect(krwShort(100_040_000)).toBe('₩ 1억 4만');
    expect(krwShort(240_000)).toBe('₩ 24만');
    expect(krwShort(243_000)).toBe('₩ 24.3만');
    expect(krwShort(43_000)).toBe('₩ 43,000');
    expect(krwShort(3000)).toBe('₩ 3,000');
  });
});
