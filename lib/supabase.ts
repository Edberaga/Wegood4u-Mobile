import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.error('EXPO_PUBLIC_SUPABASE_URL:', supabaseUrl);
  console.error('EXPO_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present' : 'Missing');
  throw new Error('Missing Supabase environment variables. Please add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env file');
}

// Custom storage adapter for React Native
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types (you can generate these later with Supabase CLI)
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          inviter_id: string | null;
          full_name: string | null;
          dob: string | null;
          country_of_residence: string | null;
          preferred_communication_channel: 'WhatsApp' | 'Telegram' | 'Line' | 'WeChat' | null;
          communication_contact_details: string | null;
          travel_destination_category: string | null;
          travel_destination_detail: string | null;
          travel_preference: string | null;
          accommodation_preference: string | null;
          travel_budget: string | null;
          role: 'subscriber' | 'member' | 'affiliate' | 'admin';
          verification_completed: boolean;
          affiliate_request_status: 'pending' | 'approved' | 'rejected' | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          inviter_id?: string | null;
          full_name?: string | null;
          dob?: string | null;
          country_of_residence?: string | null;
          preferred_communication_channel?: 'WhatsApp' | 'Telegram' | 'Line' | 'WeChat' | null;
          communication_contact_details?: string | null;
          travel_destination_category?: string | null;
          travel_destination_detail?: string | null;
          travel_preference?: string | null;
          accommodation_preference?: string | null;
          travel_budget?: string | null;
          role?: 'subscriber' | 'member' | 'affiliate' | 'admin';
          verification_completed?: boolean;
          affiliate_request_status?: 'pending' | 'approved' | 'rejected' | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          inviter_id?: string | null;
          full_name?: string | null;
          dob?: string | null;
          country_of_residence?: string | null;
          preferred_communication_channel?: 'WhatsApp' | 'Telegram' | 'Line' | 'WeChat' | null;
          communication_contact_details?: string | null;
          travel_destination_category?: string | null;
          travel_destination_detail?: string | null;
          travel_preference?: string | null;
          accommodation_preference?: string | null;
          travel_budget?: string | null;
          role?: 'subscriber' | 'member' | 'affiliate' | 'admin';
          verification_completed?: boolean;
          affiliate_request_status?: 'pending' | 'approved' | 'rejected' | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      submissions: {
        Row: {
          id: number;
          user_id: string;
          partner_store_name: string;
          partner_store_category: 'cafe' | 'restaurant' | 'others';
          status: 'pending' | 'approved' | 'rejected';
          selfie_url: string;
          receipt_url: string;
          admin_notes: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          partner_store_name: string;
          partner_store_category: 'cafe' | 'restaurant' | 'others';
          status?: 'pending' | 'approved' | 'rejected';
          selfie_url: string;
          receipt_url: string;
          admin_notes?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
        };
        Update: {
          user_id?: string;
          partner_store_name?: string;
          partner_store_category?: 'cafe' | 'restaurant' | 'others';
          status?: 'pending' | 'approved' | 'rejected';
          selfie_url?: string;
          receipt_url?: string;
          admin_notes?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
        };
      };
      badges: {
        Row: {
          id: number;
          name: string;
          category: 'activity' | 'cafe' | 'restaurant';
          required_count: number;
          image_url: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
        };
      };
      user_badges: {
        Row: {
          user_id: string;
          badge_id: number;
          earned_at: string;
        };
        Insert: {
          user_id: string;
          badge_id: number;
          earned_at?: string;
        };
      };
      invitation_codes: {
        Row: {
          user_id: string;
          code: string;
          usage_count: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          code: string;
          usage_count?: number;
          is_active?: boolean;
        };
        Update: {
          code?: string;
          usage_count?: number;
          is_active?: boolean;
        };
      };
    };
    Views: {
      user_stats: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          role: 'subscriber' | 'member' | 'affiliate' | 'admin';
          total_submissions: number;
          approved_submissions: number;
          pending_submissions: number;
          badge_count: number;
          direct_referrals: number;
          created_at: string;
        };
      };
      referral_tree: {
        Row: {
          affiliate_id: string;
          user_id: string;
          username: string | null;
          full_name: string | null;
          level: number;
          created_at: string;
        };
      };
    };
  };
};