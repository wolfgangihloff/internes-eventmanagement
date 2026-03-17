import { config } from '../config.js';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface LlmResponse {
  content: string;
}

export async function callClaude(systemPrompt: string, userMessage: string): Promise<string> {
  if (!config.anthropic.apiKey) {
    throw new Error('ANTHROPIC_API_KEY nicht konfiguriert');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.anthropic.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API Error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as { content?: { text?: string }[] };
  return data.content?.[0]?.text ?? '';
}
