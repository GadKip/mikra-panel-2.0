import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native'
import React, {useState} from 'react'
import CustomButton from '../components/CustomButton'
import FormField from '../components/FormField';
import { useGlobalContext } from '../context/GlobalProvider';
import { router, Redirect } from 'expo-router';
import { upload, signOut } from '../lib/appwrite';
import Dropdown from '../components/Dropdown';
import booksData from '../constants/booksData.json';
import Browse from '../components/Browse';

const Upload = () => {
    const { user, loggedIn, loading, client } = useGlobalContext();
    const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ category: '', book: '', episode: '' });
    const [books, setBooks] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);

    const handleLogout = async () => {
        try {
        await signOut(client);
        alert('התנתקת בהצלחה!');
        router.replace('/');
         } catch (error) {
            alert('Error', error.message);
       }
     };
      const handleClearFile = () => {
          setSelectedFile(null);
      };

      const onFileSelected = (file) => {
          setSelectedFile(file)
          
      }
    const handleChange = (name, value) => {
          setForm({ ...form, [name]: value });
            if (name === 'category') {
              setBooks(booksData.books[value]);
          }
        };

       const submit = async () => {
           if (!form.category || !form.book || !form.episode || !selectedFile) {
                alert('Error', 'חובה למלא את כל השדות, כולל בחירת קובץ');
               return;
           }
         setSubmitting(true);
           try {
             
               
               const episodeWithFileName = form.episode + ' : ' + selectedFile.name
                 await upload(form.category, form.book, episodeWithFileName, client);
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
         {selectedFile && (
                  <View style={{flexDirection:"row", alignItems:'center', margin:10, backgroundColor:'#24252f', padding:8, borderRadius:6, width:280}}>
                                <Text  numberOfLines={1}  ellipsizeMode='middle' style={{fontSize: 16, fontWeight: "bold", color:'#f0f0f0', flex:1}}>File Selected:{selectedFile.name}</Text>
                       <TouchableOpacity  onPress={handleClearFile}>
                                 <Text style={{fontSize: 12,  color:'white', backgroundColor:'#ff2442', borderRadius:20, width:25, height:25, lineHeight:20, textAlign:'center'}}>X</Text>
                        </TouchableOpacity>
              </View>)}
          
            <Browse onFileSelected={onFileSelected}/>
            <CustomButton
                  title="העלה"
                  handlePress={submit}
                    containerStyles="mt-7"
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

export default Upload;