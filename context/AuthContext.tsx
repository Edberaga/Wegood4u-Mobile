import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

interface User {
  id: number;
  email: string;
  displayName: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string, invitationCode?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Replace with your WordPress site URL
const WORDPRESS_BASE_URL = 'https://your-wordpress-site.com';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync('jwt_token');
      if (token) {
        // Validate token with WordPress
        const response = await axios.get(`${WORDPRESS_BASE_URL}/wp-json/simple-jwt-login/v1/auth/validate`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setUser(response.data.data.user);
        } else {
          await SecureStore.deleteItemAsync('jwt_token');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await SecureStore.deleteItemAsync('jwt_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const response = await axios.post(`${WORDPRESS_BASE_URL}/wp-json/simple-jwt-login/v1/auth`, {
        email,
        password,
      });

      if (response.data.success) {
        const { jwt, user: userData } = response.data.data;
        
        // Store token securely
        await SecureStore.setItemAsync('jwt_token', jwt);
        
        setUser(userData);
      } else {
        throw new Error(response.data.data?.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, displayName: string, invitationCode?: string) => {
    try {
      setIsLoading(true);
      
      const registerData: any = {
        email,
        password,
        user_login: email, // Use email as username
        user_nicename: displayName,
        display_name: displayName,
      };

      // Add invitation code if provided
      if (invitationCode) {
        registerData.invitation_code = invitationCode;
      }

      const response = await axios.post(`${WORDPRESS_BASE_URL}/wp-json/simple-jwt-login/v1/users`, registerData);

      if (response.data.success) {
        // Auto-login after successful registration
        await login(email, password);
      } else {
        throw new Error(response.data.data?.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.response?.data?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('jwt_token');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}