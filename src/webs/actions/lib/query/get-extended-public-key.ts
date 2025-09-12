import { mvc } from "meta-contract";
import { getNetwork } from "@/lib/network";
import { Chain } from "@metalet/utxo-wallet-service";
import { getActiveWalletOnlyAccount, getCurrentWallet } from "@/lib/wallet";

export async function process() {
  try {
    const network = getNetwork();
    const mvcWallet = getCurrentWallet(Chain.MVC);
    const activeWallet = await getActiveWalletOnlyAccount();

    const mneObj = mvc.Mnemonic.fromString(activeWallet.mnemonic);
    const rootPath = mvcWallet.getPath();
    const xPublicKey = mneObj
      .toHDPrivateKey("", network)
      .deriveChild(rootPath.slice(0, rootPath.length - 4))
      .xpubkey.toString();
    return xPublicKey;
  } catch (error) {
    return { error: error.message };
  }
}
