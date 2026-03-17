import { describe, it, expect } from 'vitest';
import {
  validateTransition,
  getAvailableTransitions,
} from '../../src/domain/event-machine.js';

describe('event state machine', () => {
  describe('validateTransition', () => {
    it('should allow draft → proposed for marketing', () => {
      expect(() =>
        validateTransition('draft', 'proposed', { id: '1', roles: ['marketing'] }),
      ).not.toThrow();
    });

    it('should allow proposed → approved for manager', () => {
      expect(() =>
        validateTransition('proposed', 'approved', { id: '1', roles: ['manager'] }),
      ).not.toThrow();
    });

    it('should allow approved → planned for event_admin', () => {
      expect(() =>
        validateTransition('approved', 'planned', { id: '1', roles: ['event_admin'] }),
      ).not.toThrow();
    });

    it('should allow planned → executed for event_admin', () => {
      expect(() =>
        validateTransition('planned', 'executed', { id: '1', roles: ['event_admin'] }),
      ).not.toThrow();
    });

    it('should reject draft → approved (skip proposed)', () => {
      expect(() =>
        validateTransition('draft', 'approved', { id: '1', roles: ['event_admin'] }),
      ).toThrow('Ungültiger Übergang');
    });

    it('should reject executed → planned (backwards)', () => {
      expect(() =>
        validateTransition('executed', 'planned', { id: '1', roles: ['event_admin'] }),
      ).toThrow('Ungültiger Übergang');
    });

    it('should reject employee from approving events', () => {
      expect(() =>
        validateTransition('proposed', 'approved', { id: '1', roles: ['employee'] }),
      ).toThrow('Keine Berechtigung');
    });

    it('should allow cancellation from planned by event_admin', () => {
      expect(() =>
        validateTransition('planned', 'cancelled', { id: '1', roles: ['event_admin'] }),
      ).not.toThrow();
    });

    it('should reject cancellation of executed events', () => {
      expect(() =>
        validateTransition('executed', 'cancelled', { id: '1', roles: ['event_admin'] }),
      ).toThrow('Ungültiger Übergang');
    });
  });

  describe('getAvailableTransitions', () => {
    it('should return proposed for draft + marketing', () => {
      const transitions = getAvailableTransitions('draft', ['marketing']);
      expect(transitions).toContain('proposed');
      expect(transitions).toContain('cancelled');
    });

    it('should return approved for proposed + manager', () => {
      const transitions = getAvailableTransitions('proposed', ['manager']);
      expect(transitions).toContain('approved');
      expect(transitions).toContain('cancelled');
    });

    it('should return empty for executed', () => {
      const transitions = getAvailableTransitions('executed', ['event_admin']);
      expect(transitions).toEqual([]);
    });

    it('should return no transitions for employee on proposed', () => {
      const transitions = getAvailableTransitions('proposed', ['employee']);
      expect(transitions).toEqual([]);
    });
  });
});
