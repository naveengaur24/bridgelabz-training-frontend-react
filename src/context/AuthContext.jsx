import React, { createContext, useState, useEffect, useContext } from 'react';
import { ApiService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    const saved = localStorage.getItem('fundoo_token');
    return (saved && saved !== 'null' && saved !== 'undefined') ? saved : null;
  });
  //retrieve user information
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('fundoo_user');
    try {
      return (saved && saved !== 'null' && saved !== 'undefined') ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  // for showing loading..
  const [loading, setLoading] = useState(false);

  // Listen for global auth-expired redirect triggers(jwt token expire hone p auto logout )
  useEffect(() => {
    const handleAuthExpired = () => {
      logout();
    };
    window.addEventListener('auth-expired', handleAuthExpired);
    return () => {
      window.removeEventListener('auth-expired', handleAuthExpired);
    };
  }, []);

  const login = async (email, password) => {
    const response = await ApiService.login(email, password);
    if (response.success && response.data) {
      setToken(response.data.token);
      setUser({
        userId: response.data.userId,
        email: response.data.email,
        name: response.data.name
      });
      return response;
    }
    throw new Error(response.message || 'Login failed');
  };

  const register = async (name, email, password) => {
    const response = await ApiService.register(name, email, password);
    if (response.success) {
      return response;
    }
    throw new Error(response.message || 'Registration failed');
  };

  const logout = () => {
    try {
      ApiService.logout();
    } catch (e) {
      console.warn("ApiService.logout error:", e);
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('fundoo_token');
    localStorage.removeItem('fundoo_user');
  };

  const deleteAccount = async () => {
    const response = await ApiService.deleteAccount();
    if (response.success) {
      logout();
      return response;
    }
    throw new Error(response.message || 'Account deletion failed');
  };

  const forgotPassword = async (email) => {
    return ApiService.forgotPassword(email);
  };

  const verifyOtp = async (email, otp) => {
    return ApiService.verifyOtp(email, otp);
  };

  const resetPassword = async (email, otp, newPassword) => {
    return ApiService.resetPassword(email, otp, newPassword);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    deleteAccount,
    forgotPassword,
    verifyOtp,
    resetPassword,
    isLoggedIn: !!token
  };

//Sab child components ko authentication data provide karega.
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
//custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
};
