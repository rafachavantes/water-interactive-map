# PROJECT_CONTEXT.md — Continuous Project Memory

A single source of truth updated **after each work session** to maintain full context, decisions, and next steps.
This file should always reflect the **current state of the project** so anyone can jump in and continue seamlessly.

---

## 🧠 Current Focus

**Transforming Next.js Water Infrastructure Map to Bubble.io**

Planning phase complete. Ready to begin implementation of interactive map feature in Bubble.io using Leafy Maps plugin + custom freehand drawing extension. Goal is to achieve 100% feature parity with current Next.js implementation while leveraging proven freehand drawing solution.

---

## 📜 Summary of Latest Session

**Session Date:** 2025-10-06

### ✅ Tasks Completed

1. **Created CLAUDE.md** - Comprehensive guidance document for future AI assistance
   - Development commands (dev, build, start, lint)
   - Critical client/server architecture rules
   - Data flow and state management patterns
   - Database configuration (Supabase dual setup)
   - Key type definitions and patterns

2. **Analyzed Bubble.io Plugin Options**
   - Researched Leafy Maps (ZeroQode) capabilities
   - Investigated Google Maps Geometry/Drawing + W3W plugin
   - Evaluated custom plugin development approach
   - Determined feasibility of extending existing plugins

3. **Reviewed Freehand Drawing Investigation**
   - Confirmed map instance access is PROVEN (via `window.__leafy_found_map`)
   - Validated working custom freehand implementation
   - Identified Geoman v2.18.3 present but missing Freehand handler
   - Confirmed GeoJSON output to `window.__leafy_last_freehand`

4. **Analyzed Current Implementation**
   - Reviewed screenshots showing UI/UX requirements
   - Studied PRD (Product Requirements Document)
   - Mapped all 11 marker types and features
   - Identified 3 user roles (Admin, Ditch Rider, User)

5. **Created Comprehensive Implementation Plan**
   - 8-week phased development roadmap
   - Complete database schema (Drawings, Entities, Issues, Users)
   - All drawing tools (freehand, line, area, point) integration
   - UI component breakdown (toolbar, layers panel, details panel)
   - Business logic workflows (privacy, approval, entity linking)
   - Mobile responsiveness strategy
   - Testing & deployment checklist

### 🛠 Decisions Made

1. **Plugin Strategy: Extend Leafy Maps ✅**
   - Reason: Proven feasibility from investigation report
   - Cost: $0 (Leafy Maps is free)
   - Timeline: 8 weeks vs 10+ weeks for custom plugin
   - Risk: Low (map access already proven)

2. **Freehand Implementation: Use Custom JavaScript**
   - Leverage existing working solution from investigation
   - Inject via page header + Toolbox plugin
   - No plugin modification needed
   - Douglas-Peucker simplification for coordinate reduction

3. **Database: Bubble Native Tables**
   - No migration to Supabase needed initially
   - Use Bubble's built-in database
   - JSON text fields for complex data (coordinates, privacy settings)
   - Relationships for entities, users, issues

4. **Architecture: Keep Next.js for Reference**
   - Maintain current Next.js app as reference implementation
   - Extract exact behavior patterns
   - Port type definitions to Bubble data structure
   - Use as testing baseline

### 🧪 Research Conducted

- ✅ Bubble.io Toolbox plugin capabilities for JavaScript execution
- ✅ Leaflet map instance access patterns
- ✅ GeoJSON coordinate simplification requirements
- ✅ Mobile responsive bottom sheet patterns
- ✅ BDK native wrapper capabilities for mobile maps

---

## 📌 Open Questions / Pending Decisions

### ❓ Technical Questions

1. **BN Native Plugin Availability**
   - Need to verify if BN Native plugin supports triggering native map apps
   - Fallback: Copy coordinates to clipboard if not available
   - Action: Test in Bubble environment during Phase 6

2. **Coordinate Array Size Limits**
   - Freehand drawings generate large coordinate arrays
   - Need to test Bubble's text field size limits (default: 1MB)
   - Solution: Aggressive Douglas-Peucker simplification (tolerance: 0.0001)

3. **Sub-app Data Isolation**
   - Verify data isolation between main app and sub-apps
   - Confirm push-to-subapp workflow won't break map functionality
   - Action: Document during deployment phase

### ⚠️ Architectural Considerations

