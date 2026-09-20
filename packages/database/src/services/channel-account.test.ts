import { describe, it, expect } from 'vitest';
import { ChannelAccountService } from './channel-account.service';

describe('ChannelAccountService', () => {
  it('has method definitions for omnichannel account management', () => {
    expect(typeof ChannelAccountService.upsertAccount).toBe('function');
    expect(typeof ChannelAccountService.listAccounts).toBe('function');
    expect(typeof ChannelAccountService.findByIdentifier).toBe('function');
    expect(typeof ChannelAccountService.getAccountWithCredentials).toBe('function');
    expect(typeof ChannelAccountService.disconnectAccount).toBe('function');
  });
});
