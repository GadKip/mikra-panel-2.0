import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';


export default function App() {
  return (
    <View className="flex-1 items-right justify-center bg-green">
      <Text className="text-3xl">מקרא מבואר</Text>
      <StatusBar style="auto" />
      <Link href="/profile" className='text-3xl items-right'>Go to Profile</Link>
    </View>
  );
}