# CLAUDE.md - Water Infrastructure Interactive Map

*This file provides comprehensive guidance to Claude Code (claude.ai/code) and development teams when working with this repository. It serves as both technical specification and living documentation.*

## Project Overview

**Project Name**: Water Infrastructure Interactive Map
**Project Type**: B2B SaaS Water System Management Platform
**Target Users**: Canal companies, water district administrators, ditch riders, and farmers
**Primary Goal**: Create a comprehensive mapping solution for visualizing, managing, and tracking water infrastructure with role-based privacy controls and approval workflows

### Current Status
This project exists in **two parallel implementations**:

1. **Next.js Prototype** (Current/Reference)
   - Fully functional reference implementation
   - Built with Next.js 15, React 19, TypeScript, Leaflet
   - Deployed on Vercel with Supabase backend
   - Serves as behavioral reference and testing ground

2. **Bubble.io Production** (Target/In Progress)
   - Production implementation for scalability and maintainability
   - Built with Bubble.io no-code platform
   - Custom JavaScript extensions for advanced features
   - 8-week implementation timeline (see BUBBLE_IMPLEMENTATION_PLAN.md)

### Business Objectives
- Enable efficient water system management through visual mapping
- Streamline issue reporting and maintenance workflows
- Provide role-based access to infrastructure data
- Improve operational visibility and decision-making
- Support mobile field operations (40vh map / 60vh details on mobile)

### Architecture Philosophy
This project follows a **dual-implementation strategy** with these core principles:

1. **Reference-Driven Development**: Next.js app provides the behavioral specification
2. **Feature Parity Goal**: 100% feature alignment between implementations
3. **Mobile-First Design**: Responsive layouts optimized for field use
4. **Security by Default**: Role-based access and privacy controls from day one
5. **Progressive Enhancement**: Start with MVP, expand iteratively

---

## Tech Stack

### Current Next.js Stack (Reference Implementation)

**Frontend**:
- Framework: Next.js 15 (App Router) + React 19 + TypeScript
- Maps: Leaflet 1.9.4 + React Leaflet 5.0
- UI Components: shadcn/ui + Radix UI + Tailwind CSS
- State Management: React hooks (usePersistentDrawing custom hook)

**Backend**:
- Database: Supabase (production) / SQLite (legacy)
- API: Next.js API routes (`/src/app/api/`)
- Authentication: Manual role system (User, Ditch Rider, Admin)

**Deployment**:
- Hosting: Vercel
- Database: Supabase Postgres
- Environment Variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

### Target Bubble.io Stack (Production Implementation)

**Frontend**:
- Platform: Bubble.io visual editor with responsive design system
- Maps: Leafy Maps plugin (ZeroQode) + custom JavaScript extensions
- Custom Drawing: JavaScript injection for freehand capability
- JavaScript Bridge: Toolbox plugin for Bubble-JS communication

**Backend**:
- Database: Bubble.io native database (with migration from Supabase)
- Workflows: Bubble.io backend workflows and API endpoints
- Authentication: Bubble.io user management with custom role field

**Mobile**:
- BDK wrapper for native Android/iOS functionality
- Responsive bottom sheet pattern (60vh details panel)

---

## Implementation Strategy & Technical Approach

### Current Development Status: Planning Complete, Ready for Bubble Implementation

### Phase 1: Foundation & Database (Week 1) - NEXT UP

**Focus**: Core database structure and plugin setup

#### Database Architecture (Bubble.io)

```
Core Data Types:
├── Drawings (main table)
│   ├── id (unique id)
│   ├── name (text)
│   ├── type (text) - "line" | "polygon" | "polyline" | "point"
│   ├── coordinates (text) - JSON array of [lat, lng]
│   ├── markerPosition (text) - JSON [lat, lng]
│   ├── elementType (text) - 11 types (ride, canal, lateral, headgate, meter, pump, pivot, land, hazard, maintenance, custom)
│   ├── linkedEntity (Drawing Entity) - relationship
│   ├── color (text) - hex color
│   ├── description (text)
│   ├── status (text) - "active" | "inactive" | "maintenance"
│   ├── category (text) - "infrastructure" | "monitoring" | "other"
│   ├── privacy (text) - JSON: {roles: {users: bool, ditchRiders: bool, admins: bool}, specificUsers: [ids], linkedEntity: bool}
│   ├── approvalStatus (text) - "pending" | "approved" | "rejected"
│   ├── createdBy (User) - relationship
│   ├── createdByRole (text) - "User" | "Ditch Rider" | "Admin"
│   ├── reviewedBy (User) - relationship
│   ├── reviewedAt (date)
│   ├── reviewNotes (text)
│   ├── contactName (text)
│   ├── contactPhone (text)
│   ├── contactEmail (text)
│   ├── contactRole (text)
│   ├── contactPrivacy (text) - JSON privacy object
│   ├── files (text) - JSON array of file objects
│   ├── notes (text)
│   ├── properties (text) - JSON: {strokeWeight: number, fillOpacity: number, tool: string}
│   ├── createdAt (date)
│   └── modifiedAt (date)
│
├── Drawing Entities (infrastructure master data)
│   ├── id (unique id)
│   ├── type (text) - "canal" | "ride" | "lateral" | "headgate" | "meter" | "pump" | "pivot" | "land"
│   ├── name (text)
│   ├── description (text)
│   ├── status (text)
│   ├── contactName (text)
│   ├── contactPhone (text)
│   ├── contactEmail (text)
│   ├── contactRole (text)
│   ├── maxFlow (number) - CFS
│   ├── currentOrder (number) - CFS (calculated from daily_recurring_order_item)
│   ├── metadata (text) - JSON for type-specific fields + drawing origin tracking
│   │   Example: {
│   │     "maxFlow": 100,              // type-specific
│   │     "acres": 50,                 // type-specific
│   │     "createdFromDrawingId": "abc123",  // origin tracking
│   │     "coordinates": [[lat, lng]], // origin tracking
│   │     "markerPosition": [lat, lng],// origin tracking
│   │     "color": "#3B82F6"           // origin tracking
│   │   }
│   ├── createdAt (date)
│   └── modifiedAt (date)
│
├── Issues
│   ├── id (unique id)
│   ├── drawing (Drawing) - relationship
│   ├── description (text)
│   ├── createdBy (User)
│   ├── createdByRole (text)
│   ├── createdAt (date)
│   ├── resolvedBy (User)
│   ├── resolvedAt (date)
│   └── status (text) - "open" | "resolved"
│
└── Users (enhanced built-in type)
    ├── role (text) - "User" | "Ditch Rider" | "Admin"
    └── assignedRides (list of Drawing Entities)
```

