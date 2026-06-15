import { View } from 'react-native';
import CustomButton from './CustomButton';
import ThemeToggle from './ThemeToggle';
import { useRouter } from 'expo-router';
import { useResponsive } from '../hooks/useResponsive';
import { useTheme } from '../context/ThemeContext';
import ThemedText from './ThemedText';

export default function Header({ currentPage }) {
  const router = useRouter();
  const { getResponsiveValue } = useResponsive();
  const { isDark } = useTheme();

  return (
    <View className={`flex-row justify-between items-center px-4 py-3 ${isDark ? 'bg-surface-dark' : 'bg-surface-light'} border-b ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}>
      <View className="flex-row items-center gap-3">
        <ThemeToggle />
        <CustomButton
          title={currentPage === 'upload' ? 'רשימת קבצים' : 'העלאת קבצים'}
          handlePress={() => router.replace(currentPage === 'upload' ? '/browse' : '/upload')}
          containerStyles="px-4 h-10 min-w-0" 
          textStyles="text-lg"
        />
      </View>
      
      {/* Center title text restored */}
      <ThemedText className="text-2xl font-bold">
        {currentPage === 'upload' ? 'העלאת קבצים' : 'רשימת קבצים'}
      </ThemedText>

      <CustomButton 
        title="התנתק" 
        handlePress={() => router.replace('/signed-out')}
        // Changed back to highly compatible bg-red-600 to ensure solid red in both themes
        containerStyles="bg-red-600 px-4 h-10 min-w-0" 
        textStyles="text-lg"
      />
    </View>
  );
}