import useWalletStore from '@/stores/useWalletStore';
import Constants from 'expo-constants';

export async function process(params: any) {
  const versionCode = Constants.expoConfig?.android.versionCode;
  const buildNumber = Constants.expoConfig?.ios.buildNumber;

  if (params.platform === 'ios') {
    return versionCode;
  } else if (params.platform === 'android') {
    return buildNumber;
  }
}
