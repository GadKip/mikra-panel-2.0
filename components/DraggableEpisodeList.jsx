import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { Databases } from 'appwrite';
import DraggableFlatList from 'react-native-draggable-flatlist';
import EpisodeListItem from './EpisodeListItem';
import Loader from './Loader';
import { useTheme } from '../context/ThemeContext';
import { reorderEpisode } from '../lib/appwrite';

export default function DraggableEpisodeList({ 
    episodes, 
    onReorder, 
    category, 
    book 
}) {
    const { isDark } = useTheme();
    const [isDragging, setIsDragging] = useState(false);
    const [isReordering, setIsReordering] = useState(false);

    const handleDragEnd = async (result) => {
        setIsDragging(false);
        if (!result.destination) return;

        const sourceIndex = result.source.index;
        const destIndex = result.destination.index;
        
        if (sourceIndex === destIndex) return;

        try {
            setIsReordering(true);
            
            const updatedEpisodes = Array.from(episodes);
            const [reorderedItem] = updatedEpisodes.splice(sourceIndex, 1);
            updatedEpisodes.splice(destIndex, 0, reorderedItem);

            // Update UI immediately
            onReorder(updatedEpisodes);

            // Calculate new order using one of the approaches above
            const newOrder = calculateNewOrder(updatedEpisodes, destIndex);
            
            // Silent backend update - no alerts
            await reorderEpisode(databases, reorderedItem.$id, newOrder);
        } catch (error) {
            console.error('Error reordering:', error);
            // Only show error in console, don't alert
        } finally {
            setIsReordering(false);
        }
    };

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
                    category={category}
                    book={book}
                />
            </View>
        );
    };

    return (
        <div className="w-full">
            {isReordering && (
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    <Loader />
                </div>
            )}
            <DragDropContext 
                onDragEnd={handleDragEnd} 
                onDragStart={() => setIsDragging(true)}
            >
                <Droppable droppableId="episodes">
                    {(provided) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className={`space-y-2 ${isDragging ? 'opacity-50' : ''}`}
                        >
                            {episodes.map((episode, index) => (
                                <EpisodeListItem
                                    key={episode.$id}
                                    episode={episode}
                                    index={index}
                                    category={category}
                                    book={book}
                                />
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
};

function calculateNewOrder(episodes, destIndex) {
    const INCREMENT = 1000; // Large increment to allow for future insertions
    
    if (episodes.length === 0) return INCREMENT;
    
    if (destIndex === 0) {
        // If moved to start
        return Math.floor(episodes[0].episodeOrder - INCREMENT);
    } 
    
    if (destIndex === episodes.length - 1) {
        // If moved to end
        return Math.floor(episodes[destIndex - 1].episodeOrder + INCREMENT);
    }
    
    // If moved between items
    const prevOrder = episodes[destIndex - 1].episodeOrder;
    const nextOrder = episodes[destIndex].episodeOrder;
    return Math.floor(prevOrder + (nextOrder - prevOrder) / 2);
}