import React, { useState, useRef, useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
// Only use this import on react-native:
import { useWindowDimensions } from 'react-native';


// Use the import conditionally, so this does not cause web crashing problems:
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
 * Browse Component
 *
 * A button component for browsing and selecting files from the device.
 * It renders a "Browse Files" button that triggers a document picker and calls a provided callback with selected file
 */
const Browse = ({ onFileSelected }) => {
  const isWeb = typeof navigator !== 'undefined' && navigator.product !== 'ReactNative'
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
         },[onFileSelected] );

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
             {isWeb ?
                   <>
            <input
           type="file"
        style={{display:'none'}}
                ref={inputRef}
                   onChange={handleFileChange}
           />
             <TouchableOpacity style={styles.button} onPress={browseFilesWeb}>
                
             { selectedFileName
                      ?   <View style={styles.fileBrowseStyle}>
                              <Text style={styles.text}>{selectedFileName}</Text>
                          </View> : 
                           <Text style={styles.text}>Browse Files</Text>

                      }

          </TouchableOpacity>
                
                    </>: <>
              <TouchableOpacity style={styles.button} onPress={browseFiles}>
                    <Text style={styles.text}>Browse Files</Text>
                </TouchableOpacity>
                  </>}
                
          </>
      )
};

const styles = StyleSheet.create({
   button:{
        backgroundColor:"#383b47",
        paddingVertical:12,
        paddingHorizontal:10,
        alignItems:"center",
        borderRadius:6
    },
        text:{
        color: "#efefef",
            fontSize:18,
          textAlign:"center"
        },
      fileBrowseStyle:{
           
        alignItems:'center'
         ,overflow:"hidden"

    }
});
export default Browse;