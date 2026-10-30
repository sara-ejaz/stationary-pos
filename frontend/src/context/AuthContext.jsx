import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('foji_user_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isSessionExpired, setIsSessionExpired] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('foji_user_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('foji_user_session');
    }
  }, [user]);

  /**
   * Call this with the authenticated user object returned from your backend.
   * Expected shape: { id, name, username, email, role }
   * Role must be one of: 'Admin' | 'Cashier' | 'Inventory Staff'
   */
  const login = (authenticatedUser) => {
    if (!authenticatedUser || !authenticatedUser.role) return false;
    setUser(authenticatedUser);
    setIsSessionExpired(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('foji_auth_token');
    localStorage.removeItem('foji_user_session');
  };

  const expireSession = () => {
    setIsSessionExpired(true);
  };

  const recoverSession = () => {
    setIsSessionExpired(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        isAuthenticated: !!user && !isSessionExpired,
        isSessionExpired,
        login,
        logout,
        expireSession,
        recoverSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
