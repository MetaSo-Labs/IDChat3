import { signTransaction } from "@/lib/crypto";

export async function process(params: any) {
  const signature = await signTransaction(params.transaction);

  return { signature };
}
