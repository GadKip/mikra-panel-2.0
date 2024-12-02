import { View, Text, TouchableOpacity, Image, TextInput } from 'react-native'
import React, { useState } from 'react'
import icons from "../constants/icons";

const FormField = ({title, value, placeholder, handleChangeText, keyBoardType, otherStyles, ...props}) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <View className={`w-3/4 space-y-2 ${otherStyles}`}>
      <Text className="text-base text-gray-100">{title}</Text>
      <View className="border-2 border-red-500 h-16 px-4 bg-black rounded-2xl focus:border-secondary items-center flex flex-row">
        <TextInput
        className="flex-1 text-white text-base"
        value={value}
        placeholder={placeholder}
        placeholderTextColor='#7b7b8b'
        onChangeText={handleChangeText}
        secureTextEntry={keyBoardType === 'password' && !showPassword}
        />

        {keyBoardType === 'password' && ( 
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Image 
              source={!showPassword ? icons.eye : icons.eyeHide}
              className="w-6 h-6"
              resizeMode="contain"
          />
        </TouchableOpacity>)}
      </View>
    </View>
  )
}

export default FormField

