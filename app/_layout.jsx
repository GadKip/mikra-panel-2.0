import { View, SafeAreaView } from 'react-native';
import { SplashScreen, Stack } from 'expo-router';
import React from 'react';
import "../global.css";
import { StatusBar } from 'expo-status-bar';
import { GlobalProvider } from "../context/GlobalProvider";
import { AlertProvider } from "../context/AlertContext";
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import ErrorBoundary from '../components/ErrorBoundary';
import { RTLProvider } from '../context/RTLContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

SplashScreen.preventAutoHideAsync();

const LayoutContent = () => {
  const { isDark } = useTheme();
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RTLProvider>
        <AlertProvider>
          <ErrorBoundary>
            <SafeAreaView className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="upload" options={{ headerShown: false }} />
                <Stack.Screen name="browse" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)/sign-in" />
              </Stack>
            </SafeAreaView>
          </ErrorBoundary>
          <StatusBar style={isDark ? "light" : "dark"} />
        </AlertProvider>
      </RTLProvider>
    </GestureHandlerRootView>
  );
};

export default function Layout() {
  return (
    <GlobalProvider>
      <ThemeProvider>
        <LayoutContent />
      </ThemeProvider>
    </GlobalProvider>
  );
}