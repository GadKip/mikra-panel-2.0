import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';

const CustomAlert = ({ visible, title, message, onClose, onConfirm, confirmText = "Ok", cancelText = "Cancel", showCancel = false }) => {
  const [modalVisible, setModalVisible] = useState(visible);

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

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent background
  },
  modalView: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 25,
    alignItems: 'center',
    elevation: 5,
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)' // Replaced the shadow properties with boxShadow
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign:'center'
  },
  modalMessage: {
      fontSize: 16,
      marginBottom: 20,
      textAlign:'center'
    },
  buttonContainer: {
    flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
  },
  button: {
    backgroundColor: '#2196F3',
    borderRadius: 5,
      padding: 10,
    elevation: 2,
     alignItems: 'center',
    marginLeft:5
  },
    cancelButton:{
        backgroundColor: '#646464',
    },
  textStyle: {
    color: '#fff',
    fontWeight: 'bold',
      textAlign: 'center'
  },
});

export default CustomAlert;