#### Option Sets (Bubble.io)
```
- DrawingTypes: line, polygon, polyline, point
- ElementTypes: ride, canal, lateral, headgate, meter, pump, pivot, land, hazard, maintenance, custom
- ValidEntityTypes: canal, ride, lateral, headgate, meter, pump, pivot, land
  (Used for "Create Entity from Drawing" - excludes hazard, maintenance, custom)
- Roles: User, Ditch Rider, Admin
- ApprovalStatus: pending, approved, rejected
- Colors: blue, red, green, yellow, purple, orange
```

#### Current Database Schema (Next.js/Supabase)
```
Tables: drawings, canals, rides, headgates, meters, pumps, pivots, lands

Migrations (run in order):
1. supabase-schema.sql - Base schema
2. supabase-migration-contact-fields.sql - Contact info
3. supabase-migration-privacy-complete.sql - Privacy system
```

#### Technical Implementation Notes
- **Use Option Sets** for all status fields and roles to ensure data consistency
- **Implement soft deletes** by adding "is_deleted" boolean (if needed)
- **Design for multi-tenancy** from day one (if multiple canal companies)
- **Metadata field** tracks drawing origin for "Create Entity from Drawing" feature
- **Coordinate storage** as JSON text fields (1MB limit, use Douglas-Peucker simplification)

---

### Phase 2: Map Setup & Rendering (Week 2)

**Focus**: Leaflet map integration and drawing rendering

#### Page Structure (Bubble.io)
```
Main Page (index)
├── Group: Full-page container
│   ├── Group: Header (z-index: 50)
│   │   ├── Floating Group: Top-left controls
│   │   │   ├── Button: Layers toggle (with badge for "To Review")
│   │   │   └── Input: Search bar (Idaho locations)
│   │   └── Floating Group: Top-right controls
│   │       └── Button: Export
│   │
│   ├── Group: Map container (z-index: 0)
│   │   └── Leafy Map element (ID: "main_map")
│   │
│   ├── Floating Group: Layers panel (left, conditional, z-index: 40)
│   │   └── Reusable Element: LayersPanel
│   │
│   ├── Floating Group: Details panel (right, conditional, z-index: 40)
│   │   └── Reusable Element: DetailsPanel
│   │
│   └── Floating Group: Bottom toolbar (z-index: 30)
│       └── Reusable Element: DrawingToolbar
```

#### Map Initialization Script (Page Header)
```javascript
<script>
// 1. Capture Leaflet map instance (from freehand investigation)
(function() {
  const originalMapInit = L.Map.prototype.initialize;
  L.Map.prototype.initialize = function(id, options) {
    const result = originalMapInit.call(this, id, options);
    if (id === 'main_map' || this._container.id.includes('leafy')) {
      window.__leafy_found_map = this;
      console.log('✅ Leaflet map captured:', this);
      if (window.bubble_fn_mapReady) {
        window.bubble_fn_mapReady();
      }
    }
    return result;
  };
})();

// 2. Drawing state storage
window.__drawing_state = {
  currentTool: null,
  isDrawing: false,
  drawings: [],
  selectedDrawing: null
};

// 3. Douglas-Peucker simplification (for coordinate reduction)
window.simplifyPath = function(points, tolerance = 0.0001) {
  // Implementation reduces coordinate arrays for freehand drawings
  // Critical for staying within Bubble text field limits
};
</script>
```

---

### Phase 3: Drawing Tools (Week 3)

**Focus**: Implement all 4 drawing tools with freehand as priority

#### Drawing Tools Available
1. **Point** - Single click marker placement
2. **Line** - Click-based polyline (2+ points, double-click to finish)
3. **Freehand (Draw)** - Mousedown + drag + mouseup for smooth polylines
4. **Area** - Click-based polygon (3+ points, double-click to finish)

#### Custom Freehand Implementation (Proven Working)
```javascript
// From freehand_draw_investigation_report.md - PROVEN SOLUTION
window.__leafy_freehand = {
  isDrawing: false,
  currentPath: [],
  previewLayer: null,

  start: function() {
    var map = window.__leafy_found_map;
    map.dragging.disable();
    map.getContainer().style.cursor = 'crosshair';

    map.once('pointerdown', function(e) {
      // Capture points during drag
      // Simplify path on mouseup
      // Return GeoJSON to Bubble via bubble_fn_freehandComplete()
    });
  }
};
```

**Key Implementation Details**:
- Map instance accessed via `window.__leafy_found_map` (proven pattern)
- Douglas-Peucker simplification reduces coordinate count
- GeoJSON output stored in `window.__leafy_last_freehand`
- Bubble workflow triggered via custom events

---

### Phase 4: UI Components (Week 4)

**Focus**: Build reusable elements for toolbar, panels, and controls

#### Reusable Elements

**1. DrawingToolbar** (Bottom floating group)
```
Components:
├── Mode toggle (Edit/View) - Admin only
├── Role selector (View mode) - Admin only
└── Tool buttons (Edit mode):
    ├── Select (cursor icon)
    ├── Line (minus icon)
    ├── Freehand/Draw (pen icon)
    ├── Area (square icon)
    └── Point (map-pin icon)

Custom States:
- currentTool (text)
- isEditMode (yes/no)
- viewAsRole (text)
```

