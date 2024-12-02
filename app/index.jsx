import { StatusBar } from 'expo-status-bar';
import { Image, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import CustomButton from '../components/CustomButton';
import { Link, Redirect, router } from 'expo-router';
import "../global.css";
import images from '../constants/images';

export default function App() {
  return (

<SafeAreaView className="bg-primary h-full">
  <ScrollView contentContainerStyle={{ height: '100%' }}>
    <View className="w-full justify-center items-center min-h-[85vh] px-4 my-6">
    <Image source={images.logo}
          resizeMode="cover"
          className="flex-1 w-4 h-4 "/>
    <Text dir="rtl" className="text-4xl text-gray-50">Mikra Panel 2.0</Text>
      <CustomButton 
      title="לכניסה"
      handlePress={() =>router.push('./(auth)/sign-in')}
      containerStyles="w-full mt-7"
      /> 
    </View>
  </ScrollView>
  <StatusBar backgroundColor='#161622' style='light'/>
</SafeAreaView>
  );
}

