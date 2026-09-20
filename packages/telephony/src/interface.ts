import type {
  AvailableNumber,
  SearchNumbersQuery,
  ProvisionResult,
  ReleaseResult,
} from './types';

export interface TelephonyProvider {
  readonly name: string;

  /**
   * Search available numbers in the carrier inventory
   */
  searchNumbers(query: SearchNumbersQuery): Promise<AvailableNumber[]>;

  /**
   * Provision a number from the inventory to the workspace
   */
  provisionNumber(phoneNumber: string): Promise<ProvisionResult>;

  /**
   * Release a number back to the carrier pool
   */
  releaseNumber(providerNumberId: string): Promise<ReleaseResult>;
}
