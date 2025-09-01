/*
  # Fix recursive RLS policies on profiles

  Problem: Admin policies on `public.profiles` referenced `public.profiles` in a subquery,
  causing "infinite recursion detected in policy for relation \"profiles\"".

  Fix: Create a SECURITY DEFINER helper function `public.is_admin(uuid)` that checks the role
  without being subject to RLS, then rewrite admin policies to use this function.
*/

-- Create helper function to check admin role without triggering RLS
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin_user boolean;
BEGIN
  SELECT role = 'admin' INTO is_admin_user
  FROM public.profiles
  WHERE id = user_id;

  RETURN COALESCE(is_admin_user, false);
END;
$$;

-- Ensure ownership so the function can bypass RLS safely
ALTER FUNCTION public.is_admin(uuid) OWNER TO postgres;

-- Drop recursive admin policies on profiles
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Recreate admin policies using the helper function
CREATE POLICY "Admins can read all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));



