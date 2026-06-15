import { Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '../components/CustomButton';
import Loader from '../components/Loader';
import { Redirect, useRouter } from 'expo-router';
import "../global.css";
import images from '../constants/images';
import 'react-native-url-polyfill/auto';
import { useGlobalContext } from '../context/GlobalProvider';
import { useTheme } from '../context/ThemeContext';
import ThemedText from '../components/ThemedText';

export default function App() {
    const {loading, loggedIn} = useGlobalContext();
    const { isDark } = useTheme();
    const router = useRouter();

  if (!loading && loggedIn) return <Redirect href="./upload" />;

  return (
    // Replaced h-full with flex-1 for layout scaling safety
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
      <Loader isLoading={loading} />
      <Text style={{display:"none"}}>{/* The fix is here */}</Text>
      {/* Changed height: 100% to flexGrow: 1 to ensure scrollability */}
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Removed flex-1 to prevent height lock inside ScrollView */}
        <View className="w-full justify-center items-center px-4 my-6 py-6">
          <Image source={images.logo}
              resizeMode="contain"
              className="flex-1 w-1/4 min-h-[150px]"/>
          <ThemedText className="flex-col justify-center text-4xl mt-7">
            Mikra Panel 2.0
          </ThemedText>
          <Text className={`flex-col justify-center text-2xl ${isDark ? 'text-text-dark' : 'text-text-light'} mt-7`}>
            By Gadi K.
          </Text>
          <CustomButton 
            title="לכניסה"
            handlePress={() => router.replace('/sign-in')}
            containerStyles="mt-7 w-full max-w-[300px]"
            isDark={isDark}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}