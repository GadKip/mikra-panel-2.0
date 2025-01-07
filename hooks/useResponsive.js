import { useWindowDimensions } from 'react-native';

export const useResponsive = () => {
  const { width } = useWindowDimensions();

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  const getResponsiveValue = (options) => {
    const { mobile, tablet, desktop } = options;
    if (isMobile) return mobile;
    if (isTablet) return tablet || desktop; // Fallback to desktop if tablet not specified
    return desktop;
  };

  return {
    isMobile,
    isTablet,
    isDesktop,
    getResponsiveValue,
    screenWidth: width
  };
};
