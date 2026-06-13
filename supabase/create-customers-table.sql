-- Create customers table for admin dashboard
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  order_count INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins read all customers" ON customers FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins manage customers" ON customers FOR ALL USING (public.is_admin());

-- Create index on email
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);

-- Trigger to sync from profiles to customers
CREATE OR REPLACE FUNCTION sync_customer_from_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO customers (user_id, email, full_name, phone, joined_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.first_name || ' ' || NEW.last_name, ''),
    NEW.phone,
    NEW.created_at
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS sync_profile_to_customers ON profiles;
CREATE TRIGGER sync_profile_to_customers
  AFTER INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION sync_customer_from_profile();
