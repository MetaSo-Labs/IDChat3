import { BASE_METAID_IO_URL, fetchUserMetaIDInfo } from '@/api/metaletservice';
import { UserMetaIDinfoBean } from '@/api/type/UserMetaIDinfoBean';
import { ToastView } from '@/constant/Widget';
import useUserStore from '@/stores/useUserStore';
import { isNotEmpty } from '@/utils/StringUtils';
import { getCurrentMvcWallet } from '@/wallet/wallet';

export async function isRegisterMetaID() {
  //   console.log('isRegisterMetaID address:' + address);
  const wallet = await getCurrentMvcWallet();
  console.log('isRegisterMetaID address:' + wallet.getAddress());

  const result: UserMetaIDinfoBean = await fetchUserMetaIDInfo(wallet.getAddress());
  console.log('isRegisterMetaID result:' + JSON.stringify(result));
  if (isNotEmpty(result.name)) {
    return true;
  } else {
    return false;
  }
}

export async function isUserLogin() {
  const useInfo = useUserStore.getState().userInfo;
  //   const isResister = await isRegisterMetaID();
  //   if (isResister && useInfo != null) {
  if (useInfo != null) {
    return true;
  } else {
    return false;
  }
}

export async function userLogin() {
  const wallet = await getCurrentMvcWallet();
  const result: UserMetaIDinfoBean = await fetchUserMetaIDInfo(wallet.getAddress());
  //   const useInfo = useUserStore.getState().userInfo;
  //   console.log('isRegisterMetaID result:' + JSON.stringify(result));
  if (isNotEmpty(result.name)) {
    useUserStore
      .getState()
      .setUserInfo({ name: result.name, avatar: result.avatar, bio: result.bio });
  } else {
    ToastView({ text: 'MetaID not register', type: 'info' });
  }
}

export async function getUserMetaIDInfo(): Promise<UserMetaIDinfoBean> {
  const wallet = await getCurrentMvcWallet();
  //   console.log('isRegisterMetaID address:' + address);
  const result: UserMetaIDinfoBean = await fetchUserMetaIDInfo(wallet.getAddress());
  //   console.log('isRegisterMetaID result:' + JSON.stringify(result));
  return result;
}

export function getMetaIDUserImageUrl(url: string) {
  return BASE_METAID_IO_URL + url;
}
