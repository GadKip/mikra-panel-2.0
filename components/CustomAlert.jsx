import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const CustomAlert = ({ visible, title, message, onClose, onConfirm, confirmText = "Ok", cancelText = "Cancel", showCancel = false }) => {
  const [modalVisible, setModalVisible] = useState(visible);
  const { isDark } = useTheme();

  useEffect(() => {
    setModalVisible(visible);
  }, [visible]);

  const handleClose = () => {
    setModalVisible(false);
    if (onClose) {
        onClose();
    }
  };
  const handleConfirm = () => {
      setModalVisible(false);
      if(onConfirm){
        onConfirm();
      }
  }
    
  const styles = StyleSheet.create({
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalView: {
      margin: 20,
      backgroundColor: isDark ? '#2a2a2a' : '#ffffff', // Use actual color values, not Tailwind classes
      borderRadius: 10,
      padding: 25,
      alignItems: 'center',
      elevation: 5,
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)'
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 10,
      textAlign: 'center',
      color: isDark ? '#ffffff' : '#000000'
    },
    modalMessage: {
      fontSize: 16,
      marginBottom: 20,
      textAlign: 'center',
      color: isDark ? '#ffffff' : '#000000'
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%'
    },
    button: {
      backgroundColor: isDark ? '#4a9eff' : '#2563eb', // Secondary colors
      borderRadius: 5,
      padding: 10,
      elevation: 2,
      minWidth: 100,
      alignItems: 'center',
      marginLeft: 5
    },
    cancelButton: {
      backgroundColor: isDark ? '#4a5568' : '#e5e7eb' // Border colors
    },
    textStyle: {
      color: isDark ? '#ffffff' : '#000000', // Text colors
      fontWeight: 'bold',
      textAlign: 'center'
    }
  });

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={handleClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalMessage}>{message}</Text>
          <View style={styles.buttonContainer}>
           {showCancel && (
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleClose}>
            <Text style={styles.textStyle}>{cancelText}</Text>
             </TouchableOpacity>)}
              <TouchableOpacity style={styles.button} onPress={handleConfirm}>
              <Text style={styles.textStyle}>{confirmText}</Text>
          </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomAlert;