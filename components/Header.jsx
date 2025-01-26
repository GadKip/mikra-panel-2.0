import { View } from 'react-native';
import CustomButton from './CustomButton';
import { useRouter } from 'expo-router';
import { useResponsive } from '../hooks/useResponsive';

export default function Header({ currentPage }) {
    const router = useRouter();
    const { getResponsiveValue } = useResponsive();

    return (
        <View className={getResponsiveValue({
            mobile: "flex-row justify-between items-center px-4 py-3 bg-gray-700",
            tablet: "flex-row justify-between items-center px-6 py-4 bg-gray-700",
            desktop: "flex-row justify-between items-center px-8 py-4 bg-gray-700"
        })}>
            <View className="flex-row space-x-4">
                <CustomButton
                    title={currentPage === 'upload' ? 'רשימת קבצים' : 'העלאת קבצים'}
                    handlePress={() => router.replace(currentPage === 'upload' ? '/browse' : '/upload')}
                    containerStyles="bg-primary px-4"
                />
            </View>
            <CustomButton 
                title="התנתק" 
                handlePress={() => router.replace('/signed-out')}
                containerStyles="bg-red-600 px-4" 
            />
        </View>
    );
}
