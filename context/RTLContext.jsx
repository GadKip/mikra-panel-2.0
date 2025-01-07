import React, { createContext, useContext, useEffect } from 'react';
import { I18nManager } from 'react-native';

const RTLContext = createContext(null);

export function RTLProvider({ children }) {
  useEffect(() => {
    // Force RTL for the entire app
    if (!I18nManager.isRTL) {
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(true);
    }
  }, []);

  return (
    <RTLContext.Provider value={true}>
      {children}
    </RTLContext.Provider>
  );
}

export function useRTL() {
  const context = useContext(RTLContext);
  if (context === null) {
    throw new Error('useRTL must be used within an RTLProvider');
  }
  return context;
}