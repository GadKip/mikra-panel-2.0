import { StyleSheet, Text, View } from 'react-native';
import { Slot, Stack } from 'expo-router';
import React from 'react';
import "../global.css";

const Layout = ({ children }) => {
  return (
    <Stack spacing={4} align="center">
      <View>
        <Text style={{ fontSize: 24 }}>מקרא מבואר</Text>
      </View>
      <View>
        {children}
      </View>
      <View>
        <Text>My App Footer</Text>
      </View>
    </Stack>
  );
};

export default Slot;