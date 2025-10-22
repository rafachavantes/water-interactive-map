# CLAUDE.md - Water Infrastructure Interactive Map

*Quick reference guide for AI assistants and developers working with this repository*

---

## 🎯 Project Overview

**Water Infrastructure Interactive Map** is a B2B SaaS platform for canal companies, water districts, and farmers to visualize and manage water infrastructure through interactive mapping with role-based privacy controls.

### Dual Implementation Strategy

1. **Next.js Prototype** (Reference Implementation)
   - Fully functional behavioral reference
   - Next.js 15 + React 19 + TypeScript + Leaflet
   - Deployed on Vercel with Supabase backend

2. **Bubble.io Production** (Target Implementation)
   - 8-week implementation timeline
   - Leafy Maps plugin + custom JavaScript extensions
   - Feature parity goal: 100%

**Current Status**: Next.js complete, Bubble Phase 1 (Foundation & Database) ready to start

---

## 📚 Documentation Map

**Start here for your role**:

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **CLAUDE.md** (this file) | AI assistant quick reference | Every session start |
| **bubble/docs/BUBBLE_IMPLEMENTATION_PLAN.md** | Detailed 8-week Bubble implementation | Building Bubble features |
| **docs/PROJECT_CONTEXT.md** | Session history & decisions | Catch up on latest work |
| **bubble/docs/freehand_draw_investigation_report.md** | Proven freehand drawing solution | Implementing map drawing |
| **nextjs/docs/AGENTS.md** | Next.js client/server architecture | Working with Next.js code |
| **README.md** | Project setup & installation | Initial setup |

---

## 🛠️ Tech Stack

### Next.js Stack (Reference)
```
Frontend: Next.js 15 + React 19 + TypeScript + Leaflet 1.9.4 + React Leaflet 5.0
UI: shadcn/ui + Radix UI + Tailwind CSS
Backend: Next.js API routes + Supabase (Postgres)
Deployment: Vercel
```

### Bubble.io Stack (Target)
```
Platform: Bubble.io visual editor
Maps: Leafy Maps plugin (ZeroQode) + custom JavaScript
Database: Bubble native tables + Option Sets
Mobile: BDK wrapper for Android/iOS
```

---

## ⚠️ Critical Architecture Rules

### Next.js: Client/Server Boundary

**NEVER in Client Components** (`'use client'`):
```typescript
❌ import { supabase } from '@/lib/database-supabase'
❌ import fs from 'fs'
❌ process.env.DATABASE_URL
```

**ALWAYS in Client Components**:
```typescript
✅ fetch('/api/drawings')
✅ import { drawingService } from '@/lib/drawingService'
✅ process.env.NEXT_PUBLIC_SUPABASE_URL
```

**Data Flow**:
```
Client Components → drawingService → API Routes → Database (Supabase)
```

### Bubble.io: Platform Constraints

**Limitations**:
- Real-time updates: Polling only (not WebSockets)
- Complex calculations: Backend workflows only
- File storage: Bubble storage (consider S3 for scale)
- Type safety: Use Option Sets for validation
- Coordinate arrays: 1MB text field limit (use Douglas-Peucker simplification)

**Workarounds**:
- Freehand drawing: Custom JavaScript injection via page header
- Map access: `window.__leafy_found_map` (proven pattern)
- Heavy operations: Scheduled backend workflows

---

## 🗄️ Core Data Models

### DrawingElement (TypeScript)

```typescript
interface DrawingElement {
  id: string;
  type: 'line' | 'polygon' | 'polyline' | 'point';
  coordinates: [number, number][] | [number, number];
  markerPosition?: [number, number];

  // Classification
  elementType?: 'ride' | 'canal' | 'lateral' | 'headgate' | 'meter' |
                'pump' | 'pivot' | 'land' | 'hazard' | 'maintenance' | 'custom';
  linkedEntityId?: string;

  // Core fields
  name: string;
  color: string;
  description?: string;

  // Privacy & approval
  privacy?: PrivacySettings;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  createdBy?: string;
  createdByRole?: 'User' | 'Ditch Rider' | 'Admin';

  // Metadata
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
  specificUsers?: string[];
  linkedEntity?: boolean;
}
```

