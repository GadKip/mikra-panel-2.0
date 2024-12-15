import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { Image } from 'react-native';
import images from '../constants/images';
import FormField from '../components/FormField';
import CustomButton from '../components/CustomButton';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Dropdown from '../components/Dropdown';

const UploadPage = () => {
  const [isSubmitting, setSubmitting] = useState(false);
  //empty  field values
  const [form, setForm] = useState({
    category: '',
    book:'',
    episode:''
  });
  const router = useRouter();

  const handleChange = (name, value) => { setForm({ ...form, [name]: value, }); };

  const submit = async () => {
    if(!form.book || !form.episode) {
      alert('שגיאה', 'חובה למלא את כל השדות');
      return;
    }
    
    setSubmitting(true);
    try {
      await upload(form.email, form.password);
      alert("הפרק עלה בהצלחה!")
      router.replace('../upload')
    } catch (error) {
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
          <Text dir="rtl" className="text-4xl text-gray-50">העלאת קבצים</Text>
          
          <Dropdown
            title=''
            value={form.username}
          />

          <FormField
            title='פרשה\פרק'
            value={form.username}
            handleChangeText={(e) => setForm({...form, username: e})}
            otherStyles='mt-7'
          />
          <CustomButton 
            title="העלה"
            handlePress={submit}
            containerStyles="mt-7"
            isLoading={isSubmitting}
          />
        </View>
      </ScrollView>
      <StatusBar backgroundColor='#161622' style='light'/>
    </SafeAreaView>
  )
}

export default UploadPage