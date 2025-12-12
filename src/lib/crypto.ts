import { Buffer } from "buffer";
import CryptoJS from "crypto-js";
import { getNetwork } from "@/lib/network";
import { parseLocalTransaction } from "./metadata";
import { BN, TxComposer, mvc } from "meta-contract";
import { Chain } from "@metalet/utxo-wallet-service";
import { type MvcUtxo, fetchUtxos } from "@/queries/utxos";
import { getActiveWalletOnlyAccount, getCurrentWallet } from "./wallet";
import { DERIVE_MAX_DEPTH, FEEB, P2PKH_UNLOCK_SIZE } from "@/lib/config";
import { UnlockP2PKHInputParams } from "@/webs/actions/lib/authorize/unlockP2PKHInput";
import { getDefaultMVCTRate } from "@/queries/transaction";

function getMvcRootPath() {
  const wallet = getCurrentWallet(Chain.MVC);
  return wallet.getPath().slice(0, wallet.getPath().length - 4);
}

export function eciesEncrypt(
  message: string,
  privateKey: mvc.PrivateKey
): string {
  const publicKey = privateKey.toPublicKey();
  const ecies = new mvc.ECIES().privateKey(privateKey).publicKey(publicKey);

  const encryptedInBuf = ecies.encrypt(message);
  const encrypted = encryptedInBuf.toString("hex");

  return encrypted;
}

export function eciesDecrypt(
  encrypted: string,
  privateKey: mvc.PrivateKey
): string {
  const publicKey = privateKey.toPublicKey();
  const ecies = new mvc.ECIES().privateKey(privateKey).publicKey(publicKey);

  const encryptedInBuf = Buffer.from(encrypted, "hex");
  const message = ecies.decrypt(encryptedInBuf).toString();

  return message;
}

export const signMessage = (
  message: string,
  privateKey: mvc.PrivateKey,
  encoding?: "utf-8" | "base64" | "hex" | "utf8"
) => {
  const messageHash = mvc.crypto.Hash.sha256(
    Buffer.from("MVC Signed Message:\n" + message)
  );

  let sigBuf = mvc.crypto.ECDSA.sign(messageHash, privateKey).toBuffer();

  let signature: string;
  switch (encoding) {
    case "utf-8":
    case "utf8":
      signature = sigBuf.toString("utf-8");
      break;
    case "base64":
      signature = sigBuf.toString("base64");
      break;
    case "hex":
    default:
      signature = sigBuf.toString("hex");
      break;
  }

  return {
    signature,
  };
};

export const verifySignature = (
  message: string,
  signature: string,
  publicKey: mvc.PublicKey,
  encoding?: "utf-8" | "base64" | "hex" | "utf8"
) => {
  const messageHash = mvc.crypto.Hash.sha256(
    Buffer.from("Bitcoin Signed Message:\n" + message)
  );

  const sigDER = Buffer.from(signature, encoding || "hex");
  const sigObj = mvc.crypto.Signature.fromDER(sigDER);

  let verified = mvc.crypto.ECDSA.verify(messageHash, sigObj, publicKey);

  return { verified };
};

type ToSignTransaction = {
  txHex: string;
  scriptHex: string;
  inputIndex: number;
  inputIndexes?: number[];
  satoshis: number;
  sigtype?: number;
  path?: string;
  hasMetaId?: boolean;
  dataDependsOn?: number;
};
export const signTransaction = async (
  { txHex, scriptHex, inputIndex, satoshis, sigtype, path }: ToSignTransaction,
  returnsTransaction: boolean = false
) => {
  const network = await getNetwork();
  const activeWallet = await getActiveWalletOnlyAccount();
  const mneObj = mvc.Mnemonic.fromString(activeWallet.mnemonic);
  const hdpk = mneObj.toHDPrivateKey("", network);
  const rootPath = await getMvcRootPath();
  // find out priv / pub according to path
  const subPath = path || "0/0";
  const privateKey = hdpk.deriveChild(`${rootPath}/${subPath}`).privateKey;
  const publicKey = privateKey.toPublicKey();

  if (!sigtype)
    sigtype =
      mvc.crypto.Signature.SIGHASH_ALL | mvc.crypto.Signature.SIGHASH_FORKID;

  const tx = new mvc.Transaction(txHex);

  let sighash = mvc.Transaction.Sighash.sighash(
    tx,
    sigtype,
    inputIndex,
    new mvc.Script(scriptHex),
    new BN(satoshis)
  ).toString("hex");

  let sig = mvc.crypto.ECDSA.sign(
    Buffer.from(sighash, "hex"),
    privateKey,
    "little"
  );

  if (returnsTransaction) {
    const signedScript = mvc.Script.buildPublicKeyHashIn(
      publicKey,
      sig,
      sigtype
    );
    tx.inputs[inputIndex].setScript(signedScript);

    return {
      txHex: tx.toString(),
      txid: tx.id,
    };
  }

  console.log("tx.id:", tx.id.toString());
  return {
    publicKey: publicKey.toString(),
    r: sig.r.toString("hex"),
    s: sig.s.toString("hex"),
    sig: sig.set({ nhashtype: sigtype }).toTxFormat().toString("hex"),
    sigtype,
    txid: tx.id,
  };
};

