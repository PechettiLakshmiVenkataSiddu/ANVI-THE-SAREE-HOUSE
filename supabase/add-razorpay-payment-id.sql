-- Add razorpay_payment_id column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;

-- Add cancelled_at column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

-- Create cancellations table
CREATE TABLE IF NOT EXISTS cancellations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  razorpay_payment_id TEXT NOT NULL,
  razorpay_refund_id TEXT,
  refund_amount DECIMAL(10,2),
  cancelled_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on cancellations table
ALTER TABLE cancellations ENABLE ROW LEVEL SECURITY;

-- Cancellations policies
CREATE POLICY "Users read own cancellations" ON cancellations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders WHERE orders.id = cancellations.order_id AND orders.user_id = auth.uid()
  )
);
CREATE POLICY "Admins manage cancellations" ON cancellations
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
