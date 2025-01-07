import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useGlobalContext } from '../context/GlobalProvider';
import { listFiles, deleteFile, updateFile } from '../lib/appwrite';
import CustomButton from '../components/CustomButton';
import Loader from '../components/Loader';
import { useCustomAlert } from '../lib/utils';
import EditModal from '../components/EditModal';
import { useLoadingState } from '../hooks/useLoadingState';
import { useResponsive } from '../hooks/useResponsive';
import { useErrorHandler } from '../hooks/useErrorHandler';
import Header from '../components/Header';

const Browse = () => {
    const [books, setBooks] = useState({});
    const { withLoading, isLoading } = useLoadingState();
    const { getResponsiveValue, isMobile, isTablet } = useResponsive();
    const handleError = useErrorHandler();
    const { client } = useGlobalContext();
    const customAlert = useCustomAlert();
    const router = useRouter();
    const [editingEpisode, setEditingEpisode] = useState(null);
  
    useEffect(() => {
      fetchBooks();
    }, []);
  
    const fetchBooks = async () => {
      if (!client) {
        console.error("No client available");
        return;
      }
      try {
        await withLoading(async () => {
          try {
            const files = await listFiles(client);
            setBooks(files);
          } catch (error) {
            handleError(error, {
              title: 'שגיאה בטעינת ספרים',
              fallbackMessage: 'לא ניתן לטעון את רשימת הספרים'
            });
          }
        }, true);
      } catch (error) {
        console.error("Error fetching books:", error);
        customAlert('Error', 'Could not fetch books. Please try again later.');
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
            await deleteFile(episode.fileId, episode.$id, client);
            await fetchBooks();
            customAlert('הצלחה', 'הפרק נמחק בהצלחה');
          } catch (error) {
            console.error("Error deleting file:", error);
            customAlert('שגיאה', 'לא ניתן למחוק את הפרק. נסה שוב מאוחר יותר.');
          }
        },
        null,
        'מחק',
        'ביטול',
        true
      );
    };
  
    const handleEdit = async (formData) => {
        try {
            await updateFile(
                editingEpisode.$id,
                editingEpisode.fileId,
                formData,
                client
            );
            await fetchBooks();
            customAlert('הצלחה', 'הפרק עודכן בהצלחה');
        } catch (error) {
            console.error("Error updating file:", error);
            customAlert('שגיאה', 'לא ניתן לעדכן את הפרק. נסה שוב מאוחר יותר.');
        } finally {
            setEditingEpisode(null);
        }
    };
  
    const getGridColumns = () => {
      if (isMobile) return 1;
      if (isTablet) return 2;
      return 3;
    };
  
    return (
      <SafeAreaView className="flex-1 bg-primary">
        <Loader isLoading={isLoading} />
        <Header currentPage="browse" />
        <View className={getResponsiveValue({
          mobile: "p-4",
          tablet: "p-6",
          desktop: "p-8"
        })}>
          <ScrollView 
            className="flex-1"
            contentContainerStyle={{
              display: 'grid',
              gridTemplateColumns: `repeat(${getGridColumns()}, 1fr)`,
              gap: getResponsiveValue({
                mobile: 16,
                tablet: 20,
                desktop: 24
              })
            }}
          >
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
                          <TouchableOpacity
                            onPress={() => setEditingEpisode(episode)}
                            className="bg-blue-600 px-3 py-1 rounded"
                          >
                            <Text className="text-white">ערוך</Text>
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
        </View>
        <EditModal
            isVisible={!!editingEpisode}
            onClose={() => setEditingEpisode(null)}
            onSubmit={handleEdit}
            initialData={editingEpisode}
        />
      </SafeAreaView>
    );
  
};

export default Browse;