export const signTransactions = async (
  toSignTransactions: ToSignTransaction[]
) => {
  const network = await getNetwork();
  const activeWallet = await getActiveWalletOnlyAccount();
  const mneObj = mvc.Mnemonic.fromString(activeWallet.mnemonic);
  const hdpk = mneObj.toHDPrivateKey("", network);
  const rootPath = await getMvcRootPath();

  // find out if transactions other than the first one are dependent on previous ones
  // if so, we need to sign them in order, and sequentially update the prevTxId of the later ones
  // so that the signature of the previous one can be calculated correctly
  const toSignTransactionsWithDependsOn: (ToSignTransaction & {
    dependsOn?: number;
  })[] = [];
  const txids = toSignTransactions.map(
    (tx) => new mvc.Transaction(tx.txHex).id
  );
  for (let i = 0; i < toSignTransactions.length; i++) {
    const { txHex, inputIndex } = toSignTransactions[i];
    const tx = new mvc.Transaction(txHex);
    const prevTxId = tx.inputs[inputIndex].prevTxId.toString("hex");
    if (txids.includes(prevTxId)) {
      toSignTransactionsWithDependsOn.push({
        ...toSignTransactions[i],
        dependsOn: txids.indexOf(prevTxId),
      });
    } else {
      toSignTransactionsWithDependsOn.push(toSignTransactions[i]);
    }
  }

  const signedTransactions: {
    txHex: string;
    txid: string;
  }[] = [];
  for (let i = 0; i < toSignTransactionsWithDependsOn.length; i++) {
    let { txHex, scriptHex, inputIndex, satoshis, sigtype, hasMetaId } =
      toSignTransactionsWithDependsOn[i];
    const toSign = toSignTransactionsWithDependsOn[i];

    if (!sigtype) {
      sigtype =
        mvc.crypto.Signature.SIGHASH_ALL | mvc.crypto.Signature.SIGHASH_FORKID;
    }

    const tx = new mvc.Transaction(txHex);

    // find out if this transaction depends on previous ones
    // if so, we need to update the prevTxId of the current one
    if (toSign.dependsOn !== undefined) {
      // structure dependencies
      const wrongTxId = tx.inputs[inputIndex].prevTxId.toString("hex");
      const prevTxId = signedTransactions[toSign.dependsOn].txid;

      // data dependencies
      let wrongDataTxId: string;
      let prevDataTxId: string;
      if (toSign.dataDependsOn !== undefined) {
        const dataDependentTx = new mvc.Transaction(
          toSignTransactionsWithDependsOn[toSign.dataDependsOn].txHex
        );
        wrongDataTxId = dataDependentTx.id;
        prevDataTxId = signedTransactions[toSign.dataDependsOn].txid;
      } else {
        wrongDataTxId = wrongTxId;
        prevDataTxId = prevTxId;
      }

      // update the prevTxId of the current tx
      tx.inputs[inputIndex].prevTxId = Buffer.from(prevTxId, "hex");

      // if hasMetaId is true, we need to also update the parent txid written in OP_RETURN
      // based on the wrongDataTxId and prevDataTxId
      if (hasMetaId) {
        const { messages: metaIdMessages, outputIndex } =
          await parseLocalTransaction(tx);

        if (outputIndex !== null) {
          // find out if prevTxId is already in the messages;
          // if so, we need to replace it with the new one
          for (let i = 0; i < metaIdMessages.length; i++) {
            if (typeof metaIdMessages[i] !== "string") continue;

            if (metaIdMessages[i].includes(wrongDataTxId)) {
              metaIdMessages[i] = (metaIdMessages[i] as string).replace(
                wrongDataTxId,
                prevDataTxId
              );
              break;
            }
          }

          // update the OP_RETURN
          const opReturnOutput = new mvc.Transaction.Output({
            script: mvc.Script.buildSafeDataOut(metaIdMessages),
            satoshis: 0,
          });

          // update the OP_RETURN output in tx
          tx.outputs[outputIndex] = opReturnOutput;
        }
      }
    }

    // find out priv / pub according to path
    const subPath = toSign.path || "0/0";
    const privateKey = hdpk.deriveChild(`${rootPath}/${subPath}`).privateKey;
    const publicKey = privateKey.toPublicKey();

    // Build signature of this input
    const signature = mvc.Transaction.Sighash.sign(
      tx,
      privateKey,
      sigtype,
      inputIndex,
      new mvc.Script(scriptHex),
      new BN(satoshis)
    );
    const signatureScript = mvc.Script.buildPublicKeyHashIn(
      publicKey,
      signature,
      sigtype
    );
    tx.inputs[inputIndex].setScript(signatureScript);

    signedTransactions.push({
      txHex: tx.toString(),
      txid: tx.id,
    });
  }

  return signedTransactions;
};

/**
 * the core difference between signTransaction and payTransaction is that
 * pay not only signs the transaction, but also tries to finish the transaction by adding payment UTXO and change accordingly
 * That way, by using this api, application developers can avoid the hassle of looking for a appropriate paying utxo, calculating the change and adding the change output
 * isn't that a cool idea?
 *
 */
// export const payTransactions = async (
//   toPayTransactions: {
//     txComposer: string;
//     message?: string;
//   }[],
//   hasMetaid: boolean = false
// ) => {
//   const network = await getNetwork();
//   const wallet = await getCurrentWallet(Chain.MVC);
//   const activeWallet = await getActiveWalletOnlyAccount();
//   const address = wallet.getAddress();
//   let usableUtxos = ((await fetchUtxos(Chain.MVC, address)) as MvcUtxo[]).map(
//     (u) => {
//       return {
//         txId: u.txid,
//         outputIndex: u.outIndex,
//         satoshis: u.value,
//         address,
//         height: u.height,
//       };
//     }
//   );

