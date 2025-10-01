-- Migration: Add and populate contact information fields to entity tables and drawings
-- This migration handles both adding new columns and updating existing data

-- Add contact fields to entity tables (safe to run multiple times)
ALTER TABLE public.canals ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE public.canals ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE public.canals ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE public.canals ADD COLUMN IF NOT EXISTS contact_role TEXT;

ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS contact_role TEXT;

ALTER TABLE public.headgates ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE public.headgates ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE public.headgates ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE public.headgates ADD COLUMN IF NOT EXISTS contact_role TEXT;

ALTER TABLE public.meters ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE public.meters ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE public.meters ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE public.meters ADD COLUMN IF NOT EXISTS contact_role TEXT;

ALTER TABLE public.pumps ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE public.pumps ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE public.pumps ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE public.pumps ADD COLUMN IF NOT EXISTS contact_role TEXT;

ALTER TABLE public.pivots ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE public.pivots ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE public.pivots ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE public.pivots ADD COLUMN IF NOT EXISTS contact_role TEXT;

ALTER TABLE public.lands ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE public.lands ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE public.lands ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE public.lands ADD COLUMN IF NOT EXISTS contact_role TEXT;

-- Add contact fields to drawings table for DrawingElements
ALTER TABLE public.drawings ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE public.drawings ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE public.drawings ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE public.drawings ADD COLUMN IF NOT EXISTS contact_role TEXT;

-- Create indexes for contact fields (for searching by contact info)
CREATE INDEX IF NOT EXISTS idx_canals_contact_name ON public.canals(contact_name);
CREATE INDEX IF NOT EXISTS idx_rides_contact_name ON public.rides(contact_name);
CREATE INDEX IF NOT EXISTS idx_headgates_contact_name ON public.headgates(contact_name);
CREATE INDEX IF NOT EXISTS idx_meters_contact_name ON public.meters(contact_name);
CREATE INDEX IF NOT EXISTS idx_pumps_contact_name ON public.pumps(contact_name);
CREATE INDEX IF NOT EXISTS idx_pivots_contact_name ON public.pivots(contact_name);
CREATE INDEX IF NOT EXISTS idx_lands_contact_name ON public.lands(contact_name);
CREATE INDEX IF NOT EXISTS idx_drawings_contact_name ON public.drawings(contact_name);

-- Update existing entities with contact information (use UPSERT)
INSERT INTO public.canals (id, name, description, status, length, capacity, contact_name, contact_phone, contact_email, contact_role, created_at, updated_at)
VALUES 
  ('canal-1', 'Main Canal', 'Primary irrigation canal', 'active', 5280, 50, 'John Smith', '(555) 123-4567', 'john.smith@waterdistrict.gov', 'Canal Manager', NOW(), NOW()),
  ('canal-2', 'West Branch Canal', 'Western distribution canal', 'active', 3200, 25, 'Maria Rodriguez', '(555) 234-5678', 'maria.rodriguez@westbranch.com', 'Canal Owner', NOW(), NOW()),
  ('canal-3', 'East Branch Canal', 'Eastern distribution canal', 'maintenance', 4100, 30, 'David Chen', '(555) 345-6789', 'david.chen@eastbranch.org', 'Maintenance Supervisor', NOW(), NOW())
ON CONFLICT (id) 
DO UPDATE SET 
  contact_name = EXCLUDED.contact_name,
  contact_phone = EXCLUDED.contact_phone,
  contact_email = EXCLUDED.contact_email,
  contact_role = EXCLUDED.contact_role,
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

-- Verify the migration by selecting sample data
SELECT 'Migration completed successfully. Sample data:' as message;
SELECT id, name, contact_name, contact_phone, contact_email, contact_role FROM public.canals LIMIT 3;
SELECT id, name, contact_name, contact_phone, contact_email, contact_role FROM public.rides LIMIT 2;
SELECT id, name, contact_name, contact_phone, contact_email, contact_role FROM public.headgates LIMIT 2;
SELECT id, name, contact_name, contact_phone, contact_email, contact_role FROM public.meters LIMIT 2;