**2. LayersPanel** (Left sidebar)
```
Components:
├── Header with close button
├── Search input
├── "To Review" section (Admin only, badge with count)
└── Categorized element types:
    ├── INFRASTRUCTURE: Rides, Canals, Laterals, Headgates
    ├── MONITORING: Meters, Pumps, Pivots
    └── OTHER: Land, Hazards, Maintenance, Custom

Each type shows:
- Checkbox for filtering
- Count of visible elements
```

**3. DetailsPanel** (Right sidebar)
```
Layout:
├── Header
│   ├── Editable name
│   ├── Delete button
│   ├── Create Entity button (NEW - Admin only)
│   │   └── Visible when: Admin + not linked + valid entity type
│   └── Close button
├── Issues section
├── Accordion: Details
│   ├── Type dropdown (elementType)
│   ├── Link to entity dropdown
│   ├── Description
│   └── Privacy controls (Users, Ditch Riders, Admins checkboxes)
├── Accordion: Contact Information
│   ├── Auto-populated from linked entity
│   └── Contact privacy controls
├── Accordion: Files & Links
├── Accordion: Notes
└── Accordion: Metadata
    ├── Created by + date
    ├── Modified date
    ├── Reviewed by + date
    └── Review notes
```

---

### Phase 5: Business Logic (Week 5-6)

**Focus**: Privacy filtering, approval workflow, entity linking

#### 5.1 Privacy Filtering

**Privacy Rules Pattern**:
```
Drawing Level:
- Admins always have access (cannot be disabled)
- Ditch Riders have access if privacy.roles.ditchRiders = true
- Users have access if privacy.roles.users = true
- Specific users have access if user ID in privacy.specificUsers array
- Linked entity users have access if privacy.linkedEntity = true
```

**Implementation** (Backend Workflow):
```
Function: canUserAccessDrawing
Input: Drawing, User

Logic:
  If Drawing's privacy → roles → admins AND User's role = "Admin":
    Return Yes

  If Drawing's privacy → roles → ditchRiders AND User's role = "Ditch Rider":
    Return Yes

  If Drawing's privacy → roles → users AND User's role = "User":
    Return Yes

  If Drawing's privacy → specificUsers contains User's unique id:
    Return Yes

  If Drawing's privacy → linkedEntity AND User has relationship to linked entity:
    Return Yes

  Return No
```

#### 5.2 Approval Workflow

**Flow**:
```
Non-Admin creates drawing → approvalStatus = "pending" → Admin reviews → Approve/Reject

Approve:
1. Update Drawing: approvalStatus = "approved", reviewedBy, reviewedAt
2. Send email notification to creator
3. Drawing becomes visible per privacy settings

Reject:
1. Update Drawing: approvalStatus = "rejected", reviewedBy, reviewedAt, reviewNotes
2. Send email notification with reason
3. Drawing remains hidden from non-creators
```

#### 5.3 Entity Linking & Contact Auto-population

**Standard Linking Flow**:
```
User selects entity from "Link to" dropdown
→ Fetch entity details
→ Auto-populate: contactName, contactPhone, contactEmail, contactRole
→ Display: maxFlow (if water system), currentOrder (from daily_recurring_order_item)
→ User can override contact info if needed
```

#### 5.4 Create Entity from Drawing (NEW FEATURE)

**Purpose**: Solve architecture gap - enable admins to promote drawings into reusable Drawing Entities

**Workflow**:
```
When "Create Entity" button clicked:

Step 1: Validate eligibility
  - Element type in ValidEntityTypes (canal, ride, lateral, headgate, meter, pump, pivot, land)
  - Not already linked to entity
  - User is Admin

Step 2: Show confirmation dialog
  - Explain entity creation
  - Confirm user intent

Step 3: Create Drawing Entity
  - Inherit: name, description, contact info
  - Store origin: coordinates, markerPosition, color in metadata JSON
  - Set status: "active"

Step 4: Auto-link drawing to new entity
  - Update Drawing.linkedEntity = new entity

Step 5: Success feedback
  - Hide "Create Entity" button
  - Update "Link to" dropdown
  - Trigger contact auto-population
```

**Benefits**:
- Self-service entity creation (no database access needed)
- Data accuracy (inherits from actual drawing)
- Bottom-up infrastructure mapping
- Admin quality control

---

### Phase 6: Mobile Responsiveness (Week 7)

**Focus**: Optimize for field operations on mobile devices

#### Mobile Layout Strategy

**Responsive Breakpoint**: 768px

**Desktop Layout**:
```
┌────────────────────────────────────────────────────────┐
│  Layers Panel  │     Map (full height)    │  Details  │
│  (left 300px)  │                           │  (right   │
│                │                           │   400px)  │
│                │     Bottom Toolbar        │           │
└────────────────────────────────────────────────────────┘
```

**Mobile Layout**:
```
┌──────────────────────────────┐
│      Map (40vh)              │  ← Reduced height when details open
├──────────────────────────────┤
│   Bottom Sheet (60vh)        │  ← Details panel as bottom sheet
│   - Drag handle              │
│   - Scrollable content       │
│   - Collapsible sections     │
└──────────────────────────────┘

Layers panel: Full-screen overlay when opened
Toolbar: Full-width, touch-friendly buttons
```

#### Mobile-Specific Workflows

**Center Marker on Selection** (Mobile):
```
When marker selected on mobile:
  If viewport width < 768px:
    Calculate offset for bottom sheet (60vh)
    Pan map to center marker above bottom sheet
    Animate transition (300ms)
```

**Native Map Integration** (Optional):
```
If BDK Native plugin available:
  Button: "Open in Maps"
  → Triggers native map app with coordinates

Else:
  Button: "Copy Coordinates"
  → Copies lat/lng to clipboard
```

---

### Phase 7: Testing & Quality Assurance (Week 8)

**Focus**: Comprehensive testing before data migration and deployment

#### Test Checklist

**Drawing Functionality**:
- [ ] All 4 drawing tools create elements
- [ ] Drawings save to database correctly
- [ ] Drawings reload on page refresh
- [ ] Drawings persist across sessions
- [ ] Coordinate simplification works (freehand stays under 1MB)