1. **Real-time Drawing Performance**
   - Confirm mousemove event → Bubble state update latency is acceptable
   - May need client-side preview with delayed Bubble state sync
   - Test during Phase 3 implementation

2. **Privacy Filter Performance**
   - Complex privacy checks on large drawing sets
   - May need Bubble server-side filtering vs client-side
   - Benchmark with 1000+ drawings during Phase 5

3. **Water Order Data Integration**
   - PRD mentions `daily_recurring_order_item` data type
   - Need to confirm exact relationship structure
   - Coordinate with existing Bubble app data model

---

## 📅 Next Steps

### Immediate (Week 1 - Foundation)

- [ ] Set up new Bubble app or identify target app for integration
- [ ] Install required plugins:
  - [ ] Leafy Maps (ZeroQode)
  - [ ] Toolbox plugin
- [ ] Create database tables following schema in BUBBLE_IMPLEMENTATION_PLAN.md:
  - [ ] Drawings table (30+ fields)
  - [ ] Drawing Entities table
  - [ ] Issues table
  - [ ] Extend User type with role field
- [ ] Create Option Sets:
  - [ ] DrawingTypes
  - [ ] ElementTypes
  - [ ] Roles
  - [ ] ApprovalStatus
  - [ ] Colors
- [ ] Set up page structure:
  - [ ] Main container groups
  - [ ] Leafy Map element with ID attribute
  - [ ] Floating groups for panels
- [ ] Add map capture script to page header
- [ ] Test map instance access (`window.__leafy_found_map`)

### Short-term (Week 2-3 - Core Functionality)

- [ ] Implement "Load Drawings on Page Load" workflow
- [ ] Create drawing rendering JavaScript functions
- [ ] Integrate proven freehand drawing tool
- [ ] Implement point, line, and area tools
- [ ] Create "Save Drawing" workflow with database persistence
- [ ] Test save → reload cycle

### Medium-term (Week 4-6 - UI & Logic)

- [ ] Build Drawing Toolbar reusable element
- [ ] Build Layers Panel reusable element
- [ ] Build Details Panel reusable element
- [ ] Implement privacy filtering logic
- [ ] Create approval workflow
- [ ] Integrate entity linking & contact auto-population
- [ ] Add water order data display

### Long-term (Week 7-8 - Polish & Deploy)

- [ ] Mobile responsive adjustments
- [ ] BDK wrapper testing
- [ ] Full feature testing against checklist
- [ ] Data migration from Next.js app
- [ ] Sub-app deployment
- [ ] Production launch

---

## 🧭 Project Notes & Assumptions

### 📁 Directory Structure

```
water-interactive-map/
├── docs/
│   ├── BUBBLE_TRANSFORMATION_PLAN.md (16KB) - High-level strategy
│   ├── BUBBLE_IMPLEMENTATION_PLAN.md (34KB) - Detailed 8-week plan
│   ├── freehand_draw_investigation_report.md (9KB) - Technical research
│   ├── Interactive Map Feature - Product Requirements Doc.txt (7KB) - PRD
│   ├── CLAUDE.md - AI assistant guidance
│   └── PROJECT_CONTEXT.md - This file
├── src/ - Next.js implementation (reference)
│   ├── app/ - Next.js App Router
│   ├── components/ - React components (25 files)
│   ├── lib/ - Utilities (drawingService, usePersistentDrawing, utils)
│   └── types/ - TypeScript definitions
├── AGENTS.md - Client/server architecture rules
├── DATABASE.md - SQLite implementation details
├── SUPABASE_SETUP.md - Supabase migration guide
├── VERCEL_DEPLOYMENT.md - Deployment instructions
└── README.md - Project overview
```

### 🔧 Technology Stack

**Current Next.js App:**
- Framework: Next.js 15 + React 19 + TypeScript
- Maps: Leaflet 1.9.4 + React Leaflet 5.0
- UI: shadcn/ui + Radix UI + Tailwind CSS
- Database: Supabase (production) / SQLite (legacy)
- State: React hooks (usePersistentDrawing)

**Target Bubble.io App:**
- Platform: Bubble.io (no-code)
- Maps: Leafy Maps plugin (Leaflet-based)
- JavaScript: Toolbox plugin + custom header scripts
- Database: Bubble native tables
- Mobile: BDK wrapper (Android/iOS)

