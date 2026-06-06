import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import client from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for session on mount
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      // Optionally fetch /api/auth/me here to verify token
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await client.post('/api/auth/login', { email, password });
      if (response.data.success) {
        const authUser = response.data.data.user;
        const token = response.data.data.token;
        setUser(authUser);
        localStorage.setItem('user', JSON.stringify(authUser));
        localStorage.setItem('token', token);
        setIsLoading(false);
        return { success: true, user: authUser };
      }
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: error.response?.data?.error || 'Invalid email or password' };
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const response = await client.post('/api/auth/register', userData);
      if (response.data.success) {
        // According to API spec, register doesn't return a token, just success. 
        // We'll log them in directly afterwards, or they can log in.
        setIsLoading(false);
        // Let's just automatically log them in since we know their credentials
        return await login(userData.email, userData.password);
      }
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: error.response?.data?.error || 'Registration failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
