-- Add payment_status column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT;

-- Update existing orders to set payment_status based on payment_method
UPDATE orders SET payment_status = 
  CASE 
    WHEN payment_method = 'Razorpay' THEN 'paid'
    WHEN payment_method = 'Cash on Delivery' THEN 'pending'
    ELSE 'pending'
  END
WHERE payment_status IS NULL;
