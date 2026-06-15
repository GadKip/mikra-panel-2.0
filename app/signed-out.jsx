import { Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '../components/CustomButton';
import { useRouter } from 'expo-router';
import "../global.css";
import images from '../constants/images';
import 'react-native-url-polyfill/auto';
import { useTheme } from '../context/ThemeContext';

const SignedOut = () => {
    const router = useRouter();
    const { isDark } = useTheme();
    return (
        // Replaced h-full with flex-1
        <SafeAreaView className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
          <Text style={{display:"none"}}>{/* The fix is here */}</Text>
          {/* Replaced height: 100% with flexGrow: 1 */}
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            {/* Removed flex-1 so contents can scroll naturally */}
            <View className="w-full justify-center items-center px-4 my-6 py-6">
              <Image source={images.logo}
                  resizeMode="contain"
                  className="flex-1 w-1/4 min-h-[150px]"/>
              <Text className={`flex-col justify-center text-4xl ${isDark ? 'text-text-dark' : 'text-text-light'} mt-7`}>
                התנתקת מהחשבון
              </Text>
              <CustomButton 
                title="לכניסה מחדש"
                handlePress={() => router.replace('/sign-in')}
                containerStyles="mt-7 w-full max-w-[300px]"
                isDark={isDark}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
    );
};

export default SignedOut;