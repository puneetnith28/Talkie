import { describe, it, expect } from 'vitest';
import { MockTelephonyProvider } from './index';

describe('Telephony Provider & Mock Implementation', () => {
  const provider = new MockTelephonyProvider();

  it('should search available numbers with default settings', async () => {
    const results = await provider.searchNumbers({ areaCode: '415', limit: 5 });
    expect(results).toHaveLength(5);
    expect(results[0].phoneNumber.startsWith('+1415555')).toBe(true);
    expect(results[0].country).toBe('US');
    expect(results[0].capabilities.voice).toBe(true);
    expect(results[0].capabilities.sms).toBe(true);
  });

  it('should search Canadian numbers', async () => {
    const results = await provider.searchNumbers({ areaCode: '416', limit: 3 });
    expect(results).toHaveLength(3);
    expect(results[0].country).toBe('CA');
    expect(results[0].phoneNumber.startsWith('+1416555')).toBe(true);
  });

  it('should provision and release numbers successfully', async () => {
    const provision = await provider.provisionNumber('+14155550199');
    expect(provision.phoneNumber).toBe('+14155550199');
    expect(provision.status).toBe('active');
    expect(provision.providerNumberId.startsWith('mock_pn_')).toBe(true);

    const release = await provider.releaseNumber(provision.providerNumberId);
    expect(release.success).toBe(true);
  });
});
