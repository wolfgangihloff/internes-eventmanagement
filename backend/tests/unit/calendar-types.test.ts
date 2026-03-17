import { describe, expect, it } from 'vitest';
import { CALENDAR_TYPES } from '../../src/domain/calendar-types.js';

describe('calendar types', () => {
  it('should use internal and customer calendar types', () => {
    expect(CALENDAR_TYPES).toEqual(['internal', 'customer']);
  });
});
