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
- 2025-12-29: Fixed issues and optimized for Replit
  - ✅ Fixed Tailwind CSS warning: Changed `duration-[200ms]` to `duration-200` in SavedFiltersDrawer
  - ✅ Added autocomplete attributes to login form inputs (email, password) for better accessibility
  - ✅ Removed development scripts (rocket.new) from index.html
  - ✅ Updated HTML description meta tag
  - ✅ Configured for Replit environment (port 5000, allowed all hosts)
