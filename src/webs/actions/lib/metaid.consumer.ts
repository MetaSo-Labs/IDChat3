// import { Injectable } from "@nestjs/common";
// import { IConsumer, ConsumerConfig } from "../interfaces/consumer.interface";
// import { Post } from "../../crawlers/interfaces/crawler.interface";
// import { mvc, TxComposer } from "meta-contract";
// import { ConfigService } from "@nestjs/config";
// import * as path from "path";
import { getBtcNetwork, getNetwork } from "@/lib/network";
import { getActiveWallet, getCurrentWallet } from "@/lib/wallet";
import { mvc, TxComposer } from "meta-contract";

// 添加必要的类型定义
interface MetaidData {
  revealAddr?: string;
  [key: string]: any;
}

interface Transaction {
  txComposer: TxComposer;
  message: string;
}

interface CreatePinResult {
  txIds?: string[];
  transactions?: Transaction[];
}

type BtcNetwork = "mainnet" | "testnet";

// 添加必要的常量
const FEEB = 1; // 费率，根据实际情况调整

// 定义 UTXO 接口
interface Utxo {
  txId: string;
  outputIndex: number;
  satoshis: number;
  address: string;
  height: number;
}

// Add interfaces for the createBuzz method
export interface AttachmentItem {
  data: string; // Base64 or hex encoded image data
  fileType: string; // MIME type of the file
  name?: string; // Optional filename
}

export interface BuzzOptions {
  content: string;
  images?: AttachmentItem[];
  quotePin?: { id: string };
  network?: BtcNetwork;
}

export class MetaIdConsumer {
  //   constructor(private configService: ConfigService) {}

  //   async consume(posts: Post[], config: ConsumerConfig): Promise<void> {
  //     if (!this.validateConfig()) {
  //       throw new Error("Invalid MetaID consumer configuration");
  //     }

  //     // MetaIdConsumer现在只专注于MetaID操作，不处理帖子
  //     console.log("MetaID Consumer 已准备好处理帖子，但不会直接处理它们。");
  //     console.log("请使用 TestConsumer 或其他消费者来处理帖子。");
  //   }

  //   validateConfig(): boolean {
  //     // 检查环境变量是否存在
  //     if (
  //       !this.configService.get("METAID_MNEMONIC") ||
  //       !this.configService.get("METAID_PATH")
  //     ) {
  //       console.error("缺少必要的 MetaID 环境变量配置");
  //       return false;
  //     }
  //     return true;
  //   }

