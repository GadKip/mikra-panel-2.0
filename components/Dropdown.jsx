import { View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import React from 'react';
import InputWrapper from './InputWrapper';
import { useTheme } from '../context/ThemeContext';

const Dropdown = ({ title, value, placeholder, handleChangeText, otherStyles, items }) => {
    const { isDark } = useTheme();
    
    // Base theme styles
    const baseStyle = {
        color: isDark ? '#ffffff' : '#000000',
        backgroundColor: isDark ? '#2a2a2a' : '#ffffff',
        borderColor: isDark ? '#4a5568' : '#e5e7eb',
    };

    // Specific component styles
    const styles = {
        picker: {
            ...baseStyle,
            height: '100%',
            direction: 'rtl',
        },
        item: {
            ...baseStyle,
            fontSize: 16,
            textAlign: 'right',
        },
        placeholder: {
            ...baseStyle,
            color: isDark ? '#666666' : '#999999',
            opacity: 0.8,
        },
        selected: {
            ...baseStyle,
            fontWeight: 'bold',
        },
    };

    return (
        <InputWrapper title={title} otherStyles={otherStyles}>
            <View className={`border ${isDark ? 'border-border-dark' : 'border-border-light'} h-16 px-4 ${isDark ? 'bg-surface-dark' : 'bg-surface-light'} rounded-xl items-center flex flex-row`}>
                <Picker
                    selectedValue={value}
                    onValueChange={handleChangeText}
                    className="flex-1 h-full"
                    style={styles.picker}
                    dropdownIconColor={isDark ? '#ffffff' : '#000000'}
                    itemStyle={styles.item}
                >
                    <Picker.Item 
                        label={placeholder} 
                        value="" 
                        style={styles.placeholder}
                        enabled={false}
                    />
                    {items?.map((item) => (
                        <Picker.Item
                            key={item.value}
                            label={item.label}
                            value={item.value}
                            style={value === item.value ? styles.selected : styles.item}
                        />
                    ))}
                </Picker>
            </View>
        </InputWrapper>
    );
};

export default Dropdown;