//   // find out if transactions other than the first one are dependent on previous ones
//   // if so, we need to sign them in order, and sequentially update the prevTxId of the later ones
//   // so that the signature of the previous one can be calculated correctly

//   // first we gather all txids using a map for future mutations
//   const txids = new Map<string, string>();
//   toPayTransactions.forEach(({ txComposer: txComposerSerialized }) => {
//     const txid = TxComposer.deserialize(txComposerSerialized).getTxId();
//     txids.set(txid, txid);
//   });

//   // we finish the transaction by finding the appropriate utxo and calculating the change
//   const payedTransactions = [];
//   for (let i = 0; i < toPayTransactions.length; i++) {
//     const toPayTransaction = toPayTransactions[i];
//     // record current txid
//     const currentTxid = TxComposer.deserialize(
//       toPayTransaction.txComposer
//     ).getTxId();

//     const txComposer = TxComposer.deserialize(toPayTransaction.txComposer);
//     const tx = txComposer.tx;

//     // make sure that every input has an output
//     const inputs = tx.inputs;
//     const existingInputsLength = tx.inputs.length;
//     for (let i = 0; i < inputs.length; i++) {
//       if (!inputs[i].output) {
//         throw new Error(
//           "The output of every input of the transaction must be provided"
//         );
//       }
//     }

//     // update metaid metadata
//     if (hasMetaid) {
//       const { messages: metaIdMessages, outputIndex } =
//         await parseLocalTransaction(tx);

//       if (outputIndex !== null) {
//         let replaceFound = false
//         // find out if any of the messages contains the wrong txid
//         // how to find out the wrong txid?
//         // it's the keys of txids Map
//         const prevTxids = Array.from(txids.keys());

//         // we use a nested loops here to find out the wrong txid
//         for (let i = 0; i < metaIdMessages.length; i++) {
//           for (let j = 0; j < prevTxids.length; j++) {
//             if (typeof metaIdMessages[i] !== "string") continue;

//             if (metaIdMessages[i].includes(prevTxids[j])) {
//               replaceFound = true
//               metaIdMessages[i] = (metaIdMessages[i] as string).replace(
//                 prevTxids[j],
//                 txids.get(prevTxids[j])!
//               );
//             }
//           }
//         }

//         // // update the OP_RETURN
//         // const opReturnOutput = new mvc.Transaction.Output({
//         //   script: mvc.Script.buildSafeDataOut(metaIdMessages),
//         //   satoshis: 0,
//         // });

//         // // update the OP_RETURN output in tx
//         // tx.outputs[outputIndex] = opReturnOutput;

//         if (replaceFound) {
//           // update the OP_RETURN
//           const opReturnOutput = new mvc.Transaction.Output({
//             script: mvc.Script.buildSafeDataOut(metaIdMessages),
//             satoshis: 0,
//           })

//           // update the OP_RETURN output in tx
//           tx.outputs[outputIndex] = opReturnOutput
//         }
//       }
//     }

//     const addressObj = new mvc.Address(address, network);
//     // find out the total amount of the transaction (total output minus total input)
//     const totalOutput = tx.outputs.reduce(
//       (acc, output) => acc + output.satoshis,
//       0
//     );
//     const totalInput = tx.inputs.reduce(
//       (acc, input) => acc + input.output!.satoshis,
//       0
//     );
//     const currentSize = tx.toBuffer().length;
//     const currentFee = FEEB * currentSize;
//     const difference = totalOutput - totalInput + currentFee;

//     console.log("Pick Utxo111:"+JSON.stringify(usableUtxos));
//     console.log("Pick Utxo222:"+JSON.stringify(difference));

//     const pickedUtxos = pickUtxo(usableUtxos, difference);
//     console.log("Pick Utxo:"+JSON.stringify(pickedUtxos));

//     // append inputs
//     for (let i = 0; i < pickedUtxos.length; i++) {
//       const utxo = pickedUtxos[i];
//       txComposer.appendP2PKHInput({
//         address: addressObj,
//         txId: utxo.txId,
//         outputIndex: utxo.outputIndex,
//         satoshis: utxo.satoshis,
//       });

//       // remove it from usableUtxos
//       usableUtxos = usableUtxos.filter((u) => {
//         return u.txId !== utxo.txId || u.outputIndex !== utxo.outputIndex;
//       });
//     }

//     const changeIndex = txComposer.appendChangeOutput(addressObj, FEEB);
//     const changeOutput = txComposer.getOutput(changeIndex);

//     // sign
//     const mneObj = mvc.Mnemonic.fromString(activeWallet.mnemonic);
//     const hdpk = mneObj.toHDPrivateKey("", network);

//     const rootPath = await getMvcRootPath();
//     const basePrivateKey = hdpk.deriveChild(rootPath);
//     const rootPrivateKey = hdpk.deriveChild(`${rootPath}/0/0`).privateKey;

//     // we have to find out the private key of existing inputs
//     const toUsePrivateKeys = new Map<number, mvc.PrivateKey>();
//     for (let i = 0; i < existingInputsLength; i++) {
//       const input = txComposer.getInput(i);
//       // gotta change the prevTxId of the input to the correct one, if there's some kind of dependency to previous txs
//       const prevTxId = input.prevTxId.toString("hex");
//       if (txids.has(prevTxId)) {
//         input.prevTxId = Buffer.from(txids.get(prevTxId)!, "hex");
//       }

