import { View, Text, ScrollView, Pressable, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalContext } from '../context/GlobalProvider';
import { 
    listFiles, 
    deleteFile, 
    updateFile, 
    deleteMultipleFiles,
    reorderEpisode
} from '../lib/appwrite';
import CustomButton from '../components/CustomButton';
import Loader from '../components/Loader';
import { useCustomAlert } from '../lib/utils';
import EditModal from '../components/EditModal';
import { useLoadingState } from '../hooks/useLoadingState';
import { useResponsive } from '../hooks/useResponsive';
import { useErrorHandler } from '../hooks/useErrorHandler';
import Header from '../components/Header';
import EpisodeListItem from '../components/EpisodeListItem';
import { useTheme } from '../context/ThemeContext';
import ThemedText from '../components/ThemedText';

const Browse = () => {
    // State management
    const [books, setBooks] = useState({});
    const [editingEpisode, setEditingEpisode] = useState(null);
    const [selectedEpisodes, setSelectedEpisodes] = useState([]);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [expandedBooks, setExpandedBooks] = useState({});
    const [bookSelection, setBookSelection] = useState({}); // Track book-level selection

    // Hooks
    const { withLoading, isLoading } = useLoadingState();
    const { getResponsiveValue } = useResponsive();
    const handleError = useErrorHandler();
    const { client } = useGlobalContext();
    const customAlert = useCustomAlert();
    const router = useRouter();
    const { isDark } = useTheme();

    useEffect(() => {
        fetchBooks();
    }, []);

    // Data fetching
    const fetchBooks = async () => {
        if (!client) {
            console.error("No client available");
            return;
        }

        try {
            await withLoading(async () => {
                const files = await listFiles(client);
                setBooks(files);

                // Initialize expandedCategories and expandedBooks to false
                const initialExpandedCategories = {};
                const initialExpandedBooks = {};
                const initialBookSelection = {}; // Initialize book selection state

                Object.keys(files).forEach(category => {
                    initialExpandedCategories[category] = false;
                    Object.keys(files[category]).forEach(book => {
                        initialExpandedBooks[book] = false;
                        initialBookSelection[book] = false; // Initialize book selection to false
                    });
                });

                setExpandedCategories(initialExpandedCategories);
                setExpandedBooks(initialExpandedBooks);
                setBookSelection(initialBookSelection); // Set initial book selection state
            }, true);
        } catch (error) {
            handleError(error, {
                title: 'שגיאה בטעינת ספרים',
                fallbackMessage: 'לא ניתן לטעון את רשימת הספרים'
            });
        }
    };

    // Event handlers
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
                    handleError(error, {
                        title: 'שגיאה במחיקת פרק',
                        fallbackMessage: 'לא ניתן למחוק את הפרק'
                    });
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
            await updateFile(editingEpisode.$id, editingEpisode.fileId, formData, client);
            await fetchBooks();
            customAlert('הצלחה', 'הפרק עודכן בהצלחה');
        } catch (error) {
            console.error('Edit error:', error);
            handleError(error, {
                title: 'שגיאה בעדכון פרק',
                fallbackMessage: 'לא ניתן לעדכן את הפרק'
            });
        }
    };

    const handleReorder = async (episode, newOrder) => {
        try {
            const orderValue = parseFloat(newOrder);
            if (isNaN(orderValue)) {
                throw new Error("Invalid order value");
            }
            
            await withLoading(async () => {
                await reorderEpisode(episode.$id, orderValue, client);
                await fetchBooks();
            });
            
            customAlert('הצלחה', 'סדר הפרקים עודכן בהצלחה');
        } catch (error) {
            handleError(error, {
                title: 'שגיאה בסידור פרקים',
                fallbackMessage: 'לא ניתן לעדכן את סדר הפרקים'
            });
        }
    };

    const handleMoveUp = async (episode) => {
        try {
            const bookEpisodes = Object.values(books[episode.category][episode.book]);
            const sortedEpisodes = bookEpisodes.sort((a, b) => Number(a.episodeOrder) - Number(b.episodeOrder));
            
            const currentIndex = sortedEpisodes.findIndex(ep => ep.$id === episode.$id);
            if (currentIndex <= 0) return;
            
            const prevEpisode = sortedEpisodes[currentIndex - 1];
            const newOrder = Number(prevEpisode.episodeOrder);
            const prevOrder = newOrder - 1;

            await withLoading(async () => {
                await reorderEpisode(prevEpisode.$id, prevOrder, client);
                await reorderEpisode(episode.$id, newOrder, client);
                await fetchBooks();
            });

            customAlert('הצלחה', 'סדר הפרקים עודכן בהצלחה');
        } catch (error) {
            handleError(error);
        }
    };

    const handleMoveDown = async (episode) => {
        try {
            const bookEpisodes = Object.values(books[episode.category][episode.book]);
            const sortedEpisodes = bookEpisodes.sort((a, b) => Number(a.episodeOrder) - Number(b.episodeOrder));
            
            const currentIndex = sortedEpisodes.findIndex(ep => ep.$id === episode.$id);
            if (currentIndex >= sortedEpisodes.length - 1) return;
            
            const nextEpisode = sortedEpisodes[currentIndex + 1];
            const newOrder = Number(nextEpisode.episodeOrder);
            const nextOrder = newOrder + 1;

            await withLoading(async () => {
                await reorderEpisode(nextEpisode.$id, nextOrder, client);
                await reorderEpisode(episode.$id, newOrder, client);
                await fetchBooks();
            });
            
            customAlert('הצלחה', 'סדר הפרקים עודכן בהצלחה');
        } catch (error) {
            handleError(error);
        }
    };

    const toggleEpisodeSelection = (episode) => {
        setSelectedEpisodes(prev => 
            prev.some(selected => selected.$id === episode.$id)
                ? prev.filter(selected => selected.$id !== episode.$id)
                : [...prev, episode]
        );
    };

    const handleMultipleDelete = async () => {
        if (selectedEpisodes.length === 0) return;
        
        customAlert(
            'אישור מחיקה',
            `האם אתה בטוח שברצונך למחוק ${selectedEpisodes.length} פרקים?`,
            async () => {
                try {
                    await withLoading(async () => {
                        await deleteMultipleFiles(selectedEpisodes, client);
                    });
                    
                    await fetchBooks();
                    setSelectedEpisodes([]);
                    customAlert('הצלחה', 'הפרקים נמחקו בהצלחה');
                } catch (error) {
                    handleError(error, {
                        title: 'שגיאה במחיקת פרקים',
                        fallbackMessage: error.message || 'לא ניתן למחוק את הפרקים'
                    });
                }
            },
            null,
            'מחק',
            'ביטול',
            true
        );
    };

    const toggleCategory = (category) => {
        setExpandedCategories(prev => ({...prev, [category]: !prev[category]}));
    };

    const toggleBook = (bookName) => {
        setExpandedBooks(prev => ({...prev, [bookName]: !prev[bookName]}));
    };

    const toggleBookSelection = (bookName, episodes) => {
        setBookSelection(prev => ({
            ...prev,
            [bookName]: !prev[bookName]
        }));

        // If selecting the book, add all episodes to selectedEpisodes
        if (!bookSelection[bookName]) {
            setSelectedEpisodes(prev => {
                const newEpisodes = episodes.filter(episode =>
                    !prev.some(selected => selected.$id === episode.$id)
                );
                return [...prev, ...newEpisodes];
            });
        }
        // If unselecting the book, remove all episodes from selectedEpisodes
        else {
            setSelectedEpisodes(prev =>
                prev.filter(episode => !episodes.some(e => e.$id === episode.$id))
            );
        }
    };

    // Render methods
    const renderEpisodeList = (episodes) => (
        <View>
            {episodes.map(episode => (
                <EpisodeListItem
                    key={episode.$id}
                    episode={episode}
                    onDelete={handleDelete}
                    onEdit={setEditingEpisode}
                    onToggleSelection={toggleEpisodeSelection}
                    isSelected={selectedEpisodes.some(selected => selected.$id === episode.$id)}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                />
            ))}
        </View>
    );

    const renderBookItem = ([bookName, episodes]) => (
        <View key={bookName} className="mb-4">
            <View className="flex-row items-center justify-between">
                <Pressable 
                    onPress={() => toggleBook(bookName)}
                    className="flex-row-reverse justify-between items-center mb-2 flex-1">
                    <ThemedText className="text-xl text-right">
                        {bookName}
                    </ThemedText>
                    <Ionicons 
                        name={expandedBooks[bookName] ? "chevron-down" : "chevron-back"} 
                        size={20} 
                        color="white"/>
                </Pressable>
                <TouchableOpacity
                    onPress={() => toggleBookSelection(bookName, episodes)}
                    className="items-center">
                    <Ionicons
                        name={bookSelection[bookName] ? "checkbox-outline" : "square-outline"}
                        size={24}
                        color={isDark ? "#ffffff" : "#000000"}
                    />
                </TouchableOpacity>
            </View>
            {expandedBooks[bookName] !== false && renderEpisodeList(episodes)}
        </View>
    );

    return (
        <SafeAreaView className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
            <Loader isLoading={isLoading}/>
            <Header currentPage="browse"/>
            <ScrollView className="flex-1 p-4">
                {Object.entries(books).map(([category, categoryBooks]) => (
                    <View key={category} className={`mb-8 ${isDark ? 'bg-surface-dark' : 'bg-surface-light'} rounded-lg p-4`}>
                        <Pressable 
                            onPress={() => toggleCategory(category)}
                            className="flex-row-reverse justify-between items-center mb-4 border-b border-primary pb-2">
                            <ThemedText className="text-2xl text-right w-full" dir="rtl">
                                {category}
                            </ThemedText>
                            <Ionicons 
                                name={expandedCategories[category] ? "chevron-down" : "chevron-back"} 
                                size={24} 
                                color={isDark ? "#ffffff" : "#000000"}/>
                        </Pressable>
                        {expandedCategories[category] !== false && 
                            Object.entries(categoryBooks).map(renderBookItem)}
                    </View>
                ))}
                {selectedEpisodes.length > 0 && (
                    <View className="flex-row justify-end p-4">
                        <CustomButton
                            title={`מחק ${selectedEpisodes.length} פרקים`}
                            handlePress={handleMultipleDelete} // Changed from onPress to handlePress
                            containerStyles="bg-red-600" // Changed from style to containerStyles
                        />
                    </View>
                )}
            </ScrollView>
            <EditModal
                isVisible={!!editingEpisode}
                onClose={() => setEditingEpisode(null)}
                initialData={editingEpisode}
                onSubmit={handleEdit}
            />
        </SafeAreaView>
    );
};

export default Browse;