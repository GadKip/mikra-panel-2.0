import { View, Text, ScrollView, TouchableOpacity, Pressable } from 'react-native';
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
import { Ionicons } from '@expo/vector-icons';

const Browse = () => {
    const [books, setBooks] = useState({});
    const { withLoading, isLoading } = useLoadingState();
    const { getResponsiveValue, isMobile, isTablet } = useResponsive();
    const handleError = useErrorHandler();
    const { client } = useGlobalContext();
    const customAlert = useCustomAlert();
    const router = useRouter();
    const [editingEpisode, setEditingEpisode] = useState(null);
    const [selectedEpisodes, setSelectedEpisodes] = useState([]);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [expandedBooks, setExpandedBooks] = useState({});

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

    const toggleEpisodeSelection = (episode) => {
        if (selectedEpisodes.some(selected => selected.$id === episode.$id)) {
            setSelectedEpisodes(selectedEpisodes.filter(selected => selected.$id !== episode.$id));
        } else {
            setSelectedEpisodes([...selectedEpisodes, episode]);
        }
    };

    const handleMultipleDelete = async () => {
        if (selectedEpisodes.length === 0) {
            customAlert('אזהרה', 'לא נבחרו פרקים למחיקה.');
            return;
        }
        customAlert(
            'אישור מחיקה',
            `האם אתה בטוח שברצונך למחוק ${selectedEpisodes.length} פרקים?`,
            async () => {
                try {
                    await Promise.all(selectedEpisodes.map(async (episode) => {
                        await deleteFile(episode.fileId, episode.$id, client);
                    }));
                    await fetchBooks();
                    customAlert('הצלחה', 'הפרקים נמחקו בהצלחה');
                    setSelectedEpisodes([]);
                } catch (error) {
                    console.error("Error deleting files:", error);
                    customAlert('שגיאה', 'לא ניתן למחוק את הפרקים. נסה שוב מאוחר יותר.');
                }
            },
            null,
            'מחק',
            'ביטול',
            true
        );
    };

    const toggleCategory = (category) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    const toggleBook = (bookName) => {
        setExpandedBooks(prev => ({
            ...prev,
            [bookName]: !prev[bookName]
        }));
    };

    return (
        <SafeAreaView className="flex-1 bg-primary">
            <Loader isLoading={isLoading} />
            <Header currentPage="browse" />
            <ScrollView className="flex-1"> {/* Add this wrapper ScrollView */}
                <View className={getResponsiveValue({
                    mobile: "p-4",
                    tablet: "p-6",
                    desktop: "p-8"
                })}>
                    <ScrollView
                        className="flex-1"
                        contentContainerStyle={{
                            gap: getResponsiveValue({
                                mobile: 16,
                                tablet: 20,
                                desktop: 24
                            }),
                            paddingBottom: 20
                        }}
                    >
                        {Object.entries(books).map(([category, categoryBooks]) => (
                            <View key={category} className="mb-8 bg-secondary rounded-lg p-4">
                                <Pressable onPress={() => toggleCategory(category)} 
                                    className="flex-row-reverse justify-between items-center mb-4 border-b border-primary pb-2">
                                    <Text className="text-text text-2xl text-right w-full" dir="rtl">{category}</Text>
                                    <Ionicons name={expandedCategories[category] ? "chevron-down" : "chevron-back"} size={24} color="white" />
                                </Pressable>
                                {expandedCategories[category] !== false && Object.entries(categoryBooks).map(([bookName, episodes]) => (
                                    <View key={bookName} className="mb-4">
                                        <Pressable onPress={() => toggleBook(bookName)} 
                                            className="flex-row-reverse justify-between items-center mb-2">
                                            <Text className="text-text text-xl text-right w-full" dir="rtl">{bookName}</Text>
                                            <Ionicons name={expandedBooks[bookName] ? "chevron-down" : "chevron-back"} size={20} color="white" />
                                        </Pressable>
                                        {expandedBooks[bookName] !== false && <ScrollView style={{ maxHeight: 200 }}>
                                            {episodes.map((episode) => (
                                                <View
                                                    key={episode.$id}
                                                    className={`flex-row justify-between items-center bg-primary rounded-lg mb-2 p-3`}
                                                >
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
                                                    <Pressable
                                                        onPress={() => toggleEpisodeSelection(episode)}
                                                        className="flex-row items-center gap-2"
                                                    >
                                                        <Text className="text-text text-lg">
                                                            {episode.episode}
                                                        </Text>
                                                        <Ionicons
                                                            name={selectedEpisodes.some(selected => selected.$id === episode.$id) ? "checkbox-outline" : "square-outline"}
                                                            size={24}
                                                            color="white"
                                                        />
                                                    </Pressable>
                                                </View>
                                            ))}
                                        </ScrollView>}
                                    </View>
                                ))}
                            </View>
                        ))}
                    </ScrollView>
                    {selectedEpisodes.length > 0 && (
                        <View className="flex-row justify-end p-4">
                            <CustomButton
                                title={`מחק ${selectedEpisodes.length} פרקים`}
                                onPress={handleMultipleDelete}
                                style="bg-red-600"
                            />
                        </View>
                    )}
                </View>
            </ScrollView>
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