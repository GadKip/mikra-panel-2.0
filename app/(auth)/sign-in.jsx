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

const SignIn = () => {
  const { withLoading, isLoading } = useLoadingState();
  const { getResponsiveValue } = useResponsive();
  const handleError = useErrorHandler();
  const { setUser, setLoggedIn, client } = useGlobalContext();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });

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
    <SafeAreaView className="bg-primary h-full">
      <Loader isLoading={isLoading} />
      <Text style={{display:"none"}}>{/* The fix is here */}</Text>
      <ScrollView contentContainerStyle={{ height: '100%' }}>
        <View className={getResponsiveValue({
          mobile: "px-4 my-6",
          tablet: "px-8 my-8",
          desktop: "px-12 my-10"
        })}>
          <View className="justify-center items-center min-h-[85vh] flex-1">
            <Image source={images.logo}
              resizeMode='contain' className="flex-1 w-4 h-4 "/>
            <Text dir="rtl" className="text-4xl text-gray-50">התחברות</Text>
            <FormField
              title='כתובת מייל'
              value={form.email}
              handleChangeText={(e) => setForm({...form, email: e})}
              otherStyles='mt-7'
              keyBoardType='email-address'
              onSubmitEditing={() => {
                if (form.email && form.password) submit();
              }}
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
            />

            <CustomButton 
              title="התחבר"
              handlePress={submit}
              containerStyles="mt-7 mb-4"
              isLoading={isLoading}
            /> 
            
            {/* {<View className="justify-center pt-5 flex-row gap-2">
              <Link
                href="/sign-up"
                className="text-lg text-secondary"
              >
                הירשם
              </Link>
              <Text dir='rtl' className="text-lg text-gray-100">
                אין לך משתמש?
              </Text>
            </View>} */}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignIn;