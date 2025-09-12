// import { getCurrentWallet } from '../../wallet'
import { getCurrentWallet } from "@/lib/wallet";
import { getBtcUtxos, getMRC20Utxos, UTXO } from "@/queries/utxos";
import { Chain, ScriptType, SignType } from "@metalet/utxo-wallet-service";

export interface MRC20TransferParams {
  body: string;
  amount: string;
  mrc20TickId: string;
  flag?: "metaid" | "testid";
  revealAddr?: string;
  commitFeeRate: number;
  revealFeeRate: number;
  changeAddress?: string;
  revealOutValue?: number;
  service?: {
    address: string;
    satoshis: string;
  };
  utxos?: UTXO[];
}

export async function process(params: MRC20TransferParams) {
  console.log("mrc_transfer", params);

  const wallet = await getCurrentWallet(Chain.BTC);

  // const utxos = await getBtcUtxos(wallet.getAddress(), wallet.getScriptType() === ScriptType.P2PKH)
  const utxos =
    params.utxos ||
    (await getBtcUtxos(
      wallet.getAddress(),
      wallet.getScriptType() === ScriptType.P2PKH,
      true
    ));
  const mrc20Utxos = await getMRC20Utxos(
    wallet.getAddress(),
    params.mrc20TickId,
    wallet.getScriptType() === ScriptType.P2PKH
  );

  return wallet.signTx(SignType.MRC20_TRANSFER, {
    ...params,
    mrc20Utxos,
    utxos,
  });
}
