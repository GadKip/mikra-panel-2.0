import { View, Text, ScrollView, Pressable, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalContext } from '../context/GlobalProvider';
import { 
    listFiles, 
    deleteFile, 
    updateFile, 
    deleteMultipleFiles,
    reorderEpisodes,
    reuploadAllProblematicFiles
} from '../lib/firebase';
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
    const [bookSelection, setBookSelection] = useState({});
    const [reorderingId, setReorderingId] = useState(null); // Track which episode is being reordered

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

    // Helper to get consistent ID regardless of schema
    const getEpisodeId = (episode) => episode?.$id || episode?.id;

    // Data fetching
    const fetchBooks = async () => {
        try {
            await withLoading(async () => {
                const files = await listFiles();
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
        const episodeId = getEpisodeId(episode);
        customAlert(
            'אישור מחיקה',
            'האם אתה בטוח שברצונך למחוק פרק זה?',
            async () => {
                try {
                    await deleteFile(episodeId);
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
        const episodeId = getEpisodeId(editingEpisode);
        try {
            await updateFile(episodeId, formData);
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

    const handleReorder = async (episode, direction) => {
        const episodeId = getEpisodeId(episode);
        if (!episodeId || reorderingId) return;

        const currentCategory = books[episode.category];
        if (!currentCategory) return;

        const currentBookEpisodes = currentCategory[episode.book];
        if (!currentBookEpisodes) return;

        // Ensure we are working with an array
        const bookEpisodes = Array.isArray(currentBookEpisodes) 
            ? [...currentBookEpisodes] 
            : Object.values(currentBookEpisodes);

        // Sort to verify current order
        const sortedEpisodes = bookEpisodes.sort((a, b) => Number(a.episodeOrder) - Number(b.episodeOrder));
        const currentIndex = sortedEpisodes.findIndex(ep => getEpisodeId(ep) === episodeId);
        
        if (currentIndex === -1) return;
        
        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        
        // Boundaries check
        if (targetIndex < 0 || targetIndex >= sortedEpisodes.length) {
            return;
        }

        setReorderingId(episodeId);

        // Create shallow copy and perform the swap
        const updatedEpisodes = [...sortedEpisodes];
        const temp = updatedEpisodes[currentIndex];
        updatedEpisodes[currentIndex] = updatedEpisodes[targetIndex];
        updatedEpisodes[targetIndex] = temp;

        // Map and update the internal order values explicitly so the database gets updated index fields
        const finalEpisodesWithUpdatedOrder = updatedEpisodes.map((ep, idx) => ({
            ...ep,
            episodeOrder: idx + 1
        }));

        // 1. Optimistically update local state for UI responsiveness
        setBooks(prevBooks => ({
            ...prevBooks,
            [episode.category]: {
                ...prevBooks[episode.category],
                [episode.book]: finalEpisodesWithUpdatedOrder
            }
        }));

        // 2. Perform backend update outside of the state updater flow
        try {
            await reorderEpisodes(finalEpisodesWithUpdatedOrder);
        } catch (error) {
            console.error('Reorder error:', error);
            // Revert state by fetching clean data from server if update fails
            await fetchBooks();
        } finally {
            setReorderingId(null);
        }
    };

    const handleMoveUp = (episode) => handleReorder(episode, 'up');
    const handleMoveDown = (episode) => handleReorder(episode, 'down');

    const toggleEpisodeSelection = (episode) => {
        const episodeId = getEpisodeId(episode);
        setSelectedEpisodes(prev => 
            prev.some(selected => getEpisodeId(selected) === episodeId)
                ? prev.filter(selected => getEpisodeId(selected) !== episodeId)
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
                        await deleteMultipleFiles(selectedEpisodes);
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

        const isSelecting = !bookSelection[bookName];

        if (isSelecting) {
            setSelectedEpisodes(prev => {
                const newEpisodes = episodes.filter(episode =>
                    !prev.some(selected => getEpisodeId(selected) === getEpisodeId(episode))
                );
                return [...prev, ...newEpisodes];
            });
        } else {
            setSelectedEpisodes(prev =>
                prev.filter(episode => !episodes.some(e => getEpisodeId(e) === getEpisodeId(episode)))
            );
        }
    };

    // Render methods
    const renderEpisodeList = (episodes) => (
        <View>
            {episodes.map(episode => {
                const episodeId = getEpisodeId(episode);
                return (
                    <EpisodeListItem
                        key={episodeId}
                        episode={episode}
                        onDelete={handleDelete}
                        onEdit={setEditingEpisode}
                        onToggleSelection={toggleEpisodeSelection}
                        isSelected={selectedEpisodes.some(selected => getEpisodeId(selected) === episodeId)}
                        onMoveUp={handleMoveUp}
                        onMoveDown={handleMoveDown}
                        isReordering={reorderingId === episodeId}
                    />
                );
            })}
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
                            handlePress={handleMultipleDelete}
                            containerStyles="bg-red-600"
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