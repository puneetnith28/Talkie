export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

export class InMemoryRateLimiter {
  private cache: Map<string, { count: number; resetAt: number }>;
  private maxRequests: number;
  private windowSeconds: number;

  constructor(maxRequests: number = 100, windowSeconds: number = 60) {
    this.cache = new Map();
    this.maxRequests = maxRequests;
    this.windowSeconds = windowSeconds;
  }

  /**
   * Check rate limit for a client identifier (e.g. IP or API key)
   */
  public check(identifier: string): RateLimitResult {
    const now = Date.now();
    const entry = this.cache.get(identifier);

    if (!entry || now > entry.resetAt) {
      const resetAt = now + this.windowSeconds * 1000;
      this.cache.set(identifier, { count: 1, resetAt });
      return {
        allowed: true,
        limit: this.maxRequests,
        remaining: this.maxRequests - 1,
        resetSeconds: this.windowSeconds,
      };
    }

    if (entry.count >= this.maxRequests) {
      const resetSeconds = Math.ceil((entry.resetAt - now) / 1000);
      return {
        allowed: false,
        limit: this.maxRequests,
        remaining: 0,
        resetSeconds,
      };
    }

    entry.count += 1;
    const resetSeconds = Math.ceil((entry.resetAt - now) / 1000);

    return {
      allowed: true,
      limit: this.maxRequests,
      remaining: this.maxRequests - entry.count,
      resetSeconds,
    };
  }
}

export const globalRateLimiter = new InMemoryRateLimiter(200, 60); // 200 req / min default
