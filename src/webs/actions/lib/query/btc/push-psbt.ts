import { Psbt } from "bitcoinjs-lib";
import { getBtcNetwork } from "@/lib/network";

export async function process(psbtHex: string): Promise<string> {
  const network = await getBtcNetwork();
  return Psbt.fromHex(psbtHex, { network }).extractTransaction().getId();
}
