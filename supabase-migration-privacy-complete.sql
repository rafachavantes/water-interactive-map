-- Complete Migration: Add all missing contact fields and update privacy structure
-- This migration handles the complete transition from simple privacy to checkbox-based privacy

-- Step 1: Add all missing contact fields to drawings table
ALTER TABLE public.drawings ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE public.drawings ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE public.drawings ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE public.drawings ADD COLUMN IF NOT EXISTS contact_role TEXT;
ALTER TABLE public.drawings ADD COLUMN IF NOT EXISTS contact_privacy TEXT;

-- Step 2: Add contact fields to entity tables
-- Canals
ALTER TABLE public.canals ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE public.canals ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE public.canals ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE public.canals ADD COLUMN IF NOT EXISTS contact_role TEXT;

-- Rides
ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS contact_role TEXT;

-- Headgates
ALTER TABLE public.headgates ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE public.headgates ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE public.headgates ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE public.headgates ADD COLUMN IF NOT EXISTS contact_role TEXT;

-- Meters
ALTER TABLE public.meters ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE public.meters ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE public.meters ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE public.meters ADD COLUMN IF NOT EXISTS contact_role TEXT;

-- Pumps
ALTER TABLE public.pumps ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE public.pumps ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE public.pumps ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE public.pumps ADD COLUMN IF NOT EXISTS contact_role TEXT;

-- Pivots
ALTER TABLE public.pivots ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE public.pivots ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE public.pivots ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE public.pivots ADD COLUMN IF NOT EXISTS contact_role TEXT;

-- Lands
ALTER TABLE public.lands ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE public.lands ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE public.lands ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE public.lands ADD COLUMN IF NOT EXISTS contact_role TEXT;

-- Add max_flow field to canals (in addition to existing capacity field)
ALTER TABLE public.canals ADD COLUMN IF NOT EXISTS max_flow REAL;

-- Step 3: Backup existing privacy data
CREATE TABLE IF NOT EXISTS privacy_backup AS
SELECT id, privacy, contact_privacy 
FROM public.drawings 
WHERE privacy IS NOT NULL OR contact_privacy IS NOT NULL;

-- Step 4: Convert privacy columns to JSONB type
-- Add new JSONB columns
ALTER TABLE public.drawings ADD COLUMN IF NOT EXISTS privacy_new JSONB;
ALTER TABLE public.drawings ADD COLUMN IF NOT EXISTS contact_privacy_new JSONB;

-- Step 5: Migrate existing data from old format to new format
-- Handle both text and JSONB data in privacy column
UPDATE public.drawings 
SET privacy_new = CASE 
  -- Handle text values (old format)
  WHEN privacy::text = 'all' THEN '{"roles": {"users": true, "ditchRiders": true, "admins": true}, "specificUsers": [], "linkedEntity": false}'::jsonb
  WHEN privacy::text = 'ditch-admin' THEN '{"roles": {"users": false, "ditchRiders": true, "admins": true}, "specificUsers": [], "linkedEntity": false}'::jsonb
  WHEN privacy::text = 'admin-only' THEN '{"roles": {"users": false, "ditchRiders": false, "admins": true}, "specificUsers": [], "linkedEntity": false}'::jsonb
  -- Handle existing JSONB values by adding missing linkedEntity field
  WHEN privacy IS NOT NULL AND privacy::text ~ '^{.*}$' THEN 
    CASE 
      WHEN privacy::jsonb ? 'linkedEntity' THEN privacy::jsonb
      ELSE privacy::jsonb || '{"linkedEntity": false}'::jsonb
    END
  ELSE '{"roles": {"users": true, "ditchRiders": true, "admins": true}, "specificUsers": [], "linkedEntity": false}'::jsonb
END
WHERE privacy IS NOT NULL;

