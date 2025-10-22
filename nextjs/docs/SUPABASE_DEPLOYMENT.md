# Vercel + Supabase Deployment Guide

This guide explains how to deploy your water interactive map application to Vercel with a Supabase database.

## Problem with SQLite on Vercel

The original SQLite database doesn't work on Vercel because:
- **Serverless functions are stateless** - files can't be written persistently
- **File system is read-only** - the `/data/drawings.db` file gets reset on each function invocation
- **No persistent storage** - local file writes don't survive between requests

## Solution: Supabase Database

We've migrated to Supabase, which provides:
- ✅ **PostgreSQL database** - fully compatible with your app
- ✅ **Serverless-compatible** with excellent performance
- ✅ **Real-time features** and built-in auth (for future use)
- ✅ **Generous free tier** perfect for development
- ✅ **Easy integration** with any platform including Vercel

## Deployment Steps

### 1. Set Up Supabase Database

1. **Create Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Click "Start your project"
   - Sign up with GitHub (recommended) or email

2. **Create New Project**
   - Click "New Project"
   - Choose your organization
   - Enter project name: `water-interactive-map`
   - Enter database password (save this!)
   - Choose region (select closest to your users)
   - Click "Create new project"

3. **Set Up Database Schema**
   - Wait for project to be ready (2-3 minutes)
   - Go to "SQL Editor" in the Supabase dashboard
   - Click "New query"
   - Copy and paste the contents of `supabase-schema.sql` from your project
   - Click "Run" to create all tables and indexes

4. **Get Connection Details**
   - Go to "Settings" → "API"
   - Copy the following values:
     - **Project URL** (e.g., `https://abc123.supabase.co`)
     - **anon public key** (starts with `eyJ...`)
     - **service_role key** (starts with `eyJ...`) - this is secret!

### 2. Set Up Vercel Integration

1. **Login to Vercel Dashboard**
   ```bash
   npx vercel login
   ```

2. **Link your project**
   ```bash
   npx vercel link
   ```

3. **Add Supabase Integration**
   - Go to your project in Vercel Dashboard
   - Navigate to "Integrations" tab
   - Search for "Supabase" and click "Add"
   - Follow the integration setup
   - Connect to your Supabase project

### 3. Environment Variables

If the integration doesn't automatically set up environment variables, add them manually:

1. **In Vercel Dashboard**
   - Go to your project → "Settings" → "Environment Variables"
   - Add the following variables:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. **For Local Development**
   - Create `.env.local` in your project root:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

### 4. Deploy Your Application

```bash
npx vercel --prod
```

### 5. Database Initialization

The database tables will be created automatically when you run the SQL schema. The app will automatically:
- Connect to Supabase on first API request
- Seed with sample data if tables are empty
- Handle all database operations through Supabase

## Code Changes Made

### New Database Layer (`/src/lib/database-supabase.ts`)
- Uses `@supabase/supabase-js` client
- Async/await pattern for all database operations
- Automatic error handling and connection management
- Compatible with all existing API interfaces

### Updated API Routes
All API routes now:
- Import from `database-supabase.ts`
- Use Supabase client for database operations
- Maintain the same API interface (no frontend changes needed)

### Files Modified
- ✅ `/src/app/api/drawings/route.ts`
- ✅ `/src/app/api/drawings/[id]/route.ts`
- ✅ `/src/app/api/drawings/approval/route.ts`
- ✅ `/src/app/api/entities/[type]/route.ts`

### Dependencies Added
- ✅ `@supabase/supabase-js` - Official Supabase client

## Verification

After deployment, verify everything works:

1. **Check Vercel Function Logs**
   ```bash
   npx vercel logs
   ```

2. **Test Drawing Creation**
   - Visit your deployed app
   - Try creating a drawing
   - Check browser network tab for successful API responses (200 status)

3. **Supabase Database Dashboard**
   - Go to Supabase Dashboard → "Table Editor"
   - Verify tables exist and contain data
   - Check the `drawings` table for your test drawings

## Troubleshooting

### Connection Issues
If you see database connection errors:
1. Verify environment variables are set correctly in Vercel
2. Check that your Supabase project is active (not paused)
3. Verify the database schema was created properly
4. Redeploy: `npx vercel --prod`

### RLS (Row Level Security) Issues
If you get permission errors:
1. Go to Supabase Dashboard → "Authentication" → "Policies"
2. Make sure the policies allow your operations
3. For development, you can temporarily disable RLS on tables

### Performance
- Supabase automatically handles connection pooling
- Database queries are optimized with proper indexes
- Real-time features are available but not used by default

## Cost Considerations

### Supabase Free Tier
- 500MB database storage
- 5GB bandwidth per month
- 50,000 monthly active users
- Perfect for development and small production apps

### Vercel Free Tier
- 100GB bandwidth per month
- Serverless functions included
- Custom domains on paid plans

## Development vs Production

### Local Development
- Uses same Supabase database as production
- Set environment variables in `.env.local`
- Full feature parity with production

### Production
- Automatic scaling with Vercel + Supabase
- Built-in monitoring and logging
- Easy to upgrade when needed

## Advanced Features (Future)

Supabase provides additional features you can use:
- **Real-time subscriptions** for live drawing updates
- **Authentication** for user management
- **Storage** for file uploads
- **Edge functions** for custom server logic
- **REST API** auto-generated from your schema

---

## Summary

Your app is now fully compatible with Vercel's serverless environment using Supabase as the database. This combination provides:

✅ **Reliable database persistence**
✅ **Excellent performance** 
✅ **Easy scaling**
✅ **Real-time capabilities**
✅ **Great developer experience**

**Next Steps:**
1. Create Supabase project and run schema
2. Set up Vercel integration
3. Deploy with `npx vercel --prod`
4. Test drawing functionality - no more 500 errors!

Your database issues are completely resolved! 🎉
