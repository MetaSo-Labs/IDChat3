import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Storage {
  get<T = string>(key: string): Promise<T | undefined | null>;
  get<T = string>(key: string, option: { defaultValue: T }): Promise<T>;
  set(key: string, value: unknown): Promise<void>;
  delete(key: string): Promise<void>;
}

let globalStorage: Storage;

export function createStorage(): Storage {
  if (globalStorage) {
    return globalStorage;
  }

  const storage = {
    get: async (key: string) => {
      return await AsyncStorage.getItem(key);
    },

    set: async (key: string, value: string) => {
      await AsyncStorage.setItem(key, value);
    },

    delete: async (key: string) => {
      await AsyncStorage.removeItem(key);
    },
  };

  globalStorage = {
    async get<T>(
      key: string,
      option?: { defaultValue: T }
    ): Promise<T | string | undefined | null> {
      const value = await storage.get(key);
      if (value === null || value === undefined) {
        return option?.defaultValue;
      }
      if (typeof value === "string") {
        try {
          return JSON.parse(value) as T;
        } catch (error) {
          return value;
        }
      }
      return value as T;
    },
    async set(key: string, value: object | string) {
      if (typeof value === "object") {
        value = JSON.stringify(value);
      }
      return await storage.set(key, value);
    },
    async delete(key: string) {
      return await storage.delete(key);
    },
  };

  return globalStorage;
}

export const wallets_key = "wallets";
export const account_select_key = "account_select";
export const network_key = "network";
export const network_btc = "network_btc";
export const network_mvc = "network_mvc";
export const network_all = "network_all";

export const walllet_address_type_key = "walllet_address_type";

export const wallet_password_key = "wallet_password";


//allow app
export const settings_allow_small_pay_key = "settings_allow_small_pay_key";



// current
export const CurrentWalletIDKey = "CurrentWalletID_key";
export const CurrentAccountIDKey = "CurrentAccountID_key";

export const net_wallet_network_key = "net_network_key";
export const no_notice_key="no_notice_key"

export const wallet_mode_key = "wallet_mode_key";
export const wallet_mode_cold = "cold";
export const wallet_mode_hot = "hot";
export const wallet_mode_default = "DefaultMode";
export const wallet_mode_observer = "observer";
export const wallet_language_key = "wallet_language_key";
export const wallet_language_en = "en";
export const wallet_language_zh = "zh";

//创建数据
export const AsyncStorageUtil = {
  //set
  async setItem(key, value) {
    try {
      return await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  },

  async getItem(key) {
    try {
      const value = await AsyncStorage.getItem(key);
      const result = value != null ? JSON.parse(value) : null;
      return result;
    } catch (error) {
      console.log("key", key);

      console.error("Error retrieving data:", error);
      return null;
    }
  },

  async getItemDefault(key,defaultValue) {
    try {
      const value = await AsyncStorage.getItem(key);
      const result = value != null ? JSON.parse(value) : defaultValue;
      return result;
    } catch (error) {
      console.log("key", key);

      console.error("Error retrieving data:", error);
      return null;
    }
  },

  //remove
  async removeItem(key) {
    try {
      return await AsyncStorage.removeItem(key);
    } catch (e) {}
  },

  async updateItem(key, newValue) {
    try {
      return await AsyncStorage.setItem(key, JSON.stringify(newValue));
    } catch (e) {}
  },

  updateItem2: async (key, newValue) => {
    try {
      // 先获取原来的值并转换成对象
      const oldValueStr = await AsyncStorage.getItem(key);
      const oldValue = JSON.parse(oldValueStr) || {}; // 如果没有值，则初始化为空对象
      // 将原来的值与新值合并
      const mergedValue = { ...oldValue, ...newValue };
      // 更新值
      await AsyncStorage.setItem(key, JSON.stringify(mergedValue));
    } catch (error) {
      console.error("Error updating data:", error);
    }
  },

  async clear() {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error("Error clearing data:", error);
    }
  },
};
