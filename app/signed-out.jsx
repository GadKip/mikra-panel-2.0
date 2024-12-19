import { Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '../components/CustomButton';
import Loader from '../components/Loader';
import { useRouter } from 'expo-router';
import "../global.css";
import images from '../constants/images';
import 'react-native-url-polyfill/auto';


const SignedOut = () => {
    const router = useRouter();
    return (
        <SafeAreaView className="bg-primary h-full">
          <Loader isLoading={loading} />
          <ScrollView contentContainerStyle={{ height: '100%' }}>
            <View className="w-full justify-center items-center px-4 my-6 flex-1">
              <Image source={images.logo}
                  resizeMode="contain"
                  className="flex-1 w-1/4"/>
              <Text className="flex-col justify-center text-4xl text-gray-50 mt-7">התנתקת מהחשבון</Text>
              <CustomButton 
              title="להתחברות"
              handlePress={() => router.push('/index')}
              containerStyles="font-mainfont flex-col mt-7 mb-40 justify-center"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      );

}

export default SignedOut

