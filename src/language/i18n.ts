import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
// import * as Localization from 'expo-localization';

// 导入翻译文件
import en from '../../locales/en.json';
import zh from '../../locales/zh.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      zh: { translation: zh },
    },
    // lng: Localization.locale.includes('zh') ? 'zh' : 'en', // 根据系统语言设置默认语言
    lng:"en", // 根据系统语言设置默认语言
    fallbackLng: 'en', // 备用语言
    interpolation: {
      escapeValue: false, // React 已经对字符串进行了转义处理
    },
  });

export default i18n;
