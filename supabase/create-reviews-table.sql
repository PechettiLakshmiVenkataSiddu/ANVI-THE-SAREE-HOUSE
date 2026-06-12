-- Create reviews table for product ratings
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

-- Enable Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view all reviews
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert reviews (with their user_id) or guests can insert (user_id is null)
CREATE POLICY "Anyone can insert reviews"
  ON reviews FOR INSERT
  WITH CHECK (true);

-- Policy: Authenticated users can update their own reviews
CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Authenticated users can delete their own reviews
CREATE POLICY "Users can delete their own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);
