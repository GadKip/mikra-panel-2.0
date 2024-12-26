import { Text, View, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useCallback, useEffect, useContext } from 'react';
import CustomButton from '../components/CustomButton';
import FormField from '../components/FormField';
import { useGlobalContext } from '../context/GlobalProvider';
import { useRouter, Redirect } from 'expo-router';
import { upload, getUserSession, signOut } from '../lib/appwrite';
import Dropdown from '../components/Dropdown';
import booksData from '../constants/booksData.json';
import ChooseFile from '../components/ChooseFile';
import { useHandleUploadFileError, useCustomAlert } from '../lib/utils';
import Loader from '../components/Loader'; // Import Loader

const Upload = () => {
    const { user, setUser, loggedIn, loading, client, setLoading } = useGlobalContext(); // Get setLoading function
    const [isSubmitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ category: '', book: '', episode: '' });
    const [books, setBooks] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const router = useRouter();

    useEffect(() => {
        if (!user && client) {  // Add client check
            getUserSession(client).then(sessionUser => {  // Pass client to getUserSession
                if (!sessionUser) {
                    router.replace('/sign-in');
                } else {
                    setUser(sessionUser);
                }
            }).catch((error) => {
                alert('Error', 'Could not log in user, try again.');
                router.replace('/sign-in');
            });
        }
    }, [user, setUser, client]); // Add client to dependencies;

    const handleLogout = async () => {
        try {
            if (client) {
                setLoading(true);
                await signOut(client);
                alert('התנתקת בהצלחה!');
                router.replace('/');
            } else {
                throw new Error('No valid client to handle signOut.');
            }
        } catch (error) {
            alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClearFile = useCallback(() => {
        setSelectedFile(null);
    }, []);

    const onFileSelected = useCallback((file) => {
        setSelectedFile(file);
    }, []);

    const handleChange = (name, value) => {
        setForm({ ...form, [name]: value });
        if (name === 'category') {
            setBooks(booksData.books[value]);
        }
    };
    const showAlert = useCustomAlert();
    const handleUploadFileError = useHandleUploadFileError();

    const submit = async () => {
        if (!form.category || !form.book || !form.episode || !selectedFile) { // Check all required fields
            showAlert('Error', 'חובה למלא את כל השדות, כולל בחירת קובץ');
            return;
        }
        setSubmitting(true);
        setLoading(true);
        try {
            if (!selectedFile) { // Changed from file to selectedFile
                showAlert("Error", "Please select a file.");
                return;
            }
            const fileBlob = await fetch(selectedFile.uri).then(r => r.blob());
            const updatedFile = { ...selectedFile, fileBlob }; // Changed from file to selectedFile
            
            if (client && user) {
                await upload(
                    form.category,
                    form.book,
                    form.episode,
                    updatedFile,
                    client,
                    user.$id
                );
                showAlert("Success", "File upload successful!");
                router.replace('/upload');
            } else {
                throw new Error('No valid client to handle upload.');
            }
        } catch (error) {
            handleUploadFileError(error);
        } finally {
            setSubmitting(false);
            setLoading(false);
        }
    };

            
    if (loading) return null;
    if (!loggedIn && !loading) return <Redirect href='/' />;
    return (
        <SafeAreaView className='flex-1 bg-primary'>
            <Loader isLoading={loading} />
            <Text style={{ display: "none" }}>{/* The fix is here */}</Text>
            <CustomButton title="התנתק" handlePress={handleLogout} containerStyles="mt-7 bg-red-600" />
            <View className='w-full flex-1 items-center justify-center px-4 my-6'>
                <Text className="text-center text-3xl text-gray-50">העלאת פרקים</Text>
                <Dropdown
                    title="תורה \ נביאים \ כתובים"
                    value={form.category}
                    placeholder="בחר קטגוריה"
                    handleChangeText={(e) => handleChange('category', e)}
                    items={[
                        { label: 'תורה', value: 'תורה' },
                        { label: 'נביאים', value: 'נביאים' },
                        { label: 'כתובים', value: 'כתובים' },
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
                    <View style={{ flexDirection: "row", alignItems: 'center', margin: 10, backgroundColor: '#24252f', padding: 8, borderRadius: 6, width: 280 }}>
                        <Text numberOfLines={1} ellipsizeMode='middle' style={{ fontSize: 16, fontWeight: "bold", color: '#f0f0f0', flex: 1 }}>File Selected:{selectedFile.name}</Text>
                        <TouchableOpacity onPress={handleClearFile}>
                            <Text style={{ fontSize: 12, color: 'white', backgroundColor: '#ff2442', borderRadius: 20, width: 25, height: 25, lineHeight: 20, textAlign: 'center' }}>X</Text>
                        </TouchableOpacity>
                    </View>
                )}
                <ChooseFile onFileSelected={onFileSelected} />
                <CustomButton
                    title='העלה'
                    containerStyles='mt-8'
                    handlePress={submit}
                    isLoading={isSubmitting}
                />
                <CustomButton
                    title='רשימת קבצים'
                    containerStyles='mt-5'
                    handlePress={() => router.replace('/browse')}
                />
            </View>
        </SafeAreaView>
    );
};

export default Upload;