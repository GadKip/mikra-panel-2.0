import { Text, View, SafeAreaView, TouchableOpacity } from 'react-native';
import React, { useState, useCallback, useEffect } from 'react';
import CustomButton from '../components/CustomButton';
import FormField from '../components/FormField';
import { useGlobalContext } from '../context/GlobalProvider';
import { useRouter, Redirect } from 'expo-router';
import { upload, getUserSession, signOut } from '../lib/appwrite';
import Dropdown from '../components/Dropdown';
import booksData from '../constants/booksData.json';
import ChooseFile from '../components/ChooseFile';
import { useHandleUploadFileError, useCustomAlert } from '../lib/utils';
import Loader from '../components/Loader';
import { useResponsive } from '../hooks/useResponsive';
import Header from '../components/Header';
import { useLoadingState } from '../hooks/useLoadingState';

const Upload = () => {
    const { user, setUser, loggedIn, client } = useGlobalContext();
    const { withLoading, isLoading } = useLoadingState();
    const [form, setForm] = useState({ category: '', book: '', episode: '' });
    const [books, setBooks] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const router = useRouter();
    const showAlert = useCustomAlert();
    const handleUploadFileError = useHandleUploadFileError();
    const { getResponsiveValue } = useResponsive();

    useEffect(() => {
        if (!user && client) {
            getUserSession(client).then(sessionUser => {
                if (!sessionUser) {
                    router.replace('/sign-in');
                } else {
                    setUser(sessionUser);
                }
            }).catch((error) => {
                showAlert('Error', 'Could not log in user, try again.');
                router.replace('/sign-in');
            });
        }
    }, [user, setUser, client]);

    const handleLogout = async () => {
        try {
            if (client) {
                await signOut(client);
                showAlert('התנתקת בהצלחה!');
                router.replace('/');
            } else {
                throw new Error('No valid client to handle signOut.');
            }
        } catch (error) {
            showAlert('Error', error.message);
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
            setBooks(booksData.books[value] || []);
        }
    };

    const submit = async () => {
        if (!form.category || !form.book || !form.episode || !selectedFile) {
            showAlert('Error', 'חובה למלא את כל השדות, כולל בחירת קובץ');
            return;
        }

        await withLoading(async () => {
            try {
                if (!selectedFile) {
                    showAlert("Error", "Please select a file.");
                    return;
                }
                const fileBlob = await fetch(selectedFile.uri).then(r => r.blob());
                const updatedFile = { ...selectedFile, fileBlob };
                
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
                    
                    // Reset form
                    setForm({ category: '', book: '', episode: '' });
                    setSelectedFile(null);
                    setBooks([]);
                } else {
                    throw new Error('No valid client to handle upload.');
                }
            } catch (error) {
                handleUploadFileError(error);
            }
        }, true);
    };

    if (isLoading) return null;
    if (!loggedIn && !isLoading) return <Redirect href='/' />;

    return (
        <SafeAreaView className='flex-1 bg-primary'>
            <Loader isLoading={isLoading} />
            <Header currentPage="upload" />
            <View className={getResponsiveValue({
                mobile: 'w-full flex-1 items-center justify-center px-4 my-6',
                tablet: 'w-4/5 flex-1 items-center justify-center mx-auto my-8',
                desktop: 'w-3/5 flex-1 items-center justify-center mx-auto my-10'
            })}>
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
                    items={books.map((book) => ({ 
                        label: book.name, 
                        value: book.name 
                    }))}
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
                        <Text numberOfLines={1} ellipsizeMode='middle' style={{ fontSize: 16, fontWeight: "bold", color: '#f0f0f0', flex: 1 }}>
                            File Selected: {selectedFile.name}
                        </Text>
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
                    isLoading={isLoading}
                />
            </View>
        </SafeAreaView>
    );
};

export default Upload;