import { describe, it, expect } from 'vitest';
import { parseMagazineQuery, sanitizeToken } from '../validate-params.js';

describe('validate-params', () => {
  it('sanitizes valid tokens', () => {
    expect(sanitizeToken('abc-123')).toBe('abc-123');
  });

  it('rejects invalid query params', () => {
    expect(() => parseMagazineQuery({ category: 'bad value' })).toThrow('Invalid query parameter(s): category');
  });
});
