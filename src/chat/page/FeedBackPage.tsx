import { View, Text, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingModal, RoundSimButton, TitleBar, ToastView } from '@/constant/Widget';
import WebView from 'react-native-webview';
import { useTranslation } from 'react-i18next';
import { metaStyles } from '@/constant/Constants';
import { goBack } from '@/base/NavigationService';
import { isNotEmpty } from '@/utils/StringUtils';

export default function FeedBackPage(props) {
  const { t } = useTranslation();
  const [isShow, setIsShow] = useState(false);
  const [input, setInput] = useState('');

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={{ flex: 1 }}>
        <LoadingModal isShow={isShow} />
        <View style={{ flex: 1 }}>
          <TitleBar title={t('pro_feed_back')} />

          <View style={{ flex: 1, padding: 20 }}>
            <View>
              <TextInput
                placeholder={t('pro_input_normal')}
                multiline={true}
                numberOfLines={6}
                style={[
                  metaStyles.textInputDefault,
                  { paddingVertical: 20, height: 300, textAlignVertical: 'top' },
                ]}
                onChangeText={(text) => {
                  setInput(text);
                  // setMneMonic(text.trim());
                  // setMneMonic(text);
                }}
              />
            </View>

            <View style={{ flex: 1 }} />
            <RoundSimButton
              title={t('c_confirm')}
              textColor="#333"
              event={() => {
                if (isNotEmpty(input)) {
                  setIsShow(true);
                  setTimeout(() => {
                    setIsShow(false);
                    ToastView({ text: 'Successful', type: 'success' });
                    goBack();
                  }, 2000);
                } else {
                  ToastView({ text: 'Please enter content', type: 'error' });
                }
              }}
            />
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