**Privacy & Access**:
- [ ] Admin sees all drawings
- [ ] Ditch Rider sees filtered drawings per privacy
- [ ] User sees filtered drawings per privacy
- [ ] Privacy settings update correctly
- [ ] Linked entity privacy works

**Approval Workflow**:
- [ ] Non-admin drawings default to pending
- [ ] Admin can approve/reject
- [ ] Pending count badge updates
- [ ] Notifications sent on approval/rejection
- [ ] Approved drawings visible per privacy
- [ ] Rejected drawings remain hidden

**Entity Linking**:
- [ ] Contact info auto-populates from linked entity
- [ ] Water order data displays (CFS)
- [ ] Max flow displays when available

**Entity Creation from Drawing**:
- [ ] "Create Entity" button visible to Admins on eligible drawings
- [ ] Button hidden for non-Admins
- [ ] Button hidden when already linked
- [ ] Button hidden for invalid types (hazard, maintenance, custom)
- [ ] Confirmation dialog shows
- [ ] Entity created with all inherited fields
- [ ] Entity metadata includes drawing origin
- [ ] Drawing auto-links after creation
- [ ] New entity appears in "Link to" dropdowns
- [ ] Contact info auto-populates from new entity
- [ ] Validation prevents duplicate entity creation

**Issues**:
- [ ] Issues can be created on eligible markers
- [ ] Issue status shows in tooltips
- [ ] Hazard markers require approval

**Mobile**:
- [ ] Map renders on Android/iOS
- [ ] Bottom sheet functions properly
- [ ] Map centering on selection works
- [ ] Touch drawing works smoothly

**Performance**:
- [ ] Map loads < 2 seconds
- [ ] Drawing save/load < 500ms
- [ ] 1000+ drawings render smoothly
- [ ] Search/filter is responsive

---

### Phase 8: Data Migration & Deployment

**Export from Next.js/Supabase**:
```bash
# Script to export all drawings
curl https://[your-app].vercel.app/api/drawings > drawings_export.json

# Or via Supabase SQL
SELECT * FROM drawings WHERE approval_status = 'approved';
```

**Import to Bubble**:
```
Workflow: "Import Drawings"
1. Upload JSON file
2. Parse JSON via JavaScript
3. Create Drawing records (bulk)
4. Verify import counts
5. Reload map
```

---

## Critical Architecture Rules

### ⚠️ Next.js Client/Server Boundary (MOST IMPORTANT)

**NEVER import database modules in client components** - this will cause build errors.

❌ **Client components** (`'use client'`):
- NEVER import from `@/lib/database-supabase.ts`
- NEVER import Node.js modules (fs, path, etc.)
- NEVER access environment variables directly

✅ **Client components** - Correct Pattern:
```typescript
'use client';

// ✅ Use fetch() to call API routes
const response = await fetch('/api/drawings');
const data = await response.json();

// ✅ Use client-side service layer
import { drawingService } from '@/lib/drawingService';
const drawings = await drawingService.loadAllDrawings();
```

✅ **API routes** (`/src/app/api/`) - Correct Pattern:
```typescript
// ✅ Import database directly in API routes
import { supabase } from '@/lib/database-supabase';

export async function GET() {
  const { data } = await supabase.from('drawings').select('*');
  return Response.json(data);
}
```

**Data Flow Architecture**:
```
Client Components → drawingService → API Routes → Database (Supabase)
                ↑                                        ↓
                └────────── fetch() HTTP calls ──────────┘
```

See `AGENTS.md` for detailed client/server architecture patterns.

---

## Bubble.io Best Practices & Patterns

### Database Design Patterns

#### 1. The "Hub and Spoke" Pattern
```
Canal System (Hub)
├── Users (Spoke)
├── Drawings (Spoke)
├── Drawing Entities (Spoke)
└── Issues (indirect via Drawings)
```
**Rationale**: Enables clean multi-tenancy and efficient privacy rules (if multiple canal companies)

#### 2. The "Status Machine" Pattern
```
Drawing Approval Flow:
pending → approved
        ↓
    rejected

Issue Flow:
open → resolved
```
**Implementation**: Use Option Sets with predefined transitions in workflows

#### 3. The "Calculated Field" Pattern
```
Project/Statistics Data Type:
├── total_drawings (number) - calculated
├── pending_count (number) - calculated
├── total_elements_by_type (JSON) - calculated
```
**Rationale**: Pre-calculate expensive operations for dashboard performance

### Workflow Architecture

#### Frontend Workflows (User Interactions)
```
User Actions:
├── Select Tool → Enable Drawing Mode → Capture Coordinates → Save Drawing
├── Select Element → Load Details → Show Panel → Update Form
├── Link Entity → Fetch Entity → Auto-populate Contact → Update Drawing
└── Create Entity → Validate → Confirm → Create → Link → Refresh
```

#### Backend Workflows (Scheduled/Heavy Operations)
```
Scheduled Operations:
├── Daily: Update water order data from daily_recurring_order_item
├── Weekly: Generate usage reports for admins
├── Monthly: Archive old rejected drawings
└── On-demand: Bulk entity creation, data exports
```

### JavaScript Bridge Pattern

**Communication Flow**:
```
Bubble UI → Toolbox "Run JavaScript" → window.bubble_fn_customFunction()
                                             ↓
                                    Leaflet map operations
                                             ↓
                              window.bubble_fn_triggerEvent() → Bubble Workflow
```

**Example**:
```javascript
// Bubble triggers JS
bubble_fn_enableFreehand();

// JS operates on map
window.__leafy_freehand.start();

// JS returns to Bubble
window.bubble_fn_freehandComplete(geojsonString);
```

---

## Key Components & State Management

### Next.js Components

**Main Page** (`src/app/page.tsx`):
- Central orchestration component
- Uses `usePersistentDrawing()` hook for state
- Manages filter state, tool selection, role switching
- Coordinates between map, tools, details panel, filters

