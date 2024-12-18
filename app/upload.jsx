import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native'
import React, {useState} from 'react'
import CustomButton from '../components/CustomButton'
import FormField from '../components/FormField';
import { useGlobalContext } from '../context/GlobalProvider';
import { router, Redirect } from 'expo-router';
import { upload, signOut } from '../lib/appwrite';
import Dropdown from '../components/Dropdown';
import booksData from '../constants/booksData.json';


const Upload = () => {
    const { user, loggedIn, loading, client } = useGlobalContext();
    const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ category: '', book: '', episode: '' });
    const [books, setBooks] = useState([]);
    const handleLogout = async () => {
        try {
        await signOut(client);
        alert('התנתקת בהצלחה!');
        router.replace('/');
         } catch (error) {
            alert('Error', error.message);
       }
     };
        const handleChange = (name, value) => {
          setForm({ ...form, [name]: value });
            if (name === 'category') {
              setBooks(booksData.books[value]);
          }
        };

       const submit = async () => {
          if (!form.category || !form.book || !form.episode) {
            alert('Error', 'חובה למלא את כל השדות');
           return;
          }
    
        setSubmitting(true);
          try {
            await upload(form.category, form.book, form.episode, client);
            alert('הקובץ עלה בהצלחה!');
           router.push('./upload');
            } catch (error) {
               alert('Error', error.message);
             } finally {
               setSubmitting(false);
         }
    };


   if(loading) return null;
   if(!loggedIn && !loading) return <Redirect href='/'/>

  return (
        <SafeAreaView className='flex-1 bg-primary'>
           <ScrollView
            contentContainerStyle={{ height: '100%' }}
           >
               <CustomButton title="התנתק" handlePress={handleLogout} containerStyles="mt-7 bg-red-600" />
               <View className='w-full flex-1 items-center justify-center px-4 my-6'>
                
                    <Text className="text-center text-3xl text-gray-50">העלאת פרקים</Text>
          <Dropdown
                    title="תורה \ נביאים \ כתובים"
                    value={form.category}
                    placeholder="בחר קטגוריה"
                    handleChangeText={(e) => handleChange('category', e)}
                    items={[
                      { label: 'תורה', value: 'torah' },
                      { label: 'נביאים', value: 'neviim' },
                      { label: 'כתובים', value: 'ktuvim' },
                    ]}
                    otherStyles="mt-7"
                    />
           <Dropdown
            title="ספר (ויקרא, שמואל...)"
                    value={form.book}
                   placeholder="בחר ספר"
                   handleChangeText={(e) => handleChange('book', e)}
                    items={books.map((book, index) => ({ label: book, value: book }))}
            otherStyles="mt-7"
                   />
        <FormField
                    title="תת ספר (פרשה, פרק...)"
                    value={form.episode}
                    handleChangeText={(e) => handleChange('episode', e)}
                  otherStyles="mt-7"
                   />
      

         <CustomButton 
                    title='העלה'
                      containerStyles='mt-8'
                        handlePress={submit}
                          isLoading={isSubmitting}
                     />
                       <CustomButton 
                           title='חזרה'
                              containerStyles='mt-5 mb-10'
                          handlePress={() => router.push('/')}
                  />
                </View>
        
           </ScrollView>
        </SafeAreaView>
    )
}

export default Upload