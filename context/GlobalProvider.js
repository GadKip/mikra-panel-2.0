import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { Client } from 'react-native-appwrite';
import SessionStorage from 'react-native-session-storage';
import { config, getCurrentUser } from '../lib/appwrite';

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loggedIn, setLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const clientRef = useRef(null);
  const initialized = useRef(false);

    useEffect(() => {
      const newClient = new Client()
          .setEndpoint(config?.endpoint)
          .setProject(config?.projectId);
        clientRef.current = newClient;
      
    }, []);

  const fetchSession = async () => {
    if(!clientRef.current) return;
    try {
        setLoading(true);
        const session = localStorage.getItem('appwrite_session');
        if (session) {
            const parsedSession = JSON.parse(session);
            // Check if session is expired
            if (new Date(parsedSession.expire) > new Date()) {
                clientRef.current.setSession(parsedSession.$id);
                const currentUser = await getCurrentUser(clientRef.current);
                setUser(currentUser);
                setLoggedIn(!!currentUser);
            } else {
                // Session expired, clear it
                localStorage.removeItem('appwrite_session');
                setUser(null);
                setLoggedIn(false);
            }
        }
    } catch (error) {
        console.error("Error loading session from storage:", error);
        setUser(null);
        setLoggedIn(false);
    } finally {
        setLoading(false);
    }
  }
    useEffect(() => {
         if(clientRef.current && !initialized.current){
          fetchSession()
         initialized.current = true;
         }

     },[clientRef.current]);
    

    const contextValue = { user, setUser, loggedIn, setLoggedIn, loading, setLoading, client: clientRef.current };

    return (
        <GlobalContext.Provider value={contextValue}>
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => useContext(GlobalContext);