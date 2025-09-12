import { getWalletNetwork } from "@/utils/WalletUtils";
import { metaletApiV4 } from "./request";
import { SymbolTicker } from "@/lib/asset-symbol";
import { PageResult } from "./types";

export type Token = {
  codeHash: string;
  genesis: string;
  name: string;
  symbol: SymbolTicker;
  decimal: number;
  sensibleId: string;
  utxoCount: number;
  confirmed: number;
  confirmedString: string;
  unconfirmed: number;
  unconfirmedString: string;
};

export const fetchTokens = async (address: string,codehash?: string, genesis?: string): Promise<Token[]> => {
 

  const network = await getWalletNetwork();

  const { list: tokens } = await metaletApiV4<PageResult<Token>>(`/mvc/address/contract/ft/balance-list`).get({
    network,
    address,
    genesis,
    codehash,
  })
  return tokens;
  // const tokens: any = await mvcApi(
    // `/contract/ft/address/${address}/balance`
  // ).get();

  // return tokens.map((token: any) => {
  //   // 将codeHash改为小写
  //   token.codehash = token.codeHash;
  //   delete token.codeHash;
  //   return token;
  // });
};