---

## 🔑 Key Features

### Drawing Tools (4 types)
1. **Point** - Single click marker
2. **Line** - Click-based polyline (double-click to finish)
3. **Freehand** - Mousedown + drag + mouseup for smooth polylines
4. **Area** - Click-based polygon (double-click to finish)

### Element Types (11 categories)
- **Infrastructure**: Ride, Canal, Lateral, Headgate
- **Monitoring**: Meter, Pump, Pivot
- **Other**: Land, Hazard, Maintenance, Custom

### User Roles (3 levels)
- **Admin**: Full access, approve/reject, create entities from drawings
- **Ditch Rider**: Create drawings (pending approval), view filtered by privacy
- **User**: View only, report issues, create hazard markers

### Core Workflows
- **Privacy Filtering**: Role-based access per drawing
- **Approval Workflow**: pending → approved/rejected (Admin only)
- **Entity Linking**: Auto-populate contact info from linked entities
- **Create Entity from Drawing**: Admin promotes drawing → reusable entity

---

## 💻 Development Commands

### Next.js Development
```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npx tsc --noEmit     # Type checking
```

### Useful Searches
```bash
grep -r "DrawingOverlay" src/           # Find drawing implementation
grep -r "usePersistentDrawing" src/     # Find state management
grep -r "canRoleAccessPrivacy" src/     # Find privacy logic
ls src/app/api/drawings/                # List API routes
```

### Database Operations (Supabase)
```bash
psql $DATABASE_URL < supabase-schema.sql
curl https://[app].vercel.app/api/drawings > backup.json
```

---

## 🔍 Important Code Patterns

### 1. Freehand Drawing (Proven Solution)

```javascript
// From bubble/docs/freehand_draw_investigation_report.md
window.__leafy_found_map // Leaflet map instance (captured)

// Enable freehand mode
window.__leafy_freehand.start()

// Get result after drawing
window.__leafy_last_freehand // GeoJSON object

// Key implementation details
map.dragging.disable()  // During drawing
simplifyPath(points, 0.0001)  // Douglas-Peucker for coordinate reduction
```

### 2. Privacy Check Helper

```typescript
function canRoleAccessPrivacy(privacy: PrivacySettings, role: UserRole): boolean {
  if (privacy.roles.admins && role === 'Admin') return true;
  if (privacy.roles.ditchRiders && role === 'Ditch Rider') return true;
  if (privacy.roles.users && role === 'User') return true;
  return false;
}
```

### 3. Drawing State Management (Next.js)

```typescript
// usePersistentDrawing hook
const { drawingState, createElement, updateElement, deleteElement } = usePersistentDrawing()

// Auto-loads on mount, auto-saves with 500ms debounce
// Validates before saving (filters blob URLs)
```

### 4. Dynamic Leaflet Import (SSR Issue)

```typescript
// Required because Leaflet depends on window object
const InteractiveMap = dynamic(
  () => import('@/components/InteractiveMap'),
  { ssr: false }
);
```

---

## 🧪 Common Issues & Solutions

### Issue: "Module not found: Can't resolve 'fs'"
**Cause**: Database import in client component
**Solution**: Move database logic to API route, use `fetch()` or `drawingService`

### Issue: Drawings not persisting after refresh
**Cause**: Blob URLs in file attachments
**Solution**: Upload files first, get permanent URLs (usePersistentDrawing filters automatically)

### Issue: Map not initializing (Bubble.io)
**Cause**: Leaflet not loaded or map capture script not working
**Solution**:
1. Check `window.__leafy_found_map` in console
2. Verify map ID matches script
3. Ensure Leafy Maps plugin loaded

