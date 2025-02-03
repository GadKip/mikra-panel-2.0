import React from 'react';
import { View, Text } from 'react-native';
import CustomButton from './CustomButton';
import { useTheme } from '../context/ThemeContext';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Optionally refresh the page
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center bg-primary p-4">
          <Text className="text-text text-xl text-center mb-4">
            משהו השתבש... אנא נסה שוב
          </Text>
          <Text className="text-text text-sm opacity-75 mb-6">
            {this.state.error?.message || 'Unknown error occurred'}
          </Text>
          <CustomButton
            title="נסה שוב"
            handlePress={this.handleReset}
            containerStyles="bg-secondary"
          />
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
