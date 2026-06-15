import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      className={`p-2 rounded-full ${isDark ? 'active:bg-neutral-800' : 'active:bg-neutral-200'}`}
    >
      <Ionicons
        name={isDark ? "sunny" : "moon"}
        size={24}
        color={isDark ? "#ffffff" : "#334155"} // Softened from #000000 to slate-700 for a cleaner look
      />
    </TouchableOpacity>
  );
};

export default ThemeToggle;