import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: number;
  email: string;
  displayName: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string, invitationCode?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Replace with your WordPress site URL
const WORDPRESS_BASE_URL = "https://wegood4u.com";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to fetch user profile after successful authentication
  const fetchUserProfile = async (token: string): Promise<User | null> => {
    try {
      console.log('Fetching user profile with token...');
      
      const response = await fetch(`${WORDPRESS_BASE_URL}/wp-json/wp/v2/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('User profile response status:', response.status);

      if (response.ok) {
        const wpUser = await response.json();
        console.log('User profile fetched successfully:', wpUser.name);
        return {
          id: wpUser.id,
          email: wpUser.email,
          displayName: wpUser.name,
        };
      } else {
        console.log('Failed to fetch user profile, status:', response.status);
        const errorText = await response.text();
        console.log('Error response:', errorText);
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      return null;
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync('jwt_token');
      if (token) {
        console.log('Found stored token, checking validity...');
        // Attempt to fetch user profile using the stored token
        const fetchedUser = await fetchUserProfile(token);
        if (fetchedUser) {
          setUser(fetchedUser);
        } else {
          // Token might be invalid or expired, clear it
          console.log('Token invalid, clearing stored token');
          await SecureStore.deleteItemAsync('jwt_token');
          setUser(null);
        }
      } else {
        console.log('No stored token found');
      }
    } catch (error) {
      console.error('Auto-login failed:', error);
      await SecureStore.deleteItemAsync('jwt_token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('Attempting login for username:', username);
      console.log('Login URL:', `${WORDPRESS_BASE_URL}/wp-json/api/v1/mo-jwt`);

      // Add timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${WORDPRESS_BASE_URL}/wp-json/api/v1/mo-jwt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('Login response status:', response.status);
      console.log('Login response headers:', response.headers);

      const data = await response.json();
      console.log('Login response data:', data);

      if (response.ok && data.jwt_token) {
        const jwtToken = data.jwt_token;
        console.log('Login successful, token received');

        // Store token securely
        await SecureStore.setItemAsync('jwt_token', jwtToken);

        // Fetch user profile using the new token
        const fetchedUser = await fetchUserProfile(jwtToken);
        if (fetchedUser) {
          setUser(fetchedUser);
          console.log('User profile set successfully');
        } else {
          // If user data couldn't be fetched, consider login failed
          throw new Error('Login successful, but failed to retrieve user profile.');
        }
      } else {
        // Handle specific error messages from the plugin if available
        const errorMessage = data?.error_description || data?.message || 'Login failed. Please check your credentials.';
        console.log('Login failed with message:', errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Login error details:', error);
      
      // Handle different types of errors
      if (error.name === 'AbortError') {
        throw new Error('Login request timed out. Please check your internet connection.');
      } else if (error.message === 'Network request failed') {
        throw new Error('Unable to connect to server. Please check your internet connection and try again.');
      } else {
        const errorMessage = error.message || 'Login failed. Please check your credentials.';
        throw new Error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, displayName: string, invitationCode?: string) => {
    try {
      setIsLoading(true);
      console.log('Attempting registration for email:', email);

      const registerData: any = {
        username: email,
        email: email,
        password: password,
        name: displayName,
      };

      if (invitationCode) {
        registerData.invitation_code = invitationCode;
      }

      console.log('Registration URL:', `${WORDPRESS_BASE_URL}/wp-json/api/v1/mo-jwt-register`);

      // Add timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${WORDPRESS_BASE_URL}/wp-json/api/v1/mo-jwt-register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(registerData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('Registration response status:', response.status);

      const data = await response.json();
      console.log('Registration response data:', data);

      if (response.ok && data.jwt_token) {
        console.log('Registration successful, attempting auto-login');
        // Auto-login after successful registration
        await login(email, password);
      } else {
        // Handle specific error messages from the plugin if available
        const errorMessage = data?.error_description || data?.message || 'Registration failed.';
        console.log('Registration failed with message:', errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Registration error details:', error);
      
      // Handle different types of errors
      if (error.name === 'AbortError') {
        throw new Error('Registration request timed out. Please check your internet connection.');
      } else if (error.message === 'Network request failed') {
        throw new Error('Unable to connect to server. Please check your internet connection and try again.');
      } else {
        const errorMessage = error.message || 'Registration failed. Please try again.';
        throw new Error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out user');
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