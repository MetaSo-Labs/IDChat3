import { signTransaction } from "@/lib/crypto";

export async function process(params: any) {
  const { txid } = await signTransaction(params.transaction, true);
  return { txid };
}
