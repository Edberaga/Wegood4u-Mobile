-- Drop all existing problematic policies
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all submissions" ON public.submissions;
DROP POLICY IF EXISTS "Admins can update submissions" ON public.submissions;
DROP POLICY IF EXISTS "Admins can manage all invitation codes" ON public.invitation_codes;
DROP POLICY IF EXISTS "Members can create submissions" ON public.submissions;
DROP POLICY IF EXISTS "Affiliates can read own invitation code" ON public.invitation_codes;

-- Create a SECURITY DEFINER helper function to check admin role without triggering RLS
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

-- Fix other recursive policies
CREATE POLICY "Admins can read all submissions"
  ON public.submissions
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update submissions"
  ON public.submissions
  FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage all invitation codes"
  ON public.invitation_codes
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Fix the submissions creation policy
CREATE POLICY "Members can create submissions"
  ON public.submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('member', 'affiliate', 'admin')
  );

-- Fix the invitation code reading policy
CREATE POLICY "Affiliates can read own invitation code"
  ON public.invitation_codes
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() AND 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('affiliate', 'admin')
  );