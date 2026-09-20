import type { PhoneNumberCapabilities, PhoneNumberStatus } from '@talkie/types';

export interface AvailableNumber {
  phoneNumber: string; // E.164 (+14155550142)
  friendlyName: string;
  country: string;
  countryCode: string;
  areaCode: string;
  region: string;
  postalCode?: string;
  capabilities: PhoneNumberCapabilities;
  monthlyFeeCents: number;
}

export interface SearchNumbersQuery {
  country?: string;
  areaCode?: string;
  contains?: string;
  capabilities?: Partial<PhoneNumberCapabilities>;
  limit?: number;
}

export interface ProvisionResult {
  providerNumberId: string;
  phoneNumber: string;
  status: PhoneNumberStatus;
  capabilities: PhoneNumberCapabilities;
  monthlyFeeCents: number;
}

export interface ReleaseResult {
  success: boolean;
  phoneNumber: string;
}