  // 添加签名消息的方法
  private signMessage(
    message: string,
    privateKey: mvc.PrivateKey,
    encoding?: "utf-8" | "base64" | "hex" | "utf8"
  ): string {
    const messageHash = mvc.crypto.Hash.sha256(
      Buffer.from("Bitcoin Signed Message:\n" + message)
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

    return signature;
  }

  // 修改 createPin 方法返回所有 txid
  async createPin(
    metaidData: Omit<MetaidData, "revealAddr">,
    options: {
      signMessage?: string;
      serialAction?: "combo" | "finish";
      transactions?: Transaction[];
      network: BtcNetwork;
      service?: {
        address: string;
        satoshis: string;
      };
      outputs?: {
        address: string;
        satoshis: string;
      }[];
    }
  ): Promise<CreatePinResult> {
    const transactions: Transaction[] = options?.transactions ?? [];

    // 使用封装方法获取私钥和地址
    const { address } = await this.getCredentials();

    const pinTxComposer = new TxComposer();

    pinTxComposer.appendP2PKHOutput({
      address: new mvc.Address(address, options.network),
      satoshis: 1,
    });

    const metaidOpreturn = buildOpReturnV2(metaidData, {
      network: options?.network ?? "testnet",
    });

    pinTxComposer.appendOpReturnOutput(metaidOpreturn);

    if (
      options?.service &&
      options?.service.address &&
      options?.service.satoshis
    ) {
      pinTxComposer.appendP2PKHOutput({
        address: new mvc.Address(options.service.address, options.network),
        satoshis: Number(options.service.satoshis),
      });
    }

    if (options?.outputs) {
      for (const output of options.outputs) {
        pinTxComposer.appendP2PKHOutput({
          address: new mvc.Address(output.address, options.network),
          satoshis: Number(output.satoshis),
        });
      }
    }

    transactions.push({
      txComposer: pinTxComposer,
      message: "Create Pin",
    });

    if (options?.serialAction === "combo") {
      return { transactions };
    }

    ///// apply pay
    const payRes = await this.pay({
      transactions,
    });

    // for (const txComposer of payRes) {
    //   await this.connector.broadcast(txComposer)
    // }
    const txIDs = await this.batchBroadcast({
      txComposer: payRes,
      network: options.network,
    });

    for (const [index, p] of payRes.entries()) {
      const txid = p.getTxId();

      const isValid = txIDs[index] === txid;
      if (isValid) {
        await this.notify({ txHex: p.getRawHex() });
      } else {
        throw new Error("txid is not valid");
      }
    }

    return {
      txIds: txIDs,
      transactions,
    };
  }

  // 实现 pay 方法
  private async pay(options: {
    transactions: Transaction[];
  }): Promise<TxComposer[]> {
    // 准备交易数据
    const toPayTransactions = options.transactions.map((tx) => ({
      txComposer: tx.txComposer.serialize(),
      message: tx.message,
    }));

    // 获取网络和凭证
    // const network =
    //   this.configService.get<BtcNetwork>("METAID_NETWORK") || "mainnet";
    const network = "mainnet";
    const { privateKey, address } = await this.getCredentials();

    // 获取可用的 UTXO
    let usableUtxos = await this.fetchUtxos(address, network);

    // 收集所有交易 ID 用于后续处理
    const txids = new Map<string, string>();
    toPayTransactions.forEach(({ txComposer: txComposerSerialized }) => {
      const txid = TxComposer.deserialize(txComposerSerialized).getTxId();
      txids.set(txid, txid);
    });

    // 处理每个交易
    const payedTransactions: TxComposer[] = [];
    for (let i = 0; i < toPayTransactions.length; i++) {
      const toPayTransaction = toPayTransactions[i];
      // 记录当前交易 ID
      const currentTxid = TxComposer.deserialize(
        toPayTransaction.txComposer
      ).getTxId();

      const txComposer = TxComposer.deserialize(toPayTransaction.txComposer);
      const tx = txComposer.tx;

      // 确保每个输入都有对应的输出
      const inputs = tx.inputs;
      const existingInputsLength = tx.inputs.length;
      for (let j = 0; j < inputs.length; j++) {
        if (!inputs[j].output) {
          throw new Error("每个交易输入必须提供对应的输出");
        }
      }

      // 计算交易费用和所需金额
      const addressObj = new mvc.Address(address, network);
      const totalOutput = tx.outputs.reduce(
        (acc, output) => acc + output.satoshis,
        0
      );
      const totalInput = tx.inputs.reduce(
        (acc, input) => acc + input.output!.satoshis,
        0
      );
      const currentSize = tx.toBuffer().length;
      const currentFee = FEEB * currentSize;
      const difference = totalOutput - totalInput + currentFee;

      // 选择合适的 UTXO
      const pickedUtxos = this.pickUtxo(usableUtxos, difference);

      // 添加输入
      for (let j = 0; j < pickedUtxos.length; j++) {
        const utxo = pickedUtxos[j];
        txComposer.appendP2PKHInput({
          address: addressObj,
          txId: utxo.txId,
          outputIndex: utxo.outputIndex,
          satoshis: utxo.satoshis,
        });

        // 从可用 UTXO 中移除已使用的
        usableUtxos = usableUtxos.filter(
          (u) => u.txId !== utxo.txId || u.outputIndex !== utxo.outputIndex
        );
      }

      // 添加找零输出
      const changeIndex = txComposer.appendChangeOutput(addressObj, FEEB);
      const changeOutput = txComposer.getOutput(changeIndex);

      // 签名现有输入
      for (let j = 0; j < existingInputsLength; j++) {
        const input = txComposer.getInput(j);
        // 更新依赖于前一个交易的输入
        const prevTxId = input.prevTxId.toString("hex");
        if (txids.has(prevTxId)) {
          input.prevTxId = Buffer.from(txids.get(prevTxId)!, "hex");
        }

        // 使用私钥解锁输入
        txComposer.unlockP2PKHInput(privateKey, j);
      }

      // 签名新添加的输入
      pickedUtxos.forEach((v, index) => {
        txComposer.unlockP2PKHInput(privateKey, index + existingInputsLength);
      });

      // 更新交易 ID 映射
      const txid = txComposer.getTxId();
      txids.set(currentTxid, txid);

      // 添加到已支付交易列表
      payedTransactions.push(txComposer);

      // 将找零添加到可用 UTXO
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
  }

  // 实现 fetchUtxos 方法
  private async fetchUtxos(
    address: string,
    network: BtcNetwork
  ): Promise<Utxo[]> {
    try {
      const net = network === "mainnet" ? "mainnet" : "testnet";
      const url = `https://www.metalet.space/wallet-api/v4/mvc/address/utxo-list?net=${net}&address=${address}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`获取 UTXO 失败: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.code !== 0 || !data.data || !data.data.list) {
        throw new Error(`API 返回错误: ${data.message || "未知错误"}`);
      }

      // 将 API 返回的数据转换为我们需要的格式
      return data.data.list.map(
        (item: {
          txid: string;
          outIndex: number;
          value: number;
          address: string;
          height: number;
        }) => ({
          txId: item.txid,
          outputIndex: item.outIndex,
          satoshis: item.value,
          address: item.address,
          height: item.height,
        })
      );
    } catch (error) {
      console.error("获取 UTXO 时出错:", error);
      return [];
    }
  }

  // 辅助方法：选择合适的 UTXO
  private pickUtxo(utxos: Utxo[], amount: number): Utxo[] {
    // 简单实现：选择足够支付金额的 UTXO
    let sum = 0;
    const result: Utxo[] = [];

    // Replace direct console.log with commented code for debugging
    // console.log("utxos", utxos.length, utxos);

    for (const utxo of utxos) {
      result.push(utxo);
      sum += utxo.satoshis;

      if (sum >= amount) {
        break;
      }
    }

    if (sum < amount) {
      throw new Error("余额不足");
    }

    return result;
  }

  // 实现批量广播方法
  private async batchBroadcast(options: {
    txComposer: TxComposer[];
    network: BtcNetwork;
  }): Promise<Array<string>> {
    const results: Array<string> = [];
    const { privateKey } =await this.getCredentials();
    const publicKey = privateKey.publicKey.toString();

    for (const txComposer of options.txComposer) {
      try {
        // 获取交易的原始十六进制数据
        const rawHex = txComposer.getRawHex();

        // 构建广播请求
        const net = options.network === "mainnet" ? "mainnet" : "testnet";
        const url = `https://www.metalet.space/wallet-api/v4/mvc/tx/broadcast`;

        const requestBody = {
          chain: "mvc",
          net: net,
          publicKey: publicKey,
          rawTx: rawHex,
        };

        console.log("rawHex", rawHex);

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(`广播交易失败: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.code !== 0) {
          throw new Error(`API 返回错误: ${data.message || "未知错误"}`);
        }

        // 添加交易 ID 到结果数组
        results.push(txComposer.getTxId());

        // 记录成功广播的交易
        console.log(`交易广播成功: ${txComposer.getTxId()}`);
      } catch (error) {
        console.error(`广播交易时出错:`, error);
        throw error; // 重新抛出错误，让调用者处理
      }
    }

    return results;
  }

  private async notify(options: { txHex: string }): Promise<void> {
    // TODO: 实现通知逻辑
    console.log("Transaction broadcasted:", options.txHex);
  }

  private async getCredentials(): Promise<{
    privateKey: mvc.PrivateKey;
    address: string;
  }> {
    // const network =getBtcNetwork()
    //   this.configService.get<BtcNetwork>("METAID_NETWORK") || "mainnet";
    const network = getNetwork();
    const wallet = await getActiveWallet();
    const mnemonic = wallet.mnemonic;
    // const derivationPath = this.configService.get<string>("METAID_PATH") || "";
    const derivationPath = "m/44'/" + wallet.mvcTypes + "'" + "/0'/0/0";

    console.log("mnemonic", mnemonic);
    console.log("derivationPath", derivationPath);

    // 直接在这里实现派生私钥的逻辑
    const mneObj = mvc.Mnemonic.fromString(mnemonic);
    const hdpk = mneObj.toHDPrivateKey("", network);
    const privateKey = hdpk.deriveChild(derivationPath).privateKey;

    const address = privateKey.publicKey.toAddress(network).toString();

    return { privateKey, address };
  }

  /**
   * 创建一个Buzz，支持文本内容和图片附件
   * @param options 包含内容和图片的选项对象
   * @returns 创建结果，包含交易ID
   */
  async createBuzz(options: BuzzOptions): Promise<CreatePinResult> {
    // 获取网络配置
    // const network =
    //   options.network ||
    //   this.configService.get<BtcNetwork>("METAID_NETWORK") ||
    //   "mainnet";
    const network = "mainnet";

    // 初始化交易数组
    let fileTransactions: Transaction[] = [];

    // 定义最终内容对象
    const finalBody: any = {
      content: options.content,
      contentType: "text/plain",
    };

    // 处理图片附件
    if (options.images && options.images.length > 0) {
      const attachmentUrls: string[] = [];

      // 为每个图片创建一个单独的pin
      for (const image of options.images) {
        // 创建图片的metaid数据
        const imageMetaData = {
          operation: "create" as Operation,
          body: image.data,
          path: `/file`,
          contentType: `${image.fileType};binary`,
          encoding: "base64",
        };

        // 创建pin，使用combo模式合并交易
        const result = await this.createPin(imageMetaData, {
          network,
          signMessage: "upload image",
          serialAction: "finish",
          transactions: fileTransactions,
        });

        if (!result.transactions) {
          throw new Error("Failed to create pin for image");
        }

        // 更新交易数组
        fileTransactions = result.transactions;

        // 获取最后一个交易的ID，用于构建附件URL
        const [txId] = result.txIds;
        attachmentUrls.push(`metafile://${txId}i0`);
      }

      // 将附件URL添加到最终内容对象
      if (attachmentUrls.length > 0) {
        finalBody.attachments = attachmentUrls;
      }
    }

    // 处理引用pin
    if (options.quotePin) {
      finalBody.quotePin = options.quotePin.id;
    }

    // 创建最终的buzz pin
    const buzzMetaData = {
      operation: "create" as Operation,
      body: JSON.stringify(finalBody),
      path: `/protocols/simplebuzz`,
      contentType: "text/plain;utf-8",
    };

    // 创建最终的pin，使用finish模式完成交易
    const finalResult = await this.createPin(buzzMetaData, {
      network,
      signMessage: "create buzz",
      serialAction: "finish", // 使用finish来完成并广播交易
      transactions: fileTransactions,
    });

    return finalResult;
  }

  /**
   * 从文件路径判断文件类型
   * @param filePath 文件路径
   * @returns MIME类型
   */
  getFileType(filePath: string): string {
    // const ext = path.extname(filePath).toLowerCase();
    const ext = filePath.substring(filePath.lastIndexOf('.')).toLowerCase();
    const mimeTypes = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".bmp": "image/bmp",
      ".svg": "image/svg+xml",
    };

    return mimeTypes[ext] || "application/octet-stream";
  }


}

function isNil(value: unknown): boolean {
  return value === null || value === undefined;
}

// 添加必要的类型定义
interface MetaidData {
  revealAddr?: string;
}

export type Operation = "init" | "create" | "modify" | "revoke";
export type Encryption = "0" | "1" | "2";

type OpReturnV2 = [
  "metaid", // metaid for Testnet, metaid for Mainnet
  Operation,
  string | undefined, // path example: /protocols/simplebuzz
  Encryption | undefined,
  string | undefined, // version
  string | undefined, // contentType,
  string | Buffer | undefined,
];

export function buildOpReturnV2(
  metaidData: Omit<MetaidData, "revealAddr">,
  options?: { network: BtcNetwork }
): OpReturnV2 {
  const res1 = ["metaid", metaidData.operation];
  let res2 = [];
  if (metaidData.operation !== "init") {
    res2.push(metaidData.path!);
    res2.push(metaidData?.encryption ?? "0");
    res2.push(metaidData?.version ?? "1.0.0");
    res2.push(metaidData?.contentType ?? "text/plain;utf-8");

    const body = isNil(metaidData.body)
      ? undefined
      : Buffer.isBuffer(metaidData.body)
        ? metaidData.body
        : Buffer.from(metaidData.body, metaidData?.encoding ?? "utf-8");
    res2.push(body);
  }
  return [...res1, ...res2] as OpReturnV2;
}
