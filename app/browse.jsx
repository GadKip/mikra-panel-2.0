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
    const [books, setBooks] = useState({});
    const [loading, setLoading] = useState(true);
    const { client } = useGlobalContext();
    const customAlert = useCustomAlert();
    const router = useRouter();
  
    useEffect(() => {
      fetchBooks();
    }, []);
  
    const fetchBooks = async () => {
      if (!client) {
        console.error("No client available");
        return;
      }
      try {
        setLoading(true);
        const files = await listFiles(client);
        setBooks(files);
      } catch (error) {
        console.error("Error fetching books:", error);
        customAlert('Error', 'Could not fetch books. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
  
    const handleBookPress = (bookId) => {
      router.push(`/books/${bookId}`);
    };
  
    const handleDelete = async (episode) => {
      customAlert(
        'אישור מחיקה',
        'האם אתה בטוח שברצונך למחוק פרק זה?',
        async () => {
          try {
            setLoading(true);
            await deleteFile(episode.fileId, episode.$id, client);
            await fetchBooks();
            customAlert('הצלחה', 'הפרק נמחק בהצלחה');
          } catch (error) {
            console.error("Error deleting file:", error);
            customAlert('שגיאה', 'לא ניתן למחוק את הפרק. נסה שוב מאוחר יותר.');
          } finally {
            setLoading(false);
          }
        },
        null,
        'מחק',
        'ביטול',
        true
      );
    };
  
    return (
      <SafeAreaView className="flex-1 bg-primary">
        <Loader isLoading={loading} />
        <View className="flex-row justify-between items-center px-4 py-3 bg-secondary">
          <CustomButton
            title="חזרה להעלאה"
            handlePress={() => router.replace('/upload')}
            containerStyles="bg-primary px-4"
          />
          <Text className="text-text text-2xl">רשימת פרקים</Text>
        </View>
        <ScrollView className="flex-1 px-4 py-2">
          {Object.entries(books).map(([category, categoryBooks]) => (
            <View key={category} className="mb-8 bg-secondary rounded-lg p-4">
              <Text className="text-text text-2xl text-right mb-4 border-b border-primary pb-2">{category}</Text>
              {Object.entries(categoryBooks).map(([bookName, episodes]) => (
                <View key={bookName} className="mb-4">
                  <Text className="text-text text-xl text-right mb-2 text-secondary-content">
                    {bookName}
                  </Text>
                  {episodes.map((episode) => (
                    <View key={episode.$id} className="flex-row justify-between items-center bg-primary rounded-lg mb-2 p-3">
                      <View className="flex-row gap-2">
                        <TouchableOpacity
                          onPress={() => handleDelete(episode)}
                          className="bg-red-600 px-3 py-1 rounded"
                        >
                          <Text className="text-white">מחק</Text>
                        </TouchableOpacity>
                      </View>
                      <Text className="text-text text-lg">
                        {episode.episode}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  
};

export default Browse;