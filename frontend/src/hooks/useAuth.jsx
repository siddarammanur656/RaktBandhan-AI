import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for mock session on mount
    const storedUser = localStorage.getItem('rb_mock_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    // Mock API call delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Check mock DB
    const users = JSON.parse(localStorage.getItem('rb_mock_db_users') || '[]');
    const foundUser = users.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const authUser = {
        user_id: foundUser.user_id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role
      };
      setUser(authUser);
      localStorage.setItem('rb_mock_user', JSON.stringify(authUser));
      setIsLoading(false);
      return { success: true, user: authUser };
    } else {
      setIsLoading(false);
      return { success: false, error: 'Invalid email or password' };
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const users = JSON.parse(localStorage.getItem('rb_mock_db_users') || '[]');
    if (users.find(u => u.email === userData.email)) {
      setIsLoading(false);
      return { success: false, error: 'Email already registered' };
    }

    const newUser = {
      ...userData,
      user_id: `u_${Math.random().toString(36).substring(2, 9)}`,
    };
    
    users.push(newUser);
    localStorage.setItem('rb_mock_db_users', JSON.stringify(users));
    
    // Auto login
    const authUser = {
      user_id: newUser.user_id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    };
    setUser(authUser);
    localStorage.setItem('rb_mock_user', JSON.stringify(authUser));
    
    setIsLoading(false);
    return { success: true, user: authUser };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rb_mock_user');
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
