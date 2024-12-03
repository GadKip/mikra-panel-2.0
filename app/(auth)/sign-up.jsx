import { StatusBar } from 'expo-status-bar';
import { Alert, Image, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import CustomButton from '../../components/CustomButton';
import { Link, Redirect, router, useRouter } from 'expo-router';
import "../../global.css";
import images from '../../constants/images';
import FormField from '../../components/FormField';
import { useState } from 'react';
import { createUser } from '../../lib/appwrite';
import { useGlobalContext } from "../../context/GlobalProvider";


const SignUp = () => {
  const { setUser, setIsLogged } = useGlobalContext();
  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
      username:'',
      email:'',
      password:''
  })

  const submit = async () => {
    if(!form.username || !form.email || !form.password) {
      Alert.alert('Error', 'חובה למלא את כל השדות');
    }
    setSubmitting(true);
    try {
      const result = await createUser(form.email, form.password, form.username);
      setUser(result);
      setIsLogged(true);

      router.replace('/upload');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setSubmitting(false);
    }
  }
  
  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView contentContainerStyle={{ height: '100%' }}>
        <View className=" justify-center items-center min-h-[85vh] px-4 my-6 flex-1">
        <Image source={images.logo}
              resizeMode='contain' className="flex-1 w-4 h-4 "/>
        <Text dir="rtl" className="text-4xl text-gray-50">התחברות</Text>
        <FormField
          title='שם משתמש'
          value={form.username}
          handleChangeText={(e) => setForm({...form, username: e})}
          otherStyles='mt-7'
        />
        <FormField
          title='כתובת מייל'
          value={form.email}
          handleChangeText={(e) => setForm({...form, email: e})}
          otherStyles='mt-7'
          keyBoardType='email-address'
        />
        <FormField
          title='סיסמה'
          value={form.password}
          handleChangeText={(e) => setForm({...form, password: e})}
          otherStyles='mt-7'
          keyBoardType='password'
        />
        <CustomButton 
          title="הירשם"
          handlePress={submit}
          containerStyles="mt-7"
          isLoading={isSubmitting}
        />
            <View className="justify-center pt-5 flex-row gap-2">
                <Link
                    href="/sign-in"
                    className="text-lg text-secondary"
                >
                    התחבר
                </Link>
                <Text dir='rtl' className="text-lg text-gray-100">
                    יש לך כבר משתמש?
                </Text>
            </View>
        </View>
      </ScrollView>
      <StatusBar backgroundColor='#161622' style='light'/>
    </SafeAreaView>


  )
}

export default SignUp