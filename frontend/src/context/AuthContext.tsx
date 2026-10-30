import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Role } from '../types';

export interface UserSession {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: UserSession | null;
  role: Role;
  isAuthenticated: boolean;
  isSessionExpired: boolean;
  login: (username: string, password: string) => Promise<string | null>;
  logout: () => void;
  switchRole: (newRole: Role) => void;
  expireSession: () => void;
  recoverSession: () => void;
}

const defaultUser: UserSession = {
  id: 'usr-1',
  name: 'Admin',
  username: 'admin',
  email: 'admin@gmail.com',
  role: 'Admin'
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('foji_user_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultUser;
      }
    }
    return defaultUser;
  });

  const [isSessionExpired, setIsSessionExpired] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('foji_user_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('foji_user_session');
    }
  }, [user]);

  const login = async (username: string, password: string): Promise<string | null> => {
    try {
      const res = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return data.message || 'Invalid username or password.';
      }

      // Store the JWT so protected API calls can use it
      localStorage.setItem('foji_auth_token', data.token);

      const { id, name, email, username: uname, role } = data.user;
      const newUser: UserSession = { id, name, email, username: uname, role };
      setUser(newUser);
      setIsSessionExpired(false);
      return null; // null = success
    } catch {
      return 'Could not reach the server. Make sure the backend is running.';
    }
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (newRole: Role) => {
    if (!user) return;
    const namesByRole: Record<Role, string> = {
      'Admin': 'Admin',
      'Cashier': 'Muhammad Usman (Cashier)',
      'Inventory Staff': 'Zahid Khan (Inventory)'
    };
    const updated = {
      ...user,
      role: newRole,
      name: namesByRole[newRole]
    };
    setUser(updated);
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
        role: user ? user.role : 'Cashier',
        isAuthenticated: !!user && !isSessionExpired,
        isSessionExpired,
        login,
        logout,
        switchRole,
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
