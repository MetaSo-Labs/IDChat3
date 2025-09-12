import { payTransactions } from "@/lib/crypto";
import { PayTransactionsParams ,PayParams} from "../../small-pay";
import { clearChunkData, getChunkData } from "../query/storage-chunk";
// import { PayParams, PayTransactionsParams } from './small-pay'
// import { clearChunkData, getChunkData } from './storage-chunk'


export async function process(params: any) {
  const toPayTransactions = params.transactions;
  const payedTransactions = await payTransactions(
    toPayTransactions,
    params.hasMetaid,
    params.feeb
  );
  return { payedTransactions };
}

// export async function process(params: PayParams) {
//   try {
//     let _params: PayTransactionsParams;
//     if (params.useChunk && params.chunkKey) {
//       const chunkData = await getChunkData(params.chunkKey);
//       if (!chunkData) {
//         return {
//           status: "error",
//           message: "Chunk data not found",
//         };
//       }
//       _params = JSON.parse(chunkData) as PayTransactionsParams;
//     } else {
//       _params = {
//         transactions: params.transactions || [],
//         hasMetaid: params.hasMetaid,
//         feeb: params.feeb,
//       };
//     }

//     const toPayTransactions = _params.transactions;
//     const payedTransactions = await payTransactions(
//       toPayTransactions,
//       _params.hasMetaid,
//       _params.feeb
//     );
//     if (params.useChunk && params.chunkKey) {
//       await clearChunkData();
//     }

//     return { payedTransactions };
//   } catch (error) {
//     return {
//       status: "error",
//       message:
//         error instanceof Error
//           ? error.message
//           : "Unknown error occurred during payment",
//     };
//   }
// }
