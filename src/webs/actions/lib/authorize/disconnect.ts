import connector from "@/lib/connector";
import { getCurrentAccountId } from "@/lib/account";

export async function process(_: unknown, host: string) {
  const currentAccountId = await getCurrentAccountId();
  if (!currentAccountId) {
    return { address: "" };
  }

  await connector.disconnect(currentAccountId, host);

  return { status: "ok" };
}
