import { StatusBar } from 'expo-status-bar';
import { Alert, Image, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import CustomButton from '../../components/CustomButton';
import { Link, useRouter } from 'expo-router';
import "../../global.css";
import images from '../../constants/images';
import FormField from '../../components/FormField';
import { useState } from 'react';
import { getCurrentUser, signIn } from '../../lib/appwrite';
import { useGlobalContext } from "../../context/GlobalProvider";
import alert from "../../components/alert";
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
  const { setUser, setLoggedIn, client } = useGlobalContext();
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
        const result = await signIn(form.email, form.password, client);
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
{/*           <View className="justify-center pt-5 flex-row gap-2">
            <Link href="/sign-up" className={`text-lg ${isDark ? 'text-secondary-dark' : 'text-secondary-light'}`}>
              הירשם
            </Link>
            <ThemedText dir='rtl' className="text-lg">
              אין לך משתמש?
            </ThemedText>
          </View>
 */}        </View>
      </ScrollView>
    </SafeAreaView>
  );
}