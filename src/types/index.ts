export interface PrivacySettings {
  roles: {
    users: boolean;
    ditchRiders: boolean;
    admins: boolean; // Always true and disabled
  };
  specificUsers?: string[]; // Array of user IDs or usernames
  linkedEntity?: boolean; // Whether the linked entity has access
}

export interface MapElement {
  id: string | number;
  type: 'ride' | 'canal' | 'headgate' | 'meter' | 'pump' | 'pivot' | 'land' | 'hazard' | 'maintenance' | 'custom';
  name: string;
  position: [number, number];
  color: string;
  farm?: string;
  description?: string;
  lastUpdated?: Date;
  data?: Record<string, unknown>;
  category: 'infrastructure' | 'monitoring' | 'other';
  privacy?: PrivacySettings;
}

export interface LayerCategory {
  id: string;
  name: string;
  count: number;
  visible: boolean;
  items: LayerItem[];
}

export interface LayerItem {
  id: string;
  name: string;
  visible: boolean;
  type: MapElement['type'];
}

export interface DrawingTool {
  id: 'move' | 'line' | 'draw' | 'area' | 'point';
  name: string;
  description: string;
}

export interface FilterCategory {
  id: string;
  name: string;
  types: {
    id: MapElement['type'];
    name: string;
    count: number;
  }[];
}

export interface FilterState {
  searchQuery: string;
  categories: Record<string, boolean>;
  items: Record<string, boolean>;
  types: Record<MapElement['type'] | DrawingElement['type'], boolean>;
  showPendingReview?: boolean; // Filter for elements pending admin review
}

export interface FilterUpdate {
  category?: string;
  item?: string;
  type?: MapElement['type'] | DrawingElement['type'];
  searchQuery?: string;
  checked?: boolean;
  showPendingReview?: boolean; // Add support for pending review filter
}

export interface FileAttachment {
  id: string;
  name: string;
  type: 'file' | 'link';
  url: string;
  size?: number; // in bytes, for uploaded files
  mimeType?: string; // for uploaded files
  createdAt: Date;
}

export interface Issue {
  id: string;
  description: string;
  createdBy?: string;
  createdByRole?: 'User' | 'Ditch Rider' | 'Admin';
  createdAt: Date;
  resolvedBy?: string;
  resolvedAt?: Date;
}

// Drawing-related interfaces
export interface DrawingElement {
  id: string;
  type: 'line' | 'polygon' | 'polyline' | 'point';
  coordinates: [number, number][] | [number, number];
  markerPosition?: [number, number]; // Center point for marker display
  // Map element fields - all drawings can become map elements
  elementType?: MapElement['type']; // The actual element type (pivot, meter, etc.)
  linkedEntityId?: string; // ID of the linked entity (canal, ride, etc.)
  name: string;
  color: string;
  farm?: string;
  description?: string;
  status?: 'active' | 'inactive' | 'maintenance';
  lastUpdated?: Date;
  category?: 'infrastructure' | 'monitoring' | 'other';
  privacy?: PrivacySettings;
  cfs?: number; // CFS (cubic feet per second) value for flow rate
  order?: number; // Water order amount in CFS
  notes?: string; // Free-form notes text
  files?: FileAttachment[]; // File attachments and links
  // Contact information for infrastructure elements (canal, ride, headgate)
  contactName?: string; // Contact person name
  contactPhone?: string; // Contact phone number
  contactEmail?: string; // Contact email address
  contactRole?: string; // Contact role/title (e.g., "Canal Owner", "Ditch Rider")
  contactPrivacy?: PrivacySettings; // Privacy setting for contact information
  // Issues system
  issue?: Issue; // Only one issue is allowed per element
  // Approval system fields
  approvalStatus?: 'pending' | 'approved' | 'rejected'; // Approval status for admin review
  createdBy?: string; // User ID or name who created the element
  createdByRole?: 'User' | 'Ditch Rider' | 'Admin'; // Role of the user who created the element
  reviewedBy?: string; // Admin ID or name who reviewed the element
  reviewedAt?: Date; // Date when the element was reviewed
  reviewNotes?: string; // Admin notes from the review
  // Drawing-specific properties
  properties: {
    strokeWeight: number;
    fillOpacity?: number;
    tool: 'line' | 'draw' | 'area' | 'point';
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface DrawingState {
  isDrawing: boolean;
  currentTool: string | null;
  elements: DrawingElement[];
  selectedElement: DrawingElement | null;
}

// Entity interfaces for database linking
export interface BaseEntity {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'maintenance';
  // Contact information
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactRole?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Canal extends BaseEntity {
  type: 'canal';
  length?: number; // in feet
  capacity?: number; // in CFS
  maxFlow?: number; // in CFS
}

export interface Ride extends BaseEntity {
  type: 'ride';
  routeLength?: number; // in miles
  riderId?: string;
}

export interface Headgate extends BaseEntity {
  type: 'headgate';
  maxFlow?: number; // in CFS
  gateType?: string;
}

export interface Meter extends BaseEntity {
  type: 'meter';
  meterType?: 'flow' | 'pressure' | 'level';
  units?: string;
}

export interface Pump extends BaseEntity {
  type: 'pump';
  horsepower?: number;
  flowRate?: number; // in CFS
  pumpType?: string;
}

export interface Pivot extends BaseEntity {
  type: 'pivot';
  radius?: number; // in feet
  acres?: number;
  pivotType?: string;
}

export interface Land extends BaseEntity {
  type: 'land';
  acres?: number;
  cropType?: string;
  soilType?: string;
}

export type EntityType = Canal | Ride | Headgate | Meter | Pump | Pivot | Land;
