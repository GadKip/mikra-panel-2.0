import { Alert, Platform } from 'react-native';

const alertPolyfill = (title, description, options) => {
  const result = window.confirm([title, description].filter(Boolean).join('\n'));

  if (result) {
    const confirmOption = options && options.find(({ style }) => style !== 'cancel');
    if (confirmOption) {
      confirmOption.onPress();
    }
  } else {
    const cancelOption = options && options.find(({ style }) => style === 'cancel');
    if (cancelOption) {
      cancelOption.onPress();
    }
  }
};

const alert = Platform.OS === 'web' ? alertPolyfill : Alert.alert;

export default alert;
