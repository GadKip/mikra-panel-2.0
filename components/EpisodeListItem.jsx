import { View, Text, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

/**
 * @typedef {Object} EpisodeListItemProps
 * @property {Object} episode - The episode data object
 * @property {Function} onDelete - Callback function when delete is pressed
 * @property {Function} onEdit - Callback function when edit is pressed
 * @property {Function} onToggleSelection - Callback function when selection is toggled
 * @property {boolean} isSelected - Whether the episode is currently selected
 */

const EpisodeListItem = ({ episode, onDelete, onEdit, onToggleSelection, isSelected }) => {
    const { isDark } = useTheme();
    return (
        <View className="flex-row justify-between items-center bg-primary rounded-lg mb-2 p-3">
            <View className="flex-row gap-2">
                <TouchableOpacity
                    onPress={() => onDelete(episode)}
                    className="bg-red-600 px-3 py-1 rounded">
                    <Text className="text-white">מחק</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => onEdit(episode)}
                    className="bg-blue-600 px-3 py-1 rounded">
                    <Text className="text-white">ערוך</Text>
                </TouchableOpacity>
            </View>
            <Pressable
                onPress={() => onToggleSelection(episode)}
                className="flex-row items-center gap-2">
                <Text className="text-text text-lg">{episode.episode}</Text>
                <Ionicons
                    name={isSelected ? "checkbox-outline" : "square-outline"}
                    size={24}
                    color="white"/>
            </Pressable>
        </View>
    );
};

export default EpisodeListItem;
