import crypto from 'node:crypto';

const SCRYPT_KEYLEN = 64;

/**
 * Hash a password securely using scrypt with a unique cryptographically random salt.
 * Output format: scrypt:<salt_hex>:<hash_hex>
 */
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, SCRYPT_KEYLEN, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`scrypt:${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

/**
 * Verify a plain text password against a stored scrypt hash.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  return new Promise((resolve) => {
    const parts = storedHash.split(':');
    if (parts.length !== 3 || parts[0] !== 'scrypt') {
      return resolve(false);
    }
    const [, salt, originalHex] = parts;
    crypto.scrypt(password, salt, SCRYPT_KEYLEN, (err, derivedKey) => {
      if (err) return resolve(false);
      const originalBuffer = Buffer.from(originalHex, 'hex');
      const match = crypto.timingSafeEqual(derivedKey, originalBuffer);
      resolve(match);
    });
  });
}
