import { StatusBar } from 'expo-status-bar';
import { Alert, Image, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import CustomButton from '../../components/CustomButton';
import { Link, useRouter } from 'expo-router';
import "../../global.css";
import images from '../../constants/images';
import FormField from '../../components/FormField';
import { useState } from 'react';
import { signIn, signInWithGoogle } from '../../lib/firebase';
import { useGlobalContext } from "../../context/GlobalProvider";
import Loader from '../../components/Loader'; // Import Loader
import { useLoadingState } from '../../hooks/useLoadingState';
import { useResponsive } from '../../hooks/useResponsive';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { useTheme } from '../../context/ThemeContext';
import ThemedText from '../../components/ThemedText';

export default function SignIn() {
  const { withLoading, isLoading } = useLoadingState();
  const { getResponsiveValue } = useResponsive();
  const handleError = useErrorHandler();
  const { setUser, setLoggedIn } = useGlobalContext();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const { isDark } = useTheme();

  const submit = async () => {
    if (!form.email || !form.password) {
      handleError(new Error('חובה למלא את כל השדות'), {
        title: 'שגיאת טופס',
      });
      return;
    }

    await withLoading(async () => {
      try {
        const result = await signIn(form.email, form.password);
        setUser(result);
        setLoggedIn(true);
        router.replace('/upload');
      } catch (error) {
        handleError(error, {
          title: 'שגיאת התחברות',
          fallbackMessage: 'לא ניתן להתחבר, אנא נסה שוב'
        });
      }
    }, true);
  };

  const submitGoogleSignIn = async () => {
    await withLoading(async () => {
      try {
        const result = await signInWithGoogle();
        setUser(result);
        setLoggedIn(true);
        router.replace('/upload');
      } catch (error) {
        handleError(error, {
          title: 'שגיאת התחברות עם Google',
          fallbackMessage: 'לא ניתן להתחבר עם Google, אנא נסה שוב'
        });
      }
    }, true);
  };

  return (
    <SafeAreaView className={`h-full ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
      <Loader isLoading={isLoading} />
      <ScrollView contentContainerStyle={{ height: '100%' }}>
        <View className="justify-center items-center min-h-[85vh] px-4 my-6 flex-1">
          <Image source={images.logo} resizeMode='contain' className="flex-1 w-4 h-4"/>
          <ThemedText className="text-4xl" dir="rtl">
            כניסה
          </ThemedText>
          <FormField
            title='כתובת מייל'
            value={form.email}
            handleChangeText={(e) => setForm({...form, email: e})}
            otherStyles='mt-7'
            keyBoardType='email-address'
            onSubmitEditing={() => {
              if (form.email && form.password) submit();
            }}
            isDark={isDark}
          />
          <FormField
            title='סיסמה'
            value={form.password}
            handleChangeText={(e) => setForm({...form, password: e})}
            otherStyles='mt-7'
            keyBoardType='password'
            onSubmitEditing={() => {
              if (form.email && form.password) submit();
            }}
            isDark={isDark}
          />
          <CustomButton 
            title="התחבר"
            handlePress={submit}
            containerStyles="mt-7"
            isLoading={isLoading}
          />
          
          <View className="flex-row items-center my-6 w-full">
            <View className={`flex-1 h-px ${isDark ? 'bg-surface-dark' : 'bg-surface-light'}`} />
            <ThemedText className="px-3 text-base">או</ThemedText>
            <View className={`flex-1 h-px ${isDark ? 'bg-surface-dark' : 'bg-surface-light'}`} />
          </View>

          <View className={`w-full px-4 py-3 rounded-lg flex-row items-center justify-center border-2 ${
            isDark 
              ? 'bg-surface-dark border-text-dark' 
              : 'bg-white border-text-light'
          }`}>
            <Image 
              source={{ uri: 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/google.svg' }} 
              style={{ width: 20, height: 20 }}
              className="mr-2"
            />
            <CustomButton 
              title="התחבר עם Google"
              handlePress={submitGoogleSignIn}
              containerStyles="flex-1"
              isLoading={isLoading}
              textStyles="text-base"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}