-- Handle both text and JSONB data in contact_privacy column
UPDATE public.drawings 
SET contact_privacy_new = CASE 
  -- Handle text values (old format)
  WHEN contact_privacy::text = 'all' THEN '{"roles": {"users": true, "ditchRiders": true, "admins": true}, "specificUsers": [], "linkedEntity": false}'::jsonb
  WHEN contact_privacy::text = 'ditch-admin' THEN '{"roles": {"users": false, "ditchRiders": true, "admins": true}, "specificUsers": [], "linkedEntity": false}'::jsonb
  WHEN contact_privacy::text = 'admin-only' THEN '{"roles": {"users": false, "ditchRiders": false, "admins": true}, "specificUsers": [], "linkedEntity": false}'::jsonb
  -- Handle existing JSONB values by adding missing linkedEntity field
  WHEN contact_privacy IS NOT NULL AND contact_privacy::text ~ '^{.*}$' THEN 
    CASE 
      WHEN contact_privacy::jsonb ? 'linkedEntity' THEN contact_privacy::jsonb
      ELSE contact_privacy::jsonb || '{"linkedEntity": false}'::jsonb
    END
  ELSE '{"roles": {"users": true, "ditchRiders": true, "admins": true}, "specificUsers": [], "linkedEntity": false}'::jsonb
END
WHERE contact_privacy IS NOT NULL;

-- Step 6: Set defaults for rows with NULL values
UPDATE public.drawings 
SET privacy_new = '{"roles": {"users": true, "ditchRiders": true, "admins": true}, "specificUsers": [], "linkedEntity": false}'::jsonb
WHERE privacy_new IS NULL;

UPDATE public.drawings 
SET contact_privacy_new = '{"roles": {"users": true, "ditchRiders": true, "admins": true}, "specificUsers": [], "linkedEntity": false}'::jsonb
WHERE contact_privacy_new IS NULL;

-- Step 7: Drop old columns and rename new ones
ALTER TABLE public.drawings DROP COLUMN IF EXISTS privacy;
ALTER TABLE public.drawings DROP COLUMN IF EXISTS contact_privacy;
ALTER TABLE public.drawings RENAME COLUMN privacy_new TO privacy;
ALTER TABLE public.drawings RENAME COLUMN contact_privacy_new TO contact_privacy;

-- Step 8: Create indexes for efficient querying
-- Contact information indexes
CREATE INDEX IF NOT EXISTS idx_drawings_contact_name ON public.drawings(contact_name);
CREATE INDEX IF NOT EXISTS idx_canals_contact_name ON public.canals(contact_name);
CREATE INDEX IF NOT EXISTS idx_rides_contact_name ON public.rides(contact_name);
CREATE INDEX IF NOT EXISTS idx_headgates_contact_name ON public.headgates(contact_name);
CREATE INDEX IF NOT EXISTS idx_meters_contact_name ON public.meters(contact_name);
CREATE INDEX IF NOT EXISTS idx_pumps_contact_name ON public.pumps(contact_name);
CREATE INDEX IF NOT EXISTS idx_pivots_contact_name ON public.pivots(contact_name);
CREATE INDEX IF NOT EXISTS idx_lands_contact_name ON public.lands(contact_name);

-- JSONB privacy indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_drawings_privacy_roles ON public.drawings USING GIN ((privacy->'roles'));
CREATE INDEX IF NOT EXISTS idx_drawings_privacy_users ON public.drawings USING GIN ((privacy->'specificUsers'));
CREATE INDEX IF NOT EXISTS idx_drawings_contact_privacy_roles ON public.drawings USING GIN ((contact_privacy->'roles'));
CREATE INDEX IF NOT EXISTS idx_drawings_contact_privacy_users ON public.drawings USING GIN ((contact_privacy->'specificUsers'));

-- Step 9: Seed entity data with contact information (safe to run multiple times)
INSERT INTO public.canals (id, name, description, status, length, capacity, max_flow, contact_name, contact_phone, contact_email, contact_role, created_at, updated_at)
VALUES 
  ('canal-1', 'Main Canal', 'Primary irrigation canal', 'active', 5280, 50, 75.5, 'John Smith', '(555) 123-4567', 'john.smith@waterdistrict.gov', 'Canal Manager', NOW(), NOW()),
  ('canal-2', 'West Branch Canal', 'Western distribution canal', 'active', 3200, 25, 42.3, 'Maria Rodriguez', '(555) 234-5678', 'maria.rodriguez@westbranch.com', 'Canal Owner', NOW(), NOW()),
  ('canal-3', 'East Branch Canal', 'Eastern distribution canal', 'maintenance', 4100, 30, 58.7, 'David Chen', '(555) 345-6789', 'david.chen@eastbranch.org', 'Maintenance Supervisor', NOW(), NOW())
