import { Text, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { useTheme } from '../context/ThemeContext';

const CustomButton = ({title, handlePress, containerStyles, textStyles, isLoading, isDark: propIsDark}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isDark: themeIsDark } = useTheme();

  const isDark = propIsDark !== undefined ? propIsDark : themeIsDark;

  // Check if a custom background color (like bg-red-600 or bg-error) is already supplied
  const hasCustomBg = containerStyles?.includes('bg-');

  // Use the brand secondary blues as default backgrounds
  const buttonBg = hasCustomBg ? '' : (isDark ? 'bg-secondary-dark' : 'bg-secondary-light');
  
  // High contrast text colors: White on dark-blue (light mode), dark gray on sky-blue (dark mode)
  const buttonText = hasCustomBg ? 'text-white' : (isDark ? 'text-neutral-900' : 'text-white');

  const hasCustomWidth = containerStyles?.includes('min-w-') || containerStyles?.includes('w-');
  const hasCustomHeight = containerStyles?.includes('min-h-') || containerStyles?.includes('h-');

  const widthStyle = hasCustomWidth ? '' : 'min-w-40';
  const heightStyle = hasCustomHeight ? '' : 'min-h-12';

  return (
    <TouchableOpacity 
      onPress={handlePress}
      activeOpacity={0.7}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`${buttonBg} rounded-xl ${heightStyle} ${widthStyle} justify-center items-center
      ${containerStyles} 
      ${isLoading ? 'opacity-50' : ''}
      ${isHovered ? 'opacity-80' : ''}`}
      style={{ 
        pointerEvents: isLoading ? 'none' : 'auto',
        cursor: isLoading ? 'not-allowed' : 'pointer'
      }}  
    >
      <Text 
        className={`${buttonText} text-2xl font-semibold ${textStyles}`}
        dir="rtl"
      >
        {title}
      </Text>
    </TouchableOpacity>
  )
}

export default CustomButton