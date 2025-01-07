import { View, Text, TextInput } from 'react-native';
import React from 'react';

const FormField = ({ 
    title, 
    value, 
    handleChangeText, 
    otherStyles, 
    keyBoardType,
    onSubmitEditing 
}) => {
    return (
        <View className={`w-3/4 space-y-2 relative ${otherStyles}`}>
            <Text className="text-base text-gray-100 text-right">{title}</Text>
            <View className="border-2 border-red-500 h-16 px-4 bg-black rounded-2xl">
                <TextInput
                    value={value}
                    onChangeText={handleChangeText}
                    className="flex-1 text-white text-lg h-full text-right"
                    placeholderTextColor="#666"
                    secureTextEntry={keyBoardType === 'password'}
                    keyboardType={keyBoardType === 'email-address' ? 'email-address' : 'default'}
                    returnKeyType="done"
                    onSubmitEditing={onSubmitEditing}
                />
            </View>
        </View>
    );
};

export default FormField;