ON CONFLICT (id) 
DO UPDATE SET 
  contact_name = EXCLUDED.contact_name,
  contact_phone = EXCLUDED.contact_phone,
  contact_email = EXCLUDED.contact_email,
  contact_role = EXCLUDED.contact_role,
  max_flow = EXCLUDED.max_flow,
  updated_at = NOW();

INSERT INTO public.rides (id, name, description, status, route_length, rider_id, contact_name, contact_phone, contact_email, contact_role, created_at, updated_at)
VALUES 
  ('ride-1', 'North Section Ride', 'Daily inspection route for north section', 'active', 12.5, 'rider-001', 'Tom Wilson', '(555) 456-7890', 'tom.wilson@ditchrider.com', 'Ditch Rider', NOW(), NOW()),
  ('ride-2', 'South Section Ride', 'Daily inspection route for south section', 'active', 8.3, 'rider-002', 'Sarah Johnson', '(555) 567-8901', 'sarah.johnson@ditchrider.com', 'Senior Ditch Rider', NOW(), NOW())
ON CONFLICT (id) 
DO UPDATE SET 
  contact_name = EXCLUDED.contact_name,
  contact_phone = EXCLUDED.contact_phone,
  contact_email = EXCLUDED.contact_email,
  contact_role = EXCLUDED.contact_role,
  updated_at = NOW();

INSERT INTO public.headgates (id, name, description, status, max_flow, gate_type, contact_name, contact_phone, contact_email, contact_role, created_at, updated_at)
VALUES 
  ('headgate-1', 'Main Headgate', 'Primary flow control gate', 'active', 100, 'radial', 'Robert Miller', '(555) 678-9012', 'robert.miller@gates.com', 'Gate Operator', NOW(), NOW()),
  ('headgate-2', 'West Distribution Gate', 'Controls flow to west branch', 'active', 40, 'slide', 'Lisa Thompson', '(555) 789-0123', 'lisa.thompson@westgate.org', 'Operations Manager', NOW(), NOW())
ON CONFLICT (id) 
DO UPDATE SET 
  contact_name = EXCLUDED.contact_name,
  contact_phone = EXCLUDED.contact_phone,
  contact_email = EXCLUDED.contact_email,
  contact_role = EXCLUDED.contact_role,
  updated_at = NOW();

INSERT INTO public.meters (id, name, description, status, meter_type, units, contact_name, contact_phone, contact_email, contact_role, created_at, updated_at)
VALUES 
  ('meter-1', 'Main Flow Meter', 'Measures main canal flow', 'active', 'flow', 'CFS', 'Mike Anderson', '(555) 890-1234', 'mike.anderson@meters.com', 'Meter Technician', NOW(), NOW()),
  ('meter-2', 'Pressure Gauge #1', 'Monitors system pressure', 'active', 'pressure', 'PSI', 'Jennifer Davis', '(555) 901-2345', 'jennifer.davis@monitoring.gov', 'Monitoring Specialist', NOW(), NOW())
ON CONFLICT (id) 
DO UPDATE SET 
  contact_name = EXCLUDED.contact_name,
  contact_phone = EXCLUDED.contact_phone,
  contact_email = EXCLUDED.contact_email,
  contact_role = EXCLUDED.contact_role,
  updated_at = NOW();

-- Step 10: Verify the migration
SELECT 'Complete privacy and contact migration finished successfully.' as message;

-- Show sample of migrated data
SELECT 
    id, 
    name,
    contact_name,
    privacy,
    contact_privacy,
    created_at 
FROM public.drawings 
LIMIT 3;

-- Show sample entity data
SELECT 'Sample entity data:' as info;
SELECT id, name, contact_name, contact_phone, contact_email, contact_role FROM public.canals LIMIT 2;
SELECT id, name, contact_name, contact_phone, contact_email, contact_role FROM public.rides LIMIT 2;
