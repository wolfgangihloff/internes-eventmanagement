import { describe, it, expect } from 'vitest';
import {
  signAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  hashToken,
} from '../../src/lib/jwt.js';

describe('jwt', () => {
  const payload = {
    sub: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    roles: ['employee'],
    sessionId: '123e4567-e89b-12d3-a456-426614174001',
  };

  it('should sign and verify an access token', async () => {
    const token = await signAccessToken(payload);
    expect(token).toBeTruthy();

    const decoded = await verifyAccessToken(token);
    expect(decoded.sub).toBe(payload.sub);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.roles).toEqual(payload.roles);
    expect(decoded.sessionId).toBe(payload.sessionId);
  });

  it('should reject an invalid token', async () => {
    await expect(verifyAccessToken('invalid-token')).rejects.toThrow();
  });

  it('should generate unique refresh tokens', () => {
    const token1 = generateRefreshToken();
    const token2 = generateRefreshToken();
    expect(token1).not.toBe(token2);
    expect(token1.length).toBeGreaterThan(20);
  });

  it('should hash tokens deterministically', () => {
    const token = 'test-token';
    const hash1 = hashToken(token);
    const hash2 = hashToken(token);
    expect(hash1).toBe(hash2);
  });

  it('should produce different hashes for different tokens', () => {
    const hash1 = hashToken('token-a');
    const hash2 = hashToken('token-b');
    expect(hash1).not.toBe(hash2);
  });
});
