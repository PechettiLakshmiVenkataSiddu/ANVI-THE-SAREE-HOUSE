-- Run this if admin login fails despite role = 'admin' in profiles table
-- Fixes: own-profile read policy, is_admin() reliability

-- Recreate is_admin() with explicit search_path
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Users MUST be able to read their own profile (required for role check after login)
DROP POLICY IF EXISTS "Users read own profile" ON profiles;
CREATE POLICY "Users read own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Admins can read all profiles
DROP POLICY IF EXISTS "Admins read all profiles" ON profiles;
CREATE POLICY "Admins read all profiles" ON profiles
  FOR SELECT
  USING (public.is_admin());

-- Admins manage products (insert/update/delete)
DROP POLICY IF EXISTS "Admins manage products" ON products;
CREATE POLICY "Admins manage products" ON products
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins manage collections
DROP POLICY IF EXISTS "Admins manage collections" ON collections;
CREATE POLICY "Admins manage collections" ON collections
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins manage orders
DROP POLICY IF EXISTS "Admins manage orders" ON orders;
CREATE POLICY "Admins manage orders" ON orders
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Auto-update updated_at on products
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_updated_at ON products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS collections_updated_at ON collections;
CREATE TRIGGER collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
