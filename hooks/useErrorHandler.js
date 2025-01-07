import { useCallback } from 'react';
import { useCustomAlert } from '../lib/utils';
import { useRouter } from 'expo-router';

export const useErrorHandler = () => {
  const showAlert = useCustomAlert();
  const router = useRouter();

  const handleError = useCallback((error, options = {}) => {
    const {
      title = 'שגיאה',
      fallbackMessage = 'אירעה שגיאה. אנא נסה שוב.',
      shouldRedirect = false,
      redirectPath = '/',
      onClose = null
    } = options;

    // Handle Appwrite specific errors
    if (error?.code) {
      switch (error.code) {
        case 401:
          showAlert('התחברות נדרשת', 'אנא התחבר מחדש', () => {
            router.replace('/(auth)/sign-in');
          });
          return;
        case 403:
          showAlert('אין הרשאה', 'אין לך הרשאה לבצע פעולה זו');
          return;
        // Add more specific error codes as needed
      }
    }

    // Handle general errors
    const message = error?.message || fallbackMessage;
    showAlert(title, message, () => {
      if (shouldRedirect) {
        router.replace(redirectPath);
      }
      onClose?.();
    });

    // Log error for debugging
    console.error('Error caught by handler:', error);
  }, [showAlert, router]);

  return handleError;
};