//       // find out the path corresponding to this input's prev output's address
//       const inputAddress = mvc.Address.fromString(
//         input.output!.script.toAddress().toString(),
//         network === "regtest" ? "testnet" : network
//       ).toString();
//       let deriver = 0;
//       let toUsePrivateKey: mvc.PrivateKey | undefined = undefined;
//       while (deriver < DERIVE_MAX_DEPTH) {
//         const childPk = basePrivateKey.deriveChild(0).deriveChild(deriver);
//         const childAddress = childPk.publicKey
//           .toAddress("mainnet" as any)
//           .toString();

//         if (childAddress === inputAddress.toString()) {
//           toUsePrivateKey = childPk.privateKey;
//           break;
//         }

//         deriver++;
//       }

//       if (!toUsePrivateKey) {
//         throw new Error(`Cannot find the private key of index #${i} input`);
//       }

//       // record the private key
//       toUsePrivateKeys.set(i, toUsePrivateKey);
//     }

//     // sign the existing inputs
//     toUsePrivateKeys.forEach((privateKey, index) => {
//       txComposer.unlockP2PKHInput(privateKey, index);
//     });

//     // then we use root private key to sign the new inputs (those we just added to pay)
//     pickedUtxos.forEach((v, index) => {
//       txComposer.unlockP2PKHInput(rootPrivateKey, index + existingInputsLength);
//     });

//     // change txids map to reflect the new txid
//     const txid = txComposer.getTxId();
//     txids.set(currentTxid, txid);

//     // return the payed transactions
//     payedTransactions.push(txComposer.serialize());

//     // add changeOutput to usableUtxos
//     if (changeIndex >= 0) {
//       usableUtxos.push({
//         txId: txComposer.getTxId(),
//         outputIndex: changeIndex,
//         satoshis: changeOutput.satoshis,
//         address,
//         height: -1,
//       });
//     }
//   }

//   return payedTransactions;
// };

export const payTransactions = async (
  toPayTransactions: {
    txComposer: string;
    message?: string;
  }[],
  hasMetaid: boolean = false,
  feeb?: number
) => {
  const network = await getNetwork();
  const wallet = await getCurrentWallet(Chain.MVC);
  const activeWallet = await getActiveWalletOnlyAccount();
  // const password = await getPassword()
  const address = wallet.getAddress();

  if (!feeb) {
    feeb = await getDefaultMVCTRate();
  }
  console.log("当前 Using MVC fee rate:", feeb);
  let usableUtxos = ((await fetchUtxos(Chain.MVC, address)) as MvcUtxo[]).map(
    (u) => {
      return {
        txId: u.txid,
        outputIndex: u.outIndex,
        satoshis: u.value,
        address,
        height: u.height,
      };
    }
  );

  // find out if transactions other than the first one are dependent on previous ones
  // if so, we need to sign them in order, and sequentially update the prevTxId of the later ones
  // so that the signature of the previous one can be calculated correctly

  // first we gather all txids using a map for future mutations
  const txids = new Map<string, string>();
  toPayTransactions.forEach(({ txComposer: txComposerSerialized }) => {
    const txid = TxComposer.deserialize(txComposerSerialized).getTxId();
    txids.set(txid, txid);
  });

  // we finish the transaction by finding the appropriate utxo and calculating the change
  const payedTransactions = [];
  for (let i = 0; i < toPayTransactions.length; i++) {
    const toPayTransaction = toPayTransactions[i];
    // record current txid
    const currentTxid = TxComposer.deserialize(
      toPayTransaction.txComposer
    ).getTxId();

    const txComposer = TxComposer.deserialize(toPayTransaction.txComposer);
    const tx = txComposer.tx;

    // make sure that every input has an output
    const inputs = tx.inputs;
    const existingInputsLength = tx.inputs.length;
    for (let i = 0; i < inputs.length; i++) {
      if (!inputs[i].output) {
        throw new Error(
          "The output of every input of the transaction must be provided"
        );
      }
    }

    // update metaid metadata
    if (hasMetaid) {
      const { messages: metaIdMessages, outputIndex } =
        await parseLocalTransaction(tx);

      if (outputIndex !== null) {
        let replaceFound = false;
        // find out if any of the messages contains the wrong txid
        // how to find out the wrong txid?
        // it's the keys of txids Map
        const prevTxids = Array.from(txids.keys());

        // we use a nested loops here to find out the wrong txid
        for (let i = 0; i < metaIdMessages.length; i++) {
          for (let j = 0; j < prevTxids.length; j++) {
            if (typeof metaIdMessages[i] !== "string") continue;

            if (metaIdMessages[i].includes(prevTxids[j])) {
              replaceFound = true;
              metaIdMessages[i] = (metaIdMessages[i] as string).replace(
                prevTxids[j],
                txids.get(prevTxids[j])!
              );
            }
          }
        }

        if (replaceFound) {
          // update the OP_RETURN
          const opReturnOutput = new mvc.Transaction.Output({
            script: mvc.Script.buildSafeDataOut(metaIdMessages),
            satoshis: 0,
          });

          // update the OP_RETURN output in tx
          tx.outputs[outputIndex] = opReturnOutput;
        }
      }
    }

    const addressObj = new mvc.Address(address, network);
    // find out the total amount of the transaction (total output minus total input)
    const totalOutput = tx.outputs.reduce(
      (acc, output) => acc + output.satoshis,
      0
    );
    const totalInput = tx.inputs.reduce(
      (acc, input) => acc + input.output!.satoshis,
      0
    );
    const currentSize = tx.toBuffer().length;
    const currentFee = feeb * currentSize;
    const difference = totalOutput - totalInput + currentFee;

    const pickedUtxos = pickUtxo(usableUtxos, difference, feeb);

    // append inputs
    for (let i = 0; i < pickedUtxos.length; i++) {
      const utxo = pickedUtxos[i];
      txComposer.appendP2PKHInput({
        address: addressObj,
        txId: utxo.txId,
        outputIndex: utxo.outputIndex,
        satoshis: utxo.satoshis,
      });

      // remove it from usableUtxos
      usableUtxos = usableUtxos.filter((u) => {
        return u.txId !== utxo.txId || u.outputIndex !== utxo.outputIndex;
      });
    }

    const changeIndex = txComposer.appendChangeOutput(addressObj, feeb);
    const changeOutput = txComposer.getOutput(changeIndex);

    // sign
    // const mneObj = mvc.Mnemonic.fromString(decrypt(activeWallet.mnemonic, password))
    const mneObj = mvc.Mnemonic.fromString(activeWallet.mnemonic);
    const hdpk = mneObj.toHDPrivateKey("", network);

    const rootPath = await getMvcRootPath();
    const basePrivateKey = hdpk.deriveChild(rootPath);
    // const rootPrivateKey = hdpk.deriveChild(`${rootPath}/0/0`).privateKey
    const rootPrivateKey = mvc.PrivateKey.fromWIF(wallet.getPrivateKey());

    // we have to find out the private key of existing inputs
    const toUsePrivateKeys = new Map<number, mvc.PrivateKey>();
    for (let i = 0; i < existingInputsLength; i++) {
      const input = txComposer.getInput(i);
      // gotta change the prevTxId of the input to the correct one, if there's some kind of dependency to previous txs
      const prevTxId = input.prevTxId.toString("hex");
      if (txids.has(prevTxId)) {
        input.prevTxId = Buffer.from(txids.get(prevTxId)!, "hex");
      }

      // find out the path corresponding to this input's prev output's address
      const inputAddress = mvc.Address.fromString(
        input.output!.script.toAddress().toString(),
        network === "regtest" ? "testnet" : network
      ).toString();
      let deriver = 0;
      let toUsePrivateKey: mvc.PrivateKey | undefined = undefined;
      while (deriver < DERIVE_MAX_DEPTH) {
        const childPk = basePrivateKey.deriveChild(0).deriveChild(deriver);
        const childAddress = childPk.publicKey
          .toAddress(network === "regtest" ? "testnet" : network)
          .toString();

        if (childAddress === inputAddress.toString()) {
          toUsePrivateKey = childPk.privateKey;
          break;
        }

        deriver++;
      }

      if (!toUsePrivateKey) {
        throw new Error(`Cannot find the private key of index #${i} input`);
      }

      // record the private key
      toUsePrivateKeys.set(i, toUsePrivateKey);
    }

    // sign the existing inputs
    toUsePrivateKeys.forEach((privateKey, index) => {
      txComposer.unlockP2PKHInput(privateKey, index);
    });

    // then we use root private key to sign the new inputs (those we just added to pay)
    pickedUtxos.forEach((v, index) => {
      txComposer.unlockP2PKHInput(rootPrivateKey, index + existingInputsLength);
    });

    // change txids map to reflect the new txid
    const txid = txComposer.getTxId();
    txids.set(currentTxid, txid);

    // return the payed transactions
    payedTransactions.push(txComposer.serialize());

    // add changeOutput to usableUtxos
    if (changeIndex >= 0) {
      usableUtxos.push({
        txId: txComposer.getTxId(),
        outputIndex: changeIndex,
        satoshis: changeOutput.satoshis,
        address,
        height: -1,
      });
    }
  }

  return payedTransactions;
};

