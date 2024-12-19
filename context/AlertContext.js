import React, { createContext, useState, useContext, useCallback } from 'react';
import CustomAlert from '../components/CustomAlert';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({});

    const showAlert = useCallback(({title, message, onConfirm, onClose, confirmText, cancelText, showCancel}) => {
         setAlertConfig({title, message, onConfirm, onClose, confirmText, cancelText, showCancel});
        setAlertVisible(true);
    },[]);

    const hideAlert = useCallback(() => {
        setAlertVisible(false)
        setAlertConfig({})
    },[])
    const handleConfirm = useCallback(() => {
          if(alertConfig.onConfirm) {
               alertConfig.onConfirm();
           }
        hideAlert();
    },[alertConfig.onConfirm, hideAlert]);
    
    const handleClose = useCallback(() => {
      if(alertConfig.onClose) {
           alertConfig.onClose();
      }
       hideAlert()
   },[alertConfig.onClose, hideAlert])

    const contextValue = {
        showAlert,
        hideAlert,
      
    };
    return(
         <AlertContext.Provider value={contextValue}>
           {children}
           <CustomAlert
                visible={alertVisible}
                title={alertConfig.title}
              message={alertConfig.message}
              onConfirm={handleConfirm}
              onClose={handleClose}
              confirmText={alertConfig.confirmText}
              cancelText={alertConfig.cancelText}
              showCancel={alertConfig.showCancel}
            />
         </AlertContext.Provider>
    );
};

export const useAlert = () => useContext(AlertContext);