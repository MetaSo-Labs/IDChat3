import { createStorage } from "@/utils/AsyncStorageUtil";

const storage = createStorage();

const MetaIdPin_UTXO_KEY = "MetaIdPin_UTXO_LIST";

export const getMetaIdPinUnspentOutputsObj = async () => {
  return await storage.get<{ [address: string]: string[] }>(
    MetaIdPin_UTXO_KEY,
    {
      defaultValue: {},
    }
  );
};

export const setMetaIdPinUnspentOutputsObj = async (utxosStorage: {
  [address: string]: string[];
}) => {
  await storage.set(MetaIdPin_UTXO_KEY, utxosStorage);
};
