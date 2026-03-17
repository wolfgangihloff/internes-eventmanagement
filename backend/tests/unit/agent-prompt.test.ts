import { describe, expect, it } from 'vitest';
import { AGENT_SYSTEM_PROMPT } from '../../src/lib/agent-prompt.js';

describe('agent system prompt', () => {
  it('should focus on participation in external events', () => {
    expect(AGENT_SYSTEM_PROMPT).toContain('Teilnahme an externen Events');
    expect(AGENT_SYSTEM_PROMPT).toContain('Registrierung');
    expect(AGENT_SYSTEM_PROMPT).toContain('Reise');
    expect(AGENT_SYSTEM_PROMPT).toContain('Gesprächstermine');
    expect(AGENT_SYSTEM_PROMPT).toContain('Nachbereitung');
  });

  it('should not use organizer or exhibitor wording', () => {
    expect(AGENT_SYSTEM_PROMPT).not.toContain('Stand vorbereiten');
    expect(AGENT_SYSTEM_PROMPT).not.toContain('Kundenkalender');
    expect(AGENT_SYSTEM_PROMPT).not.toContain('Messebesuchen');
  });
});
