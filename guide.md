# Supabase Setup Guide for Upgoal Media CRM

This guide provides step-by-step instructions to set up Supabase for the Upgoal Media CRM application and resolve any database-related issues.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Creating a Supabase Project](#creating-a-supabase-project)
3. [Setting Up Database Tables](#setting-up-database-tables)
4. [Configuring Environment Variables](#configuring-environment-variables)
5. [Setting Up Authentication](#setting-up-authentication)
6. [Configuring Row Level Security (RLS)](#configuring-row-level-security)
7. [Testing the Connection](#testing-the-connection)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Supabase account (free tier available at https://supabase.com)
- The Upgoal Media CRM application set up in Replit
- Access to Supabase dashboard

---

## Creating a Supabase Project

### Step 1: Create a New Project

1. Go to [supabase.com](https://supabase.com) and sign in with your account
2. Click **"New Project"** in the dashboard
3. Enter project details:
   - **Project Name**: `upgoal-media-crm` (or your preferred name)
   - **Database Password**: Create a strong password (save this somewhere safe)
   - **Region**: Choose a region closest to your users
4. Click **"Create new project"** and wait for initialization (5-10 minutes)

### Step 2: Retrieve Credentials

Once the project is created:

1. Go to **Settings** → **API** in the left sidebar
2. Copy these values:
   - **Project URL** (supabase_url)
   - **anon public** key (supabase_key)
   - **service_role** secret key (keep this secret!)

---

## Setting Up Database Tables

### Step 1: Create User Roles Table

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Paste the following SQL:

```sql
-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT INTO user_roles (role_name, display_name, permissions) VALUES
  ('super_admin', 'Super Admin', '{"all": true}'),
  ('admin', 'Admin', '{"manage_users": true, "manage_settings": true}'),
  ('manager', 'Manager', '{"manage_campaigns": true, "manage_creators": true}'),
  ('user', 'User', '{"view_data": true}'),
  ('viewer', 'Viewer', '{"view_data": true}')
ON CONFLICT (role_name) DO NOTHING;
```

4. Click **"Run"** and wait for completion

### Step 2: Create Users Table

In the same SQL Editor, create a new query:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  role_id UUID REFERENCES user_roles(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_auth_id ON users(auth_id);
```

### Step 3: Create System Settings Table

```sql
-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(255) UNIQUE NOT NULL,
  setting_value JSONB,
  setting_category VARCHAR(100),
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO system_settings (setting_key, setting_value, setting_category, description, is_public) VALUES
  ('app_name', '"Upgoal Media CRM"', 'general', 'Application name', true),
  ('max_upload_size', '10485760', 'general', 'Maximum file upload size in bytes', false),
  ('session_timeout', '3600', 'security', 'Session timeout in seconds', false),
  ('enable_notifications', 'true', 'notification', 'Enable email notifications', true),
  ('payment_gateway', '"stripe"', 'payment', 'Payment gateway provider', false),
  ('smtp_host', '"smtp.gmail.com"', 'email', 'SMTP host for email', false)
ON CONFLICT (setting_key) DO NOTHING;

-- Add index
CREATE INDEX idx_system_settings_key ON system_settings(setting_key);
```

### Step 4: Create Audit Logs Table

```sql
-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(255),
  description TEXT,
  changes JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
```

### Step 5: Create Additional Tables (Optional but Recommended)

```sql
-- Create creators table
CREATE TABLE IF NOT EXISTS creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  instagram_handle VARCHAR(255),
  bio TEXT,
  followers_count INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  budget DECIMAL(12,2),
  start_date DATE,
  end_date DATE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES creators(id),
  campaign_id UUID REFERENCES campaigns(id),
  amount DECIMAL(12,2),
  status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Configuring Environment Variables

### Step 1: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy:
   - **Project URL** (the long URL starting with https://)
   - **anon public** key

### Step 2: Update Replit Environment Variables

In Replit:

1. Go to the **Secrets** tab (lock icon)
2. Add these environment variables:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Note**: Replace the values with your actual Supabase credentials.

### Step 3: Verify Environment Variables

The app should automatically load these in `src/lib/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

---

## Setting Up Authentication

### Step 1: Enable Email Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Click **Email**
3. Enable the toggle for **Email Provider**
4. Configure settings:
   - **Enable Confirm email**: Turn ON (recommended)
   - **Auto confirm users**: Turn OFF (for security)
5. Click **Save**

### Step 2: Configure JWT Settings (Optional)

1. Go to **Authentication** → **Settings**
2. Scroll to **JWT Settings**
3. Configure:
   - **Expiration time**: 3600 (seconds, or 1 hour)
   - **Refresh token expiration**: 604800 (7 days)

### Step 3: Configure Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Add redirect URLs:
   - For local development: `http://localhost:5000/`
   - For production: Your deployed URL

---

## Configuring Row Level Security (RLS)

### Step 1: Enable RLS on All Tables

For each table (users, system_settings, audit_logs, creators, campaigns, payments):

1. Go to **Tables** in the Supabase dashboard
2. Select the table
3. Click **RLS** button at the top right
4. Enable RLS
5. Click **Create policy**

### Step 2: Create Policies

**For Users Table:**

```sql
-- Users can view their own record
CREATE POLICY "Users can view own record"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = auth_id);

-- Admins can view all users
CREATE POLICY "Admins can view all users"
ON users FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE auth_id = auth.uid()
    AND role_id IN (
      SELECT id FROM user_roles WHERE role_name IN ('super_admin', 'admin')
    )
  )
);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = auth_id);

-- Admins can update any user
CREATE POLICY "Admins can update users"
ON users FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE auth_id = auth.uid()
    AND role_id IN (
      SELECT id FROM user_roles WHERE role_name IN ('super_admin', 'admin')
    )
  )
);
```

**For System Settings Table:**

```sql
-- Public settings readable by all
CREATE POLICY "Public settings readable by all"
ON system_settings FOR SELECT
USING (is_public = true);

-- Authenticated users can view all settings
CREATE POLICY "Authenticated users can view settings"
ON system_settings FOR SELECT
TO authenticated
USING (true);

-- Only admins can modify settings
CREATE POLICY "Only admins can modify settings"
ON system_settings FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE auth_id = auth.uid()
    AND role_id IN (
      SELECT id FROM user_roles WHERE role_name IN ('super_admin', 'admin')
    )
  )
);
```

**For Audit Logs Table:**

```sql
-- Users can view audit logs (for compliance)
CREATE POLICY "Authenticated users can view audit logs"
ON audit_logs FOR SELECT
TO authenticated
USING (true);

-- Admins can insert audit logs
CREATE POLICY "Authenticated users can insert audit logs"
ON audit_logs FOR INSERT
TO authenticated
WITH CHECK (true);
```

---

## Testing the Connection

### Step 1: Test from Supabase Dashboard

1. Go to **SQL Editor**
2. Run this query:

```sql
SELECT * FROM users;
SELECT * FROM system_settings;
SELECT * FROM audit_logs;
```

You should see the sample data you inserted.

### Step 2: Test from the App

1. Start the development server: `npm run dev`
2. Navigate to **System Settings & User Management** page
3. Check each tab:
   - **System Settings**: Should show all 6 settings
   - **User Management**: Should show 2 users (John Admin, Jane Manager)
   - **Audit Logs**: Should show 3 log entries

### Step 3: Test Add Operations

1. Go to **System Settings** tab
2. Click **"Add Setting"** button
3. Fill in the form:
   - Setting Key: `test_key`
   - Category: `general`
   - Value: `test_value`
   - Check "Public setting"
4. Click **"Create Setting"**
5. Verify the new setting appears in the list

---

## Troubleshooting

### Issue 1: "Connection Failed" Error

**Solution:**
- Verify environment variables are set correctly in Replit Secrets
- Check that Supabase project is active (not paused)
- Ensure credentials are copied exactly without extra spaces

### Issue 2: RLS Policy Blocking Requests

**Error**: `row level security violated`

**Solution:**
- Disable RLS for development: In Supabase, go to each table and turn OFF RLS
- Or create more permissive policies (see example policies above)
- For production, use stricter RLS policies

### Issue 3: Empty Tables in User Management

**Solution:**
- Verify tables were created successfully in **SQL Editor**
- Check that sample data was inserted without errors
- Clear browser cache and refresh the page

### Issue 4: "Add User" or "Add Setting" Button Not Working

**Solution:**
1. Open browser Developer Tools (F12)
2. Check the **Console** tab for error messages
3. Common causes:
   - Missing environment variables
   - RLS policies blocking INSERT operations
   - Database connection failed

### Issue 5: Authentication Not Working

**Solution:**
- Enable Email authentication in Supabase (see Step 1 under "Setting Up Authentication")
- Verify redirect URLs are configured correctly
- Check that auth.users table exists in Supabase

---

## Best Practices

1. **Always Use Environment Variables**: Never commit Supabase keys to git
2. **Enable RLS in Production**: Row Level Security protects user data
3. **Regular Backups**: Supabase offers automatic daily backups
4. **Monitor Usage**: Check the Usage page in Supabase dashboard
5. **Use Indexes**: Indexes improve query performance (already created in SQL above)
6. **Soft Deletes**: Consider using `deleted_at` instead of actual deletion for audit purposes

---

## Useful Supabase Resources

- **Official Docs**: https://supabase.com/docs
- **API Reference**: https://supabase.com/docs/reference/javascript
- **SQL Reference**: https://supabase.com/docs/reference/sql
- **Authentication Guide**: https://supabase.com/docs/guides/auth
- **RLS Guide**: https://supabase.com/docs/guides/auth/row-level-security

---

## Need Help?

If you encounter any issues:

1. Check the browser console for error messages (F12)
2. Verify all SQL queries executed successfully
3. Confirm environment variables are set
4. Check Supabase documentation
5. Review the application logs in Replit

---

**Last Updated**: 2025-12-31  
**Version**: 1.0
