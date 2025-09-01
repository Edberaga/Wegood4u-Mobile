/*
  # Create Profile Insertion Function
  
  This migration creates a SQL function to directly insert user profiles
  using the exact same pattern that works in SQL Editor.
  
  1. New Functions
    - `insert_user_profile` - Direct SQL insertion function
  
  2. Security
    - Function runs with SECURITY DEFINER to bypass RLS
    - Only authenticated users can call it
*/

-- Create function to insert user profile directly
CREATE OR REPLACE FUNCTION public.insert_user_profile(
  user_id uuid,
  user_name text,
  user_role text DEFAULT 'subscriber',
  inviter_user_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Direct INSERT query (same as your working SQL Editor test)
  INSERT INTO public.profiles (id, username, role, inviter_id, full_name)
  VALUES (user_id, user_name, user_role::user_role, inviter_user_id, user_name);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.insert_user_profile TO authenticated;