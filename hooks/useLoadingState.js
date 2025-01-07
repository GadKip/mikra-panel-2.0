import { useState, useCallback } from 'react';
import { useGlobalContext } from '../context/GlobalProvider';

export const useLoadingState = (initialState = false) => {
  const [localLoading, setLocalLoading] = useState(initialState);
  const { setLoading: setGlobalLoading } = useGlobalContext();

  const startLoading = useCallback((isGlobal = false) => {
    setLocalLoading(true);
    if (isGlobal) setGlobalLoading(true);
  }, [setGlobalLoading]);

  const stopLoading = useCallback((isGlobal = false) => {
    setLocalLoading(false);
    if (isGlobal) setGlobalLoading(false);
  }, [setGlobalLoading]);

  const withLoading = useCallback(async (fn, isGlobal = false) => {
    try {
      startLoading(isGlobal);
      await fn();
    } finally {
      stopLoading(isGlobal);
    }
  }, [startLoading, stopLoading]);

  return {
    isLoading: localLoading,
    startLoading,
    stopLoading,
    withLoading
  };
};