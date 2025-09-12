import { getCurrentAccountId } from "@/lib/account";
import { createStorage } from "@/utils/AsyncStorageUtil";

const CONNECTIONS_KEY = "connections";

const storage = createStorage();

type Connections = Record<
  string,
  Record<
    string,
    {
      connectedAt: number;
      autoApprove: boolean;
      logo?: string;
    }
  >
>;

type Connector = {
  connect: (accountId: string, host: string, logo?: string) => Promise<void>;
  isConnected: (accountId: string, host: string) => Promise<boolean>;
  registerListen: (accountId: string, host: string) => Promise<void>;
  disconnect: (accountId: string, host: string) => Promise<void>;
  getCurrentConnections: () => Promise<Array<{ host: string; logo?: string }>>;
};

const connector = {} as Connector;

async function getConnections() {
  return await storage.get<Connections>(CONNECTIONS_KEY, { defaultValue: {} });
}

connector.connect = async function (accountId, host, logo?: string) {
  const connections = await getConnections();
  const accountConnections = connections[accountId] || {};
  accountConnections[host] = {
    connectedAt: Date.now(),
    autoApprove: true,
    logo,
  };
  connections[accountId] = accountConnections;
  await storage.set(CONNECTIONS_KEY, connections);
};

connector.isConnected = async function (accountId, host) {
  const connections = await getConnections();
  // console.log("connections", JSON.stringify(connections));

  const accountConnections = connections[accountId] || {};
  // console.log("accountConnections----", JSON.stringify(accountConnections));
  // console.log("accountConnections[host] ", JSON.stringify(accountConnections[host]));
  
  
  return !!accountConnections[host];
};

connector.disconnect = async function (accountId, host) {
  const connections = await getConnections();
  const accountConnections = connections[accountId] || {};
  delete accountConnections[host];
  connections[accountId] = accountConnections;
  await storage.set(CONNECTIONS_KEY, connections);
};

connector.getCurrentConnections = async function () {
  const accountId = await getCurrentAccountId();
  const connections = await getConnections();

  const currentConnections = !!accountId ? connections[accountId] || {} : {};
  return Object.entries(currentConnections).map(([host, { logo }]) => ({
    host,
    logo,
  }));
};

connector.registerListen = async function (accountId, host) {
  const listens = await storage.get<Record<string, Record<string, boolean>>>(
    "listens",
    { defaultValue: {} }
  );
  const accountListens = listens[accountId] || {};
  accountListens[host] = true;
  listens[accountId] = accountListens;
  await storage.set("listens", listens);
};

export default connector;
