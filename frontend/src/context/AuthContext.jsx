import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If we have a user in localStorage, we consider them logged in
    // Real app might verify token with API on load
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      return res.data;
    } catch (err) {
      console.warn("Backend failed, using mock auth");
      // Fallback to Mock Auth
      const mockUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
      const foundUser = mockUsers.find(u => u.email === email && u.password === password);
      
      if (!foundUser) {
        throw { response: { data: { message: 'Invalid credentials. User not found in mock DB.' } } };
      }
      
      const mockAuthData = { ...foundUser, token: 'mock-token-123' };
      setUser(mockAuthData);
      localStorage.setItem('user', JSON.stringify(mockAuthData));
      return mockAuthData;
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      return res.data;
    } catch (err) {
      console.warn("Backend failed, using mock auth");
      // Fallback to Mock Auth
      const mockUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
      
      if (mockUsers.some(u => u.email === email)) {
        throw { response: { data: { message: 'Email already exists in mock DB.' } } };
      }

      // If email has @admin.com, set role to admin
      const role = email.includes('@admin.com') ? 'admin' : 'user';
      const newUser = { _id: Date.now().toString(), name, email, password, role };
      
      mockUsers.push(newUser);
      localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
      
      const mockAuthData = { ...newUser, token: 'mock-token-123' };
      setUser(mockAuthData);
      localStorage.setItem('user', JSON.stringify(mockAuthData));
      return mockAuthData;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
