import { Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import CustomButton from '../../components/CustomButton';
import { Link, useRouter } from 'expo-router';
import "../../global.css";
import images from '../../constants/images';
import FormField from '../../components/FormField';
import { useState } from 'react';
import { createUser } from '../../lib/appwrite';
import { useGlobalContext } from "../../context/GlobalProvider";
import alert from "../../components/alert";
import Loader from '../../components/Loader'; // Import Loader
import { useTheme } from '../../context/ThemeContext'; // Import useTheme

export default function SignUp() {
  const { setUser, setLoggedIn, client, loading, setLoading } = useGlobalContext(); // Get setLoading
  const { isDark } = useTheme(); // Use useTheme
  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
      username:'',
      email:'',
      password:''
  })
  const router = useRouter();
    
    const submit = async () => {
        if (!form.username || !form.email || !form.password) {
            alert('Error', 'חובה למלא את כל השדות');
            return;
        }
        setSubmitting(true);
        setLoading(true); // Set loading to true
        try {
            const result = await createUser(form.email, form.password, form.username, client);
            setUser(result);
            setLoggedIn(true);
            router.replace('/upload');
        } catch (error) {
            alert('Error', error.message);
        } finally {
            setSubmitting(false);
              setLoading(false); // Set loading to false
        }
    };


  
  return (
    <SafeAreaView className={`h-full ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
      <Loader isLoading={loading} />
      <ScrollView contentContainerStyle={{ height: '100%' }}>
        <View className=" justify-center items-center min-h-[85vh] px-4 my-6 flex-1">
          <Image source={images.logo}
                resizeMode='contain' className="flex-1 w-4 h-4 "/>
          <Text dir="rtl" className={`text-4xl ${isDark ? 'text-text-dark' : 'text-text-light'}`}>הרשמה</Text>
            <FormField
              title='שם משתמש'
              value={form.username}
              handleChangeText={(e) => setForm({...form, username: e})}
              otherStyles='mt-7'
              isDark={isDark}
            />
          <FormField
            title='כתובת מייל'
            value={form.email}
            handleChangeText={(e) => setForm({...form, email: e})}
            otherStyles='mt-7'
            keyBoardType='email-address'
            isDark={isDark}
          />
          <FormField
            title='סיסמה'
            value={form.password}
            handleChangeText={(e) => setForm({...form, password: e})}
            otherStyles='mt-7'
            keyBoardType='password'
            isDark={isDark}
          />
          <CustomButton 
            title="הירשם"
            handlePress={submit}
            containerStyles="mt-7"
            isLoading={isSubmitting}
            isDark={isDark}
          />
          <View className="justify-center pt-5 flex-row gap-2">
              <Link
                  href="/sign-in"
                  className={`text-lg ${isDark ? 'text-secondary-dark' : 'text-secondary-light'}`}
              >
                התחבר
              </Link>
              <Text dir='rtl' className={`text-lg ${isDark ? 'text-text-dark' : 'text-text-light'}`}>
                  יש לך כבר משתמש?
              </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};