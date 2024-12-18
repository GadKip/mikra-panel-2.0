import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as DocumentPicker from 'react-native-document-picker';

/**
 * Browse Component
 *
 * A button component for browsing and selecting files from the device.
 * It renders a "Browse Files" button that triggers a document picker and calls a provided callback with selected file
 */
const Browse = ({onFileSelected}) => {

    const browseFiles = async () => {
      
          
          try {
            const result = await DocumentPicker.pickSingle({
                  type: [DocumentPicker.types.allFiles]
                  
              });

           if (result) {
              
             onFileSelected(result)
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
    <TouchableOpacity style={styles.button} onPress={browseFiles}>
          <Text style={styles.text}>Browse Files</Text>
    </TouchableOpacity>
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
      textAlign:"center",
   }
})
export default Browse