### Issue: Freehand coordinates too large (Bubble.io)
**Cause**: Too many points exceeding 1MB text field
**Solution**: Increase Douglas-Peucker tolerance (0.0001 → 0.0005)

---

## 🗺️ Bubble.io Implementation Phases

**See bubble/docs/BUBBLE_IMPLEMENTATION_PLAN.md for complete details**

| Phase | Focus | Timeline |
|-------|-------|----------|
| 1 | Foundation & Database | Week 1 |
| 2 | Map Setup & Rendering | Week 2 |
| 3 | Drawing Tools | Week 3 |
| 4 | UI Components | Week 4 |
| 5 | Business Logic | Week 5-6 |
| 6 | Mobile Responsiveness | Week 7 |
| 7 | Testing & QA | Week 8 |
| 8 | Data Migration & Deployment | Post-launch |

**Current Phase**: Phase 1 - Foundation & Database (Ready to start)

---

## 📋 Database Schema (Bubble.io)

**Core Tables**:
- **Drawings**: Main table (coordinates, type, privacy, approval status)
- **Drawing Entities**: Infrastructure master data (canals, rides, etc.)
- **Issues**: Issue tracking per drawing
- **Users**: Built-in with custom role field

**Option Sets** (use for data integrity):
- DrawingTypes, ElementTypes, ValidEntityTypes, Roles, ApprovalStatus, ElementStatus, Categories, IssueStatus

**See bubble/docs/BUBBLE_IMPLEMENTATION_PLAN.md Phase 1 for complete schema**

---

## 🎯 AI Session Workflow

### Start of Session
1. Read `docs/PROJECT_CONTEXT.md` for latest status
2. Check current implementation phase
3. Review any open questions or blockers

### During Session
1. Follow existing patterns and architecture
2. Refer to bubble/docs/BUBBLE_IMPLEMENTATION_PLAN.md for implementation details
3. Test changes thoroughly
4. Document any new decisions

### End of Session
1. Update `docs/PROJECT_CONTEXT.md` with session summary
2. Note any new decisions or open questions
3. Update implementation status in roadmap

---

## ⚡ Quick Reference Links

**Internal Docs**:
- Implementation Plan: `bubble/docs/BUBBLE_IMPLEMENTATION_PLAN.md`
- Project Context: `docs/PROJECT_CONTEXT.md`
- Freehand Proof: `bubble/docs/freehand_draw_investigation_report.md`
- Next.js Rules: `nextjs/docs/AGENTS.md`

**External Resources**:
- Leaflet: https://leafletjs.com/reference.html
- Leafy Maps: https://docs.zeroqode.com/plugins/leafy-maps
- Bubble Manual: https://manual.bubble.io/
- Supabase: https://supabase.com/docs

---

## ✅ Never Do / Always Do

### Next.js
**Never**:
- Import database in client components
- Access env vars directly in client
- Use Leaflet without dynamic import
- Save blob: URLs to database

**Always**:
- Use API routes for database operations
- Use drawingService wrapper
- Dynamic imports for browser libs
- Test save/reload cycle

### Bubble.io
**Never**:
- Implement freehand without coordinate simplification
- Assume real-time updates work (use polling)
- Create entities without tracking origin in metadata
- Skip privacy filtering in workflows

**Always**:
- Use Option Sets for predefined values
- Test drawings save and reload
- Validate privacy filtering per role
- Check mobile responsiveness
- Document decisions in PROJECT_CONTEXT.md

---

## 📊 Success Metrics

**Technical**:
- Map load time: < 2 seconds
- Drawing save/load: < 500ms
- Support 1000+ drawings smoothly
- 99% uptime

**User Experience**:
- 100% feature parity (Next.js ↔ Bubble)
- Mobile-friendly all devices
- No data loss
- Intuitive drawing workflow

---

**Document Version**: 3.0
**Last Updated**: 2025-10-09
**Status**: Streamlined for AI efficiency
**Next Focus**: Bubble.io Phase 1 - Foundation & Database Setup
