/**
 * DOGE Balance Query Functions
 */

import Decimal from 'decimal.js';
import { getNetwork } from '@/lib/network';
import { metaletApiV4 } from '@/queries/request';
import { Balance_QUERY_INTERVAL } from '@/queries/constants';
import { DogeBalance, DogeBalanceResult } from './types';
import { Chain } from '@metalet/utxo-wallet-sdk';

/**
 * Fetch DOGE balance for an address
 * Uses the /v4/doge/address/balance-info endpoint
 */
export async function fetchDogeBalance(address: string): Promise<DogeBalanceResult> {
  // const net = getNet()
  const net = getNetwork(Chain.BTC);

  const data = await metaletApiV4<DogeBalance>('/doge/address/balance-info', {
    withCredential: false,
  }).get({
    net,
    address,
  });

  return {
    total: new Decimal(data.confirmed + data.unconfirmed),
    confirmed: new Decimal(data.confirmed),
    unconfirmed: new Decimal(data.unconfirmed),
  };
}
