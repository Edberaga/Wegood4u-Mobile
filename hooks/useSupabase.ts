import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Submission = Database['public']['Tables']['submissions']['Row'];
type Badge = Database['public']['Tables']['badges']['Row'];
type UserBadge = Database['public']['Tables']['user_badges']['Row'];

export function useProfile(userId?: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchProfile() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [userId]);

  return { profile, loading, error };
}

export function useSubmissions(userId?: string) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchSubmissions() {
      try {
        const { data, error } = await supabase
          .from('submissions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSubmissions(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSubmissions();
  }, [userId]);

  return { submissions, loading, error, refetch: () => fetchSubmissions() };
}

export function useUserBadges(userId?: string) {
  const [badges, setBadges] = useState<(UserBadge & { badge: Badge })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchUserBadges() {
      try {
        const { data, error } = await supabase
          .from('user_badges')
          .select(`
            *,
            badge:badges(*)
          `)
          .eq('user_id', userId)
          .order('earned_at', { ascending: false });

        if (error) throw error;
        setBadges(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUserBadges();
  }, [userId]);

  return { badges, loading, error };
}

export function useAllBadges() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBadges() {
      try {
        const { data, error } = await supabase
          .from('badges')
          .select('*')
          .eq('is_active', true)
          .order('category', { ascending: true })
          .order('required_count', { ascending: true });

        if (error) throw error;
        setBadges(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchBadges();
  }, []);

  return { badges, loading, error };
}

// Helper function to submit proof of visit
export async function submitProofOfVisit(
  userId: string,
  partnerStoreName: string,
  partnerStoreCategory: 'cafe' | 'restaurant' | 'others',
  selfieUrl: string,
  receiptUrl: string
) {
  const { data, error } = await supabase
    .from('submissions')
    .insert({
      user_id: userId,
      partner_store_name: partnerStoreName,
      partner_store_category: partnerStoreCategory,
      selfie_url: selfieUrl,
      receipt_url: receiptUrl,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Helper function to update profile
export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}