**Key Components**:
- `InteractiveMap`: Leaflet map with dynamic import (SSR disabled)
- `DrawingTools`: Bottom toolbar (tools, mode toggle, role switcher)
- `LayerFilters`: Left sidebar (filters, search, pending badge)
- `DrawingElementDetailsPanel`: Right panel (details form)
- `DrawingOverlay`: Canvas overlay for live drawing preview
- `DrawingElements`: Renders saved elements on map

### Next.js State Management

**usePersistentDrawing Hook** (`src/lib/usePersistentDrawing.ts`):
```typescript
Features:
- Auto-loads drawings on mount
- Auto-saves on changes (500ms debounce)
- Validates before saving (filters blob URLs)
- Immediate save for create/update/delete
- Returns: { drawingState, createElement, updateElement, deleteElement }
```

**drawingService** (`src/lib/drawingService.ts`):
```typescript
Client-side API wrapper:
- loadAllDrawings()
- saveDrawing(drawing)
- updateDrawing(id, updates)
- deleteDrawing(id)
- All methods use fetch() to call API routes
```

### Bubble.io State Management

**Page Custom States**:
```
- currentTool (text) - "select" | "line" | "draw" | "area" | "point"
- isEditMode (yes/no) - Admin mode toggle
- viewAsRole (text) - "User" | "Ditch Rider" | "Admin"
- selectedDrawing (Drawing) - Currently selected element
- filteredDrawings (list of Drawings) - After privacy filtering
- searchQuery (text) - Current search text
- showLayersPanel (yes/no) - Panel visibility
- showDetailsPanel (yes/no) - Panel visibility
```

**Element Custom States**:
```
Map Element:
- drawingCoordinates (list of geographic addresses) - Live drawing path
- isDrawing (yes/no) - Drawing in progress
- currentDrawingMode (text) - Active tool
```

---

## API Routes

### Next.js API Endpoints

```
GET    /api/drawings                    → List all drawings (filtered by role)
POST   /api/drawings                    → Create new drawing
DELETE /api/drawings                    → Clear all drawings (dev only)

GET    /api/drawings/[id]               → Get single drawing
PUT    /api/drawings/[id]               → Update drawing
DELETE /api/drawings/[id]               → Delete single drawing

POST   /api/drawings/approval           → Approve/reject drawing
GET    /api/drawings/approval?action=count → Get pending count

GET    /api/entities/[type]             → List entities by type (canals, rides, etc.)
```

### Bubble.io Workflows (API-like)

```
Backend Workflow: Load Drawings
- Input: User role
- Output: Filtered list of drawings
- Privacy filtering applied

Backend Workflow: Save Drawing
- Input: Drawing data, User
- Output: Created drawing
- Auto-set approvalStatus based on role

Backend Workflow: Create Entity from Drawing
- Input: Drawing ID
- Output: New Drawing Entity
- Auto-link drawing to entity

Backend Workflow: Filter by Privacy
- Input: Drawing, User
- Output: Boolean (can access)
- Reusable privacy check logic
```

---

## Key Type Definitions

### DrawingElement (TypeScript - Next.js)

```typescript
interface DrawingElement {
  id: string;
  type: 'line' | 'polygon' | 'polyline' | 'point';
  coordinates: [number, number][] | [number, number];
  markerPosition?: [number, number]; // Center for marker display

  // Element metadata
  elementType?: 'ride' | 'canal' | 'lateral' | 'headgate' | 'meter' | 'pump' |
                'pivot' | 'land' | 'hazard' | 'maintenance' | 'custom';
  linkedEntityId?: string; // ID of linked entity
  name: string;
  color: string;
  description?: string;
  status?: 'active' | 'inactive' | 'maintenance';
  category?: 'infrastructure' | 'monitoring' | 'other';

  // Privacy system
  privacy?: PrivacySettings;

  // Approval system
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  createdBy?: string;
  createdByRole?: 'User' | 'Ditch Rider' | 'Admin';
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;

  // Contact information
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactRole?: string;
  contactPrivacy?: PrivacySettings;

  // Additional features
  issue?: Issue; // Single issue per element
  files?: FileAttachment[]; // File attachments and links
  notes?: string;

  // Drawing properties
  properties: {
    strokeWeight: number;
    fillOpacity?: number;
    tool: 'line' | 'draw' | 'area' | 'point';
  };

  createdAt: Date;
  updatedAt: Date;
}
```

### PrivacySettings

```typescript
interface PrivacySettings {
  roles: {
    users: boolean;
    ditchRiders: boolean;
    admins: boolean; // Always true, disabled in UI
  };
  specificUsers?: string[]; // Array of user IDs
  linkedEntity?: boolean; // Access via entity relationship
}
```

### Entity Types

```typescript
interface BaseEntity {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'maintenance';
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactRole?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Extended types: Canal, Ride, Headgate, Meter, Pump, Pivot, Land
// Each adds type-specific fields (e.g., Canal has maxFlow, capacity)
```

---

## Important Code Patterns

### 1. Dynamic Leaflet Import (Next.js)

```typescript
// Required because Leaflet depends on window object (SSR issue)
const InteractiveMap = dynamic(
  () => import('@/components/InteractiveMap').then(mod => ({ default: mod.InteractiveMap })),
  { ssr: false }
);
```

### 2. Drawing Tool Workflow (Next.js)

```typescript
User selects tool
    ↓
setCurrentTool('draw')
    ↓
DrawingOverlay captures mouse events
    ↓
mousedown → startDrawing()
mousemove → addPoint()
mouseup → finishDrawing()
    ↓
handleDrawingComplete(element)
    ↓
createElement(element) → Auto-saves to database
    ↓
Element rendered on map + Details panel opens
```

### 3. Freehand Drawing (Bubble.io)

```javascript
// Proven pattern from freehand_draw_investigation_report.md
window.__leafy_freehand.start();
    ↓
Map dragging disabled
    ↓
Capture points: pointerdown → pointermove → pointerup
    ↓
Simplify path (Douglas-Peucker, tolerance: 0.0001)
    ↓
Create GeoJSON LineString
    ↓
window.__leafy_last_freehand = geojson;
    ↓
bubble_fn_freehandComplete(JSON.stringify(geojson));
    ↓
Bubble workflow saves to database
```

