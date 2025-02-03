import { Text, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'

const CustomButton = ({title, handlePress, containerStyles, textStyles, isLoading, isDark}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <TouchableOpacity 
      onPress={handlePress}
      activeOpacity={0.7}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`${isDark ? 'bg-secondary-dark' : 'bg-secondary-light'} rounded-xl min-h-12 min-w-40 justify-center items-center
      ${containerStyles} 
      ${isLoading ? 'opacity-50' : ''}
      ${isHovered ? 'opacity-80' : ''}`}
      style={{ 
        pointerEvents: isLoading ? 'none' : 'auto',
        cursor: isLoading ? 'not-allowed' : 'pointer'
      }}  
    >
      <Text 
        className={`${isDark ? 'text-text-dark' : 'text-text-light'} text-2xl ${textStyles}`}
        dir="rtl"
      >
        {title}
      </Text>
    </TouchableOpacity>
  )
}

export default CustomButton