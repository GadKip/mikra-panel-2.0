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

SplashScreen.preventAutoHideAsync();

const LayoutContent = () => {
  const { isDark } = useTheme();
  
  return (
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
  );
};

const Layout = () => {
  return (
    <GlobalProvider>
      <ThemeProvider>
        <LayoutContent />
      </ThemeProvider>
    </GlobalProvider>
  );
};

export default Layout;