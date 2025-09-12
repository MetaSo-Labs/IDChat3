import { metaletApiV3 } from "./request";
import { useQuery } from "@tanstack/react-query";
import { Net } from "@metalet/utxo-wallet-service";

interface DiscoverStruct {
  name: string;
  icon: string;
  url: string;
  desc: string;
  recover: string;
  themeColor: string;
}

interface DiscoverData {
  recommend: DiscoverStruct[] | null;
  tops: DiscoverStruct[] | null;
  dapps: DiscoverStruct[] | null;
}

const fetchDiscoverData = async (net: Net): Promise<DiscoverData> => {
  return metaletApiV3<DiscoverData>(`/dapp/list`).get({ net });
};

export const useDiscoverDataQuery = (
  network: Net,
  options?: { enabled: boolean }
) => {
  return useQuery({
    queryKey: ["discoverData", network],
    queryFn: () => fetchDiscoverData(network),
    ...options,
  });
};
