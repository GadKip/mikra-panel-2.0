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
        alert('Error', 'Could not fetch books. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
  
    const handleBookPress = (bookId) => {
      router.push(`/books/${bookId}`);
    };
  
    return (
      <View className="flex-1 bg-background">
        <Loader isLoading={loading} />
        <ScrollView className="flex-1 p-4">
          {Object.entries(books).map(([category, categoryBooks]) => (
            <View key={category} className="mb-8">
              <Text className="text-text text-2xl text-right mb-4">{category}</Text>
              {Object.entries(categoryBooks).map(([bookName, episodes]) => (
                <View key={bookName} className="mb-4">
                  <Text 
                    className="text-text text-xl text-right mb-2"
                    onPress={() => handleBookPress(bookName)}
                  >
                    {bookName}
                  </Text>
                  {episodes.map((episode) => (
                    <Text 
                      key={episode.$id} 
                      className="text-text text-lg text-right py-2"
                      onPress={() => handleBookPress(episode.$id)}
                    >
                      {episode.episode}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      </View>
    );
  
};

export default Browse;