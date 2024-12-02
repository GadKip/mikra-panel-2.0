import { View, Text, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { TextInput } from 'react-native-web'

const FormField = ({title, value, placeholder, handleChangeText, keyBoardType, otherStyles, ...props}) => {
  const [showPassword, setShowPassword] = useState(false)
  return (
    <View className={`space-y-2 ${otherStyles}`}>
      <Text className="text-base text-gray-100">{title}</Text>
      <View className="border-2 border-red-500 w-full h-16 px-4 bg-black rounded-2xl focus:border-secondary items-center">
        <TextInput
        className="flex-1 text-white text-base"
        value={value}
        placeholder={placeholder}
        placeholderTextColor='#7b7b8b'
        onChangeText={handleChangeText}
        secureTextEntry={keyBoardType === 'password' && !showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          

        </TouchableOpacity>
      </View>
    </View>
  )
}

export default FormField

/* <View className="w-full max-w-xs mb-4">
<TextInput dir="rtl"
className="border-b-2 border-r-4 text-2xl text-secondary w-full"
placeholder="שם משתמש" />
</View>
<View className="w-full max-w-xs mb-4">
<TextInput dir="rtl"
className="mt-1 border-b-2 border-r-4 text-2xl text-secondary"
placeholder="סיסמה"  />
</View> **/
