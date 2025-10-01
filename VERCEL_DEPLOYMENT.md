.e# Vercel Deployment Guide

This guide explains how to deploy your water interactive map application to
Vercel with the Postgres database.

## Problem with SQLite on Vercel

The original SQLite database doesn't work on Vercel because:

- **Serverless functions are stateless** - files can't be written persistently
- **File system is read-only** - the `/data/drawings.db` file gets reset on each
  function invocation
- **No persistent storage** - local file writes don't survive between requests

## Solution: Vercel Postgres

We've migrated to Vercel Postgres, which provides:

- ✅ **Serverless-compatible** database
- ✅ **Persistent storage** that survives deployments
- ✅ **Automatic scaling** and connection pooling
- ✅ **Built-in Vercel integration**

## Deployment Steps

### 1. Set Up Vercel Postgres Database

1. **Login to Vercel Dashboard**
   ```bash
   npx vercel login
   ```

2. **Link your project**
   ```bash
   npx vercel link
   ```

3. **Create Postgres Database**
   - Go to your project in Vercel Dashboard
   - Navigate to "Storage" tab
   - Click "Create Database"
   - Select "Postgres"
   - Choose a database name (e.g., `water-map-db`)
   - Click "Create"

4. **Connect Database to Project**
   - In the database page, click "Connect Project"
   - Select your project
   - Click "Connect"

### 2. Environment Variables

The database connection will be automatically configured with these environment
variables:

- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

**No manual environment variable setup required** - Vercel handles this
automatically!

### 3. Deploy Your Application

```bash
npx vercel --prod
```

### 4. Database Initialization

The database tables will be created automatically on first API request. The
system will:

- Create all necessary tables (`drawings`, `canals`, `rides`, etc.)
- Add proper indexes for performance
- Seed with sample data if tables are empty

## Code Changes Made

### New Database Layer (`/src/lib/database-postgres.ts`)

- Replaced SQLite with Vercel Postgres
- Uses `@vercel/postgres` package
- Async/await pattern for all database operations
- Automatic table creation and seeding

### Updated API Routes

All API routes now:

- Import from `database-postgres.ts` instead of `database.ts`
- Call `await initDatabase()` on first access
- Use `await` for all database operations

### Files Modified

- ✅ `/src/app/api/drawings/route.ts`
- ✅ `/src/app/api/drawings/[id]/route.ts`
- ✅ `/src/app/api/drawings/approval/route.ts`
- ✅ `/src/app/api/entities/[type]/route.ts`

## Verification

After deployment, verify the database is working:

1. **Check Vercel Functions Logs**
   ```bash
   npx vercel logs
   ```

2. **Test Drawing Creation**
   - Visit your deployed app
   - Try creating a drawing
   - Check browser network tab for successful API responses (200 status)

3. **Database Dashboard**
   - Go to Vercel Dashboard → Storage → Your Database
   - Click "Query" tab to run SQL queries
   - Verify tables exist: `SELECT * FROM drawings LIMIT 5;`

## Troubleshooting

### Connection Issues

If you see database connection errors:

1. Verify the database is connected to your project in Vercel Dashboard
2. Redeploy: `npx vercel --prod`
3. Check function logs: `npx vercel logs`

### Migration from SQLite

The old SQLite data in `/data/drawings.db` won't be automatically migrated. If
you need to preserve existing data:

1. Export data from local SQLite database
2. Import into Vercel Postgres using the dashboard query interface

### Performance

- Vercel Postgres includes connection pooling automatically
- Database queries are optimized with proper indexes
- Tables are created with performance considerations

## Development vs Production

### Local Development

During local development, you can either:

1. **Use Vercel Postgres**: Set up `.env.local` with Vercel database credentials
2. **Keep SQLite**: Use the old `database.ts` for local development

### Production

Always uses Vercel Postgres automatically.

## Cost Considerations

- Vercel Postgres has usage-based pricing
- Free tier includes:
  - 1 database
  - 500k row reads/month
  - 100k row writes/month
- Monitor usage in Vercel Dashboard

---

## Summary

Your app is now fully compatible with Vercel's serverless environment. The
database migration from SQLite to Postgres solves the deployment issues while
maintaining all existing functionality.

**Next Steps:**

1. Create Vercel Postgres database
2. Deploy with `npx vercel --prod`
3. Test drawing functionality
4. Monitor logs and database usage
