import { View, ActivityIndicator, Dimensions, Platform } from "react-native";
import { useTheme } from '../context/ThemeContext';

const Loader = ({ isLoading }) => {
  const osName = Platform.OS;
  const screenHeight = Dimensions.get("screen").height;
  const { isDark } = useTheme();

  if (!isLoading) return null;

  return (
    <View
      className="absolute flex justify-center items-center w-full h-full bg-primary/60 z-10"
      style={{
        height: screenHeight,
      }}
    >
      <ActivityIndicator
        animating={isLoading}
        color={isDark ? "#fff" : "#000"} // Should use theme color
      />
    </View>
  );
};

export default Loader;