import { createHmac, timingSafeEqual } from 'crypto';

export interface WebhookHeaders {
  'X-Talkie-Signature': string;
  'X-Talkie-Timestamp': string;
  'X-Talkie-Event': string;
  'Content-Type': 'application/json';
}

export class WebhookSigner {
  /**
   * Generates HMAC-SHA256 signature for payload and timestamp
   */
  static sign(payload: string, secret: string, timestamp?: number): { signature: string; timestamp: number } {
    const ts = timestamp ?? Math.floor(Date.now() / 1000);
    const signedPayload = `${ts}.${payload}`;
    const hmac = createHmac('sha256', secret).update(signedPayload).digest('hex');
    return {
      signature: `t=${ts},v1=${hmac}`,
      timestamp: ts,
    };
  }

  /**
   * Generates complete request headers for webhook delivery
   */
  static generateHeaders(payload: string, secret: string, eventName: string): WebhookHeaders {
    const { signature, timestamp } = this.sign(payload, secret);
    return {
      'X-Talkie-Signature': signature,
      'X-Talkie-Timestamp': timestamp.toString(),
      'X-Talkie-Event': eventName,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Verifies signature against payload and secret with replay protection tolerance
   */
  static verify(
    payload: string,
    signatureHeader: string,
    secret: string,
    toleranceSeconds: number = 300
  ): boolean {
    if (!signatureHeader || !payload || !secret) return false;

    // Parse 't=12345,v1=abcdef...'
    const parts = signatureHeader.split(',');
    let timestampStr = '';
    let hash = '';

    for (const part of parts) {
      const [key, value] = part.split('=');
      if (key === 't') timestampStr = value;
      if (key === 'v1') hash = value;
    }

    if (!timestampStr || !hash) return false;

    const timestamp = parseInt(timestampStr, 10);
    const now = Math.floor(Date.now() / 1000);

    // Tolerance / replay attack check
    if (Math.abs(now - timestamp) > toleranceSeconds) {
      return false;
    }

    const expectedSignedPayload = `${timestamp}.${payload}`;
    const expectedHash = createHmac('sha256', secret).update(expectedSignedPayload).digest('hex');

    try {
      const hashBuffer = Buffer.from(hash);
      const expectedBuffer = Buffer.from(expectedHash);
      if (hashBuffer.length !== expectedBuffer.length) return false;
      return timingSafeEqual(hashBuffer, expectedBuffer);
    } catch {
      return false;
    }
  }
}
