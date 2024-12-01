import { StatusBar } from 'expo-status-bar';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import CustomButton from '../components/CustomButton';
import { Link, Redirect, router } from 'expo-router';

export default function App() {
  return (

<SafeAreaView className="bg-primary h-full">
  <ScrollView contentContainerStyle={{ height: '100%' }}>
    <View className="flex-1 w-full justify-center items-center px-4 min-h-[85vh]">
      <Text dir="rtl" className="text-4xl text-gray-50">מקרא מבואר - ניהול</Text>
      <View className="w-full max-w-xs mb-4">
        <TextInput dir="rtl" className="border-b-2 border-r-4 text-2xl text-gray-50 w-full" placeholder="שם משתמש" />
      </View>
      <View className="w-full max-w-xs mb-4">
      <TextInput dir="rtl" className="mt-1 border-b-2 border-r-4 text-2xl text-gray-50" placeholder="סיסמה" />
      </View>
      
      <CustomButton 
      title="התחבר"
      handlePress={() =>router.push('/upload')}
      containerStyles="w-full mt-7"
      /> 
    </View>
  </ScrollView>
  <StatusBar backgroundColor='#161622' style='light'/>
</SafeAreaView>
  );
}

