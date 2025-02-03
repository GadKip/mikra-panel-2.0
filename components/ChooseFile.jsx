import React, { useState, useRef, useCallback } from 'react';
import { View } from 'react-native';
import CustomButton from './CustomButton';
import { useTheme } from '../context/ThemeContext';

// Only use this import on react-native:
let DocumentPicker = null;
try {
    if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative' ) {
       DocumentPicker = require('react-native-document-picker');
     }
}
catch(err){
 console.error("Browser environmnent detected and avoiding dynamic import");
}

/**
 * ChooseFile Component
 *
 * A button component for browsing and selecting files from the device.
 * It renders a "Browse Files" button that triggers a document picker and calls a provided callback with selected file
 */
const ChooseFile = ({ onFileSelected }) => {
  const isWeb = typeof navigator !== 'undefined' && navigator.product !== 'ReactNative';
  const { isDark } = useTheme();
  const [selectedFileName, setSelectedFileName] = useState('');
  const inputRef = useRef(null);

  const browseFilesWeb = () => {
      inputRef.current && inputRef.current.click();
  }

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if(file){
      setSelectedFileName(file.name);
      onFileSelected({name: file.name, uri: URL.createObjectURL(file), type:file.type});
    }
  },[onFileSelected]);

  const browseFiles = async () => {
    try {
      if(DocumentPicker){
        const result = await DocumentPicker.pickSingle({
          type: [DocumentPicker.types.allFiles]
        });
        if(result) {
          onFileSelected(result)
        }
      }
    } catch (error) {
      console.log("DocumentPicker failed, message is:", error.message, "and original error is ",error);
      if (DocumentPicker.isCancel(error)) {
        console.log("DocumentPicker canceled by the user.");
      } else {
        console.error("Error picking document:", error);
        // Handle the error (e.g. notify user or other fallback actions)
      }
    }
  };

  return (
    <>
      {isWeb ? (
        <>
          <input
            type="file"
            style={{ display: 'none' }}
            ref={inputRef}
            onChange={handleFileChange}
          />
          <CustomButton
            title={selectedFileName ? selectedFileName : 'בחר קבצים'}
            handlePress={browseFilesWeb}
            containerStyles={`${selectedFileName ? 'opacity-90' : ''}`}
            isDark={isDark}
          />
        </>
      ) : (
        <CustomButton
          title="בחר קבצים"
          handlePress={browseFiles}
          isDark={isDark}
        />
      )}
    </>
  );
};

export default ChooseFile;