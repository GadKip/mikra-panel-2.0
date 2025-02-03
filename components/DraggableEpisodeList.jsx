import React, { useState } from 'react';
import { View } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import EpisodeListItem from './EpisodeListItem';
import { useTheme } from '../context/ThemeContext';

const DraggableEpisodeList = ({ 
    episodes, 
    onDelete, 
    onEdit, 
    onToggleSelection, 
    selectedEpisodes,
    onReorder 
}) => {
    const { isDark } = useTheme();

    const renderItem = ({ item, drag, isActive }) => {
        return (
            <View 
                style={{ 
                    opacity: isActive ? 0.5 : 1,
                    transform: [{ scale: isActive ? 1.05 : 1 }]
                }}
            >
                <EpisodeListItem
                    episode={item}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onToggleSelection={onToggleSelection}
                    isSelected={selectedEpisodes.some(selected => selected.$id === item.$id)}
                    onLongPress={drag}
                />
            </View>
        );
    };

    return (
        <DraggableFlatList
            data={episodes}
            keyExtractor={item => item.$id}
            renderItem={renderItem}
            onDragEnd={({ data }) => {
                // Update orders based on new positions
                const updatedEpisodes = data.map((episode, index) => ({
                    ...episode,
                    episodeOrder: index + 1
                }));
                onReorder(updatedEpisodes);
            }}
            style={{ maxHeight: 200 }}
        />
    );
};

export default DraggableEpisodeList;