export const smallPayTransactions = async (
  toPayTransactions: {
    txComposer: string;
    message?: string;
  }[],
  hasMetaid: boolean = false,
  feeb?: number,
  autoPaymentAmount: number = 0,
  options?: { password: string }
) => {
  // const network = await getNetwork()
  // const password = options?.password || (await getPassword())
  // const activeWallet = await getActiveWalletOnlyAccount()
  // const wallet = await getCurrentWallet(Chain.MVC, options)
  // const address = wallet.getAddress()

  const network = await getNetwork();
  const wallet = await getCurrentWallet(Chain.MVC);
  const activeWallet = await getActiveWalletOnlyAccount();
  const address = wallet.getAddress();
  if (!feeb) {
    feeb = await getDefaultMVCTRate();
  }
  let usableUtxos = ((await fetchUtxos(Chain.MVC, address)) as MvcUtxo[]).map(
    (u) => {
      return {
        txId: u.txid,
        outputIndex: u.outIndex,
        satoshis: u.value,
        address,
        height: u.height,
      };
    }
  );

  // find out if transactions other than the first one are dependent on previous ones
  // if so, we need to sign them in order, and sequentially update the prevTxId of the later ones
  // so that the signature of the previous one can be calculated correctly

  // first we gather all txids using a map for future mutations
  const txids = new Map<string, string>();
  toPayTransactions.forEach(({ txComposer: txComposerSerialized }) => {
    const txid = TxComposer.deserialize(txComposerSerialized).getTxId();
    txids.set(txid, txid);
  });

  // we finish the transaction by finding the appropriate utxo and calculating the change
  const payedTransactions = [];
  let cost = 0;
  for (let i = 0; i < toPayTransactions.length; i++) {
    const toPayTransaction = toPayTransactions[i];
    // record current txid
    const currentTxid = TxComposer.deserialize(
      toPayTransaction.txComposer
    ).getTxId();

    const txComposer = TxComposer.deserialize(toPayTransaction.txComposer);
    const tx = txComposer.tx;

    // make sure that every input has an output
    const inputs = tx.inputs;
    const existingInputsLength = tx.inputs.length;
    for (let i = 0; i < inputs.length; i++) {
      if (!inputs[i].output) {
        throw new Error(
          "The output of every input of the transaction must be provided"
        );
      }
    }

    // update metaid metadata
    if (hasMetaid) {
      const { messages: metaIdMessages, outputIndex } =
        await parseLocalTransaction(tx);

      if (outputIndex !== null) {
        let replaceFound = false;
        // find out if any of the messages contains the wrong txid
        // how to find out the wrong txid?
        // it's the keys of txids Map
        const prevTxids = Array.from(txids.keys());

        // we use a nested loops here to find out the wrong txid
        for (let i = 0; i < metaIdMessages.length; i++) {
          for (let j = 0; j < prevTxids.length; j++) {
            if (typeof metaIdMessages[i] !== "string") continue;

            if (metaIdMessages[i].includes(prevTxids[j])) {
              replaceFound = true;
              metaIdMessages[i] = (metaIdMessages[i] as string).replace(
                prevTxids[j],
                txids.get(prevTxids[j])!
              );
            }
          }
        }

        if (replaceFound) {
          // update the OP_RETURN
          const opReturnOutput = new mvc.Transaction.Output({
            script: mvc.Script.buildSafeDataOut(metaIdMessages),
            satoshis: 0,
          });

          // update the OP_RETURN output in tx
          tx.outputs[outputIndex] = opReturnOutput;
        }
      }
    }

    const addressObj = new mvc.Address(address, network);
    // find out the total amount of the transaction (total output minus total input)
    const totalOutput = tx.outputs.reduce(
      (acc, output) => acc + output.satoshis,
      0
    );
    const totalInput = tx.inputs.reduce(
      (acc, input) => acc + input.output!.satoshis,
      0
    );
    const currentSize = tx.toBuffer().length;
    const currentFee = feeb * currentSize;
    const difference = totalOutput - totalInput + currentFee;

    // Validate transaction outputs
    if (!tx || !Array.isArray(tx.outputs)) {
      throw new Error("Invalid transaction: missing or invalid outputs");
    }

    for (let i = 0; i < tx.outputs.length; i++) {
      const output = tx.outputs[i];

      // Skip outputs without script
      if (!output?.script) continue;

      try {
        // Skip OP_RETURN outputs
        if (output.script.toASM().includes("OP_RETURN")) {
          continue;
        }

        // Get and normalize output address
        const outputAddress = output.script
          .toAddress()
          .toString()
          .toLowerCase();

        // Get and normalize wallet address
        const walletAddress = wallet.getAddress().toLowerCase();

        // Compare normalized addresses
        if (outputAddress !== walletAddress) {
          throw new Error(
            `Security violation: Output ${i} address ${outputAddress} ` +
              `does not match wallet address ${walletAddress}`
          );
        }
      } catch (err: unknown) {
        // Handle potential toAddress() errors
        const errorMessage =
          err instanceof Error
            ? output.script.isDataOut()
              ? "Cannot convert data output to address"
              : output.script.isSafeDataOut()
                ? "Cannot convert safe data output to address"
                : err.message
            : "Unknown script conversion error";

        throw new Error(
          `Failed to validate output ${i}: ${errorMessage}. ` +
            `Script type: ${output.script.classifyOutput() || "unknown"}`
        );
      }
    }

    const pickedUtxos = pickUtxo(usableUtxos, difference, feeb);

    // append inputs
    for (let i = 0; i < pickedUtxos.length; i++) {
      const utxo = pickedUtxos[i];
      txComposer.appendP2PKHInput({
        address: addressObj,
        txId: utxo.txId,
        outputIndex: utxo.outputIndex,
        satoshis: utxo.satoshis,
      });

      // remove it from usableUtxos
      usableUtxos = usableUtxos.filter((u) => {
        return u.txId !== utxo.txId || u.outputIndex !== utxo.outputIndex;
      });
    }

    const changeIndex = txComposer.appendChangeOutput(addressObj, feeb);
    const changeOutput = txComposer.getOutput(changeIndex);

    {
      const tx = txComposer.tx;
      const totalOutput = tx.outputs.reduce(
        (acc, output) => acc + output.satoshis,
        0
      );
      const totalInput = tx.inputs.reduce(
        (acc, input) => acc + input.output!.satoshis,
        0
      );
      cost = cost + (totalInput - totalOutput);

      if (
        autoPaymentAmount !== 0 &&
        totalInput - totalOutput > autoPaymentAmount
      ) {
        throw new Error(
          `The fee is too high: ${totalInput - totalOutput}, it should be less than ${autoPaymentAmount}`
        );
      }
    }

    // sign
    // const mneObj = mvc.Mnemonic.fromString(
    //   decrypt(activeWallet.mnemonic, password)
    // );
    const mneObj = mvc.Mnemonic.fromString(activeWallet.mnemonic);
    const hdpk = mneObj.toHDPrivateKey("", network);

    const rootPath = await getMvcRootPath();
    const basePrivateKey = hdpk.deriveChild(rootPath);
    // const rootPrivateKey = hdpk.deriveChild(`${rootPath}/0/0`).privateKey
    const rootPrivateKey = mvc.PrivateKey.fromWIF(wallet.getPrivateKey());

    // we have to find out the private key of existing inputs
    const toUsePrivateKeys = new Map<number, mvc.PrivateKey>();
    for (let i = 0; i < existingInputsLength; i++) {
      const input = txComposer.getInput(i);
      // gotta change the prevTxId of the input to the correct one, if there's some kind of dependency to previous txs
      const prevTxId = input.prevTxId.toString("hex");
      if (txids.has(prevTxId)) {
        input.prevTxId = Buffer.from(txids.get(prevTxId)!, "hex");
      }

      // find out the path corresponding to this input's prev output's address
      const inputAddress = mvc.Address.fromString(
        input.output!.script.toAddress().toString(),
        network === "regtest" ? "testnet" : network
      ).toString();
      let deriver = 0;
      let toUsePrivateKey: mvc.PrivateKey | undefined = undefined;
      while (deriver < DERIVE_MAX_DEPTH) {
        const childPk = basePrivateKey.deriveChild(0).deriveChild(deriver);
        const childAddress = childPk.publicKey
          .toAddress(network === "regtest" ? "testnet" : network)
          .toString();

        if (childAddress === inputAddress.toString()) {
          toUsePrivateKey = childPk.privateKey;
          break;
        }

        deriver++;
      }

      if (!toUsePrivateKey) {
        throw new Error(`Cannot find the private key of index #${i} input`);
      }

      // record the private key
      toUsePrivateKeys.set(i, toUsePrivateKey);
    }

    // sign the existing inputs
    toUsePrivateKeys.forEach((privateKey, index) => {
      txComposer.unlockP2PKHInput(privateKey, index);
    });

    // then we use root private key to sign the new inputs (those we just added to pay)
    pickedUtxos.forEach((v, index) => {
      txComposer.unlockP2PKHInput(rootPrivateKey, index + existingInputsLength);
    });

    // change txids map to reflect the new txid
    const txid = txComposer.getTxId();
    txids.set(currentTxid, txid);

    // return the payed transactions
    payedTransactions.push(txComposer.serialize());

    // add changeOutput to usableUtxos
    if (changeIndex >= 0) {
      usableUtxos.push({
        txId: txComposer.getTxId(),
        outputIndex: changeIndex,
        satoshis: changeOutput.satoshis,
        address,
        height: -1,
      });
    }
  }

  return { payedTransactions, cost };
};
export const payTransactionsWithUtxos = async (
  toPayTransactions: {
    txComposer: string;
    message?: string;
  }[],
  utxos: {
    txId: string;
    outputIndex: number;
    satoshis: number;
    address: string;
    height: number;
  }[],
  signType: number = mvc.crypto.Signature.SIGHASH_ALL,
  hasMetaid: boolean = false
) => {
  if (toPayTransactions.length !== utxos.length) {
    throw new Error(
      "The number of transactions must match the number of UTXOs"
    );
  }
  const network = await getNetwork();
  const wallet = await getCurrentWallet(Chain.MVC);
  const activeWallet = await getActiveWalletOnlyAccount();
  // const password = await getPassword()
  const address = wallet.getAddress();

  const txids = new Map<string, string>();
  toPayTransactions.forEach(({ txComposer: txComposerSerialized }) => {
    const txid = TxComposer.deserialize(txComposerSerialized).getTxId();
    txids.set(txid, txid);
  });

  const payedTransactions = [];
  for (let i = 0; i < toPayTransactions.length; i++) {
    const toPayTransaction = toPayTransactions[i];
    const currentUtxo = utxos[i];
    const currentTxid = TxComposer.deserialize(
      toPayTransaction.txComposer
    ).getTxId();

    const txComposer = TxComposer.deserialize(toPayTransaction.txComposer);
    const tx = txComposer.tx;

    const inputs = tx.inputs;
    const existingInputsLength = tx.inputs.length;
    for (let i = 0; i < inputs.length; i++) {
      if (!inputs[i].output) {
        throw new Error(
          "The output of every input of the transaction must be provided"
        );
      }
    }

    if (hasMetaid) {
      const { messages: metaIdMessages, outputIndex } =
        await parseLocalTransaction(tx);

      if (outputIndex !== null) {
        let replaceFound = false;
        const prevTxids = Array.from(txids.keys());

        for (let i = 0; i < metaIdMessages.length; i++) {
          for (let j = 0; j < prevTxids.length; j++) {
            if (typeof metaIdMessages[i] !== "string") continue;

            if (metaIdMessages[i].includes(prevTxids[j])) {
              replaceFound = true;
              metaIdMessages[i] = (metaIdMessages[i] as string).replace(
                prevTxids[j],
                txids.get(prevTxids[j])!
              );
            }
          }
        }

        if (replaceFound) {
          const opReturnOutput = new mvc.Transaction.Output({
            script: mvc.Script.buildSafeDataOut(metaIdMessages),
            satoshis: 0,
          });
          tx.outputs[outputIndex] = opReturnOutput;
        }
      }
    }

    const addressObj = new mvc.Address(address, network);

    txComposer.appendP2PKHInput({
      address: addressObj,
      txId: currentUtxo.txId,
      outputIndex: currentUtxo.outputIndex,
      satoshis: currentUtxo.satoshis,
    });

    const mneObj = mvc.Mnemonic.fromString(activeWallet.mnemonic);
    const hdpk = mneObj.toHDPrivateKey("", network);

    const rootPath = await getMvcRootPath();
    const basePrivateKey = hdpk.deriveChild(rootPath);
    const rootPrivateKey = mvc.PrivateKey.fromWIF(wallet.getPrivateKey());

    const toUsePrivateKeys = new Map<number, mvc.PrivateKey>();
    for (let i = 0; i < existingInputsLength; i++) {
      const input = txComposer.getInput(i);
      const prevTxId = input.prevTxId.toString("hex");
      if (txids.has(prevTxId)) {
        input.prevTxId = Buffer.from(txids.get(prevTxId)!, "hex");
      }

      const inputAddress = mvc.Address.fromString(
        input.output!.script.toAddress().toString(),
        network === "regtest" ? "testnet" : network
      ).toString();
      let deriver = 0;
      let toUsePrivateKey: mvc.PrivateKey | undefined = undefined;
      while (deriver < DERIVE_MAX_DEPTH) {
        const childPk = basePrivateKey.deriveChild(0).deriveChild(deriver);
        const childAddress = childPk.publicKey
          .toAddress(network === "regtest" ? "testnet" : network)
          .toString();

        if (childAddress === inputAddress.toString()) {
          toUsePrivateKey = childPk.privateKey;
          break;
        }

        deriver++;
      }

      if (!toUsePrivateKey) {
        throw new Error(`Cannot find the private key of index #${i} input`);
      }

      toUsePrivateKeys.set(i, toUsePrivateKey);
    }

    toUsePrivateKeys.forEach((privateKey, index) => {
      txComposer.unlockP2PKHInput(privateKey, index, signType);
    });

    txComposer.unlockP2PKHInput(rootPrivateKey, existingInputsLength, signType);

    const txid = txComposer.getTxId();
    txids.set(currentTxid, txid);

    payedTransactions.push(txComposer.serialize());
  }

  return payedTransactions;
};

