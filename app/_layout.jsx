import { View, SafeAreaView } from 'react-native';
import { SplashScreen, Stack } from 'expo-router';
import React, { useEffect } from 'react';
import "../global.css";
import { StatusBar } from 'expo-status-bar';
import { GlobalProvider } from "../context/GlobalProvider";
import { AlertProvider } from "../context/AlertContext";
import ErrorBoundary from '../components/ErrorBoundary';
import { RTLProvider } from '../context/RTLContext';

SplashScreen.preventAutoHideAsync();

const Layout = () => {

    return (
        <GlobalProvider>
            <RTLProvider>
                <AlertProvider>
                    <ErrorBoundary>
                        <SafeAreaView className="bg-primary h-full flex-1">
                            <Stack screenOptions={{ headerShown: false }}>
                                <Stack.Screen name="index" options={{ headerShown: false }} />
                                <Stack.Screen name="upload" options={{ headerShown: false }} />
                                <Stack.Screen name="browse" options={{ headerShown: false }} />
                                <Stack.Screen name="(auth)/sign-in" />
                            </Stack>
                        </SafeAreaView>
                    </ErrorBoundary>
                    <StatusBar backgroundColor='#161622' style="light" />
                </AlertProvider>
            </RTLProvider>
        </GlobalProvider>
    );
};

export default Layout;