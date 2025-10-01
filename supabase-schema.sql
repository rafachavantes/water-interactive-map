-- Supabase Schema for Water Interactive Map
-- Run this SQL in your Supabase SQL Editor to create the required tables

-- Enable the uuid-ossp extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main drawings table
CREATE TABLE IF NOT EXISTS public.drawings (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    coordinates TEXT NOT NULL,
    marker_position TEXT,
    element_type TEXT,
    linked_entity_id TEXT,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    farm TEXT,
    description TEXT,
    status TEXT,
    last_updated TIMESTAMP WITH TIME ZONE,
    category TEXT,
    privacy TEXT,
    cfs REAL,
    order_amount REAL,
    notes TEXT,
    files TEXT,
    live_data_privacy TEXT,
    approval_status TEXT,
    created_by TEXT,
    created_by_role TEXT,
    reviewed_by TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    stroke_weight INTEGER NOT NULL,
    fill_opacity REAL,
    tool TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Entity tables
CREATE TABLE IF NOT EXISTS public.canals (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL,
    length REAL,
    capacity REAL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rides (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL,
    route_length REAL,
    rider_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.headgates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL,
    max_flow REAL,
    gate_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.meters (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL,
    meter_type TEXT,
    units TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pumps (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL,
    horsepower REAL,
    flow_rate REAL,
    pump_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pivots (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL,
    radius REAL,
    acres REAL,
    pivot_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lands (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL,
    acres REAL,
    crop_type TEXT,
    soil_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_drawings_type ON public.drawings(type);
CREATE INDEX IF NOT EXISTS idx_drawings_element_type ON public.drawings(element_type);
CREATE INDEX IF NOT EXISTS idx_drawings_linked_entity_id ON public.drawings(linked_entity_id);
CREATE INDEX IF NOT EXISTS idx_drawings_status ON public.drawings(status);
CREATE INDEX IF NOT EXISTS idx_drawings_created_at ON public.drawings(created_at);
CREATE INDEX IF NOT EXISTS idx_drawings_approval_status ON public.drawings(approval_status);
CREATE INDEX IF NOT EXISTS idx_drawings_created_by_role ON public.drawings(created_by_role);

CREATE INDEX IF NOT EXISTS idx_canals_status ON public.canals(status);
CREATE INDEX IF NOT EXISTS idx_rides_status ON public.rides(status);
CREATE INDEX IF NOT EXISTS idx_headgates_status ON public.headgates(status);
CREATE INDEX IF NOT EXISTS idx_meters_status ON public.meters(status);
CREATE INDEX IF NOT EXISTS idx_pumps_status ON public.pumps(status);
CREATE INDEX IF NOT EXISTS idx_pivots_status ON public.pivots(status);
CREATE INDEX IF NOT EXISTS idx_lands_status ON public.lands(status);

-- Enable Row Level Security (RLS) for better security
ALTER TABLE public.drawings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.headgates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pumps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pivots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lands ENABLE ROW LEVEL SECURITY;

-- Create policies to allow authenticated users to access data
-- You can modify these policies based on your security requirements

-- Drawings policies
CREATE POLICY "Allow all operations on drawings" ON public.drawings
    FOR ALL USING (true);

-- Entity policies
CREATE POLICY "Allow all operations on canals" ON public.canals
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on rides" ON public.rides
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on headgates" ON public.headgates
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on meters" ON public.meters
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on pumps" ON public.pumps
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on pivots" ON public.pivots
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on lands" ON public.lands
    FOR ALL USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_drawings_updated_at BEFORE UPDATE ON public.drawings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canals_updated_at BEFORE UPDATE ON public.canals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rides_updated_at BEFORE UPDATE ON public.rides
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_headgates_updated_at BEFORE UPDATE ON public.headgates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meters_updated_at BEFORE UPDATE ON public.meters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pumps_updated_at BEFORE UPDATE ON public.pumps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pivots_updated_at BEFORE UPDATE ON public.pivots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lands_updated_at BEFORE UPDATE ON public.lands
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
