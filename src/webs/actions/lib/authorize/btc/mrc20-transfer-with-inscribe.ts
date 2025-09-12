import { addSafeUtxo } from "@/lib/utxo";
import { getBtcUtxos, getMRC20Utxos, UTXO } from "@/queries/utxos";
import {
  Chain,
  ScriptType,
  SignType,
  Transaction,
  getAddressFromScript,
} from "@metalet/utxo-wallet-service";
import { MetaidData } from "./inscribe";
import { getCurrentWallet } from "@/lib/wallet";

export interface MRC20TransferWithInscribeParams {
  body: string;
  amount: string;
  mrc20TickId: string;
  flag?: "metaid";
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
  inscribeMetaIdData: MetaidData;
}

export async function process(params: MRC20TransferWithInscribeParams) {
  const wallet = await getCurrentWallet(Chain.BTC);

  console.log("process MRC20TransferWithInscribeParams", params);

  const address = wallet.getAddress();
  const utxos =
    params.utxos ||
    (await getBtcUtxos(
      wallet.getAddress(),
      wallet.getScriptType() === ScriptType.P2PKH,
      true
    ));

  console.log("address:", wallet.getAddress());

  const mrc20Utxos = await getMRC20Utxos(
    wallet.getAddress(),
    params.mrc20TickId,
    wallet.getScriptType() === ScriptType.P2PKH
  );

  console.log(
    "process MRC20TransferWithInscribeParams mrc20Utxos:",
    mrc20Utxos
  );

  if (mrc20Utxos.length === 0) {
    console.log("Insufficient balance for MRC20 transfer");

    throw new Error("Insufficient balance for MRC20 transfer");
  }

  const { commitTx, revealTx } = wallet.signTx(
    SignType.MRC20_TRANSFER_INSCRIBE,
    {
      ...params,
      mrc20Utxos,
      utxos,
    }
  );

  console.log("process MRC20TransferWithInscribeParams commitTx:", commitTx);
  console.log("process MRC20TransferWithInscribeParams revealTx:", revealTx);

  const tx = Transaction.fromHex(commitTx.rawTx);
  if (
    tx.outs.length > 1 &&
    getAddressFromScript(
      tx.outs[tx.outs.length - 1].script,
      wallet.getNetwork()
    ) === address
  ) {
    await addSafeUtxo(address, `${commitTx.txId}:${tx.outs.length - 1}`);
  }

  return { commitTx, revealTx };
}
