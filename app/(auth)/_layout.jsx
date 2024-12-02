import { StyleSheet, Text, View } from 'react-native';
import { Slot, Stack } from 'expo-router';
import React from 'react';
import "../../global.css";
import { StatusBar } from 'expo-status-bar';

const Layout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen
          name = "index"
          options={{headerShown: false}}
        />
      <Stack.Screen
          name = "upload"
          options={{headerShown: true}}
        />
      </Stack>
      <StatusBar backgroundColor='#161622' style="light" />
    </>
  );
};

export default Slot;