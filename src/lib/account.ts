import { createStorage, CurrentAccountIDKey } from "@/utils/AsyncStorageUtil";

const storage = createStorage();

export async function getCurrentAccountId() {
  const currentAccountId = await storage.get(CurrentAccountIDKey);
  if (!currentAccountId) {
    throw new Error("No current account found. Please select an account.");
  }
  return currentAccountId;
}
