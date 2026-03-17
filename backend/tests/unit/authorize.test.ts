import { describe, it, expect } from 'vitest';
import {
  PERMISSIONS,
  canCreateEventWithStatus,
  resolveEventCreationStatus,
  type Permission,
} from '../../src/middleware/authorize.js';

describe('RBAC permissions', () => {
  it('should allow event_admin to create events', () => {
    const roles = PERMISSIONS['event:create'];
    expect(roles).toContain('event_admin');
  });

  it('should allow marketing to create events', () => {
    const roles = PERMISSIONS['event:create'];
    expect(roles).toContain('marketing');
  });

  it('should not allow employee to create events', () => {
    const roles = PERMISSIONS['event:create'];
    expect(roles).not.toContain('employee');
  });

  it('should allow employee to apply for participation', () => {
    const roles = PERMISSIONS['participation:apply'];
    expect(roles).toContain('employee');
  });

  it('should allow manager to decide on participation', () => {
    const roles = PERMISSIONS['participation:decide'];
    expect(roles).toContain('manager');
  });

  it('should not allow employee to decide on participation', () => {
    const roles = PERMISSIONS['participation:decide'];
    expect(roles).not.toContain('employee');
  });

  it('should only allow event_admin to read audit log', () => {
    const roles = PERMISSIONS['audit:read'];
    expect(roles).toEqual(['event_admin']);
  });

  it('should have all permissions well-defined', () => {
    const allPermissions = Object.keys(PERMISSIONS) as Permission[];
    for (const perm of allPermissions) {
      expect(Array.isArray(PERMISSIONS[perm])).toBe(true);
      expect(PERMISSIONS[perm].length).toBeGreaterThan(0);
    }
  });
});

describe('event creation policy', () => {
  it('should allow employees to propose external events', () => {
    expect(canCreateEventWithStatus(['employee'], 'proposed')).toBe(true);
  });

  it('should not allow employees to create draft events', () => {
    expect(canCreateEventWithStatus(['employee'], 'draft')).toBe(false);
  });

  it('should allow managers to propose external events', () => {
    expect(canCreateEventWithStatus(['manager'], 'proposed')).toBe(true);
  });

  it('should allow marketing to create draft and proposed events', () => {
    expect(canCreateEventWithStatus(['marketing'], 'draft')).toBe(true);
    expect(canCreateEventWithStatus(['marketing'], 'proposed')).toBe(true);
  });

  it('should allow event admins to create draft and proposed events', () => {
    expect(canCreateEventWithStatus(['event_admin'], 'draft')).toBe(true);
    expect(canCreateEventWithStatus(['event_admin'], 'proposed')).toBe(true);
  });

  it('should default employee proposals to proposed', () => {
    expect(resolveEventCreationStatus(['employee'])).toBe('proposed');
  });

  it('should default marketing-created events to draft', () => {
    expect(resolveEventCreationStatus(['marketing'])).toBe('draft');
  });

  it('should reject users without create or propose rights', () => {
    expect(() => resolveEventCreationStatus([])).toThrowError(
      'Keine Berechtigung für diese Aktion',
    );
  });
});