### 📡 Key Integrations

1. **Leaflet Map Instance Access**
   - Hook: `L.Map.prototype.initialize`
   - Storage: `window.__leafy_found_map`
   - Status: ✅ Proven working

2. **Drawing Tools**
   - Freehand: `window.__leafy_freehand` → `window.__leafy_last_freehand`
   - Point: `window.__leafy_point`
   - Line: `window.__leafy_line`
   - Area: `window.__leafy_area`

3. **Bubble JavaScript Bridge**
   - JS → Bubble: `bubble_fn_saveDrawing()`, `bubble_fn_selectDrawing()`
   - Bubble → JS: Toolbox "Run JavaScript" actions
   - State sync: Custom event listeners + window objects

4. **Water Order Data**
   - Source: `daily_recurring_order_item` (existing Bubble data type)
   - Display: CFS units only
   - Filter: Current date + linked entity

### 📌 Constraints & Requirements

**Must-Have Features:**
1. ✅ All 4 drawing tools (point, line, freehand, area)
2. ✅ 11 marker types (ride, canal, lateral, headgate, meter, pump, pivot, land, hazard, maintenance, custom)
3. ✅ 3 user roles with privacy controls
4. ✅ Approval workflow (pending → approved/rejected)
5. ✅ Entity linking with contact auto-population
6. ✅ Issue management
7. ✅ Files & links attachments
8. ✅ Mobile responsive (40vh map / 60vh bottom sheet)
9. ✅ Layer filtering by type
10. ✅ Search functionality
11. ✅ Export map as image

**Performance Targets:**
- Map load time: < 2 seconds
- Drawing save/load: < 500ms
- Support: 1000+ drawings without degradation
- Mobile: Touch drawing responsive

**Browser Support:**
- Desktop: Chrome, Firefox, Safari, Edge (latest)
- Mobile: iOS Safari, Android Chrome
- Tablet: iPad, Android tablets

### 🎨 UI/UX Requirements

**Layout (from screenshots):**
- Top-left: Layers button (with badge), Search bar
- Top-right: Export button
- Bottom: Drawing toolbar (Edit/View toggle, tools, role selector)
- Left: Layers panel (conditional, categories + filters)
- Right: Details panel (conditional, accordions)

