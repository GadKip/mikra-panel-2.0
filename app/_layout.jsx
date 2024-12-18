// app/layout.jsx
import { View } from 'react-native';
import { SplashScreen, Stack } from 'expo-router';
import React, { useEffect } from 'react';
import "../global.css";
import { StatusBar } from 'expo-status-bar';
import {GlobalProvider} from "../context/GlobalProvider"; // Correct Import
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
      <View style={{ flex: 1 }}>
          <Stack>
          <Stack.Screen
              name = "index"
              options={{headerShown: false}}
            />
           <Stack.Screen
              name = "upload"
              options={{headerShown: false}}
            />
          </Stack>
          <StatusBar backgroundColor='#161622' style="light" />
      </View>
    </GlobalProvider>
  );
};

export default Layout;