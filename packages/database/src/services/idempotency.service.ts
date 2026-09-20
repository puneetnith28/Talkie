import { prisma } from '../client';

export interface SetIdempotencyInput {
  key: string;
  workspaceId: string;
  endpoint: string;
  responseCode: number;
  responseBody: any;
  ttlSeconds?: number;
}

export class IdempotencyService {
  /**
   * Check if a cached idempotent response exists and has not expired
   */
  static async get(key: string, workspaceId: string) {
    const record = await prisma.idempotencyRecord.findUnique({
      where: { key },
    });

    if (!record) return null;

    if (record.workspaceId !== workspaceId) return null;

    if (new Date() > record.expiresAt) {
      // Expired, delete asynchronously
      await prisma.idempotencyRecord.delete({ where: { key } }).catch(() => {});
      return null;
    }

    try {
      return {
        statusCode: record.responseCode,
        body: JSON.parse(record.responseBody),
        createdAt: record.createdAt,
      };
    } catch {
      return null;
    }
  }

  /**
   * Store response payload against idempotency key
   */
  static async set(input: SetIdempotencyInput) {
    const ttlSeconds = input.ttlSeconds ?? 86400; // 24 hours default
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    return prisma.idempotencyRecord.upsert({
      where: { key: input.key },
      create: {
        key: input.key,
        workspaceId: input.workspaceId,
        endpoint: input.endpoint,
        responseCode: input.responseCode,
        responseBody: JSON.stringify(input.responseBody),
        expiresAt,
      },
      update: {
        responseCode: input.responseCode,
        responseBody: JSON.stringify(input.responseBody),
        expiresAt,
      },
    });
  }

  /**
   * Helper alias to check idempotency key
   */
  static async check(workspaceId: string, key: string) {
    const res = await this.get(key, workspaceId);
    if (!res) return null;
    return {
      statusCode: res.statusCode,
      responseJson: JSON.stringify(res.body),
    };
  }

  /**
   * Helper alias to save idempotency response
   */
  static async save(
    workspaceId: string,
    key: string,
    endpoint: string,
    responseCode: number,
    responseBody: any
  ) {
    return this.set({
      workspaceId,
      key,
      endpoint,
      responseCode,
      responseBody,
    });
  }
}
