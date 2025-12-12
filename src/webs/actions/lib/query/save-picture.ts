import { ToastView } from '@/constant/Widget';
import { payTransactions } from '@/lib/crypto';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Alert, Platform } from 'react-native';

export async function process(params: any) {
  try {
    console.log('调用 saveImage 方法 params:', params);
    const { base64 } = params;

    if (!base64) {
      throw new Error('未提供 base64 数据');
    }

    // 确保有相册权限
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('权限不足', '请在系统设置中允许访问相册');
      return;
    }

    // 生成临时文件路径
    const fileUri = FileSystem.cacheDirectory + `image_${Date.now()}.png`;

    // 保存 base64 图片到临时文件
    await FileSystem.writeAsStringAsync(fileUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // 将文件保存到相册
    const asset = await MediaLibrary.createAssetAsync(fileUri);
    await MediaLibrary.createAlbumAsync('Download', asset, false);

    Alert.alert('保存成功', '图片已保存到相册 🎉');
    console.log('图片保存成功:', fileUri);
    ToastView({ text: 'successfully', type: 'success' });

    return fileUri;
  } catch (error: any) {
    console.error('保存图片出错:', error);
    // ToastView({ text: 'successfully', type: 'success' });
    ToastView({ text: error.message, type: 'error' });

    Alert.alert('保存失败', error.message || '未知错误');
  }
}
