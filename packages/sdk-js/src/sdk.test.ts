import { describe, it, expect, vi } from 'vitest';
import { TalkieClient, TalkieError } from './index';

describe('@talkie/sdk (JavaScript/TypeScript SDK)', () => {
  it('instantiates correctly with valid API Key', () => {
    const client = new TalkieClient({ apiKey: 'tk_live_test123' });
    expect(client).toBeDefined();
    expect(client.agents).toBeDefined();
    expect(client.numbers).toBeDefined();
    expect(client.calls).toBeDefined();
    expect(client.messages).toBeDefined();
    expect(client.contacts).toBeDefined();
    expect(client.webhooks).toBeDefined();
  });

  it('throws error when API Key is missing', () => {
    expect(() => new TalkieClient({ apiKey: '' })).toThrow(TalkieError);
  });

  it('executes API requests and formats headers correctly', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: [{ id: 'ag_123', name: 'Support Agent' }],
      }),
    });

    const client = new TalkieClient({
      apiKey: 'tk_live_mock_secret',
      baseUrl: 'http://localhost:3000',
      fetch: mockFetch as any,
    });

    const agents = await client.agents.list();
    expect(agents).toHaveLength(1);
    expect(agents[0].name).toBe('Support Agent');

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/agents',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Authorization': 'Bearer tk_live_mock_secret',
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  it('handles API error responses gracefully', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Agent does not exist' },
      }),
    });

    const client = new TalkieClient({
      apiKey: 'tk_live_mock_secret',
      fetch: mockFetch as any,
    });

    await expect(client.agents.get('non_existent')).rejects.toThrow('Agent does not exist');
  });
});
