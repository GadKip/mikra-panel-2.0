import { View, Text, TextInput } from 'react-native';
import React from 'react';

const FormField = ({ 
    title, 
    value, 
    handleChangeText, 
    otherStyles, 
    keyBoardType = 'default',
    onSubmitEditing,
    placeholder 
}) => {
    // Determine if the field should be LTR based on keyBoardType or title
    const isLTRField = keyBoardType === 'password' || 
                      keyBoardType === 'email-address' || 
                      title.includes('מייל') ||
                      title.includes('סיסמה') ||
                      title.includes('משתמש');

    return (
        <View className={`w-3/4 space-y-2 relative ${otherStyles}`}>
            <Text className="text-base text-gray-100 text-right">{title}</Text>
            <View className="border border-gray-600 h-16 px-4 bg-gray-700/40 rounded-xl">
                <TextInput
                    value={value}
                    onChangeText={handleChangeText}
                    placeholder={placeholder}
                    className={`flex-1 text-white text-lg h-full ${isLTRField ? 'text-left' : 'text-right'}`}
                    placeholderTextColor="#666"
                    secureTextEntry={keyBoardType === 'password'}
                    keyboardType={keyBoardType}
                    returnKeyType="done"
                    onSubmitEditing={onSubmitEditing}
                    textAlign={isLTRField ? 'left' : 'right'}
                    dir={isLTRField ? 'ltr' : 'rtl'}
                />
            </View>
        </View>
    );
};

export default FormField;

