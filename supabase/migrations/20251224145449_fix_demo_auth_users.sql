-- Fix Demo Auth Users Setup
-- Created: 2025-12-24 14:54:49

-- ============================================================
-- CRITICAL: MANUAL USER CREATION REQUIRED
-- ============================================================
-- This migration CANNOT directly create users in auth.users due to security restrictions.
-- You MUST follow these exact steps in Supabase Dashboard:

-- ============================================================
-- STEP 1: CREATE USERS IN SUPABASE DASHBOARD
-- ============================================================
-- Navigate to: Authentication > Users > "Add user" button

-- CREATE USER 1: Super Admin
-- -------------------------
-- Email: admin@crm.com
-- Password: Admin@123456
-- ✅ TOGGLE ON: "Auto Confirm User" (MUST BE ENABLED!)
-- User Metadata (optional but recommended):
-- {
--   "full_name": "Admin User"
-- }

-- CREATE USER 2: Manager
-- ----------------------
-- Email: manager@crm.com  
-- Password: Manager@123456
-- ✅ TOGGLE ON: "Auto Confirm User" (MUST BE ENABLED!)
-- User Metadata (optional but recommended):
-- {
--   "full_name": "Manager User"
-- }

-- ============================================================
-- STEP 2: VERIFY TRIGGER CREATED USERS TABLE RECORDS
-- ============================================================
-- Run this query to check if users were automatically created:
-- SELECT email, full_name, is_active FROM users WHERE email IN ('admin@crm.com', 'manager@crm.com');

-- If no records appear, the trigger didn't fire. Manually insert:
DO $$
DECLARE
    admin_auth_id uuid;
    manager_auth_id uuid;
    default_role_id uuid;
BEGIN
    -- Get default user role
    SELECT id INTO default_role_id FROM user_roles WHERE role_name = 'user' LIMIT 1;
    
    -- Get auth IDs from auth.users (if users were created)
    SELECT id INTO admin_auth_id FROM auth.users WHERE email = 'admin@crm.com';
    SELECT id INTO manager_auth_id FROM auth.users WHERE email = 'manager@crm.com';
    
    -- Insert admin user if auth exists but public.users record missing
    IF admin_auth_id IS NOT NULL THEN
        INSERT INTO public.users (auth_id, email, full_name, role_id, is_active)
        VALUES (admin_auth_id, 'admin@crm.com', 'Admin User', default_role_id, true)
        ON CONFLICT (email) DO NOTHING;
    END IF;
    
    -- Insert manager user if auth exists but public.users record missing
    IF manager_auth_id IS NOT NULL THEN
        INSERT INTO public.users (auth_id, email, full_name, role_id, is_active)
        VALUES (manager_auth_id, 'manager@crm.com', 'Manager User', default_role_id, true)
        ON CONFLICT (email) DO NOTHING;
    END IF;
END $$;

-- ============================================================
-- STEP 3: ASSIGN PROPER ROLES TO DEMO USERS
-- ============================================================
-- Update users with correct roles after they're created
DO $$
BEGIN
    -- Assign super_admin role to admin@crm.com
    UPDATE public.users
    SET role_id = (SELECT id FROM user_roles WHERE role_name = 'super_admin' LIMIT 1)
    WHERE email = 'admin@crm.com' AND EXISTS (SELECT 1 FROM user_roles WHERE role_name = 'super_admin');
    
    -- Assign manager role to manager@crm.com
    UPDATE public.users
    SET role_id = (SELECT id FROM user_roles WHERE role_name = 'manager' LIMIT 1)
    WHERE email = 'manager@crm.com' AND EXISTS (SELECT 1 FROM user_roles WHERE role_name = 'manager');
END $$;

-- ============================================================
-- STEP 4: VERIFICATION QUERIES
-- ============================================================
-- Run these to confirm everything is set up correctly:

-- Check auth.users table (requires admin access)
-- SELECT email, email_confirmed_at, created_at FROM auth.users WHERE email IN ('admin@crm.com', 'manager@crm.com');

-- Check public.users table with roles
-- SELECT u.email, u.full_name, ur.role_name, u.is_active, u.created_at
-- FROM users u
-- LEFT JOIN user_roles ur ON u.role_id = ur.id
-- WHERE u.email IN ('admin@crm.com', 'manager@crm.com');

-- ============================================================
-- TROUBLESHOOTING
-- ============================================================
-- If login still fails after creating users:
-- 1. Verify "Auto Confirm User" was toggled ON when creating users
-- 2. Check if email_confirmed_at is set in auth.users table
-- 3. Verify users table has matching records with is_active = true
-- 4. Try resetting password in Supabase Dashboard
-- 5. Check Supabase logs for authentication errors