-- Migration: Add contact_privacy field to drawings table
-- This allows users to configure privacy settings for contact information

-- Add contact_privacy column to drawings table
ALTER TABLE public.drawings ADD COLUMN IF NOT EXISTS contact_privacy TEXT CHECK (contact_privacy IN ('all', 'ditch-admin', 'admin-only'));

-- Set default contact_privacy to 'all' for existing rows with null values
UPDATE public.drawings 
SET contact_privacy = 'all' 
WHERE contact_privacy IS NULL;

-- Create index for contact_privacy field (for filtering by privacy level)
CREATE INDEX IF NOT EXISTS idx_drawings_contact_privacy ON public.drawings(contact_privacy);

-- Verify the migration
SELECT 'Contact privacy migration completed successfully.' as message;
SELECT 
    id, 
    name, 
    contact_name, 
    contact_privacy,
    created_at 
FROM public.drawings 
WHERE contact_name IS NOT NULL 
LIMIT 5;
