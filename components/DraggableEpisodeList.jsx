import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import EpisodeListItem from './EpisodeListItem';
import Loader from './Loader';
import { useTheme } from '../context/ThemeContext';
import { reorderEpisodes } from '../lib/firebase';

export default function DraggableEpisodeList({ 
    episodes, 
    onReorder, 
    category, 
    book,
    onDelete,
    onEdit,
    onToggleSelection,
    selectedEpisodes = []
}) {
    const { isDark } = useTheme();
    const [isReordering, setIsReordering] = useState(false);

    const handleDragEnd = async ({ data }) => {
        try {
            setIsReordering(true);
            
            // Re-map the episodeOrder indexes to match their new positions in the list
            const updatedEpisodes = data.map((item, index) => ({
                ...item,
                episodeOrder: index + 1
            }));

            // Immediately update parent state to make UI movement smooth
            onReorder(updatedEpisodes);

            // Update database
            await reorderEpisodes(updatedEpisodes);
        } catch (error) {
            console.error('Error reordering:', error);
        } finally {
            setIsReordering(false);
        }
    };

    const renderItem = ({ item, drag, isActive }) => {
        const episodeId = item.$id || item.id;
        const isSelected = selectedEpisodes.some(selected => (selected.$id || selected.id) === episodeId);

        return (
            <ScaleDecorator>
                <View style={{ opacity: isActive ? 0.8 : 1 }}>
                    <EpisodeListItem
                        episode={item}
                        onDelete={onDelete}
                        onEdit={onEdit}
                        onToggleSelection={onToggleSelection}
                        isSelected={isSelected}
                        onMoveUp={null} // Drag handle overrides manual stepping
                        onMoveDown={null}
                        isReordering={isReordering}
                    />
                </View>
            </ScaleDecorator>
        );
    };

    return (
        <View style={styles.container}>
            {isReordering && (
                <View style={styles.loaderContainer}>
                    <Loader />
                </View>
            )}
            <DraggableFlatList
                data={episodes}
                onDragEnd={handleDragEnd}
                keyExtractor={(item) => item.$id || item.id}
                renderItem={renderItem}
                containerStyle={styles.listContainer}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    loaderContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    listContainer: {
        flexGrow: 1,
    }
});