import { useAlert } from '../context/AlertContext';
import { useCallback } from 'react';

export function useCustomAlert() {
  const { showAlert } = useAlert();

  const customAlert = useCallback((title, message, onConfirm, onClose, confirmText, cancelText, showCancel) => {
    showAlert({ title, message, onConfirm, onClose, confirmText, cancelText, showCancel });
  }, [showAlert]);

  return customAlert;
}

export function useHandleUploadFileError() {
  const customAlert = useCustomAlert();

  const handleUploadFileError = useCallback((e) => {
    console.error(
      "Could not fetch or handle upload. Please notify user and contact developer if this keeps happening",
      e
    );
    customAlert(
      'Error',
      `There was a problem uploading this file or reading it for upload. Please try again and if this issue persists contact developers with this log:` +
      e
    );
  }, [customAlert]);

  return handleUploadFileError;
}