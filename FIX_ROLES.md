# Fix "No Roles Available" Issue

If you're seeing the warning "No roles available" in the user management system, follow these steps:

## Option 1: Run SQL Script (Recommended - Fastest)

1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Copy and paste the contents of `scripts/seed-user-roles.sql`
4. Click **Run**
5. Verify you see 5 roles in the results
6. Refresh your application

## Option 2: Run Migration

If you're using Supabase CLI:

```bash
supabase db reset
# or
supabase migration up
```

## Option 3: Use Node Script

1. Make sure you have a `.env.local` file with:
   ```
   VITE_SUPABASE_URL=your-project-url
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. Run the script:
   ```bash
   node scripts/seed-user-roles.js
   ```

## Option 4: Manual Insert via Supabase Dashboard

1. Go to **Table Editor** in Supabase Dashboard
2. Select the `user_roles` table
3. Click **Insert** and add each role manually:

   **Super Admin:**
   - role_name: `super_admin`
   - display_name: `Super Admin`
   - permissions: `["all"]`
   - description: `Full system access with ability to manage all settings and users`

   **Admin:**
   - role_name: `admin`
   - display_name: `Admin`
   - permissions: `["users.manage", "settings.manage", "campaigns.manage", "creators.manage", "brands.manage"]`
   - description: `Administrative access to manage users, settings, and business operations`

   **Manager:**
   - role_name: `manager`
   - display_name: `Manager`
   - permissions: `["campaigns.manage", "creators.view", "brands.view", "payments.view"]`
   - description: `Can manage campaigns and view creator/brand information`

   **User:**
   - role_name: `user`
   - display_name: `User`
   - permissions: `["campaigns.view", "creators.view", "brands.view"]`
   - description: `Standard user with view access to campaigns, creators, and brands`

   **Viewer:**
   - role_name: `viewer`
   - display_name: `Viewer`
   - permissions: `["campaigns.view"]`
   - description: `Read-only access to campaign information`

## Verify Roles Are Seeded

Run this query in SQL Editor to verify:

```sql
SELECT role_name, display_name FROM user_roles ORDER BY role_name;
```

You should see 5 roles:
- admin
- manager
- super_admin
- user
- viewer

## Troubleshooting

### If roles still don't appear:

1. **Check RLS Policies:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'user_roles';
   ```
   
   Make sure there's a policy allowing authenticated users to SELECT:
   ```sql
   CREATE POLICY "Roles viewable by authenticated users"
       ON user_roles FOR SELECT
       TO authenticated
       USING (true);
   ```

2. **Check Authentication:**
   - Make sure you're logged in
   - Check browser console for authentication errors

3. **Check Browser Console:**
   - Open DevTools (F12)
   - Look for errors in the Console tab
   - Check Network tab for failed requests to `user_roles`

## After Fixing

Once roles are seeded:
1. Refresh the page
2. Click "Add User" button
3. The role dropdown should now show all 5 roles