### 4. File Attachments Cleanup

```typescript
// Critical: Never save blob: URLs to database
// They are temporary and will break on reload

// ❌ Wrong
files: [{ url: "blob:http://localhost:3000/abc123" }]

// ✅ Correct
// Upload file first, get permanent URL, then save
files: [{ url: "https://supabase.co/storage/files/abc123.pdf" }]

// usePersistentDrawing automatically filters blob URLs before saving
```

### 5. Privacy Check Helper

```typescript
// Use this pattern in both Next.js and Bubble
function canRoleAccessPrivacy(privacy: PrivacySettings, role: UserRole): boolean {
  if (privacy.roles.admins && role === 'Admin') return true;
  if (privacy.roles.ditchRiders && role === 'Ditch Rider') return true;
  if (privacy.roles.users && role === 'User') return true;
  return false;
}
```

---

## Role-Based Features

### Three User Roles

**Admin**:
- Full access to all drawings (privacy cannot exclude admins)
- Can approve/reject submissions
- Can create entities from drawings
- Can edit any element
- Can switch roles (View mode)
- Edit/View mode toggle visible

**Ditch Rider**:
- Can create drawings (pending approval required)
- Can view drawings based on privacy settings
- Can report issues
- Can edit own pending drawings
- View-only mode

**User**:
- Can view drawings based on privacy settings
- Can report issues on eligible markers
- Can create hazard markers (pending approval)
- View-only mode
- Limited data visibility (only their connected systems)

### Approval Workflow

```
Non-Admin creates drawing
    ↓
approvalStatus = "pending"
    ↓
Drawing hidden from others (except admins)
    ↓
Admin reviews
    ↓
    ├─→ Approve: approvalStatus = "approved" → Visible per privacy
    └─→ Reject: approvalStatus = "rejected" → Hidden, creator notified
```

### Privacy Filtering

```
For each drawing:
1. Check if Admin → Always visible
2. Check if privacy.roles.[userRole] === true → Visible
3. Check if user ID in privacy.specificUsers → Visible
4. Check if user has relationship to linkedEntity → Visible
5. Else → Hidden
```

---

## Testing & Debugging

### Testing Drawing Functionality (Next.js)

```bash
1. Start dev server
npm run dev

2. Select a drawing tool (line, draw, area, point)

3. Draw on map

4. Check browser console for save confirmation:
"Drawing saved successfully"

5. Refresh page (Cmd+R / Ctrl+R)

6. Verify drawing reappears → Persistence working

7. Test approval flow:
- Switch role to "Ditch Rider" via toolbar
- Create drawing → Should be pending
- Switch back to "Admin"
- Approve drawing → Should become visible

8. Test privacy:
- Create drawing
- Set privacy to "Ditch Riders only"
- Switch role to "User"
- Drawing should disappear
```

### Common Issues & Solutions

**Issue**: "Module not found: Can't resolve 'fs'"
```
Cause: Database import in client component
Solution:
1. Check for import { supabase } from '@/lib/database-supabase' in 'use client' files
2. Move database logic to API route
3. Use fetch() or drawingService in client component
```

**Issue**: Drawings not persisting after refresh
```
Cause: Blob URLs in file attachments
Solution:
- usePersistentDrawing automatically filters these
- If still occurring, check files array before save
- Upload files first, get permanent URLs
```

**Issue**: Privacy filtering not working
```
Cause: Privacy object structure mismatch
Solution:
- Ensure privacy object matches PrivacySettings interface
- Check privacy.roles.admins is always true
- Verify canRoleAccessPrivacy() logic
```

**Issue**: Map not initializing (Bubble.io)
```
Cause: Leaflet not loaded or map capture script not working
Solution:
1. Check window.__leafy_found_map in browser console
2. Verify map ID matches script
3. Ensure Leafy Maps plugin is loaded
4. Check browser console for errors
```

**Issue**: Freehand drawing coordinates too large (Bubble.io)
```
Cause: Too many points captured, exceeding text field limit
Solution:
- Increase Douglas-Peucker tolerance (0.0001 → 0.0005)
- Test with aggressive simplification
- Consider splitting very long paths into segments
```

---

## Scalability Considerations

### Performance Optimization

**Next.js**:
- Use dynamic imports for Leaflet (SSR disabled)
- Debounce auto-save (500ms)
- Lazy load details panel content
- Use React.memo for map elements

**Bubble.io**:
- Backend workflows for heavy operations
- Pagination on repeating groups (max 20 items/page)
- Cache calculated values (progress, stats)
- Conditional formatting used sparingly
- Coordinate simplification (Douglas-Peucker)

### Database Optimization

**Indexes** (Supabase):
```sql
CREATE INDEX idx_drawings_approval_status ON drawings(approval_status);
CREATE INDEX idx_drawings_created_by ON drawings(created_by);
CREATE INDEX idx_drawings_element_type ON drawings(element_type);
```

**Indexes** (Bubble.io):
- Company/canal system field
- approvalStatus field
- createdBy field
- elementType field

### Coordinate Array Size Limits

**Problem**: Freehand drawings can generate 1000+ coordinate pairs

**Solution**:
```javascript
// Douglas-Peucker simplification
// Reduces points while preserving shape
// Tolerance: 0.0001 = ~11 meters accuracy
window.simplifyPath(points, 0.0001);

// Aggressive for very long paths
window.simplifyPath(points, 0.0005); // ~55 meters
```

**Bubble.io Text Field Limit**: 1MB
- Monitor coordinate array sizes
- Test with longest expected paths
- Implement size validation before save

---

## Feature Implementation Roadmap

### ✅ Completed (Next.js Prototype)

