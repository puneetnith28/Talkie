import type { TelephonyProvider } from './interface';
import type {
  AvailableNumber,
  SearchNumbersQuery,
  ProvisionResult,
  ReleaseResult,
} from './types';

const AREA_CODES: Record<string, { city: string; region: string; country: string; countryCode: string }> = {
  '415': { city: 'San Francisco', region: 'CA', country: 'US', countryCode: '+1' },
  '212': { city: 'New York', region: 'NY', country: 'US', countryCode: '+1' },
  '312': { city: 'Chicago', region: 'IL', country: 'US', countryCode: '+1' },
  '512': { city: 'Austin', region: 'TX', country: 'US', countryCode: '+1' },
  '206': { city: 'Seattle', region: 'WA', country: 'US', countryCode: '+1' },
  '305': { city: 'Miami', region: 'FL', country: 'US', countryCode: '+1' },
  '617': { city: 'Boston', region: 'MA', country: 'US', countryCode: '+1' },
  '404': { city: 'Atlanta', region: 'GA', country: 'US', countryCode: '+1' },
  '213': { city: 'Los Angeles', region: 'CA', country: 'US', countryCode: '+1' },
  '416': { city: 'Toronto', region: 'ON', country: 'CA', countryCode: '+1' },
  '604': { city: 'Vancouver', region: 'BC', country: 'CA', countryCode: '+1' },
  '514': { city: 'Montreal', region: 'QC', country: 'CA', countryCode: '+1' },
};

export class MockTelephonyProvider implements TelephonyProvider {
  readonly name = 'mock';

  /**
   * Generates realistic mock available phone numbers based on query parameters
   */
  async searchNumbers(query: SearchNumbersQuery): Promise<AvailableNumber[]> {
    const areaCode = query.areaCode || '415';
    const areaInfo = AREA_CODES[areaCode] || {
      city: 'Metro',
      region: 'US',
      country: query.country || 'US',
      countryCode: '+1',
    };

    const count = query.limit || 8;
    const numbers: AvailableNumber[] = [];

    for (let i = 1; i <= count; i++) {
      const line = Math.floor(1000 + Math.random() * 8999).toString();
      const prefix = '555';
      const rawNumber = `${areaInfo.countryCode}${areaCode}${prefix}${line}`;
      const friendlyName = `(${areaCode}) ${prefix}-${line}`;

      if (query.contains && !rawNumber.includes(query.contains)) {
        continue;
      }

      numbers.push({
        phoneNumber: rawNumber,
        friendlyName,
        country: areaInfo.country,
        countryCode: areaInfo.countryCode,
        areaCode,
        region: areaInfo.region,
        capabilities: {
          voice: query.capabilities?.voice ?? true,
          sms: query.capabilities?.sms ?? true,
          mms: query.capabilities?.mms ?? (i % 2 === 0),
        },
        monthlyFeeCents: 150, // $1.50 / month
      });
    }

    return numbers;
  }

  /**
   * Provision number from mock pool
   */
  async provisionNumber(phoneNumber: string): Promise<ProvisionResult> {
    const providerNumberId = `mock_pn_${Math.random().toString(36).substring(2, 12)}`;

    return {
      providerNumberId,
      phoneNumber,
      status: 'active',
      capabilities: {
        voice: true,
        sms: true,
        mms: true,
      },
      monthlyFeeCents: 150,
    };
  }

  /**
   * Release number back to mock pool
   */
  async releaseNumber(providerNumberId: string): Promise<ReleaseResult> {
    return {
      success: true,
      phoneNumber: providerNumberId,
    };
  }
}
