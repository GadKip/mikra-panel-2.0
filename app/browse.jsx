import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useGlobalContext } from '../context/GlobalProvider';
import { listFiles, deleteFile } from '../lib/appwrite';
import CustomButton from '../components/CustomButton';
import Loader from '../components/Loader';
import { useCustomAlert } from '../lib/utils';

const Browse = () => {
    const [files, setFiles] = useState([]);
    const { client, loading, setLoading } = useGlobalContext();
    const router = useRouter();
    const showAlert = useCustomAlert();

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            setLoading(true);
            const filesList = await listFiles(client);
            setFiles(filesList);
        } catch (error) {
            showAlert('Error', 'Could not fetch files');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (fileId, docId) => {
        showAlert('Confirm Delete', 'Are you sure you want to delete this file?', 
            async () => {
                try {
                    setLoading(true);
                    await deleteFile(fileId, docId, client);
                    showAlert('Success', 'File deleted successfully');
                    fetchFiles(); // Refresh the list
                } catch (error) {
                    showAlert('Error', 'Could not delete file');
                } finally {
                    setLoading(false);
                }
            }, 
            null, 
            'Delete', 
            'Cancel',
            true
        );
    };

    const handleReplace = (file) => {
        router.push({
            pathname: '/upload',
            params: {
                category: file.category,
                book: file.book,
                episode: file.episode
            }
        });
    };

    return (
        <SafeAreaView className="bg-primary h-full">
            <Loader isLoading={loading} />
            <Text style={{display:"none"}}>{/* Fix for React Native Web */}</Text>
            <View className="w-full px-4 py-6">
                <Text className="text-3xl text-center text-gray-50 mb-6">רשימת קבצים</Text>
                <ScrollView className="h-[80vh]">
                    {Object.entries(files).map(([category, books]) => (
                        <View key={category} className="mb-8">
                            <Text className="text-2xl text-gray-50 text-right mb-4">{category}</Text>
                            {Object.entries(books).map(([bookName, bookFiles]) => (
                                <View key={bookName} className="mb-6">
                                    <Text className="text-xl text-gray-300 text-right mb-3">{bookName}</Text>
                                    {bookFiles.map((file) => (
                                        <View key={file.$id} className="bg-gray-800 rounded-lg p-4 mb-4">
                                            <Text className="text-gray-50 text-lg text-right mb-2">
                                                {file.episode}
                                            </Text>
                                            <Text className="text-gray-300 text-right mb-4">
                                                {new Date(file.uploaded_at).toLocaleDateString('he-IL')}
                                            </Text>
                                            <View className="flex-row justify-end space-x-4">
                                                <CustomButton
                                                    title="החלף"
                                                    handlePress={() => handleReplace(file)}
                                                    containerStyles="bg-blue-500 px-4"
                                                />
                                                <CustomButton
                                                    title="מחק"
                                                    handlePress={() => handleDelete(file.file_id, file.$id)}
                                                    containerStyles="bg-red-500 px-4"
                                                />
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            ))}
                        </View>
                    ))}
                </ScrollView>
                <CustomButton
                    title="העלאה חדשה"
                    handlePress={() => router.push('/upload')}
                    containerStyles="mt-4"
                />
            </View>
        </SafeAreaView>
    );
};

export default Browse;