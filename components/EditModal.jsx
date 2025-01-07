import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import FormField from './FormField';
import Dropdown from './Dropdown';
import ChooseFile from './ChooseFile';
import CustomButton from './CustomButton';
import booksData from '../constants/booksData.json';

const EditModal = ({ isVisible, onClose, onSubmit, initialData }) => {
    const [form, setForm] = useState({
        category: '',
        book: '',
        episode: ''
    });
    const [books, setBooks] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        if (initialData) {
            setForm({
                category: initialData.category || '',
                book: initialData.book || '',
                episode: initialData.episode || ''
            });
            if (initialData.category) {
                setBooks(booksData.books[initialData.category] || []);
            }
        }
    }, [initialData]);

    const handleChange = (name, value) => {
        setForm({ ...form, [name]: value });
        if (name === 'category') {
            setBooks(booksData.books[value] || []);
        }
    };

    const handleSubmit = () => {
        onSubmit({ ...form, file: selectedFile });
        onClose();
    };

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="slide"
        >
            <View className="flex-1 justify-center items-center bg-black/50">
                <View className="bg-primary w-[90%] rounded-lg p-4">
                    <Text className="text-text text-2xl text-center mb-4">עריכת פרק</Text>
                    
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
                        otherStyles="mb-4"
                    />
                    
                    <Dropdown
                        title="ספר"
                        value={form.book}
                        placeholder="בחר ספר"
                        handleChangeText={(e) => handleChange('book', e)}
                        items={books.map((book) => ({ label: book, value: book }))}
                        otherStyles="mb-4"
                    />
                    
                    <FormField
                        title="תת ספר"
                        value={form.episode}
                        handleChangeText={(e) => handleChange('episode', e)}
                        otherStyles="mb-4"
                    />
                    
                    <ChooseFile onFileSelected={setSelectedFile} />
                    {!selectedFile && (
                        <Text className="text-text text-sm text-center mt-2">
                            השאר ריק כדי להשאיר את הקובץ הנוכחי
                        </Text>
                    )}
                    
                    <View className="flex-row justify-end gap-2 mt-4">
                        <CustomButton
                            title="ביטול"
                            handlePress={onClose}
                            containerStyles="bg-gray-500"
                        />
                        <CustomButton
                            title="שמור"
                            handlePress={handleSubmit}
                            containerStyles="bg-green-600"
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default EditModal;
