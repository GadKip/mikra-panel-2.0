import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import CustomButton from '../components/CustomButton';

export default function App() {
  return (
    <SafeAreaView className="h-full bg-cyan-950">
      <ScrollView contentContainerStyle={{height: '100%'}}>
        <View className="w-full justify-center items-center h-full px-4">
          <Text className="text-4xl text-gray-50">מקרא מבואר - ניהול</Text>
          <TextInput
            placeholder="שם משתמש"
          />
          <TextInput
            placeholder="סיסמה"
          />
          <CustomButton />
          <TouchableOpacity>

          </TouchableOpacity>


        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