type SA_utxo = {
  txId: string;
  outputIndex: number;
  satoshis: number;
  address: string;
  height: number;
};
function pickUtxo(utxos: SA_utxo[], amount: number, feeb: number) {
  // amount + 2 outputs + buffer
  let requiredAmount = amount + 34 * 2 * feeb + 100;

  if (requiredAmount <= 0) {
    return [];
  }

  // if the sum of utxos is less than requiredAmount, throw error
  const sum = utxos.reduce((acc, utxo) => acc + utxo.satoshis, 0);
  if (sum < requiredAmount) {
    throw new Error("Not enough balance");
  }

  const candidateUtxos: SA_utxo[] = [];
  // split utxo to confirmed and unconfirmed and shuffle them
  const confirmedUtxos = utxos
    .filter((utxo) => {
      return utxo.height > 0;
    })
    .sort(() => Math.random() - 0.5);
  const unconfirmedUtxos = utxos
    .filter((utxo) => {
      return utxo.height <= 0;
    })
    .sort(() => Math.random() - 0.5);

  let current = 0;
  // use confirmed first
  for (let utxo of confirmedUtxos) {
    current += utxo.satoshis;
    // add input fee
    requiredAmount += feeb * P2PKH_UNLOCK_SIZE;
    candidateUtxos.push(utxo);
    if (current > requiredAmount) {
      return candidateUtxos;
    }
  }
  for (let utxo of unconfirmedUtxos) {
    current += utxo.satoshis;
    // add input fee
    requiredAmount += feeb * P2PKH_UNLOCK_SIZE;
    candidateUtxos.push(utxo);
    if (current > requiredAmount) {
      return candidateUtxos;
    }
  }
  return candidateUtxos;
}

