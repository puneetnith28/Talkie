import crypto from 'node:crypto';

export interface GeneratedApiKey {
  rawKey: string;
  keyHash: string;
  keyHint: string;
}

/**
 * Generate a new API Key in standard format: tk_live_<random_bytes>
 */
export function generateApiKey(prefix = 'tk_live'): GeneratedApiKey {
  const randomHex = crypto.randomBytes(24).toString('hex');
  const rawKey = `${prefix}_${randomHex}`;
  const keyHash = hashApiKey(rawKey);
  const keyHint = `${prefix}_...${rawKey.slice(-4)}`;

  return {
    rawKey,
    keyHash,
    keyHint,
  };
}

/**
 * Hash an API key using SHA-256 for secure DB storage
 */
export function hashApiKey(rawKey: string): string {
  return crypto.createHash('sha256').update(rawKey).digest('hex');
}

/**
 * Constant-time comparison for API key hashes
 */
export function verifyApiKey(rawKey: string, storedHash: string): boolean {
  const hash = hashApiKey(rawKey);
  const hashBuffer = Buffer.from(hash, 'hex');
  const storedBuffer = Buffer.from(storedHash, 'hex');

  if (hashBuffer.length !== storedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(hashBuffer, storedBuffer);
}
