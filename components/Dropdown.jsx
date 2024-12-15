import { View, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Ensure Picker for web compatibility
import React from 'react';


const Dropdown = ({ title, value, placeholder, handleChangeText, otherStyles, items }) => {
  return (
    <View className={`w-3/4 space-y-2 relative ${otherStyles}`}>
      <Text className="text-base text-gray-100 text-right">{title}</Text>
      <View className="border-2 border-red-500 h-16 px-4 bg-black rounded-2xl items-center flex flex-row">
        <Picker
          selectedValue={value}
          onValueChange={(itemValue) => handleChangeText(itemValue)}
          className="bg-black flex-1 text-white" dir="rtl"
        >
          <Picker.Item label={placeholder} value="" />
          {items.map((item, index) => (
            <Picker.Item key={index} label={item.label} value={item.value} />
          ))}
        </Picker>
      </View>
    </View>
  );
};

export default Dropdown;
