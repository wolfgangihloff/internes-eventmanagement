import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../../src/lib/password.js';

describe('password', () => {
  it('should hash and verify a password', async () => {
    const password = 'sicheres-passwort-123';
    const hashed = await hashPassword(password);

    expect(hashed).not.toBe(password);
    expect(hashed.length).toBeGreaterThan(0);

    const valid = await verifyPassword(hashed, password);
    expect(valid).toBe(true);
  });

  it('should reject wrong password', async () => {
    const hashed = await hashPassword('richtig');
    const valid = await verifyPassword(hashed, 'falsch');
    expect(valid).toBe(false);
  });

  it('should produce different hashes for same password', async () => {
    const password = 'test-password';
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);
    expect(hash1).not.toBe(hash2);
  });
});
