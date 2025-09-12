import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';
import type { UserData, UserContextType } from '@/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realtimeChannel, setRealtimeChannel] = useState<any>(null);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current user from auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('user: ', user);
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

  // Set up real-time subscription for profile changes
  const setupRealtimeSubscription = (userId: string) => {
    // Clean up existing subscription
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
    }

    // Create new subscription for profile changes
    const channel = supabase
      .channel(`profile-changes-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`,
        },
        (payload: any) => {
          console.log('Profile updated in real-time:', payload);
          // Refresh user data when profile changes
          fetchUserData();
        }
      )
      .subscribe();

    setRealtimeChannel(channel);
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

  // Set up real-time subscription for profile changes
  useEffect(() => {
    if (userData?.id) {
      setupRealtimeSubscription(userData.id);
    }

    // Cleanup on unmount or user change
    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [userData?.id]);

  // Set up real-time subscription for auth changes (email confirmation)
  useEffect(() => {
    if (!userData?.id) return;

    // Listen for auth changes that might affect email confirmation
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED' || event === 'SIGNED_IN') {
          console.log('Auth state changed:', event);
          // Refresh user data when auth state changes
          await fetchUserData();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

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