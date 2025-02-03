import { TextInput, View } from 'react-native';
import React from 'react';
import InputWrapper from './InputWrapper';
import { useTheme } from '../context/ThemeContext';

const FormField = ({ 
    title, 
    value, 
    handleChangeText, 
    otherStyles = '', 
    keyBoardType = 'default',
    onSubmitEditing,
    placeholder,
    ...props
}) => {
    const { isDark } = useTheme();
    const isLTRField = keyBoardType === 'password' || 
                      keyBoardType === 'email-address' || 
                      title.includes('מייל') ||
                      title.includes('סיסמה');

    return (
        <InputWrapper title={title} otherStyles={otherStyles}>
            <View className={`border ${isDark ? 'border-border-dark' : 'border-border-light'} h-16 px-4 ${isDark ? 'bg-surface-dark/40' : 'bg-surface-light/40'} rounded-xl`}>
                <TextInput
                    value={value}
                    onChangeText={handleChangeText}
                    keyboardType={keyBoardType === 'password' ? 'default' : keyBoardType}
                    secureTextEntry={keyBoardType === 'password'}
                    onSubmitEditing={onSubmitEditing}
                    placeholder={placeholder}
                    placeholderTextColor={isDark ? '#666666' : '#999999'}
                    className={`flex-1 ${isDark ? 'text-text-dark' : 'text-text-light'} text-lg h-full`}
                    style={{
                        textAlign: isLTRField ? 'left' : 'right',
                        direction: isLTRField ? 'ltr' : 'rtl'
                    }}
                    {...props}
                />
            </View>
        </InputWrapper>
    );
};

export default FormField;

