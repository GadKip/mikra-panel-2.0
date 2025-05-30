import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import FormField from './FormField';
import Dropdown from './Dropdown';
import CustomButton from './CustomButton';
import booksData from '../constants/booksData.json';
import { useResponsive } from '../hooks/useResponsive';
import ThemedText from './ThemedText';
import { useTheme } from '../context/ThemeContext';

const EditModal = ({ isVisible, onClose, bookId, initialData, onSubmit }) => {
    const { isDark } = useTheme();
    const { getResponsiveValue } = useResponsive();
    const [form, setForm] = useState({
        category: '',
        book: '',
        episode: '',
        episodeOrder: ''
    });
    const [books, setBooks] = useState([]);

    useEffect(() => {
        if (initialData) {
            setForm({
                category: initialData.category || '',
                book: initialData.book || '',
                episode: initialData.episode || '',
                episodeOrder: initialData.episodeOrder?.toString() || ''
            });
            if (initialData.category) {
                const categoryBooks = booksData.books[initialData.category] || [];
                setBooks(categoryBooks);
            }
        }
    }, [initialData]);

    const handleChange = (name, value) => {
        setForm({ ...form, [name]: value });
        if (name === 'category') {
            const categoryBooks = booksData.books[value] || [];
            setBooks(categoryBooks);
        }
    };

    const handleSubmit = () => {
        if (typeof onSubmit === 'function') {
            onSubmit(form);
        }
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
                <View className={`w-11/12 p-6 rounded-2xl ${isDark ? 'bg-surface-dark' : 'bg-surface-light'}`}>
                    <ThemedText className="text-2xl mb-4 text-center">
                        {bookId ? 'עריכת פרק' : 'הוספת פרק'}
                    </ThemedText>
                    
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
                        isDark={isDark}
                    />
                    <Dropdown
                        title="ספר"
                        value={form.book}
                        placeholder="בחר ספר"
                        handleChangeText={(e) => handleChange('book', e)}
                        items={books.map(book => ({
                            label: book.name,
                            value: book.name
                        }))}
                        otherStyles="mb-4"
                    />
                    <FormField
                        title="תת ספר"
                        value={form.episode}
                        handleChangeText={(e) => handleChange('episode', e)}
                        otherStyles="mb-4"
                        isDark={isDark}
                    />                    
                    <View className="flex-row justify-end space-x-4 mt-6">
                        <CustomButton
                            title="ביטול"
                            handlePress={onClose}
                            containerStyles={`px-4 ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`}
                            isDark={isDark}
                        />
                        <CustomButton
                            title="שמור"
                            handlePress={handleSubmit}
                            containerStyles="px-4"
                            isDark={isDark}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

EditModal.propTypes = {
    isVisible: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    initialData: PropTypes.object
};

export default EditModal;
