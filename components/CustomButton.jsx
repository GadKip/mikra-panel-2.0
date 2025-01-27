import { Text, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'

const CustomButton = ({title, handlePress, containerStyles, textStyles, isLoading}) => {
  const [isHovered, setIsHovered] = useState(false);

  const onPress = () => {
    handlePress?.();
  };

  return (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.7}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`bg-gray-800/40 border border-gray-600 rounded-xl min-h-12 min-w-40 justify-center items-center
      ${containerStyles} 
      ${isLoading ? 'opacity-50' : ''}
      ${isHovered ? 'bg-gray-700/40' : ''}`}
      style={{ 
        pointerEvents: isLoading ? 'none' : 'auto',
        cursor: isLoading ? 'not-allowed' : 'pointer'
      }}  
    >
      <Text 
        className={`text-white text-2xl ${textStyles}`}
        dir="rtl">
        {title}
      </Text>
    </TouchableOpacity>
  )
}

export default CustomButton