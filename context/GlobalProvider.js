import React, { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser } from "../lib/appwrite";

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getCurrentUser();
        if (res) {
          setLoggedIn(true);
          setUser(res);
        } else {
          setLoggedIn(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setLoggedIn(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        loading,
        loggedIn,
        setLoggedIn,
        user,
        setUser,
        setLoading,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
