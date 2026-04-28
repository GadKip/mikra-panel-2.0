import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { getCurrentUser } from '../lib/firebase';
import { auth } from '../firebaseConfig';

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loggedIn, setLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const initialized = useRef(false);

  const fetchSession = async () => {
    try {
        setLoading(true);
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setLoggedIn(!!currentUser);
    } catch (error) {
        console.error("Error loading session from storage:", error);
        setUser(null);
        setLoggedIn(false);
    } finally {
        setLoading(false);
    }
  }

    useEffect(() => {
        if (!initialized.current) {
            fetchSession();
            initialized.current = true;
        }
    }, []);

    // Listen for Firebase auth state changes
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
            if (firebaseUser) {
                const currentUser = await getCurrentUser();
                setUser(currentUser);
                setLoggedIn(true);
            } else {
                setUser(null);
                setLoggedIn(false);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // For backward compatibility, client is null with Firebase
    const contextValue = { user, setUser, loggedIn, setLoggedIn, loading, setLoading, client: null };

    return (
        <GlobalContext.Provider value={contextValue}>
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => useContext(GlobalContext);