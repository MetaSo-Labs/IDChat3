import Decimal from "decimal.js";
import { getBtcUtxos } from "@/queries/utxos";
import { getCurrentWallet } from "@/lib/wallet";
import { Chain, ScriptType } from "@metalet/utxo-wallet-service";
import { broadcastBTCTx, getBTCTRate } from "@/queries/transaction";
import { ToastView } from "@/constant/Widget";

interface TransferParameters {
  toAddress: string;
  satoshis: string;
  options?: { noBroadcast?: boolean; feeRate?: string | number };
}

export async function process(
  params: TransferParameters
): Promise<{ txId: string } | { txHex: string }> {
  const wallet = await getCurrentWallet(Chain.BTC);
  console.log(wallet.getAddress());

  let feeRate = params.options?.feeRate;

  if (!feeRate) {
    const { list } = await getBTCTRate();
    feeRate = list.find((item) => item.title === "Avg")?.feeRate;
    throw Error("Request feeRate Error");
  }

  feeRate = Number(feeRate);
  console.log({ feeRate });

  const utxos = await getBtcUtxos(
    wallet.getAddress(),
    wallet.getScriptType() === ScriptType.P2PKH
  );
  console.log("uuuuu  ", { utxos });
  if (!utxos.length) {
    ToastView({
      text: "Insufficient balance or wait for transaction confirmation",
      type: "error",
    });
    return;
  }

  const { psbt, rawTx } = wallet.send(
    params.toAddress,
    new Decimal(params.satoshis).div(1e8).toString(),
    feeRate,
    utxos
  );
  if (params.options?.noBroadcast) {
    return { txHex: psbt.extractTransaction().toHex() };
  }
  const txId = await broadcastBTCTx(rawTx);
  return { txId };
}
