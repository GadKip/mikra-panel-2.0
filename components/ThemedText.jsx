import { Text } from 'react-native';
import React from 'react';
import { useTheme } from '../context/ThemeContext';
import PropTypes from 'prop-types';

const ThemedText = ({ children, className = '', ...props }) => {
  const { isDark } = useTheme();
  return (
    <Text 
      className={`${isDark ? 'text-text-dark' : 'text-text-light'} ${className}`} 
      {...props}
    >
      {children}
    </Text>
  );
};

ThemedText.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default ThemedText;