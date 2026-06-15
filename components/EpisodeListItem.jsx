import { View, TouchableOpacity, Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import ThemedText from './ThemedText';
import { memo, useCallback } from 'react';

const EpisodeListItem = ({ 
    episode, 
    onDelete, 
    onEdit, 
    onToggleSelection, 
    isSelected,
    onMoveUp,
    onMoveDown,
    isReordering
}) => {
    const { isDark } = useTheme();
    
    const handleMoveUp = useCallback(() => {
        onMoveUp(episode);
    }, [episode, onMoveUp]);

    const handleMoveDown = useCallback(() => {
        onMoveDown(episode);
    }, [episode, onMoveDown]);

    return (
        // Changed background color from bg-neutral-100 to bg-gray-200 to make it darker than the page background (#f3f4f6)
        <View className={`flex-row justify-between items-center ${isDark ? 'bg-surface-dark' : 'bg-gray-200'} rounded-lg mb-2 p-3`}>
            <View className="flex-row gap-2 items-center">
                <TouchableOpacity
                    onPress={() => onDelete(episode)}
                    className="bg-red-600 px-3 py-1 rounded">
                    <ThemedText className="text-white">מחק</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => onEdit(episode)}
                    className="bg-blue-600 px-3 py-1 rounded">
                    <ThemedText className="text-white">ערוך</ThemedText>
                </TouchableOpacity>
                <View className="flex-row gap-1">
                    {/* Reorder Buttons: Updated to high-contrast slate-700 on gray-300 in light mode */}
                    <TouchableOpacity
                        onPress={handleMoveUp}
                        disabled={isReordering}
                        className={`${isDark ? 'bg-neutral-800' : 'bg-gray-300'} p-1 rounded ${isReordering ? 'opacity-50' : ''}`}>
                        <Ionicons 
                            name="chevron-up" 
                            size={20} 
                            color={isDark ? "#ffffff" : "#1e293b"} 
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleMoveDown}
                        disabled={isReordering}
                        className={`${isDark ? 'bg-neutral-800' : 'bg-gray-300'} p-1 rounded ${isReordering ? 'opacity-50' : ''}`}>
                        <Ionicons 
                            name="chevron-down" 
                            size={20} 
                            color={isDark ? "#ffffff" : "#1e293b"} 
                        />
                    </TouchableOpacity>
                </View>
            </View>
            <View className="flex-row items-center gap-4">
                <Pressable
                    onPress={() => onToggleSelection(episode)}
                    className="flex-row items-center gap-2">
                    <ThemedText className="text-lg">
                        {episode.episode || episode.title}
                    </ThemedText>
                    <Ionicons
                        name={isSelected ? "checkbox-outline" : "square-outline"}
                        size={24}
                        color={isDark ? "#ffffff" : "#334155"}
                    />
                </Pressable>
            </View>
        </View>
    );
};

export default memo(EpisodeListItem);