**MVP Features**:
- [x] User registration and authentication
- [x] Role management (Admin, Ditch Rider, User)
- [x] 4 drawing tools (point, line, freehand, area)
- [x] 11 marker types
- [x] Drawing persistence (Supabase)
- [x] Privacy controls per element
- [x] Approval workflow
- [x] Entity linking system
- [x] Contact auto-population
- [x] File attachments
- [x] Issue tracking (one per element)
- [x] Layer filtering and search
- [x] Details panel with accordions
- [x] Responsive layout (desktop)

### 🔄 In Progress (Bubble.io Implementation)

**Phase 1-2** (Foundation & Map Setup):
- [ ] Bubble database schema
- [ ] Leafy Maps plugin setup
- [ ] Map capture script
- [ ] Drawing rendering workflow
- [ ] Page structure and floating groups

**Phase 3-4** (Drawing Tools & UI):
- [ ] Freehand drawing (custom JavaScript)
- [ ] Point, line, area tools
- [ ] Drawing toolbar reusable element
- [ ] Layers panel reusable element
- [ ] Details panel reusable element

**Phase 5** (Business Logic):
- [ ] Privacy filtering workflows
- [ ] Approval workflow
- [ ] Entity linking with auto-population
- [ ] "Create Entity from Drawing" feature
- [ ] Issue management

**Phase 6-7** (Mobile & Testing):
- [ ] Mobile responsive layouts (40vh map / 60vh bottom sheet)
- [ ] Bottom sheet pattern for details
- [ ] Touch-friendly drawing
- [ ] Comprehensive testing checklist
- [ ] Performance optimization

**Phase 8** (Migration & Deployment):
- [ ] Data export from Supabase
- [ ] Data import to Bubble
- [ ] Sub-app deployment
- [ ] Production launch

### ⏳ Future Enhancements

**Phase 3 Features** (Nice to Have):
- [ ] Advanced analytics dashboard
- [ ] Bulk operations (import/export)
- [ ] Native map app integration (BDK wrapper)
- [ ] Custom fields per element type
- [ ] Gantt chart visualization
- [ ] Resource planning
- [ ] API for third-party integrations

---

## Technical Constraints & Limitations

### Next.js Constraints

**Critical Limitations**:
- ⚠️ **Client/Server Boundary**: Never import database modules in 'use client' components
- ⚠️ **SSR Issues**: Leaflet requires dynamic import with `{ ssr: false }`
- ⚠️ **Environment Variables**: Client components only access NEXT_PUBLIC_* vars

**Workarounds**:
- Use API routes for all database operations
- Use drawingService as client-side wrapper
- Dynamic imports for browser-dependent libraries

### Bubble.io Constraints

**Platform Limitations**:
- **Real-time updates**: Polling only, not true WebSocket connections
- **Complex calculations**: Must be done in backend workflows
- **File storage**: Limited to Bubble storage (consider S3 for scale)
- **Custom styling**: Some advanced CSS requires plugins
- **Offline functionality**: Not natively supported
- **Type safety**: No TypeScript, use Option Sets for validation

**Workarounds**:
```
Real-time Updates:
- "Do every 5 seconds" workflow for critical updates
- Manual refresh buttons for non-critical data

Complex Calculations:
- Scheduled backend workflows
- Cache results in database fields
- External API calls for heavy math

File Management:
- Compress images before upload
- File type and size validation
- CDN for frequently accessed files

Freehand Drawing:
- Custom JavaScript injection
- Map instance capture via prototype hook
- Douglas-Peucker coordinate simplification
```

---

## Documentation & References

### Internal Documentation

**Primary Documents**:
- `CLAUDE.md` (this file) - AI assistant guidance and comprehensive overview
- `BUBBLE_IMPLEMENTATION_PLAN.md` - Detailed 8-week Bubble implementation plan
- `BUBBLE_TRANSFORMATION_PLAN.md` - High-level transformation strategy
- `PROJECT_CONTEXT.md` - Session log, decisions, and project memory
- `AGENTS.md` - Next.js client/server architecture patterns

**Technical Documentation**:
- `freehand_draw_investigation_report.md` - Proven freehand drawing solution
- `Interactive Map Feature - Product Requirements Doc.txt` - Business requirements
- `SUPABASE_SETUP.md` - Supabase schema and migration guide
- `VERCEL_DEPLOYMENT.md` - Next.js deployment instructions
- `DATABASE.md` - SQLite implementation (legacy)

### External Resources

**Mapping**:
- Leaflet Documentation: https://leafletjs.com/reference.html
- React Leaflet: https://react-leaflet.js.org/
- Leaflet-Geoman: https://geoman.io/docs/leaflet

**Bubble.io**:
- Bubble Manual: https://manual.bubble.io/
- Plugin Development: https://manual.bubble.io/account-and-marketplace/building-plugins
- Leafy Maps Plugin: https://docs.zeroqode.com/plugins/leafy-maps
- Google Maps Geometry: https://forum.bubble.io/t/plugin-google-maps-geometry-drawing-w3w/157711

**Next.js**:
- Next.js 15 Documentation: https://nextjs.org/docs
- App Router: https://nextjs.org/docs/app
- API Routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers

**Database**:
- Supabase Documentation: https://supabase.com/docs
- Supabase JavaScript Client: https://supabase.com/docs/reference/javascript

---

## Tech Lead Recommendations

### Immediate Action Items

**For Bubble.io Implementation**:
1. **Start with Phase 1** - Database setup and plugin installation (Week 1)
2. **Test freehand drawing early** - Validate custom JavaScript solution (Week 2)
3. **Use BUBBLE_IMPLEMENTATION_PLAN.md as primary reference** - Follow phase-by-phase
4. **Keep Next.js app running** - Use as behavioral reference throughout
5. **Document deviations** - Update PROJECT_CONTEXT.md after each session

**For Next.js Maintenance**:
1. **Do NOT implement "Create Entity from Drawing"** - Feature planned for Bubble only
2. **Keep as reference implementation** - Bug fixes and critical updates only
3. **Maintain data export capability** - Needed for Bubble migration (Phase 8)
4. **Test new features here first** - Validate behavior before Bubble implementation

### Risk Mitigation

**High-Risk Areas**:

