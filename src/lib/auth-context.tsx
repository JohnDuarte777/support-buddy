import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from './types';
import { getCurrentUser, setCurrentUser, getUsers } from './store';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAdmin: boolean;
  isTechnician: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => false,
  logout: () => {},
  isAdmin: false,
  isTechnician: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getCurrentUser);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  const login = (email: string, _password: string) => {
    const users = getUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setUser(found);
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAdmin: user?.role === 'admin',
      isTechnician: user?.role === 'technician' || user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
