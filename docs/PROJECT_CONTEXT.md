# PROJECT_CONTEXT.md — Continuous Project Memory

> **📖 How to Update**
>
> **Quick update**: Manually add compressed session entry (5-10 lines) using template in `.claude/commands/project-context.md`
> **AI-assisted**: Type `/session-end` and approve generated summary (recommended)
> **Keep brief**: Document decisions, not implementation details

A single source of truth for project status, decisions, and session history.
Updated after each work session to maintain full context and enable seamless continuation.

---

## 🧠 Current Focus

**Bubble.io Freehand Drawing Implementation - In Progress**

Step 3 complete: Freehand drawing saves to database and renders on map successfully. Database and Toolbox plugin configured correctly. Coordinate format handling (GeoJSON ↔ Leaflet) working. Next: Implement page reload functionality (Step 4) to load existing drawings from database.

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

**See CLAUDE.md for complete tech stack details**

**Quick Reference:**
- **Next.js**: Next.js 15 + React 19 + TypeScript + Leaflet + Supabase
- **Bubble.io**: Leafy Maps plugin + custom JavaScript + Bubble database

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

### Session 1: 2025-10-06 (Initial Planning)

**Outputs:** BUBBLE_TRANSFORMATION_PLAN.md, BUBBLE_IMPLEMENTATION_PLAN.md, initial CLAUDE.md
**Key Decisions:** ✅ Leafy Maps extension, ✅ 8-week timeline, ✅ Freehand solution validated
**Status:** Planning complete

---

### Session 2: 2025-10-06 (Entity Architecture Discovery)

**Issue Discovered:** Architecture gap - drawings cannot link to other drawings, only to entities
**Solution Designed:** "Create Entity from Drawing" button for admins to promote drawings → entities
**Decision:** Implement in Bubble only (skip Next.js prototype)
**Status:** Feature designed

---

### Session 3: 2025-10-09 (Bubble Feature Planning)

**Work Done:** Integrated "Create Entity from Drawing" into BUBBLE_IMPLEMENTATION_PLAN.md
**Decisions:** ✅ ValidEntityTypes option set, ✅ Admin-only workflow, ✅ Metadata tracking
**Status:** Feature documented

---

### Session 4: 2025-10-09 (Documentation & Schema Refactor)

**Work Done:**
- Expanded CLAUDE.md to comprehensive Tech Lead guide (7KB → 47KB)
- Refactored Bubble schema to use Option Sets (8 sets added/used)
- Documented best practices and architecture patterns

**Key Changes:**
- All predefined values → Option Sets (data integrity)
- Built-in Bubble date fields (Created Date, Modified Date)
- Complete API documentation and troubleshooting guide

**Commits:** `8088d81`, `336c846`
**Status:** Documentation complete

---

### Session 5: 2025-10-09 (Documentation Optimization & Session Workflow)

**Work Done:**
- Optimized documentation: CLAUDE.md 47KB → 11KB (-77%), PROJECT_CONTEXT.md 24KB → 15KB (-38%)
- Archived obsolete docs (REFERENCE_ prefix for BUBBLE_TRANSFORMATION_PLAN, PRD)
- Created AI-assisted session update workflow with `/session-end` command

**Key Decisions:**
- Each doc has single purpose (CLAUDE=quick ref, BUBBLE_PLAN=details, PROJECT_CONTEXT=history)
- AI-assisted updates recommended (30s vs 5min manual)
- Archive sessions every 10 entries to keep file under 20KB

**Commits:** `de27033`
**Status:** Complete

---

### Session 6: 2025-10-10 (Bubble.io Freehand Implementation - Step 3 Complete)

**Work Done:**
- Implemented freehand drawing in Bubble.io with Toolbox plugin integration
- Created bubble-freehand-header-v2.html (working map capture + drawing)
- Built complete "Save and Render Drawing" workflow (database + map rendering)
- Fixed coordinate format handling (GeoJSON [lng,lat] → Leaflet [lat,lng])
- Created BUBBLE_WORKFLOW_GUIDE.md and STEP_3_QUICK_REFERENCE.md

**Key Decisions:**
- Toolbox element trigger method: Use element's "Trigger event" setting (simpler than workflow trigger)
- Coordinate simplification working: 113 points → 27 points via Douglas-Peucker
- Bubble JavaScript context: Avoid `return` statements (use conditional wrapping instead)

**Status:** Step 3 complete ✅ (Drawing saves to DB and renders on map)
**Next:** Step 4 - Load drawings on page refresh

---

**Last Updated:** 2025-10-10 (Session 6)
**Next Session Focus:** Step 4 - Load drawings on page refresh, then Step 5 - Drawing selection
