import { View, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import ThemedText from './ThemedText';

/**
 * @typedef {Object} EpisodeListItemProps
 * @property {Object} episode - The episode data object
 * @property {Function} onDelete - Callback function when delete is pressed
 * @property {Function} onEdit - Callback function when edit is pressed
 * @property {Function} onToggleSelection - Callback function when selection is toggled
 * @property {boolean} isSelected - Whether the episode is currently selected
 */

const EpisodeListItem = ({ 
    episode, 
    onDelete, 
    onEdit, 
    onToggleSelection, 
    isSelected,
    onMoveUp,
    onMoveDown 
}) => {
    const { isDark } = useTheme();
    
    return (
        <View className={`flex-row justify-between items-center ${isDark ? 'bg-surface-dark' : 'bg-surface-light'} rounded-lg mb-2 p-3`}>
            <View className="flex-row gap-2 items-center">
                <TouchableOpacity
                    onPress={() => onDelete(episode)}
                    className="bg-red-600 px-3 py-1 rounded">
                    <ThemedText>מחק</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => onEdit(episode)}
                    className="bg-blue-600 px-3 py-1 rounded">
                    <ThemedText>ערוך</ThemedText>
                </TouchableOpacity>
                <View className="flex-row gap-1">
                    <TouchableOpacity
                        onPress={() => onMoveUp(episode)}
                        className="bg-gray-600 p-1 rounded">
                        <Ionicons 
                            name="chevron-up" 
                            size={20} 
                            color={isDark ? "#ffffff" : "#000000"}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => onMoveDown(episode)}
                        className="bg-gray-600 p-1 rounded">
                        <Ionicons 
                            name="chevron-down" 
                            size={20} 
                            color={isDark ? "#ffffff" : "#000000"}
                        />
                    </TouchableOpacity>
                </View>
            </View>
            <View className="flex-row items-center gap-4">
                <ThemedText className="text-sm opacity-50">
                    {episode.episodeOrder.toFixed(1)}
                </ThemedText>
                <Pressable
                    onPress={() => onToggleSelection(episode)}
                    className="flex-row items-center gap-2">
                    <ThemedText className="text-lg">
                        {episode.episode}
                    </ThemedText>
                    <Ionicons
                        name={isSelected ? "checkbox-outline" : "square-outline"}
                        size={24}
                        color={isDark ? "#ffffff" : "#000000"}
                    />
                </Pressable>
            </View>
        </View>
    );
};

export default EpisodeListItem;
