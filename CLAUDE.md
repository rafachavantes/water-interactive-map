# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

An interactive mapping application for water infrastructure management, built with Next.js 15, Leaflet, and shadcn/ui. The app allows canal companies to visualize, draw, and manage water infrastructure elements on an interactive map with role-based privacy controls and approval workflows.

## Development Commands

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Lint Code
```bash
npm run lint
```

## Critical Architecture Rules

### ⚠️ Client/Server Boundary (MOST IMPORTANT)

**NEVER import database modules in client components** - this will cause build errors.

- ❌ **Client components** (`'use client'`): NEVER import from `@/lib/database-supabase.ts` or any Node.js modules
- ✅ **Client components**: Use `fetch()` calls to API routes in `/src/app/api/`
- ✅ **API routes** (`/src/app/api/`): Import and use database directly

**Correct Pattern:**
```typescript
// Client Component - ✅ Correct
'use client';
const response = await fetch('/api/drawings');
const data = await response.json();

// API Route - ✅ Correct
import { supabase } from '@/lib/database-supabase';
export async function GET() {
  const { data } = await supabase.from('drawings').select('*');
  return Response.json(data);
}
```

See `AGENTS.md` for detailed client/server architecture patterns.

## Data Architecture

### Core Data Flow

```
Client Components → drawingService → API Routes → Database (Supabase/SQLite)
                ↑                                        ↓
                └────────── fetch() HTTP calls ──────────┘
```

### Drawing State Management

- **Hook**: `usePersistentDrawing` (src/lib/usePersistentDrawing.ts)
  - Manages all drawing state with automatic database persistence
  - Auto-loads drawings on mount, auto-saves on changes (500ms debounce)
  - Validates elements before saving (filters invalid/blob URL files)

- **Service Layer**: `drawingService` (src/lib/drawingService.ts)
  - Client-side service for all drawing API communication
  - Methods: `loadAllDrawings()`, `saveDrawing()`, `updateDrawing()`, `deleteDrawing()`

### Entity Linking System

Drawing elements can be linked to infrastructure entities (canals, rides, headgates, meters, pumps, pivots, lands). When linked:
- Contact information auto-populates from the linked entity
- Entities are fetched via `/api/entities/[type]` endpoints
- Contact fields: `contactName`, `contactPhone`, `contactEmail`, `contactRole`

## Database Configuration

### Dual Database System

**Local Development**: Can use SQLite (legacy)
**Production (Vercel)**: Uses Supabase Postgres

Current implementation uses Supabase for both environments. See:
- `SUPABASE_SETUP.md` - Schema and migration instructions
- `VERCEL_DEPLOYMENT.md` - Deployment guide

### Required Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### Database Schema

Key tables: `drawings`, `canals`, `rides`, `headgates`, `meters`, `pumps`, `pivots`, `lands`

Run migrations in order:
1. `supabase-schema.sql` - Base schema
2. `supabase-migration-contact-fields.sql` - Contact info
3. `supabase-migration-privacy-complete.sql` - Privacy system

## Key Type Definitions (src/types/index.ts)

### DrawingElement
Main drawing type with:
- Geometry: `type`, `coordinates`, `markerPosition`
- Metadata: `name`, `color`, `elementType`, `linkedEntityId`
- Privacy: `privacy` (PrivacySettings object)
- Approval: `approvalStatus`, `createdBy`, `createdByRole`, `reviewedBy`, `reviewNotes`
- Contact: `contactName`, `contactPhone`, `contactEmail`, `contactRole`, `contactPrivacy`
- Issues: `issue` (single Issue object)
- Files: `files` (FileAttachment array)

### Entity Types
`Canal`, `Ride`, `Headgate`, `Meter`, `Pump`, `Pivot`, `Land` - all extend `BaseEntity`

### Privacy System

```typescript
interface PrivacySettings {
  roles: { users: boolean; ditchRiders: boolean; admins: boolean };
  specificUsers?: string[];
  linkedEntity?: boolean;
}
```

Use `canRoleAccessPrivacy(privacy, role)` helper to check access.

## Role-Based Features

Three user roles: `'User'`, `'Ditch Rider'`, `'Admin'`

- **Admin**: Full access, can approve/reject drawings, see all elements
- **Ditch Rider**: Can create drawings (pending approval), filtered view based on privacy
- **User**: Limited access, filtered view based on privacy

### Approval Workflow

- Non-admin drawings default to `approvalStatus: 'pending'`
- Admins can approve/reject via `/api/drawings/approval` endpoint
- Pending review filter available in LayerFilters component

## Component Architecture

### Main Page (src/app/page.tsx)

Central state management:
- Uses `usePersistentDrawing()` hook
- Manages filter state, tool selection, role switching
- Handles drawing lifecycle: create → save → approve/reject
- Coordinates between map, tools, details panel, and filters

### Key Components

- **InteractiveMap**: Leaflet map with dynamic import (SSR disabled)
- **DrawingTools**: Bottom toolbar for tool selection, mode toggle, role switcher
- **LayerFilters**: Left sidebar with filters, search, pending review badge
- **DrawingElementDetailsPanel**: Right panel for element details/editing
- **DrawingOverlay**: Canvas overlay for live drawing preview
- **DrawingElements**: Renders saved elements on map

### API Routes

- `/api/drawings` - GET (list), POST (create/bulk save), DELETE (clear all)
- `/api/drawings/[id]` - GET (single), PUT (update), DELETE (single)
- `/api/drawings/approval` - POST (approve/reject), GET with `?action=count` (pending count)
- `/api/entities/[type]` - GET (list entities by type for linking)

## Important Patterns

### Dynamic Import for Leaflet
```typescript
const InteractiveMap = dynamic(
  () => import('@/components/InteractiveMap').then(mod => ({ default: mod.InteractiveMap })),
  { ssr: false }
);
```

### Drawing Tool Workflow
1. User selects tool → `setCurrentTool(toolId)`
2. Map overlay captures mouse events → `startDrawing()`, `addPoint()`, `finishDrawing()`
3. On finish → `handleDrawingComplete()` creates DrawingElement
4. Element saved via `createElement()` → auto-persists to database

### File Attachments Cleanup
- **Critical**: Never save `blob:` URLs to database
- `usePersistentDrawing` filters blob URLs before saving
- Files should be uploaded and converted to permanent URLs

## Testing Drawing Functionality

1. Select a drawing tool (line, draw, area, point)
2. Draw on map
3. Element auto-saves and details panel opens
4. Check browser console for save confirmation
5. Refresh page to verify persistence
6. Test approval flow by switching roles

## Common Pitfall: Node.js Module Errors

If you see "Module not found: Can't resolve 'fs'" or similar:
1. Check for database imports in client components
2. Verify all database operations go through API routes
3. Ensure `'use client'` components only use fetch/HTTP calls
