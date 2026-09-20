import type {
  TalkieClientOptions,
  ApiResponse,
  Agent,
  CreateAgentParams,
  PhoneNumber,
  SearchNumbersParams,
  ProvisionNumberParams,
  Call,
  CreateCallParams,
  CallControlParams,
  Message,
  SendMessageParams,
  Contact,
  CreateContactParams,
  WebhookConfig,
  CreateWebhookParams,
} from './types';

export class TalkieError extends Error {
  public code: string;
  public details?: any;

  constructor(message: string, code: string = 'TALKIE_ERROR', details?: any) {
    super(message);
    this.name = 'TalkieError';
    this.code = code;
    this.details = details;
  }
}

export class TalkieClient {
  private apiKey: string;
  private baseUrl: string;
  private timeoutMs: number;
  private fetchFn: typeof fetch;

  constructor(options: TalkieClientOptions) {
    if (!options.apiKey) {
      throw new TalkieError('API Key is required to initialize TalkieClient', 'MISSING_API_KEY');
    }
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl || 'http://localhost:3000').replace(/\/+$/, '');
    this.timeoutMs = options.timeoutMs || 30000;
    this.fetchFn = options.fetch || globalThis.fetch;
  }

  private async request<T = any>(
    path: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
      body?: any;
      query?: Record<string, string | number | boolean | undefined>;
    } = {}
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (options.query) {
      Object.entries(options.query).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      });
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetchFn(url.toString(), {
        method: options.method || 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'talkie-node-sdk/1.0.0',
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timer);

      const json = (await response.json()) as ApiResponse<T>;

      if (!response.ok || json.success === false) {
        throw new TalkieError(
          json.error?.message || `API request failed with status ${response.status}`,
          json.error?.code || `HTTP_${response.status}`,
          json.error?.details
        );
      }

      return json.data as T;
    } catch (err: any) {
      clearTimeout(timer);
      if (err instanceof TalkieError) {
        throw err;
      }
      throw new TalkieError(err.message || 'Network request failed', 'NETWORK_ERROR');
    }
  }

  // --- Agents ---
  public agents = {
    list: async (): Promise<Agent[]> => {
      return this.request<Agent[]>('/api/v1/agents');
    },
    get: async (id: string): Promise<Agent> => {
      return this.request<Agent>(`/api/v1/agents/${id}`);
    },
    create: async (params: CreateAgentParams): Promise<Agent> => {
      return this.request<Agent>('/api/v1/agents', {
        method: 'POST',
        body: params,
      });
    },
    update: async (id: string, params: Partial<CreateAgentParams>): Promise<Agent> => {
      return this.request<Agent>(`/api/v1/agents/${id}`, {
        method: 'PATCH',
        body: params,
      });
    },
    delete: async (id: string): Promise<{ success: boolean }> => {
      return this.request<{ success: boolean }>(`/api/v1/agents/${id}`, {
        method: 'DELETE',
      });
    },
  };

  // --- Phone Numbers ---
  public numbers = {
    list: async (): Promise<PhoneNumber[]> => {
      return this.request<PhoneNumber[]>('/api/v1/numbers');
    },
    search: async (params: SearchNumbersParams = {}): Promise<Array<{ phoneNumber: string; country: string; capabilities: string[] }>> => {
      return this.request('/api/v1/numbers/search', {
        query: params as Record<string, string | number | boolean | undefined>,
      });
    },
    provision: async (params: ProvisionNumberParams): Promise<PhoneNumber> => {
      return this.request<PhoneNumber>('/api/v1/numbers', {
        method: 'POST',
        body: params,
      });
    },
    release: async (id: string): Promise<{ success: boolean }> => {
      return this.request<{ success: boolean }>(`/api/v1/numbers/${id}`, {
        method: 'DELETE',
      });
    },
  };

  // --- Calls ---
  public calls = {
    list: async (query?: { limit?: number; status?: string }): Promise<Call[]> => {
      return this.request<Call[]>('/api/v1/calls', { query });
    },
    get: async (id: string): Promise<Call> => {
      return this.request<Call>(`/api/v1/calls/${id}`);
    },
    create: async (params: CreateCallParams): Promise<Call> => {
      return this.request<Call>('/api/v1/calls', {
        method: 'POST',
        body: params,
      });
    },
    control: async (id: string, params: CallControlParams): Promise<{ success: boolean }> => {
      return this.request<{ success: boolean }>(`/api/v1/calls/${id}/control`, {
        method: 'POST',
        body: params,
      });
    },
  };

  // --- Messages ---
  public messages = {
    list: async (query?: { conversationId?: string; limit?: number }): Promise<Message[]> => {
      return this.request<Message[]>('/api/v1/messages', { query });
    },
    send: async (params: SendMessageParams): Promise<Message> => {
      return this.request<Message>('/api/v1/messages', {
        method: 'POST',
        body: params,
      });
    },
    conversations: {
      list: async (): Promise<any[]> => {
        return this.request<any[]>('/api/v1/conversations');
      },
      get: async (id: string): Promise<any> => {
        return this.request<any>(`/api/v1/conversations/${id}`);
      },
    },
  };

  // --- Contacts ---
  public contacts = {
    list: async (query?: { search?: string }): Promise<Contact[]> => {
      return this.request<Contact[]>('/api/v1/contacts', { query });
    },
    get: async (id: string): Promise<Contact> => {
      return this.request<Contact>(`/api/v1/contacts/${id}`);
    },
    create: async (params: CreateContactParams): Promise<Contact> => {
      return this.request<Contact>('/api/v1/contacts', {
        method: 'POST',
        body: params,
      });
    },
    update: async (id: string, params: Partial<CreateContactParams>): Promise<Contact> => {
      return this.request<Contact>(`/api/v1/contacts/${id}`, {
        method: 'PATCH',
        body: params,
      });
    },
    delete: async (id: string): Promise<{ success: boolean }> => {
      return this.request<{ success: boolean }>(`/api/v1/contacts/${id}`, {
        method: 'DELETE',
      });
    },
  };

  // --- Webhooks ---
  public webhooks = {
    list: async (): Promise<WebhookConfig[]> => {
      return this.request<WebhookConfig[]>('/api/v1/webhooks');
    },
    create: async (params: CreateWebhookParams): Promise<WebhookConfig> => {
      return this.request<WebhookConfig>('/api/v1/webhooks', {
        method: 'POST',
        body: params,
      });
    },
    delete: async (id: string): Promise<{ success: boolean }> => {
      return this.request<{ success: boolean }>(`/api/v1/webhooks/${id}`, {
        method: 'DELETE',
      });
    },
    test: async (id: string): Promise<{ success: boolean; result: any }> => {
      return this.request<{ success: boolean; result: any }>(`/api/v1/webhooks/${id}/test`, {
        method: 'POST',
      });
    },
  };
}
