import { sleep } from "@/lib/helpers";
import { getBtcUtxos } from "@/queries/utxos";
import { getCurrentWallet } from "@/lib/wallet";
import { broadcastBTCTx } from "@/queries/transaction";
import {
  getMetaIdPinUnspentOutputsObj,
  setMetaIdPinUnspentOutputsObj,
} from "@/lib/metaIdPin";
import {
  Chain,
  ScriptType,
  SignType,
  Transaction,
  TxDetail,
} from "@metalet/utxo-wallet-service";

interface InscribeHexResult {
  totalCost: number;
  commitCost: number;
  revealCost: number;
  commitTxHex: string;
  revealTxsHex: string[];
}

interface InscribeTxIdResult {
  commitTxId: string;
  revealTxIds: string[];
  commitCost: number;
  revealCost: number;
  totalCost: number;
}

export type PrevOutput = {
  txId: string;
  vOut: number;
  amount: number;
  address: string;
};

export type Operation = "init" | "create" | "modify" | "revoke";

export type MetaidData = {
  body?: string;
  operation: Operation;
  path?: string;
  contentType?: string;
  encryption?: "0" | "1" | "2";
  version?: string;
  encoding?: BufferEncoding;
  revealAddr: string;
  flag?: "metaid" | "testid";
};

export type InscriptionRequest = {
  commitTxPrevOutputList: PrevOutput[];
  feeRate: number;
  metaidDataList: MetaidData[];
  revealOutValue: number;
  changeAddress: string;
  minChangeValue?: number;
  shareData?: string;
  masterPublicKey?: string;
  chainCode?: string;
  commitTx?: string;
  signatureList?: string[];
  service?: {
    address: string;
    satoshis: string;
  };
};

function initOptions() {
  return { noBroadcast: false };
}

export async function estimate({
  data: { metaidDataList, service, feeRate, revealOutValue },
  options = initOptions(),
}: {
  data: Omit<InscriptionRequest, "commitTxPrevOutputList">;
  options?: { noBroadcast: boolean };
}): Promise<{
  feeRate: number;
  totalCost: number;
  commitCost: number;
  revealCost: number;
  commitTx: TxDetail;
  revealTxs: TxDetail[];
  options?: { noBroadcast: boolean };
}> {
  console.log("inscribe 方法");
  const wallet = await getCurrentWallet(Chain.BTC);
  const address = wallet.getAddress();
  const utxos = await getBtcUtxos(
    wallet.getAddress(),
    wallet.getScriptType() === ScriptType.P2PKH,
    true
  );
  console.log("inscribe 方法11111");
  const metaIdPinUnspentOutputsObj = await getMetaIdPinUnspentOutputsObj();
  const metaIdPinUnspentOutputs = metaIdPinUnspentOutputsObj[address] || [];
  const btcUnspentOutputs = utxos.map(
    (utxo) => `${utxo.txId}:${utxo.outputIndex}`
  );
  metaIdPinUnspentOutputs.filter((unspentOutputs) =>
    btcUnspentOutputs.includes(unspentOutputs)
  );
  utxos.filter(
    (utxo) =>
      utxo.confirmed ||
      metaIdPinUnspentOutputs.includes(`${utxo.txId}:${utxo.outputIndex}`)
  );
  console.log("inscribe 方法222221");

  console.log("inscribe utxos", utxos);
  console.log("inscribe feeRate", feeRate);
  console.log("inscribe metaidDataList", metaidDataList);
  console.log("inscribe service", service);
  
  // try {
    const { commitTx, revealTxs } = wallet.signTx(SignType.INSCRIBE_METAIDPIN, {
      utxos,
      feeRate,
      metaidDataList,
      service,
    });
    console.log("inscribe 方法333");

    const commitCost =
      utxos.reduce((acc, utxo) => acc + utxo.satoshis, 0) -
      commitTx.txOutputs
        .filter((out) => out.address === address)
        .reduce((acc, out) => acc + out.value, 0);

    const revealCost = revealTxs.reduce(
      (acc, revealTx) =>
        acc + revealTx.txInputs.reduce((acc, out) => acc + out.value, 0),
      0
    );

    const totalCost =
      commitCost -
      metaidDataList.filter((metaidData) => metaidData.revealAddr === address)
        .length *
        revealOutValue;

    return {
      feeRate,
      commitTx,
      revealTxs,
      commitCost,
      revealCost,
      totalCost,
      options,
    };
  // } catch (e) {
  //   return {
  //    e
  //   };
  // }
}

export async function process({
  options,
  commitTx,
  revealTxs,
  totalCost,
  commitCost,
  revealCost,
}: {
  totalCost: number;
  commitCost: number;
  revealCost: number;
  commitTx: TxDetail;
  revealTxs: TxDetail[];
  options: { noBroadcast: boolean };
}): Promise<InscribeHexResult | InscribeTxIdResult> {
  
  if (!options.noBroadcast) {
    const commitTxId = await broadcastBTCTx(commitTx.rawTx);
    await sleep(1000);
    const [...revealTxIds] = await Promise.all([
      ...revealTxs.map((revealTx) => broadcastBTCTx(revealTx.rawTx)),
    ]);
    const wallet = await getCurrentWallet(Chain.BTC);
    const address = wallet.getAddress();
    const metaIdPinUnspentOutputsObj = await getMetaIdPinUnspentOutputsObj();
    const metaIdPinUnspentOutputs = metaIdPinUnspentOutputsObj[address] || [];
    metaIdPinUnspentOutputs.push(
      `${commitTxId}:${Transaction.fromHex(commitTx.rawTx).outs.length - 1}`
    );
    await setMetaIdPinUnspentOutputsObj({
      ...metaIdPinUnspentOutputsObj,
      [address]: metaIdPinUnspentOutputs,
    });
    return { commitTxId, revealTxIds, commitCost, revealCost, totalCost };
  }

  return {
    totalCost,
    commitCost,
    revealCost,
    commitTxHex: commitTx.rawTx,
    revealTxsHex: revealTxs.map((revealTx) => revealTx.rawTx),
  };
}