1. **Coordinate Array Size Limits** (Bubble.io)
   - **Risk**: Freehand drawings exceeding 1MB text field limit
   - **Mitigation**: Aggressive Douglas-Peucker simplification, test early with long paths
   - **Contingency**: Split long paths into segments, increase tolerance

2. **Real-time Drawing Performance** (Bubble.io)
   - **Risk**: Lag during freehand drawing due to state updates
   - **Mitigation**: Client-side preview, delayed Bubble sync
   - **Contingency**: Reduce update frequency, optimize workflow

3. **Privacy Filter Performance** (Bubble.io)
   - **Risk**: Slow filtering with 1000+ drawings
   - **Mitigation**: Backend workflow filtering, caching
   - **Contingency**: Pagination, lazy loading

4. **Sub-app Data Isolation** (Bubble.io)
   - **Risk**: Data leakage between sub-apps
   - **Mitigation**: Test isolation early, document push-to-subapp workflow
   - **Contingency**: Use external database for true isolation

5. **Mobile Touch Drawing** (Bubble.io)
   - **Risk**: Freehand drawing not working on mobile
   - **Mitigation**: Test pointer events (not just mouse), use touch-friendly tolerance
   - **Contingency**: Simplify to line tool only for mobile

### Success Metrics

**Technical Metrics**:
- Map load time: < 2 seconds
- Drawing save/load: < 500ms
- Support 1000+ drawings without performance degradation
- 99% uptime (Bubble hosting)
- < 1% error rate

**User Experience Metrics**:
- 100% feature parity between Next.js and Bubble implementations
- Mobile-friendly on all devices
- Intuitive UI (< 5 minutes to learn drawing tools)
- No data loss during any operation
- Smooth freehand drawing (< 100ms lag)

**Business Metrics**:
- Successful migration of all existing data
- User adoption: > 80% of admins use drawing features weekly
- Issue reporting: > 50 issues reported in first month
- User satisfaction: > 4.5/5 rating

---

## Development Commands

### Next.js Development

```bash
# Start development server (localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint

# Type checking
npx tsc --noEmit
```

### Useful Searches in Codebase

```bash
# Find drawing implementation
grep -r "DrawingOverlay" src/

# Find state management
grep -r "usePersistentDrawing" src/

# Find API routes
ls src/app/api/drawings/

# Find privacy logic
grep -r "canRoleAccessPrivacy" src/

# Find component usage
grep -r "InteractiveMap" src/
```

### Database Operations (Supabase)

```bash
# Run migrations (from project root)
psql $DATABASE_URL < supabase-schema.sql
psql $DATABASE_URL < supabase-migration-contact-fields.sql
psql $DATABASE_URL < supabase-migration-privacy-complete.sql

# Export drawings
curl https://[your-app].vercel.app/api/drawings > drawings_backup.json

# Direct Supabase query (via dashboard or CLI)
supabase db reset
supabase db push
```

---

## Support & Maintenance Strategy

### Bug Tracking & Resolution

**Priority System**:
- **Critical** (< 2 hours): Data loss, security breach, app down
- **High** (< 24 hours): Drawing not saving, privacy bypass, approval broken
- **Medium** (< 1 week): UI glitches, minor feature issues
- **Low** (< 1 month): Nice-to-have enhancements, edge cases

**User Feedback Collection**:
- In-app feedback forms (future enhancement)
- Email support
- GitHub issues for Next.js implementation

**Error Logging**:
- Next.js: Console errors, Vercel logs
- Bubble.io: Bubble server logs, custom error tracking workflows

### Documentation Maintenance

**Update Frequency**:
- `PROJECT_CONTEXT.md`: After each development session
- `CLAUDE.md`: When architecture or patterns change
- `BUBBLE_IMPLEMENTATION_PLAN.md`: When timeline or approach changes

**Version Control**:
- Git for all documentation and Next.js code
- Bubble version control for production app
- Tag releases for major milestones

### Regular Tasks

**Weekly**:
- Review pending approvals
- Check error logs
- Monitor performance metrics
- Update PROJECT_CONTEXT.md

**Monthly**:
- Database optimization (Supabase vacuum, Bubble cleanup)
- Performance review
- Feature prioritization

**Quarterly**:
- Security audit (privacy rules, access controls)
- Feature updates based on user feedback
- Documentation review and updates

---

## Final Notes for AI Assistants

### When Working with This Project

**Always Refer To**:
1. `CLAUDE.md` (this file) for architecture and patterns
2. `BUBBLE_IMPLEMENTATION_PLAN.md` for Bubble-specific implementation
3. `PROJECT_CONTEXT.md` for latest decisions and session history
4. `AGENTS.md` for Next.js client/server boundary rules

**Never Do** (Next.js):
- Import database modules in 'use client' components
- Access environment variables directly in client components
- Use Leaflet without dynamic import
- Save blob: URLs to database

**Never Do** (Bubble.io):
- Implement freehand without coordinate simplification
- Assume real-time updates work (use polling)
- Create entities without tracking origin in metadata
- Skip privacy filtering in workflows

**Always Do**:
- Test drawings save and reload (critical feature)
- Validate privacy filtering for each role
- Check mobile responsiveness
- Document decisions in PROJECT_CONTEXT.md
- Follow approved plan before making changes

### Session Workflow

**Start of Session**:
1. Read `PROJECT_CONTEXT.md` for latest status
2. Check current implementation phase
3. Review any open questions or blockers

**During Session**:
1. Follow existing patterns and architecture
2. Test changes thoroughly
3. Document any new decisions

**End of Session**:
1. Update `PROJECT_CONTEXT.md` with session summary
2. Note any new decisions or open questions
3. Update implementation status in roadmap

---

**Document Version**: 2.0
**Last Updated**: 2025-10-09
**Status**: Next.js complete, Bubble implementation ready to start
**Next Focus**: Bubble.io Phase 1 - Foundation & Database Setup (Week 1)

This CLAUDE.md serves as both a technical specification and a living document that should be updated as the project evolves. Regular reviews ensure alignment and help identify potential issues before they become problems.
