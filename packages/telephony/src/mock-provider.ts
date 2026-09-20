import type { TelephonyProvider } from './interface';
import type {
  AvailableNumber,
  SearchNumbersQuery,
  ProvisionResult,
  ReleaseResult,
} from './types';

const AREA_CODES: Record<string, { city: string; region: string; country: string; countryCode: string }> = {
  // India (Primary)
  '80': { city: 'Bengaluru', region: 'Karnataka', country: 'IN', countryCode: '+91' },
  '11': { city: 'New Delhi', region: 'Delhi NCR', country: 'IN', countryCode: '+91' },
  '22': { city: 'Mumbai', region: 'Maharashtra', country: 'IN', countryCode: '+91' },
  '40': { city: 'Hyderabad', region: 'Telangana', country: 'IN', countryCode: '+91' },
  '20': { city: 'Pune', region: 'Maharashtra', country: 'IN', countryCode: '+91' },
  '44': { city: 'Chennai', region: 'Tamil Nadu', country: 'IN', countryCode: '+91' },
  '33': { city: 'Kolkata', region: 'West Bengal', country: 'IN', countryCode: '+91' },
  '79': { city: 'Ahmedabad', region: 'Gujarat', country: 'IN', countryCode: '+91' },
  '124': { city: 'Gurugram', region: 'Haryana', country: 'IN', countryCode: '+91' },
  '120': { city: 'Noida', region: 'Uttar Pradesh', country: 'IN', countryCode: '+91' },
  '98': { city: 'National Mobile (Series 98)', region: 'India', country: 'IN', countryCode: '+91' },
  '99': { city: 'National Mobile (Series 99)', region: 'India', country: 'IN', countryCode: '+91' },
  '97': { city: 'National Mobile (Series 97)', region: 'India', country: 'IN', countryCode: '+91' },
  '88': { city: 'National Mobile (Series 88)', region: 'India', country: 'IN', countryCode: '+91' },

  // Global (US / CA / UK)
  '415': { city: 'San Francisco', region: 'CA', country: 'US', countryCode: '+1' },
  '212': { city: 'New York', region: 'NY', country: 'US', countryCode: '+1' },
  '312': { city: 'Chicago', region: 'IL', country: 'US', countryCode: '+1' },
  '512': { city: 'Austin', region: 'TX', country: 'US', countryCode: '+1' },
  '207': { city: 'London', region: 'Greater London', country: 'GB', countryCode: '+44' },
  '416': { city: 'Toronto', region: 'ON', country: 'CA', countryCode: '+1' },
};

export class MockTelephonyProvider implements TelephonyProvider {
  readonly name = 'mock';

  /**
   * Generates realistic mock available phone numbers based on query parameters
   */
  async searchNumbers(query: SearchNumbersQuery): Promise<AvailableNumber[]> {
    const isIndia = (query.country || 'IN') === 'IN';
    const defaultAreaCode = isIndia ? '80' : '415';
    const areaCode = query.areaCode || defaultAreaCode;

    const areaInfo = AREA_CODES[areaCode] || {
      city: isIndia ? 'Bengaluru' : 'San Francisco',
      region: isIndia ? 'Karnataka' : 'CA',
      country: query.country || (isIndia ? 'IN' : 'US'),
      countryCode: isIndia ? '+91' : '+1',
    };

    const count = query.limit || 8;
    const numbers: AvailableNumber[] = [];

    for (let i = 1; i <= count; i++) {
      let rawNumber = '';
      let friendlyName = '';

      if (areaInfo.countryCode === '+91') {
        // Indian E.164 10-digit format
        if (['98', '99', '97', '88'].includes(areaCode)) {
          const suffix = Math.floor(10000000 + Math.random() * 89999999).toString();
          const tenDigit = `${areaCode}${suffix.slice(0, 8)}`;
          rawNumber = `+91${tenDigit}`;
          friendlyName = `+91 ${tenDigit.slice(0, 5)} ${tenDigit.slice(5)}`;
        } else {
          // Landline STD format (e.g. 080-4567-8901)
          const line = Math.floor(1000000 + Math.random() * 8999999).toString();
          const tenDigit = `${areaCode}${line.slice(0, 10 - areaCode.length)}`;
          rawNumber = `+91${tenDigit}`;
          friendlyName = `+91 ${areaCode} ${line.slice(0, 4)} ${line.slice(4, 7)}`;
        }
      } else {
        // Standard US/CA/UK format
        const line = Math.floor(1000 + Math.random() * 8999).toString();
        const prefix = '555';
        rawNumber = `${areaInfo.countryCode}${areaCode}${prefix}${line}`;
        friendlyName = `(${areaCode}) ${prefix}-${line}`;
      }

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
