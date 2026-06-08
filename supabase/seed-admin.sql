-- Promote an existing user to admin (run AFTER user signs up)
-- Replace 'your-admin@email.com' with the actual admin email

UPDATE profiles
SET role = 'admin'
WHERE email = 'your-admin@email.com';

-- Or create admin directly if you have the user UUID:
-- UPDATE profiles SET role = 'admin' WHERE id = 'USER_UUID_HERE';
