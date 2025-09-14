import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { AuthContextType } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🔧 AuthProvider: Initializing auth state');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔧 AuthProvider: Initial session:', session ? 'exists' : 'none');
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔧 AuthProvider: Auth state changed:', event);
        console.log('🔧 AuthProvider: New session:', session ? 'exists' : 'none');
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => {
      console.log('🔧 AuthProvider: Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('🔐 AuthContext: signIn called');
    console.log('📧 Email:', email);
    
    setIsLoading(true);
    
    try {
      console.log('📤 Calling supabase.auth.signInWithPassword...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('📥 Supabase response received');
      console.log('✅ Data exists:', !!data);
      console.log('❌ Error exists:', !!error);

      if (error) {
        console.error('🚨 Supabase auth error:', error);
        console.error('Error code:', error.message);
        throw error;
      }

      console.log('✅ Login successful');
      console.log('Session:', data.session ? 'exists' : 'missing');
      console.log('User:', data.user ? 'exists' : 'missing');
      
      // Note: We don't manually set session/user here because 
      // onAuthStateChange will handle it automatically
      
      console.log('✅ SignIn completed successfully');
      
    } catch (error: any) {
      console.error('🚨 SignIn error caught:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error.message);
      throw new Error(error.message || 'Login failed');
    } finally {
      console.log('🔄 Setting isLoading to false');
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string, dateOfBirth: string, gender: string, invitationCode?: string) => {
    console.log('📝 AuthContext: signUp called');
    setIsLoading(true);
    
    try {
      // First, check if invitation code exists (if provided)
      let inviterId: string | undefined;
      
      if (invitationCode) {
        console.log('🎫 Checking invitation code:', invitationCode);
        const { data: inviteData, error: inviteError } = await supabase
          .from('invitation_codes')
          .select('user_id')
          .eq('code', invitationCode)
          .eq('is_active', true)
          .single();

        if (inviteError) {
          console.error('🚨 Invalid invitation code:', inviteError);
          throw new Error('Invalid invitation code');
        }
        inviterId = inviteData.user_id;
        console.log('✅ Valid invitation code, inviter ID:', inviterId);
      }

      console.log('📤 Creating user account...');
      // Create user account with metadata for trigger
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: displayName,
            full_name: displayName,
            dob: dateOfBirth,
            gender: gender,
          },
        },
      });

      if (error) {
        console.error('🚨 SignUp error:', error);
        throw error;
      }

      if (!data.user) {
        console.error('🚨 No user returned from signUp');
        throw new Error('Failed to create user account');
      }

      console.log('✅ User created successfully:', data.user.id);

      // If invitation code was provided, update the profile with inviter_id after trigger creates it
      if (inviterId) {
        console.log('⏳ Waiting for profile creation trigger...');
        // Wait a moment for the trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('📝 Updating profile with inviter ID...');
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ inviter_id: inviterId })
          .eq('id', data.user.id);

        if (updateError) {
          console.error('⚠️ Error setting inviter:', updateError);
          // Don't throw error here - profile was created successfully
        } else {
          console.log('✅ Inviter ID set successfully');
        }
      }

    } catch (error: any) {
      console.error('🚨 SignUp error caught:', error);
      throw new Error(error.message);
    } finally {
      console.log('🔄 Setting isLoading to false (signUp)');
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    console.log('🚪 AuthContext: signOut called');
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('🚨 SignOut error:', error);
        throw error;
      }
      console.log('✅ SignOut successful');
    } catch (error: any) {
      console.error('🚨 SignOut error caught:', error);
      throw new Error(error.message);
    } finally {
      console.log('🔄 Setting isLoading to false (signOut)');
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
  };

  console.log('🔧 AuthProvider render - isAuthenticated:', !!user, 'isLoading:', isLoading);

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