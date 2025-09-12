import connector from "@/lib/connector";
import { getCurrentAccountId } from "@/lib/account";

export async function process(_: unknown, host: string) {
  const currentAccountId = await getCurrentAccountId();
  if (!currentAccountId) return false;
  console.log(
    "currentAccountId",
    currentAccountId,
    connector.isConnected(currentAccountId, host)
  );

  return await connector.isConnected(currentAccountId, host);
}
