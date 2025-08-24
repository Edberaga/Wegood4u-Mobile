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
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string, invitationCode?: string) => Promise<void>;
  logout: () => Promise<void>;
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
        options: {
          emailRedirectTo: 'wegood4u://auth/callback',
        },
      });

      if (error) throw error;

      // Check if user needs to verify email
      if (data.user && !data.user.email_confirmed_at) {
        throw new Error('Please check your email and click the verification link to complete registration.');
      }
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

  const register = async (email: string, password: string, username: string, invitationCode?: string) => {
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

    // Sign up the user with username in user_metadata
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'wegood4u://auth/callback',
        data: {
          username: username,
          full_name: username,
        }
      },
    });

    if (error) throw error;

    // Check if user needs to verify email
    if (data.user && !data.user.email_confirmed_at) {
      throw new Error('Please check your email and click the verification link to complete registration.');
    }

    // If we have an inviter, update the profile with inviter_id and username
    if (data.user) {
      const updates: any = { 
        username: username,
        full_name: username 
      };
      
      if (inviterId) {
        updates.inviter_id = inviterId;
      }
      
      await supabase
        .from('profiles')
        .update(updates)
        .eq('id', data.user.id);
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