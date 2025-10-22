# Supabase Database Setup Instructions

## 🚨 IMPORTANT: Required Database Migration

The contact information feature requires database schema updates that must be
manually applied to your Supabase database.

## Step 1: Apply the Initial Schema

If you haven't already, run the main schema file in your Supabase SQL Editor:

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase-schema.sql`
4. Click **Run**

## Step 2: Apply the Contact Fields Migration

**This step is required for contact information to work:**

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase-migration-contact-fields.sql`
4. Click **Run**

This migration will:

- Add contact fields to all entity tables
- Add contact fields to the drawings table
- Insert sample data with contact information
- Create performance indexes

## Step 3: Verify the Migration

After running the migration, verify it worked by checking one of the entity
tables:

```sql
SELECT id, name, contact_name, contact_phone, contact_email, contact_role 
FROM canals 
LIMIT 3;
```

You should see contact information like:

- **canal-1**: John Smith, (555) 123-4567, john.smith@waterdistrict.gov, Canal
  Manager
- **canal-2**: Maria Rodriguez, (555) 234-5678, maria.rodriguez@westbranch.com,
  Canal Owner
- **canal-3**: David Chen, (555) 345-6789, david.chen@eastbranch.org,
  Maintenance Supervisor

## Step 4: Environment Variables

Ensure your environment variables are properly set:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Step 5: Test the Feature

1. Restart your Next.js application
2. Create a new drawing element with type **canal**, **ride**, **headgate**, or
   **meter**
3. In the Details panel, select an entity from the "Link to" dropdown
4. The Contact Information section should auto-populate with the entity's
   contact details

## Troubleshooting

### If contact information doesn't populate:

1. **Check browser console** for error messages
2. **Verify API response** by visiting: `/api/entities/canal`
   - Should include `contactName`, `contactPhone`, `contactEmail`, `contactRole`
     fields
3. **Ensure migration was successful** by running the verification query above
4. **Check Supabase logs** for any database errors

### Common Issues:

- **"Failed to fetch entities"**: Check your environment variables
- **Empty contact fields**: Migration wasn't applied successfully
- **"Table doesn't exist"**: Run the initial schema first, then the migration
- **Permission errors**: Ensure you're using the service role key, not the anon
  key

## Sample Data Included

The migration includes sample contact information for:

### Canals

- Main Canal → John Smith (Canal Manager)
- West Branch Canal → Maria Rodriguez (Canal Owner)
- East Branch Canal → David Chen (Maintenance Supervisor)

### Rides

- North Section Ride → Tom Wilson (Ditch Rider)
- South Section Ride → Sarah Johnson (Senior Ditch Rider)

### Headgates

- Main Headgate → Robert Miller (Gate Operator)
- West Distribution Gate → Lisa Thompson (Operations Manager)

### Meters

- Main Flow Meter → Mike Anderson (Meter Technician)
- Pressure Gauge #1 → Jennifer Davis (Monitoring Specialist)

## Need Help?

If you continue having issues:

1. Check the browser console for JavaScript errors
2. Check the Network tab to see API responses
3. Verify your Supabase project is active and accessible
4. Make sure all SQL migrations completed without errors
