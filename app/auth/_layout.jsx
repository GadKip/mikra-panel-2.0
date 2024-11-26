import { Text, View } from 'react-native';
import { Stack, Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import "../../global.css";

const Layout = ({ children }) => {
  return (
    <>
        <Stack>
            <Stack.Screen 
            name="sign-in" options={{headerShown: flase}}
            />
        </Stack>

    </>
  );
};

export default Slot;

