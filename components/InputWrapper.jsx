import { View } from 'react-native';
import React from 'react';
import PropTypes from 'prop-types';
import ThemedText from './ThemedText';

const InputWrapper = ({ title, children, otherStyles = '' }) => (
  <View className={`w-3/4 space-y-2 relative ${otherStyles}`}>
    <ThemedText className="text-base text-right">
      {title}
    </ThemedText>
    {children}
  </View>
);

InputWrapper.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  otherStyles: PropTypes.string
};

InputWrapper.displayName = 'InputWrapper';

export default InputWrapper;