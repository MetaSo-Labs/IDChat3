import { getNetwork } from "@/lib/network";

export async function process() {
  try {
    const network = getNetwork();
    return { network };
  } catch (error) {
    return { error: error.message };
  }
}
