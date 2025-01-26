import { View, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import React from 'react';

const Dropdown = ({ title, value, placeholder, handleChangeText, otherStyles, items }) => {
  return (
    <View className={`w-3/4 space-y-2 relative ${otherStyles}`}>
      <Text className="text-base text-gray-100 text-right">{title}</Text>
      <View className="border border-gray-600 h-16 px-4 bg-gray-800/40 rounded-xl items-center flex flex-row">
        <Picker
          selectedValue={value}
          onValueChange={(itemValue) => handleChangeText(itemValue)}
          className="bg-transparent flex-1" 
          dir="rtl"
          style={{ 
            color: 'white',
            backgroundColor: '#1a1a1a'
          }}
          dropdownIconColor="white"
        >
          <Picker.Item 
            label={placeholder} 
            value="" 
            style={{
              backgroundColor: '#1a1a1a',
              color: 'white'
            }}
          />
          {items.map((item, index) => (
            <Picker.Item 
              key={index} 
              label={item.label} 
              value={item.value}
              style={{
                backgroundColor: '#1a1a1a',
                color: 'white'
              }}
            />
          ))}
        </Picker>
      </View>
    </View>
  );
};

export default Dropdown;
