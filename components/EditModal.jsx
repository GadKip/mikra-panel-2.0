import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import FormField from './FormField';
import Dropdown from './Dropdown';
import CustomButton from './CustomButton';
import booksData from '../constants/booksData.json';
import { useResponsive } from '../hooks/useResponsive';

const EditModal = ({ isVisible, onClose, onSubmit, initialData }) => {
    const { getResponsiveValue } = useResponsive();
    const [form, setForm] = useState({
        category: '',
        book: '',
        episode: ''
    });
    const [books, setBooks] = useState([]);

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
        onSubmit(form);
        onClose();
    };

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-center items-center bg-black/50">
                <View className={getResponsiveValue({
                    mobile: "w-[90%] bg-white rounded-lg p-4",
                    tablet: "w-[70%] bg-white rounded-lg p-6",
                    desktop: "w-[50%] bg-white rounded-lg p-8"
                })}>
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-2xl">עריכת פרק</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text className="text-xl">✕</Text>
                        </TouchableOpacity>
                    </View>
                    
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
                        otherStyles="mb-6"
                    />
                    
                    <View className="flex-row justify-end space-x-4">
                        <CustomButton
                            title="ביטול"
                            handlePress={onClose}
                            containerStyles="bg-gray-500"
                        />
                        <CustomButton
                            title="שמור"
                            handlePress={handleSubmit}
                            containerStyles="bg-primary"
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default EditModal;
