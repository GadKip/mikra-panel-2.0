import { StatusBar } from 'expo-status-bar';
import { Image, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import CustomButton from '../../components/CustomButton';
import { Link, Redirect, router } from 'expo-router';
import "../../global.css";
import images from '../../constants/images';
import FormField from '../../components/FormField';
import { useState } from 'react';



const SignIn = () => {
    const [form, setForm] = useState({
        email:'',
        password:''
    })
  return (
<SafeAreaView className="bg-primary h-full">
  <ScrollView contentContainerStyle={{ height: '100%' }}>
    <View className="w-full justify-center items-center min-h-[85vh] px-4 my-6">
    <Image source={images.logo}
          resizeMode='contain' className="flex-1 w-4 h-4 "/>
            <Text dir="rtl" className="text-4xl text-gray-50">התחברות</Text>
    <FormField
      title='שם משתמש'
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

      /** button config */
      <CustomButton 
      title="התחבר"
      handlePress={() =>router.push('/upload')}
      containerStyles="w-full mt-7"
      /> 
    </View>
  </ScrollView>
  <StatusBar backgroundColor='#161622' style='light'/>
</SafeAreaView>


  )
}

export default SignIn