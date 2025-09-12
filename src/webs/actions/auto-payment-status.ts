import { createStorage } from "@/utils/AsyncStorageUtil";
import { AutoPaymentAmountKey, AutoPaymentListKey, EnabledAutoPaymentKey } from './auto-payment'

export async function process(params:string,host: string ) {
  console.log("获取状态 AutoPayment status check called for host:", host);
   
  const storage = createStorage()
  const isEnabled = await storage.get(EnabledAutoPaymentKey, { defaultValue: true })
  const list: { logo?: string; host: string }[] = await storage.get(AutoPaymentListKey, { defaultValue: [] })
  const autoPaymentAmount = await storage.get(AutoPaymentAmountKey, { defaultValue: 10000 })
  const autoPaymentList = list ?? []
  return {
    isEnabled: isEnabled,
    isApproved: autoPaymentList.some((item) => item.host === host),
    // isApproved: true,
    autoPaymentAmount: autoPaymentAmount,
  }
}

