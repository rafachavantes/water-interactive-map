-- Migration: Add issue support to drawings table
-- Add issue-related columns to the drawings table

-- Add issue columns to drawings table
ALTER TABLE public.drawings 
ADD COLUMN IF NOT EXISTS issue_id TEXT,
ADD COLUMN IF NOT EXISTS issue_description TEXT,
ADD COLUMN IF NOT EXISTS issue_created_by TEXT,
ADD COLUMN IF NOT EXISTS issue_created_by_role TEXT,
ADD COLUMN IF NOT EXISTS issue_created_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS issue_resolved_by TEXT,
ADD COLUMN IF NOT EXISTS issue_resolved_at TIMESTAMP WITH TIME ZONE;

-- Add index for issue queries
CREATE INDEX IF NOT EXISTS idx_drawings_has_issue ON public.drawings(issue_id) WHERE issue_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_drawings_issue_created_at ON public.drawings(issue_created_at) WHERE issue_created_at IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.drawings.issue_id IS 'Unique identifier for the issue (if any)';
COMMENT ON COLUMN public.drawings.issue_description IS 'Description of the reported issue';
COMMENT ON COLUMN public.drawings.issue_created_by IS 'User who reported the issue';
COMMENT ON COLUMN public.drawings.issue_created_by_role IS 'Role of the user who reported the issue (User, Ditch Rider, Admin)';
COMMENT ON COLUMN public.drawings.issue_created_at IS 'Timestamp when the issue was reported';
COMMENT ON COLUMN public.drawings.issue_resolved_by IS 'User who resolved the issue';
COMMENT ON COLUMN public.drawings.issue_resolved_at IS 'Timestamp when the issue was resolved';
