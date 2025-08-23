import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, invitationCode?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setIsLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, invitationCode?: string) => {
    setIsLoading(true);
    try {
      // First, check if invitation code exists (if provided)
      let inviterId: string | undefined;
      
      if (invitationCode) {
        const { data: inviteData, error: inviteError } = await supabase
          .from('invitation_codes')
          .select('user_id')
          .eq('code', invitationCode)
          .eq('is_active', true)
          .single();

        if (inviteError) {
          throw new Error('Invalid invitation code');
        }
        inviterId = inviteData.user_id;
      }

      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // If we have an inviter, update the profile with inviter_id
      if (data.user && inviterId) {
        await supabase
          .from('profiles')
          .update({ inviter_id: inviterId })
          .eq('id', data.user.id);
      }

    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  // Legacy compatibility - map new auth to old interface
  const login = async (username: string, password: string) => {
    // Assume username is email for now
    await signIn(username, password);
  };

  const register = async (email: string, password: string, displayName: string, invitationCode?: string) => {
    await signUp(email, password, invitationCode);
    
    // Update profile with display name after signup
    if (user) {
      await updateProfile({ full_name: displayName });
    }
  };

  const logout = async () => {
    await signOut();
  };

  // Create a legacy user object for backward compatibility
  const legacyUser = user && profile ? {
    id: parseInt(user.id.replace(/-/g, '').substring(0, 8), 16), // Convert UUID to number
    email: user.email || '',
    displayName: profile.full_name || profile.username || 'User',
  } : null;

  const value: AuthContextType = {
    user,
    profile,
    session,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  // For backward compatibility, also provide legacy methods
  const legacyValue = {
    ...value,
    user: legacyUser,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={legacyValue as any}>
      {children}
    </AuthContext.Provider>
  );
}
        
        setUser(defaultUser);
        console.log('User set with default data:', defaultUser);
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
        throw new Error('CORS or network issue. Please contact support if this persists.');
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

      // Check if API key is available
      if (!JWT_API_KEY) {
        throw new Error('API key not configured. Please contact support.');
      }

      const registerData: any = {
        username: displayName,
        email: email,
        password: password,
        apikey: JWT_API_KEY,
      };

      if (invitationCode) {
        registerData.invitation_code = invitationCode;
      }

      console.log('Registration URL:', `${WORDPRESS_BASE_URL}/wp-json/api/v1/mo-jwt-register`);
      console.log('Registration data (without apikey):', { ...registerData, apikey: '[HIDDEN]' });

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
        await login(displayName, password);
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