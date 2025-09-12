import { mvc } from 'meta-contract'
import { eciesDecrypt } from '@/lib/crypto'
import { getCurrentWallet } from '@/lib/wallet'
import { Chain } from '@metalet/utxo-wallet-service'

export async function process(params: any) {
  const { encrypted } = params

  const wallet = await getCurrentWallet(Chain.MVC)!

  const wif = wallet.getPrivateKey()
  const privateKeyObj = mvc.PrivateKey.fromWIF(wif)

  const message = eciesDecrypt(encrypted, privateKeyObj)

  return {
    status: 'ok',
    result: message,
  }
}
