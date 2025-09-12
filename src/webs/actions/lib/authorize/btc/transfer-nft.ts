import { getNetwork } from "@/lib/network";
import { getCurrentWallet } from "@/lib/wallet";
import { getDefaultMVCTRate } from "@/queries/transaction";
import { Chain } from "@metalet/utxo-wallet-service";
import { API_NET, API_TARGET, NftManager } from "meta-contract";

interface TransferParameters {
  codehash: string;
  genesis: string;
  tokenIndex: string;
  recipient: string;
  options?: {
    noBroadcast?: boolean;
    feeRate?: string | number;
    useUnconfirmed?: boolean;
  };
}

export async function process({
  options,
  recipient,
  codehash,
  genesis,
  tokenIndex,
}: TransferParameters): Promise<{ txId: string } | { txHex: string }> {
  const network = await getNetwork();
  const currentMVCWallet = await getCurrentWallet(Chain.MVC);
  const privateKey = currentMVCWallet.getPrivateKey();

  let feeb;
  if (!feeb) {
    feeb = await getDefaultMVCTRate();
  }
  
  const nftManager = new NftManager({
    network: network as API_NET,
    apiTarget: API_TARGET.APIMVC,
    purse: privateKey,
    feeb,
  });

  // Pick the largest utxo from wallet to pay the transaction
  const largestUtxo = await nftManager.api
    .getUnspents(currentMVCWallet.getAddress())
    .then((utxos) => {
      return utxos.reduce((prev, curr) => {
        if (curr.satoshis > prev.satoshis) return curr;
        return prev;
      });
    })
    .then((utxo) => {
      // add wif to utxo
      return {
        ...utxo,
        wif: privateKey,
      };
    });

  const transferRes = await nftManager
    .transfer({
      genesis,
      codehash,
      tokenIndex,
      senderWif: privateKey,
      receiverAddress: recipient,
      utxos: [largestUtxo],
      noBroadcast: options?.noBroadcast,
    })
    .catch((err) => {
      throw err;
    });
  if (options?.noBroadcast) {
    return { txHex: transferRes.txHex };
  }
  return { txId: transferRes.txid };
}
