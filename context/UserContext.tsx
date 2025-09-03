import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface UserData {
  // Auth data
  id: string;
  email: string;
  emailConfirmedAt: string | null;
  phone: string | null;
  phoneConfirmedAt: string | null;
  
  // Profile data
  username: string | null;
  fullName: string | null;
  role: 'subscriber' | 'member' | 'affiliate' | 'admin';
  avatarUrl: string | null;
  verificationCompleted: boolean;
  inviterId: string | null;
  affiliateRequestStatus: 'pending' | 'approved' | 'rejected' | null;
  createdAt: string;
}

interface UserContextType {
  userData: UserData | null;
  isLoading: boolean;
  error: string | null;
  refreshUserData: () => Promise<void>;
  resendEmailConfirmation: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current user from auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        throw authError;
      }

      if (!user) {
        setUserData(null);
        return;
      }

      // Fetch profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      // Combine auth and profile data
      const combinedUserData: UserData = {
        // Auth data
        id: user.id,
        email: user.email || '',
        emailConfirmedAt: user.email_confirmed_at || null,
        phone: user.phone || null,
        phoneConfirmedAt: user.phone_confirmed_at || null,
        
        // Profile data (with defaults if profile doesn't exist)
        username: profile?.username || null,
        fullName: profile?.full_name || null,
        role: profile?.role || 'subscriber',
        avatarUrl: profile?.avatar_url || null,
        verificationCompleted: profile?.verification_completed || false,
        inviterId: profile?.inviter_id || null,
        affiliateRequestStatus: profile?.affiliate_request_status || null,
        createdAt: profile?.created_at || user.created_at,
      };

      setUserData(combinedUserData);
    } catch (err: any) {
      console.error('Error fetching user data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserData = async () => {
    await fetchUserData();
  };

  const resendEmailConfirmation = async () => {
    try {
      if (!userData?.email) {
        throw new Error('No email address found');
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userData.email,
      });

      if (error) throw error;
      
      return Promise.resolve();
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  useEffect(() => {
    fetchUserData();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await fetchUserData();
        } else if (event === 'SIGNED_OUT') {
          setUserData(null);
          setIsLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value: UserContextType = {
    userData,
    isLoading,
    error,
    refreshUserData,
    resendEmailConfirmation,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}