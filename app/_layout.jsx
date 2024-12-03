import { StyleSheet, Text, View } from 'react-native';
import { Slot, SplashScreen, Stack } from 'expo-router';
import React, { useEffect } from 'react';
import "../global.css";
import { StatusBar } from 'expo-status-bar';
import GlobalProvider from "../context/GlobalProvider";
import {useFonts} from 'expo-font'

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const Layout = () => {
  const [fontsLoaded, error] = useFonts({
    "SILEOTSR": require("../assets/fonts/SILEOTSR.ttf"),
    "SILEOT": require("../assets/fonts/SILEOT.ttf")
  });

useEffect( () => {
  if (error) throw error;
  if (fontsLoaded) SplashScreen.hideAsync();
}, [fontsLoaded, error]);
if (!fontsLoaded && !error) return null;

  return (
    <GlobalProvider> 
      <Stack>
      <Stack.Screen
          name = "index"
          options={{headerShown: false}}
        />
        <Stack.Screen
          name = "(auth)"
          options={{headerShown: false}}
        />
      <Stack.Screen
          name = "upload"
          options={{headerShown: true}}
        />
      </Stack>
      <StatusBar backgroundColor='#161622' style="light" />
    </GlobalProvider>
  );
};

export default Layout;