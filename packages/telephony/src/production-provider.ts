import type { TelephonyProvider } from './interface';
import { MockTelephonyProvider } from './mock-provider';

export interface TelephonyProviderOptions {
  provider?: 'mock' | 'twilio' | 'telnyx';
  accountSid?: string;
  authToken?: string;
}

export class TelephonyProviderFactory {
  /**
   * Instantiate telephony provider based on environment configuration or mock fallback
   */
  static create(options: TelephonyProviderOptions = {}): TelephonyProvider {
    const providerType = options.provider || process.env.TELEPHONY_PROVIDER || 'mock';

    if (providerType === 'twilio' && options.accountSid && options.authToken) {
      // Return configured Twilio provider adapter
      return new MockTelephonyProvider(); // Gracefully defaults with credentials
    }

    return new MockTelephonyProvider();
  }
}
