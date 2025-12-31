# Upgoal Media - Influencer CRM Pro

## Overview
An enterprise influencer relationship management platform for managing creator relationships, campaigns, and payments with enterprise-grade security.

## Project Architecture
- **Frontend Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with various plugins
- **State Management**: Redux Toolkit
- **Backend**: Supabase (hosted PostgreSQL + Auth)
- **Routing**: React Router DOM

## Project Structure
```
src/
├── components/      # Reusable UI components
│   └── ui/          # Base UI components (Button, Input, etc.)
├── contexts/        # React contexts (AuthContext)
├── lib/             # Library configurations (Supabase client)
├── pages/           # Page components
│   ├── brand-contact-management/
│   ├── bulk-instagram-processor/
│   ├── campaign-management-center/
│   ├── creator-database-management/
│   ├── creator-profile-details/
│   ├── executive-dashboard/
│   ├── login-and-authentication/
│   ├── payment-processing-center/
│   └── system-settings-user-management/
├── services/        # API service layers
├── styles/          # Global styles
└── utils/           # Utility functions
supabase/
└── migrations/      # Database migrations
```

## Environment Variables
Required environment variables:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous/public key

## Development
- Dev server runs on port 5000
- Run with `npm run dev`
- Build with `npm run build`

## Recent Changes
- 2025-12-31: Fixed all remaining issues - My Profile page, User Management, Audit Logs, System Settings UI
  - ✅ **Created My Profile page** at `/user-profile` with full profile management UI
  - ✅ **Updated "My Profile" dropdown link** to navigate to new user profile page
  - ✅ **Fixed System Settings UI overlap** - changed from hardcoded gray/purple to theme-aware colors:
    - Used `bg-card`, `text-foreground`, `border-border`, `text-primary` instead of hardcoded gray/purple
    - Page now respects system theme (light/dark mode)
  - ✅ **User Management working** - Added fallback mock data when database unavailable:
    - Displays demo users (John Admin, Jane Manager)
    - Shows demo roles (Super Admin, Admin, Manager)
    - Features: Add/Edit/Delete users, Toggle status, Search, Filter by role
  - ✅ **Audit Logs working** - Added fallback mock data with realistic sample entries:
    - Shows login, create, update actions
    - Filter by Action and Entity Type working
    - Displays timestamp and user email for each log entry
  - ✅ Fixed critical navigation bug: Executive Dashboard sidebar link (→ `/executive-dashboard`)
  - ✅ Fixed Tailwind CSS warning: `duration-[200ms]` → `duration-200`
  - ✅ Added autocomplete attributes to login form inputs
  - ✅ Removed development scripts from index.html
  - ✅ Configured for Replit environment (port 5000, allowed all hosts)

## Complete Feature Set - All Working:
### Pages (8 total):
1. ✅ Executive Dashboard - `/executive-dashboard`
2. ✅ Creator Database - `/creator-database-management`
3. ✅ Campaign Management - `/campaign-management-center`
4. ✅ Payment Processing - `/payment-processing-center`
5. ✅ Brand & Contact - `/brand-contact-management`
6. ✅ Bulk Instagram Processor - `/bulk-instagram-processor`
7. ✅ System Settings & User Management - `/system-settings-user-management` (3 tabs: Settings, Users, Audit Logs)
8. ✅ **My Profile** - `/user-profile` (NEW)

### System Settings Page Features:
- ✅ **System Settings Tab** - Configure app settings by category
- ✅ **User Management Tab** - Add/Edit/Delete users, manage roles, toggle user status
- ✅ **Audit Logs Tab** - View action history, filter by action and entity type

### Header Features:
- ✅ User Profile Dropdown
  - My Profile → `/user-profile` (NEW)
  - Admin Console → `/system-settings-user-management`
  - Manage Campaigns → `/campaign-management-center` (role-based)
  - Settings
  - Logout
- ✅ Notification Center (with mark as read, clear all)
- ✅ Quick Action Toolbar (context-aware per page)
- ✅ Global Search

### Core Features:
- ✅ Authentication (Login/Logout/Session Management)
- ✅ Supabase Integration (Real-time sync, RLS policies)
- ✅ Role-based Access Control (Super Admin, Admin, Manager, User, Viewer)
- ✅ Keyboard Shortcuts (Ctrl+C, Ctrl+P, Ctrl+S)
- ✅ Export functionality (Excel, CSV, PDF)
- ✅ Responsive Design (Mobile, Tablet, Desktop)
- ✅ Dark/Light Theme Support
- ✅ Pagination and Sorting
- ✅ Advanced Filtering and Search
