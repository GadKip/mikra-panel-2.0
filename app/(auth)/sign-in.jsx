import { StatusBar } from 'expo-status-bar';
import { Alert, Image, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import CustomButton from '../../components/CustomButton';
import { Link, router, useRouter } from 'expo-router';
import "../../global.css";
import images from '../../constants/images';
import FormField from '../../components/FormField';
import { useState } from 'react';
import { getCurrentUser, signIn } from '../../lib/appwrite';
import { useGlobalContext } from "../../context/GlobalProvider";
import alert from "../../components/alert";


const SignIn = () => {
    const { setUser, setLoggedIn, client } = useGlobalContext();
  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    email:'',
    password:''
  });
  const router = useRouter();

  const handleChange = (name, value) => { setForm({ ...form, [name]: value, }); };

  const submit = async () => {
    if(!form.email || !form.password) {
      alert('Error', 'חובה למלא את כל השדות');
      return; 
    }

    setSubmitting(true);
    
    try {
        await signIn(form.email, form.password, client);
      const result = await getCurrentUser(client);
      setUser(result);
      setLoggedIn (true);
      alert("Success","User signed in successfully!")
      router.push('../upload')
    } catch (error) {
      console.error('SignIn error:', error); // Log the error
      alert('Error', error.message);
    } finally {
      setSubmitting(false);
    }
  };

      
  return (
  <SafeAreaView className="bg-primary h-full">
    <ScrollView contentContainerStyle={{ height: '100%' }}>
      <View className=" justify-center items-center min-h-[85vh] px-4 my-6 flex-1">
      <Image source={images.logo}
            resizeMode='contain' className="flex-1 w-4 h-4 "/>
              <Text dir="rtl" className="text-4xl text-gray-50">התחברות</Text>
      <FormField
        title='כתובת מייל'
        value={form.email}
        handleChangeText={(e) => setForm({...form, email: e})}
        otherStyles='mt-7'
        keyBoardType='email-address'      />
      <FormField
        title='סיסמה'
        value={form.password}
        handleChangeText={(e) => setForm({...form, password: e})}
        otherStyles='mt-7'
        keyBoardType='password'      />

        <CustomButton 
        title="התחבר"
        handlePress={submit}
        containerStyles="mt-7 mb-4"
        isLoading={isSubmitting}
      /> 
        
        <View className="justify-center pt-5 flex-row gap-2">
        <Link
            href="/sign-up"
            className="text-lg text-secondary"
          >
            הירשם
          </Link>
          <Text dir='rtl' className="text-lg text-gray-100">
            אין לך משתמש?
          </Text>
        </View>
      </View>
    </ScrollView>
    <StatusBar backgroundColor='#161622' style='light'/>
  </SafeAreaView>
  )
}

export default SignIn;