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
    <View className={`flex-row justify-between items-center px-4 py-3 ${isDark ? 'bg-surface-dark' : 'bg-surface-light'}`}>
      <View className="flex-row space-x-4 items-center">
        <ThemeToggle />
        <CustomButton
          title={currentPage === 'upload' ? 'רשימת קבצים' : 'העלאת קבצים'}
          handlePress={() => router.replace(currentPage === 'upload' ? '/browse' : '/upload')}
          containerStyles="bg-primary px-4"
        />
      </View>
      <ThemedText className="text-2xl">
        {currentPage === 'upload' ? 'רשימת קבצים' : 'העלאת קבצים'}
      </ThemedText>
      <CustomButton 
        title="התנתק" 
        handlePress={() => router.replace('/signed-out')}
        containerStyles="bg-red-600 px-4" 
      />
    </View>
  );
}
