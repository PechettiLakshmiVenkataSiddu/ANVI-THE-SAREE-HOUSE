-- Fix customer registration trigger to handle both Google OAuth and manual signup
-- This ensures all users (Google OAuth and manual signup) are inserted into profiles table

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  first_name_val TEXT;
  last_name_val TEXT;
  full_name TEXT;
BEGIN
  -- Try to get first_name and last_name from metadata (manual signup)
  first_name_val := COALESCE(NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'given_name', '');
  last_name_val := COALESCE(NEW.raw_user_meta_data->>'last_name', NEW.raw_user_meta_data->>'family_name', '');
  
  -- If first_name and last_name are empty, try to parse from full_name (Google OAuth)
  IF first_name_val = '' AND last_name_val = '' THEN
    full_name := COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', '');
    
    -- Parse full_name into first_name and last_name
    IF full_name != '' THEN
      -- Split by space and take first word as first_name, rest as last_name
      first_name_val := split_part(full_name, ' ', 1);
      last_name_val := substring(full_name from position(' ' in full_name) + 1);
      
      -- If no space in name, put everything in first_name
      IF last_name_val = '' THEN
        first_name_val := full_name;
      END IF;
    END IF;
  END IF;
  
  -- Insert or update profile (upsert logic)
  INSERT INTO profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    first_name_val,
    last_name_val,
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