**Color Scheme:**
- Primary: Blue (#3B82F6)
- Success: Green
- Warning: Orange
- Danger: Red
- Neutral: Gray scale

**Marker Icons:**
- Custom colored markers per element type
- Issue indicator badge
- Approval status indicator

---

## 🪪 Important References

### 📚 Documentation

**Internal Docs:**
- `/docs/BUBBLE_IMPLEMENTATION_PLAN.md` - **PRIMARY REFERENCE** for implementation
- `/docs/freehand_draw_investigation_report.md` - Technical proof of concept
- `/docs/Interactive Map Feature - Product Requirements Doc.txt` - Business requirements
- `CLAUDE.md` - AI assistant instructions
- `AGENTS.md` - Client/server boundary rules

**External Resources:**
- Leaflet Docs: https://leafletjs.com/reference.html
- Leafy Maps Plugin: https://docs.zeroqode.com/plugins/leafy-maps
- Leaflet-Geoman: https://geoman.io/docs/leaflet
- Bubble Manual: https://manual.bubble.io/
- Bubble Plugin Development: https://manual.bubble.io/account-and-marketplace/building-plugins

### 🧰 Key Commands

**Next.js Development:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

**Useful Searches in Codebase:**
```bash
# Find drawing implementation
grep -r "DrawingOverlay" src/

# Find state management
grep -r "usePersistentDrawing" src/

# Find API routes
ls src/app/api/drawings/
```

### 🔗 Critical Code Patterns

**Freehand Drawing (JavaScript):**
```javascript
// Map capture (proven working)
window.__leafy_found_map // Leaflet map instance

// Start freehand
window.__leafy_freehand.start()

// Get result
window.__leafy_last_freehand // GeoJSON object
```

**Privacy Check (TypeScript → adapt to Bubble):**
```typescript
function canRoleAccessPrivacy(privacy: PrivacySettings, role: UserRole): boolean {
  if (privacy.roles.admins && role === 'Admin') return true;
  if (privacy.roles.ditchRiders && role === 'Ditch Rider') return true;
  if (privacy.roles.users && role === 'User') return true;
  return false;
}
```

**Drawing State Management:**
```typescript
// Next.js pattern (reference for Bubble workflows)
usePersistentDrawing() → {
  drawingState,
  createElement(),
  updateElement(),
  deleteElement(),
  selectElement()
}
```

### 🎯 Success Criteria

**Technical:**
- [ ] All 4 drawing tools functional and saving to DB
- [ ] All saved drawings reload on page refresh
- [ ] Privacy filtering works per role
- [ ] Approval workflow complete with notifications
- [ ] Entity linking auto-populates contact info
- [ ] Water order data displays correctly
- [ ] Mobile responsive on real devices
- [ ] Performance benchmarks met

**User Experience:**
- [ ] UI matches current Next.js app screenshots
- [ ] No data loss during any operation
- [ ] Intuitive drawing workflow
- [ ] Clear approval status indicators
- [ ] Smooth mobile interactions
- [ ] Fast search/filter response

**Business:**
- [ ] All PRD requirements implemented
- [ ] 3 user roles properly restricted
- [ ] Admin can manage all aspects
- [ ] Ditch Riders have appropriate access
- [ ] Users can view and report issues
- [ ] Sub-app deployment successful

---

## 📝 Session Log

### Session 1: 2025-10-06 (Planning & Research)

**Duration:** ~3 hours

**Participants:** User (Rafa) + Claude Code

**Activities:**
1. Initial codebase analysis
2. Bubble.io plugin research
3. Freehand drawing investigation review
4. PRD analysis
5. Screenshot UI/UX review
6. Implementation planning

**Outputs:**
- CLAUDE.md (7KB)
- BUBBLE_TRANSFORMATION_PLAN.md (16KB)
- BUBBLE_IMPLEMENTATION_PLAN.md (34KB)
- PROJECT_CONTEXT.md (this file)

**Key Decisions:**
- ✅ Use Leafy Maps extension approach
- ✅ 8-week implementation timeline
- ✅ Proven freehand solution validated
- ✅ 100% feature parity goal confirmed

**Status:** ✅ Planning phase complete, ready for implementation

---

### Session 2: 2025-10-06 (Entity Linking Discovery & Testing)

**Duration:** ~1 hour

**Participants:** User (Rafa) + Claude Code

**Context:** User tested Next.js prototype and discovered critical UX/architecture gap

**Testing Performed:**
1. Created drawing: type "land" (polygon)
2. Created drawing: type "pump" (point) → Tried to link to land drawing ❌
3. Created drawing: type "headgate" (point)
4. Created drawing: type "headgate" (point) → Tried to link to first headgate ❌
5. Observed: "Link to" dropdown shows only pre-seeded entities

**Root Cause Identified:**
- **Architecture Gap:** Drawings ≠ Drawing Entities
- User expected: Drawing → Drawing linking
- Actual system: Drawing → Entity linking
- Missing: UI workflow to create Drawing Entities from Drawings

**Key Findings:**

1. **Database Schema Confusion**
   - `drawings` table: Visual map elements created by users
   - `{type}s` tables (canals, headgates, etc.): Infrastructure entities (master data)
   - Relationship: Drawings.linkedEntity → Entity (many-to-one)
   - **Users cannot link drawings to other drawings** - only to entities

2. **Missing Seed Data**
   - Seeded: canals, rides, headgates, meters ✅
   - NOT seeded: pumps, pivots, lands ❌
   - Code location: `src/lib/database-supabase.ts` lines 525-689
   - Only 4 entity types in seed data

3. **UX Gap: No Entity Creation Workflow**
   - No UI to create Drawing Entities
   - Current approach: Manual database insertion or seed scripts
   - Need: "Create Entity from Drawing" button (Admin-only)

**Solution Proposed:**

**Feature: "Create Entity from Drawing" Button**

```
User Flow:
1. Admin draws element on map (e.g., headgate)
2. Drawing saved to drawings table
3. [NEW] Button: "Create Entity from Drawing"
4. Confirmation dialog → Creates entity in headgates table
5. Drawing automatically linked to new entity
6. Entity now appears in "Link to" dropdowns for other drawings
```

**Benefits:**
- Self-service entity creation
- Data inherits from drawing (accurate coordinates, contact info)
- No database/seed file editing required
- Admin-controlled quality
- Clear visual workflow

**Implementation Requirements:**
- API endpoint: `POST /api/drawings/[id]/create-entity`
- Details Panel: Add button (visible only for admins, valid types, unlinked drawings)
- Validation: elementType in ['canal', 'ride', 'headgate', 'meter', 'pump', 'pivot', 'land']
- Auto-link: Update drawing.linkedEntity after entity creation

**Outputs:**
- Detailed explanation of Drawings vs Drawing Entities architecture
- Proposed "Create Entity from Drawing" feature specification
- Implementation plan for entity creation workflow

**Updated Understanding:**
- Drawings = User-created visual elements on map
- Drawing Entities = Admin-managed infrastructure master data
- Link To = Associates drawing with entity for contact/data auto-population
- Missing Feature = UI to promote drawings to entities

**Open Question Added:**
- How should entity creation work in Bubble.io implementation?
  - Option A: Same "Create Entity from Drawing" button
  - Option B: Separate admin entity management page
  - Option C: Both approaches

**Next Steps Added:**
- [ ] Add "Create Entity from Drawing" API endpoint to Next.js prototype
- [ ] Complete seed data for pumps, pivots, lands
- [ ] Update Details Panel with entity creation button
- [ ] Document entity management workflow for Bubble.io

**Status:** 🔍 Architecture gap identified, solution designed, ready to implement

---

### Session 3: 2025-10-09 (Feature Planning for Bubble Implementation)

**Duration:** ~30 minutes

**Participants:** User (Rafa) + Claude Code

**Context:** User decided not to implement "Create Entity from Drawing" in Next.js prototype; instead, plan to add this feature directly in Bubble.io implementation

**Activities:**
1. Reviewed BUBBLE_IMPLEMENTATION_PLAN.md structure
2. Analyzed TypeScript types for entity definitions
3. Identified valid entity types vs drawing-only types
4. Designed Bubble-specific implementation approach

**Outputs:**
- Updated BUBBLE_IMPLEMENTATION_PLAN.md with "Create Entity from Drawing" feature:
  - Phase 1: Updated Drawing Entities metadata documentation
  - Phase 1: Added ValidEntityTypes option set
  - Phase 4.3: Added "Create Entity" button to Details Panel UI
  - Phase 5.4.1: New comprehensive workflow section with:
    - Step-by-step Bubble workflow
    - Error handling
    - UI specifications
    - Benefits documentation
  - Phase 7: Added 16 test cases for entity creation feature

**Key Decisions:**
- ✅ Skip Next.js prototype implementation
- ✅ Integrate feature directly into Bubble.io plan
- ✅ Admin-only feature with strict validation
- ✅ Valid entity types: canal, ride, lateral, headgate, meter, pump, pivot, land
- ✅ Invalid types (cannot become entities): hazard, maintenance, custom
- ✅ Metadata field tracks drawing origin for audit trail

**Implementation Details:**
- Button visibility: Admin role + not linked + valid type
- Confirmation dialog required before entity creation
- Entity inherits: name, description, contact info, coordinates
- Auto-linking after entity creation
- Success/error feedback for user

**Technical Specifications:**
```
ValidEntityTypes = [canal, ride, lateral, headgate, meter, pump, pivot, land]
Entity metadata structure = {
  createdFromDrawingId: string,
  coordinates: array,
  markerPosition: [lat, lng],
  color: hex string,
  createdAt: ISO date
}
```

**Status:** ✅ Feature fully planned and documented in Bubble implementation

---

### Session 4: 2025-10-09 (Documentation Transformation & Database Schema Refactoring)

**Duration:** ~2 hours

**Participants:** User (Rafa) + Claude Code

**Context:** Transform CLAUDE.md into comprehensive Tech Lead documentation and refactor Bubble database schema to use Option Sets best practices

**Activities:**

1. **CLAUDE.md Transformation**
   - Read bubble.io-techlead-agents.md template for structure
   - Analyzed all docs in docs/ folder for content
   - Expanded CLAUDE.md from 7KB (216 lines) to 28KB (1,614 lines)
   - Added comprehensive Tech Lead-style documentation

2. **Database Schema Review & Refactoring**
   - User identified critical issue: Option Sets defined but not used
   - Reviewed Phase 1 Database Setup in BUBBLE_IMPLEMENTATION_PLAN.md
   - Converted all predefined-value text fields to Option Sets
   - Added 3 new Option Sets: ElementStatus, Categories, IssueStatus

**Outputs:**

**CLAUDE.md Transformation:**
- Complete dual-implementation strategy (Next.js + Bubble.io)
- 8-phase Bubble implementation roadmap with week-by-week breakdown
- Database architecture for both platforms
- Bubble.io best practices (Hub/Spoke, Status Machine, Calculated Fields)
- JavaScript bridge pattern documentation
- Mobile responsiveness strategy (40vh map / 60vh bottom sheet)
- Comprehensive testing checklist and QA guidelines
- Risk mitigation strategies and success metrics
- Complete API endpoint documentation
- Feature roadmap (MVP, in-progress, future)
- Troubleshooting guide with common issues
- Tech Lead recommendations and action items

**Database Schema Refactoring:**

Tables Updated with Option Sets:
- **Drawings** (7 fields): type, elementType, status, category, approvalStatus, createdByRole + built-in date fields
- **Drawing Entities** (2 fields): type, status + built-in date fields
- **Issues** (2 fields): createdByRole, status + built-in Created Date
- **Users** (1 field): role

New Option Sets Added:
- ElementStatus: active, inactive, maintenance
- Categories: infrastructure, monitoring, other
- IssueStatus: open, resolved

Documentation Added:
- "Why Use Option Sets?" section (6 benefits)
- "When to Use Text Instead" guidelines
- Clear field mapping for each Option Set

**Key Decisions:**

1. ✅ **CLAUDE.md as Single Source of Truth**
   - Comprehensive reference for AI assistants and developers
   - Includes both Next.js and Bubble.io architectures
   - Living document to be updated as project evolves

2. ✅ **Option Sets for Data Integrity**
   - All predefined values converted from text to Option Sets
   - Benefits: data integrity, performance, validation, UI generation
   - Text kept for: JSON structures, user content, custom values (hex colors)

3. ✅ **Built-in Bubble Date Fields**
   - Use Created Date and Modified Date (built-in)
   - Automatic management, no custom createdAt/modifiedAt needed

4. ✅ **Color Field as Text**
   - Kept as text to allow custom hex colors (#3B82F6)
   - Option to add Colors Option Set for predefined palette if needed

**Technical Details:**

**CLAUDE.md Structure:**
- Project Overview (business context, dual status)
- Tech Stack (Next.js + Bubble.io)
- 8 Implementation Phases (detailed week-by-week)
- Critical Architecture Rules (client/server boundary)
- Bubble.io Best Practices & Patterns
- Key Components & State Management
- API Routes documentation
- Type Definitions
- Role-Based Features
- Testing & Debugging
- Scalability Considerations
- Feature Roadmap
- Technical Constraints
- Documentation References
- Tech Lead Recommendations
- Support & Maintenance Strategy

**Database Best Practices Applied:**
```
Option Set Usage:
✅ Drawings.type → DrawingTypes
✅ Drawings.elementType → ElementTypes
✅ Drawings.status → ElementStatus (NEW)
✅ Drawings.category → Categories (NEW)
✅ Drawings.approvalStatus → ApprovalStatus
✅ Drawings.createdByRole → Roles
✅ Drawing Entities.type → ValidEntityTypes
✅ Drawing Entities.status → ElementStatus
✅ Issues.createdByRole → Roles
✅ Issues.status → IssueStatus (NEW)
✅ Users.role → Roles

Text Field Usage (appropriate):
✅ Drawings.color → text (custom hex colors)
✅ Drawings.privacy → text (complex JSON)
✅ Drawings.coordinates → text (JSON arrays)
✅ Drawings.metadata → text (JSON)
✅ User content → text (names, descriptions, notes)
```

**Commits Made:**
1. `8088d81` - Transform CLAUDE.md into comprehensive Tech Lead-style documentation
2. `336c846` - Refactor database schema to use Bubble.io Option Sets best practices

**Status:** ✅ Documentation complete, database schema follows Bubble.io best practices

---

**Last Updated:** 2025-10-09 (Session 4)
**Next Session Focus:** Continue reviewing BUBBLE_IMPLEMENTATION_PLAN.md (Phases 2-8) or begin Bubble.io Week 1 implementation
