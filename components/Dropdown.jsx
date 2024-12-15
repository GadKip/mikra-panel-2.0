import RNPickerSelect from 'react-native-picker-select';
import { View, Text, TouchableOpacity, Image, TextInput } from 'react-native';
import React, { useState } from 'react';

const Dropdown = ({title, value, placeholder, handleChangeText, keyBoardType, otherStyles, ...props}) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <View className={`w-3/4 space-y-2 relative ${otherStyles}`}>
      <Text className="text-base text-gray-100 text-right">{title}</Text>
      <View className="border-2 border-red-500 h-16 px-4 bg-black rounded-2xl focus:border-secondary items-center flex flex-row">
        <TextInput
        className="flex-1 text-white text-base"
        value={value}
        placeholder={placeholder}
        placeholderTextColor='#7b7b8b'
        onChangeText={handleChangeText}
        secureTextEntry={keyBoardType === 'password' && !showPassword}
        />
        <RNPickerSelect
            onValueChange={(value) => console.log(value)}
            items={[
                { label: 'Football', value: 'football' },
                { label: 'Baseball', value: 'baseball' },
                { label: 'Hockey', value: 'hockey' },
            ]}
        />

      </View>
    </View>
  )
};

export default Dropdown