/**
 * Retrieves secret data.
 * @param password The password used for encryption.
 * @returns An object containing the secret key and initialization vector (both parsed from the password).
 */
export function getSecretData(password: string) {
  return {
    SECRET_KEY: CryptoJS.enc.Utf8.parse(password),
    SECRET_IV: CryptoJS.enc.Utf8.parse("0000000000000000"),
  };
}

export function encrypt(mnemonic: string, password: string) {
  const { SECRET_KEY, SECRET_IV } = getSecretData(password);
  const mnemonicUtf8 = CryptoJS.enc.Utf8.parse(mnemonic);
  const encrypted = CryptoJS.AES.encrypt(mnemonicUtf8, SECRET_KEY, {
    iv: SECRET_IV,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.ciphertext.toString();
}

export function decrypt(encryptedText: string, password: string) {
  const { SECRET_KEY, SECRET_IV } = getSecretData(password);
  const encryptedHexStr = CryptoJS.enc.Hex.parse(encryptedText);
  const str = CryptoJS.enc.Base64.stringify(encryptedHexStr);
  const decrypt = CryptoJS.AES.decrypt(str, SECRET_KEY, {
    iv: SECRET_IV,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  const decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
  return decryptedStr.toString();
}

export const unlockP2PKHInput = async (params: UnlockP2PKHInputParams) => {
  const network = await getNetwork();
  const wallet = await getCurrentWallet(Chain.MVC);
  const rootPrivateKey = mvc.PrivateKey.fromWIF(wallet.getPrivateKey());
  const payedTransactions: string[] = [];
  params.transaction.forEach((tx) => {
    const { txComposer: txComposerSerialized, toSignInputs } = tx;
    const txComposer = TxComposer.deserialize(txComposerSerialized);
    // console.log("txComposer", txComposer);
    toSignInputs.forEach((inputIndex) => {
      txComposer.unlockP2PKHInput(
        new mvc.PrivateKey(
          rootPrivateKey,
          network === "mainnet" ? "mainnet" : "testnet"
        ),
        inputIndex
      );
    });
    payedTransactions.push(txComposer.serialize());
  });
  return payedTransactions;
};
