import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { Image } from 'react-native';
import images from '../constants/images';
import FormField from '../components/FormField';
import CustomButton from '../components/CustomButton';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Dropdown from '../components/Dropdown';
import booksData from '../constants/booksData.json';
import { upload, signOut } from '../lib/appwrite';

/**
 * UploadPage Component
 * 
 * This component renders a page for uploading files with form fields for category, book, and episode.
 * It handles form submission and dynamically updates the book options based on the selected category.
 */
const UploadPage = () => {
  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ category: '', book: '', episode: '' });
  const [books, setBooks] = useState([]);
  const router = useRouter();

  /**
   * handleChange Function
   * 
   * Updates the form state when a form field value changes. 
   * Dynamically updates the book options based on the selected category.
   * 
   * @param {string} name - The name of the form field.
   * @param {string} value - The new value of the form field.
   */
  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
    if (name === 'category') {
      setBooks(booksData.books[value]);
    }
  };

  /**
   * submit Function
   * 
   * Handles form submission. Validates the form fields and attempts to upload the data.
   * Shows success or error alerts based on the outcome.
   */
  const submit = async () => {
    if (!form.category || !form.book || !form.episode) {
      alert('Error', 'חובה למלא את כל השדות');
      return;
    }

    setSubmitting(true);
    
    try {
      await upload(form.category, form.book, form.episode);
      alert('הקובץ עלה בהצלחה!');
      router.replace('../upload');
    } catch (error) {
      alert('Error', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * handleLogout Function
   * 
   * Handles user logout. Signs out the user and redirects to the login page.
   */
  const handleLogout = async () => {
    try {
      await signOut();
      alert('התנתקת בהצלחה!');
      router.replace('/login');
    } catch (error) {
      alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView contentContainerStyle={{ height: '100%' }}>
        <CustomButton title="התנתק" handlePress={handleLogout} containerStyles="mt-7 bg-red-600" />
        <View className="justify-center items-center min-h-[85vh] px-4 my-6 flex-1">
          <Image source={images.logo} resizeMode="contain" className="flex-1 w-4 h-4" />
          <Text dir="rtl" className="text-4xl text-gray-50">העלאת קבצים</Text>

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
            title="העלה"
            handlePress={submit}
            containerStyles="mt-7"
            isLoading={isSubmitting}
          />
        </View>
      </ScrollView>
      <StatusBar backgroundColor="#161622" style="light" />
    </SafeAreaView>
  );
};

export default UploadPage;
