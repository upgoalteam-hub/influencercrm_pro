-- Create Demo Auth Users Migration
-- Created: 2025-12-24 14:28:24

-- ============================================================
-- IMPORTANT: Demo User Creation Instructions
-- ============================================================
-- This migration provides instructions for creating demo users in Supabase Auth.
-- These users must be created through Supabase Dashboard or Auth API, not via SQL.

-- ============================================================
-- DEMO USERS TO CREATE IN SUPABASE DASHBOARD
-- ============================================================
-- Navigate to Authentication > Users in Supabase Dashboard and create:

-- 1. Super Admin User
--    Email: admin@crm.com
--    Password: Admin@123456
--    Email Confirmed: Yes (toggle "Email confirmed" when creating)
--    User Metadata (raw_user_meta_data):
--    {
--      "full_name": "Admin User",
--      "role": "super_admin"
--    }

-- 2. Manager User
--    Email: manager@crm.com
--    Password: Manager@123456
--    Email Confirmed: Yes (toggle "Email confirmed" when creating)
--    User Metadata (raw_user_meta_data):
--    {
--      "full_name": "Manager User",
--      "role": "manager"
--    }

-- ============================================================
-- AFTER CREATING USERS IN DASHBOARD
-- ============================================================
-- The handle_new_user_signup() trigger will automatically create
-- corresponding records in public.users table with the metadata

-- To assign proper roles to demo users, run these updates:

-- Update Super Admin role
UPDATE public.users
SET role_id = (SELECT id FROM user_roles WHERE role_name = 'manager')
WHERE email = 'admin@crm.com';

-- Update Manager role
UPDATE public.users
SET role_id = (SELECT id FROM user_roles WHERE role_name = 'manager')
WHERE email = 'manager@crm.com';

-- ============================================================
-- VERIFICATION QUERY
-- ============================================================
-- Run this to verify users are created correctly:
-- SELECT u.email, u.full_name, ur.role_name, u.is_active
-- FROM users u
-- LEFT JOIN user_roles ur ON u.role_id = ur.id
-- WHERE u.email IN ('admin@crm.com', 'manager@crm.com');