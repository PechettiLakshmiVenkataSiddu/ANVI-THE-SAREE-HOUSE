-- Add collection_id column to products table
ALTER TABLE products 
ADD COLUMN collection_id UUID REFERENCES collections(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX idx_products_collection_id ON products(collection_id);

-- Add comment
COMMENT ON COLUMN products.collection_id IS 'Foreign key reference to the collection this product belongs to';
