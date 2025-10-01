import { createClient } from '@supabase/supabase-js';
import { DrawingElement, MapElement, EntityType, Canal, Ride, Headgate, Meter, Pump, Pivot, Land, Issue } from '@/types';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a dummy client for build time when env vars aren't available
const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Helper function to ensure supabase is configured
function getSupabase() {
  if (!supabase) {
    throw new Error('Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
  }
  return supabase;
}

// Initialize database tables
export async function initDatabase(): Promise<void> {
  try {
    console.log('Supabase database ready (tables should be created using supabase-schema.sql)');
    
    // Seed with dummy data if tables are empty
    const drawingDbInstance = new DrawingDatabase();
    try {
      const canals = await drawingDbInstance.getEntitiesByType('canal');
      if (canals.length === 0) {
        await seedDatabase(drawingDbInstance);
      }
    } catch (error) {
      console.warn('Could not check/seed entities (tables might not exist yet):', error);
    }
    
    console.log('Database initialization complete');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

// Helper function to serialize coordinates
function serializeCoordinates(coordinates: DrawingElement['coordinates']): string {
  return JSON.stringify(coordinates);
}

// Helper function to deserialize coordinates
function deserializeCoordinates(coordinatesStr: string): DrawingElement['coordinates'] {
  return JSON.parse(coordinatesStr);
}

// Helper function to serialize marker position
function serializeMarkerPosition(position?: [number, number]): string | null {
  return position ? JSON.stringify(position) : null;
}

// Helper function to deserialize marker position
function deserializeMarkerPosition(positionStr: string | null): [number, number] | undefined {
  return positionStr ? JSON.parse(positionStr) : undefined;
}

// Helper function to serialize files
function serializeFiles(files: DrawingElement['files']): string | null {
  return files && files.length > 0 ? JSON.stringify(files) : null;
}

// Helper function to deserialize files
function deserializeFiles(filesStr: string | null): DrawingElement['files'] {
  if (!filesStr) return undefined;
  try {
    const parsed = JSON.parse(filesStr);
    return Array.isArray(parsed) ? parsed.map(file => ({
      ...file,
      createdAt: new Date(file.createdAt)
    })) : undefined;
  } catch {
    return undefined;
  }
}

// Helper function to serialize privacy settings
function serializePrivacySettings(privacy: DrawingElement['privacy']): string | null {
  return privacy ? JSON.stringify(privacy) : null;
}

// Helper function to deserialize privacy settings
function deserializePrivacySettings(privacyStr: string | null): DrawingElement['privacy'] {
  if (!privacyStr) return undefined;
  try {
    return JSON.parse(privacyStr);
  } catch {
    return undefined;
  }
}

// Helper function to serialize issue
function serializeIssue(issue: Issue | undefined): { [key: string]: string | null } {
  if (!issue) {
    return {
      issue_id: null,
      issue_description: null,
      issue_created_by: null,
      issue_created_by_role: null,
      issue_created_at: null,
      issue_resolved_by: null,
      issue_resolved_at: null,
    };
  }
  
  // Handle both Date objects and ISO strings
  const createdAt = issue.createdAt instanceof Date ? issue.createdAt : new Date(issue.createdAt);
  const resolvedAt = issue.resolvedAt ? (issue.resolvedAt instanceof Date ? issue.resolvedAt : new Date(issue.resolvedAt)) : null;
  
  return {
    issue_id: issue.id,
    issue_description: issue.description,
    issue_created_by: issue.createdBy || null,
    issue_created_by_role: issue.createdByRole || null,
    issue_created_at: createdAt.toISOString(),
    issue_resolved_by: issue.resolvedBy || null,
    issue_resolved_at: resolvedAt ? resolvedAt.toISOString() : null,
  };
}

// Helper function to deserialize issue
function deserializeIssue(row: Record<string, unknown>): Issue | undefined {
  if (!row.issue_id) return undefined;
  
  return {
    id: row.issue_id as string,
    description: row.issue_description as string,
    createdBy: (row.issue_created_by as string) || undefined,
    createdByRole: (row.issue_created_by_role as Issue['createdByRole']) || undefined,
    createdAt: new Date(row.issue_created_at as string),
    resolvedBy: (row.issue_resolved_by as string) || undefined,
    resolvedAt: row.issue_resolved_at ? new Date(row.issue_resolved_at as string) : undefined,
  };
}

// Convert DrawingElement to database row
function elementToRow(element: DrawingElement) {
  const issueFields = serializeIssue(element.issue);
  
  return {
    id: element.id,
    type: element.type,
    coordinates: serializeCoordinates(element.coordinates),
    marker_position: serializeMarkerPosition(element.markerPosition),
    element_type: element.elementType || null,
    linked_entity_id: element.linkedEntityId || null,
    name: element.name,
    color: element.color,
    farm: element.farm || null,
    description: element.description || null,
    status: element.status || null,
    last_updated: element.lastUpdated ? element.lastUpdated.toISOString() : null,
    category: element.category || null,
    privacy: serializePrivacySettings(element.privacy),
    cfs: element.cfs || null,
    order_amount: element.order || null,
    notes: element.notes || null,
    files: serializeFiles(element.files),
    contact_name: element.contactName || null,
    contact_phone: element.contactPhone || null,
    contact_email: element.contactEmail || null,
    contact_role: element.contactRole || null,
    contact_privacy: serializePrivacySettings(element.contactPrivacy),
    approval_status: element.approvalStatus || null,
    created_by: element.createdBy || null,
    created_by_role: element.createdByRole || null,
    reviewed_by: element.reviewedBy || null,
    reviewed_at: element.reviewedAt ? element.reviewedAt.toISOString() : null,
    review_notes: element.reviewNotes || null,
    stroke_weight: element.properties.strokeWeight,
    fill_opacity: element.properties.fillOpacity || null,
    tool: element.properties.tool,
    created_at: element.createdAt.toISOString(),
    updated_at: element.updatedAt.toISOString(),
    ...issueFields,
  };
}

// Convert database row to DrawingElement
function rowToElement(row: Record<string, unknown>): DrawingElement {
  return {
    id: row.id as string,
    type: row.type as DrawingElement['type'],
    coordinates: deserializeCoordinates(row.coordinates as string),
    markerPosition: deserializeMarkerPosition(row.marker_position as string | null),
    elementType: (row.element_type as MapElement['type']) || undefined,
    linkedEntityId: (row.linked_entity_id as string) || undefined,
    name: row.name as string,
    color: row.color as string,
    farm: (row.farm as string) || undefined,
    description: (row.description as string) || undefined,
    status: (row.status as DrawingElement['status']) || undefined,
    lastUpdated: row.last_updated ? new Date(row.last_updated as string) : undefined,
    category: (row.category as DrawingElement['category']) || undefined,
    privacy: deserializePrivacySettings(row.privacy as string | null),
    cfs: (row.cfs as number) || undefined,
    order: (row.order_amount as number) || undefined,
    notes: (row.notes as string) || undefined,
    files: deserializeFiles(row.files as string | null),
    contactName: (row.contact_name as string) || undefined,
    contactPhone: (row.contact_phone as string) || undefined,
    contactEmail: (row.contact_email as string) || undefined,
    contactRole: (row.contact_role as string) || undefined,
    contactPrivacy: deserializePrivacySettings(row.contact_privacy as string | null),
    issue: deserializeIssue(row),
    approvalStatus: (row.approval_status as DrawingElement['approvalStatus']) || undefined,
    createdBy: (row.created_by as string) || undefined,
    createdByRole: (row.created_by_role as DrawingElement['createdByRole']) || undefined,
    reviewedBy: (row.reviewed_by as string) || undefined,
    reviewedAt: row.reviewed_at ? new Date(row.reviewed_at as string) : undefined,
    reviewNotes: (row.review_notes as string) || undefined,
    properties: {
      strokeWeight: row.stroke_weight as number,
      ...(row.fill_opacity != null && { fillOpacity: row.fill_opacity as number }),
      tool: row.tool as DrawingElement['properties']['tool'],
    },
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

// Database operations
export class DrawingDatabase {
  // Save a drawing element
  async saveDrawing(element: DrawingElement): Promise<void> {
    const supabaseClient = getSupabase();
    const row = elementToRow(element);
    
    const { error } = await supabaseClient
      .from('drawings')
      .upsert(row, { onConflict: 'id' });

    if (error) {
      throw new Error(`Failed to save drawing: ${error.message}`);
    }
  }

  // Save multiple drawing elements
  async saveDrawings(elements: DrawingElement[]): Promise<void> {
    const supabaseClient = getSupabase();
    const rows = elements.map(elementToRow);
    
    const { error } = await supabaseClient
      .from('drawings')
      .upsert(rows, { onConflict: 'id' });

    if (error) {
      throw new Error(`Failed to save drawings: ${error.message}`);
    }
  }

  // Load all drawing elements
  async loadAllDrawings(): Promise<DrawingElement[]> {
    const supabaseClient = getSupabase();
    const { data, error } = await supabaseClient
      .from('drawings')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to load drawings: ${error.message}`);
    }

    return (data || []).map(rowToElement);
  }

  // Load a specific drawing by ID
  async loadDrawing(id: string): Promise<DrawingElement | null> {
    const supabaseClient = getSupabase();
    const { data, error } = await supabaseClient
      .from('drawings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to load drawing: ${error.message}`);
    }

    return data ? rowToElement(data) : null;
  }

  // Update a drawing element
  async updateDrawing(id: string, updates: Partial<DrawingElement>): Promise<boolean> {
    const existing = await this.loadDrawing(id);
    if (!existing) return false;

    const updated = { ...existing, ...updates, updatedAt: new Date() };
    await this.saveDrawing(updated);
    return true;
  }

  // Delete a drawing element
  async deleteDrawing(id: string): Promise<boolean> {
    const supabaseClient = getSupabase();
    const { error } = await supabaseClient
      .from('drawings')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete drawing: ${error.message}`);
    }

    return true;
  }

  // Clear all drawings
  async clearAllDrawings(): Promise<void> {
    const supabaseClient = getSupabase();
    const { error } = await supabaseClient
      .from('drawings')
      .delete()
      .neq('id', ''); // Delete all rows

    if (error) {
      throw new Error(`Failed to clear drawings: ${error.message}`);
    }
  }

  // Get drawing count
  async getDrawingCount(): Promise<number> {
    const supabaseClient = getSupabase();
    const { count, error } = await supabaseClient
      .from('drawings')
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw new Error(`Failed to get drawing count: ${error.message}`);
    }

    return count || 0;
  }

  // Get count of drawings pending approval
  async getPendingReviewCount(): Promise<number> {
    const supabaseClient = getSupabase();
    const { count, error } = await supabaseClient
      .from('drawings')
      .select('*', { count: 'exact', head: true })
      .eq('approval_status', 'pending');

    if (error) {
      throw new Error(`Failed to get pending review count: ${error.message}`);
    }

    return count || 0;
  }

  // Get drawings that need admin review
  async getDrawingsForReview(): Promise<DrawingElement[]> {
    const supabaseClient = getSupabase();
    const { data, error } = await supabaseClient
      .from('drawings')
      .select('*')
      .eq('approval_status', 'pending')
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to get drawings for review: ${error.message}`);
    }

    return (data || []).map(rowToElement);
  }

  // Approve or reject a drawing
  async updateApprovalStatus(id: string, status: 'approved' | 'rejected', reviewedBy: string, reviewNotes?: string): Promise<boolean> {
    const supabaseClient = getSupabase();
    const { error } = await supabaseClient
      .from('drawings')
      .update({
        approval_status: status,
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
        review_notes: reviewNotes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to update approval status: ${error.message}`);
    }

    return true;
  }

  // Entity management methods
  private entityToRow(entity: EntityType) {
    const baseRow = {
      id: entity.id,
      name: entity.name,
      description: entity.description || null,
      status: entity.status,
      contact_name: entity.contactName || null,
      contact_phone: entity.contactPhone || null,
      contact_email: entity.contactEmail || null,
      contact_role: entity.contactRole || null,
      created_at: entity.createdAt.toISOString(),
      updated_at: entity.updatedAt.toISOString(),
    };

    switch (entity.type) {
      case 'canal':
        return { ...baseRow, length: entity.length || null, capacity: entity.capacity || null, max_flow: entity.maxFlow || null };
      case 'ride':
        return { ...baseRow, route_length: entity.routeLength || null, rider_id: entity.riderId || null };
      case 'headgate':
        return { ...baseRow, max_flow: entity.maxFlow || null, gate_type: entity.gateType || null };
      case 'meter':
        return { ...baseRow, meter_type: entity.meterType || null, units: entity.units || null };
      case 'pump':
        return { ...baseRow, horsepower: entity.horsepower || null, flow_rate: entity.flowRate || null, pump_type: entity.pumpType || null };
      case 'pivot':
        return { ...baseRow, radius: entity.radius || null, acres: entity.acres || null, pivot_type: entity.pivotType || null };
      case 'land':
        return { ...baseRow, acres: entity.acres || null, crop_type: entity.cropType || null, soil_type: entity.soilType || null };
      default:
        return baseRow;
    }
  }

  private rowToEntity(row: Record<string, unknown>, type: string): EntityType {
    const baseEntity = {
      id: row.id as string,
      name: row.name as string,
      description: (row.description as string) || undefined,
      status: row.status as 'active' | 'inactive' | 'maintenance',
      contactName: (row.contact_name as string) || undefined,
      contactPhone: (row.contact_phone as string) || undefined,
      contactEmail: (row.contact_email as string) || undefined,
      contactRole: (row.contact_role as string) || undefined,
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
    };

    switch (type) {
      case 'canal':
        return { ...baseEntity, type: 'canal', length: (row.length as number) || undefined, capacity: (row.capacity as number) || undefined, maxFlow: (row.max_flow as number) || undefined } as Canal;
      case 'ride':
        return { ...baseEntity, type: 'ride', routeLength: (row.route_length as number) || undefined, riderId: (row.rider_id as string) || undefined } as Ride;
      case 'headgate':
        return { ...baseEntity, type: 'headgate', maxFlow: (row.max_flow as number) || undefined, gateType: (row.gate_type as string) || undefined } as Headgate;
      case 'meter':
        return { ...baseEntity, type: 'meter', meterType: (row.meter_type as 'flow' | 'pressure' | 'level') || undefined, units: (row.units as string) || undefined } as Meter;
      case 'pump':
        return { ...baseEntity, type: 'pump', horsepower: (row.horsepower as number) || undefined, flowRate: (row.flow_rate as number) || undefined, pumpType: (row.pump_type as string) || undefined } as Pump;
      case 'pivot':
        return { ...baseEntity, type: 'pivot', radius: (row.radius as number) || undefined, acres: (row.acres as number) || undefined, pivotType: (row.pivot_type as string) || undefined } as Pivot;
      case 'land':
        return { ...baseEntity, type: 'land', acres: (row.acres as number) || undefined, cropType: (row.crop_type as string) || undefined, soilType: (row.soil_type as string) || undefined } as Land;
      default:
        throw new Error(`Unknown entity type: ${type}`);
    }
  }

  async saveEntity(entity: EntityType): Promise<void> {
    const supabaseClient = getSupabase();
    const row = this.entityToRow(entity);
    const tableName = `${entity.type}s`;
    
    const { error } = await supabaseClient
      .from(tableName)
      .upsert(row, { onConflict: 'id' });

    if (error) {
      throw new Error(`Failed to save entity: ${error.message}`);
    }
  }

  async getEntitiesByType(type: MapElement['type']): Promise<EntityType[]> {
    if (['hazard', 'maintenance', 'custom'].includes(type)) {
      return [];
    }
    
    const supabaseClient = getSupabase();
    const tableName = `${type}s`;
    const { data, error } = await supabaseClient
      .from(tableName)
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      // Table might not exist yet, return empty array
      console.warn(`Table ${tableName} might not exist:`, error.message);
      return [];
    }

    return (data || []).map((row) => this.rowToEntity(row, type));
  }

  async getEntityById(type: MapElement['type'], id: string): Promise<EntityType | null> {
    if (['hazard', 'maintenance', 'custom'].includes(type)) {
      return null;
    }
    
    const supabaseClient = getSupabase();
    const tableName = `${type}s`;
    const { data, error } = await supabaseClient
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to get entity: ${error.message}`);
    }

    return data ? this.rowToEntity(data, type) : null;
  }
}

// Seed the database with dummy data
export async function seedDatabase(db: DrawingDatabase): Promise<void> {
  const now = new Date();
  
  // Canal entities
  const canals: Canal[] = [
    {
      id: 'canal-1',
      type: 'canal',
      name: 'Main Canal',
      description: 'Primary irrigation canal',
      status: 'active',
      length: 5280,
      capacity: 50,
      contactName: 'John Smith',
      contactPhone: '(555) 123-4567',
      contactEmail: 'john.smith@waterdistrict.gov',
      contactRole: 'Canal Manager',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'canal-2',
      type: 'canal',
      name: 'West Branch Canal',
      description: 'Western distribution canal',
      status: 'active',
      length: 3200,
      capacity: 25,
      contactName: 'Maria Rodriguez',
      contactPhone: '(555) 234-5678',
      contactEmail: 'maria.rodriguez@westbranch.com',
      contactRole: 'Canal Owner',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'canal-3',
      type: 'canal',
      name: 'East Branch Canal',
      description: 'Eastern distribution canal',
      status: 'maintenance',
      length: 4100,
      capacity: 30,
      contactName: 'David Chen',
      contactPhone: '(555) 345-6789',
      contactEmail: 'david.chen@eastbranch.org',
      contactRole: 'Maintenance Supervisor',
      createdAt: now,
      updatedAt: now,
    },
  ];

  // Ride entities
  const rides: Ride[] = [
    {
      id: 'ride-1',
      type: 'ride',
      name: 'North Section Ride',
      description: 'Daily inspection route for north section',
      status: 'active',
      routeLength: 12.5,
      riderId: 'rider-001',
      contactName: 'Tom Wilson',
      contactPhone: '(555) 456-7890',
      contactEmail: 'tom.wilson@ditchrider.com',
      contactRole: 'Ditch Rider',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'ride-2',
      type: 'ride',
      name: 'South Section Ride',
      description: 'Daily inspection route for south section',
      status: 'active',
      routeLength: 8.3,
      riderId: 'rider-002',
      contactName: 'Sarah Johnson',
      contactPhone: '(555) 567-8901',
      contactEmail: 'sarah.johnson@ditchrider.com',
      contactRole: 'Senior Ditch Rider',
      createdAt: now,
      updatedAt: now,
    },
  ];

  // Headgate entities
  const headgates: Headgate[] = [
    {
      id: 'headgate-1',
      type: 'headgate',
      name: 'Main Headgate',
      description: 'Primary flow control gate',
      status: 'active',
      maxFlow: 100,
      gateType: 'radial',
      contactName: 'Robert Miller',
      contactPhone: '(555) 678-9012',
      contactEmail: 'robert.miller@gates.com',
      contactRole: 'Gate Operator',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'headgate-2',
      type: 'headgate',
      name: 'West Distribution Gate',
      description: 'Controls flow to west branch',
      status: 'active',
      maxFlow: 40,
      gateType: 'slide',
      contactName: 'Lisa Thompson',
      contactPhone: '(555) 789-0123',
      contactEmail: 'lisa.thompson@westgate.org',
      contactRole: 'Operations Manager',
      createdAt: now,
      updatedAt: now,
    },
  ];

  // Meter entities
  const meters: Meter[] = [
    {
      id: 'meter-1',
      type: 'meter',
      name: 'Main Flow Meter',
      description: 'Measures main canal flow',
      status: 'active',
      meterType: 'flow',
      units: 'CFS',
      contactName: 'Mike Anderson',
      contactPhone: '(555) 890-1234',
      contactEmail: 'mike.anderson@meters.com',
      contactRole: 'Meter Technician',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'meter-2',
      type: 'meter',
      name: 'Pressure Gauge #1',
      description: 'Monitors system pressure',
      status: 'active',
      meterType: 'pressure',
      units: 'PSI',
      contactName: 'Jennifer Davis',
      contactPhone: '(555) 901-2345',
      contactEmail: 'jennifer.davis@monitoring.gov',
      contactRole: 'Monitoring Specialist',
      createdAt: now,
      updatedAt: now,
    },
  ];

  // Save all entities
  const allEntities = [...canals, ...rides, ...headgates, ...meters];
  for (const entity of allEntities) {
    try {
      await db.saveEntity(entity);
      console.log(`Seeded entity: ${entity.name} (${entity.type})`);
    } catch (error) {
      console.warn(`Failed to seed entity ${entity.id}:`, error);
    }
  }
}

// Export a singleton instance
export const drawingDb = new DrawingDatabase();
