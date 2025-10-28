# CLAUDE.md - Water Infrastructure Interactive Map

*Quick reference guide for AI assistants working with this repository*

---

## 👤 User Info
- **Name**: Rafael
- **Commit format**: Co-Authored-By: Claude <noreply@anthropic.com> (NO 🤖 emoji)
- **Documentation**: Keep CLAUDE.md and bubble/README.md lean - only crucial info

---

## 🎯 Project Overview

**Water Infrastructure Interactive Map** - B2B SaaS platform for canal companies to visualize and manage water infrastructure with interactive mapping and role-based privacy controls.

### Implementation Strategy
- **Next.js Prototype** (Complete) - Reference implementation for behavior
- **Bubble.io Production** (In Progress) - Target platform with Leafy Maps + custom JavaScript

### Current Status
✅ **Phase 3 Complete**: Drawing Tools (Point, Line, Area, Freehand) + Cancel/Done buttons (wrapper architecture)
🔜 **Phase 4 Next**: UI Components (Toolbar, Layers Panel, Details Panel)

---

## 📚 Documentation Map

| Document | Purpose |
|----------|---------|
| **CLAUDE.md** (this file) | AI assistant quick reference |
| **bubble/README.md** | Current status, recent updates, next steps |
| **bubble/docs/BUBBLE_IMPLEMENTATION_PLAN.md** | Complete 8-week implementation roadmap |
| **bubble/docs/TOOLBAR_CANCEL_DONE_BUTTONS.md** | Cancel/Done buttons (Wrapper + Toolbox pattern, ~18 min) |
| **bubble/scripts/workflows/*.js** | Copy-paste workflow snippets for Bubble |
| **nextjs/docs/AGENTS.md** | Next.js reference (client/server rules) |

---

## 🛠️ Tech Stack

**Bubble.io (Production)**:
- Platform: Bubble.io visual editor
- Maps: Leafy Maps plugin (ZeroQode) + custom JavaScript
- Database: Bubble native tables + Option Sets
- Mobile: BDK wrapper for iOS/Android

**Next.js (Reference Only)**:
- Next.js 15 + React 19 + TypeScript + Leaflet 1.9.4
- Deployed on Vercel + Supabase

---

## ⚠️ Critical Bubble.io Patterns

### 1. List Fields → JavaScript Arrays (CRITICAL!)

**Problem**: Bubble passes list fields as strings, causing `TypeError: privacy.join is not a function`

**Solution**:
```javascript
// In Bubble JavaScript action:
var privacy = [<Result of Step X's privacy:each item Display:formatted as text>];
```

**Configuration**:
- In "formatted as text" field: `"This Text"`
- Set delimiter: `,`
- Result: `["User", "Ditch Rider", "Admin"]` (proper JavaScript array)

### 2. Storage Pattern (Object, Not Array!)

**✅ CORRECT**:
```javascript
window.__drawing_layers[drawingId] = { layer, marker, type };
```

**❌ WRONG** (causes color updates to fail):
```javascript
window.__drawing_state.drawings.push({ id, layer, marker, type });
```

### 3. Universal Utility Functions

Available in `bubble-drawing-tools-v4.html`:

```javascript
window.stopAllDrawingTools();                    // Stop all 4 drawing modes (JavaScript cleanup only)
window.finishCurrentDrawing();                   // Finish active drawing (Done button)
window.removeDrawing(drawingId);                 // Remove any drawing type
window.updateDrawingColor(drawingId, '#FF5733'); // Update color (recreates markers)
window.updateDrawingOpacity(drawingId, 0.5);     // Update polygon opacity
```

**Cancel/Done Button Pattern (Wrapper + Toolbox):**
- **Cancel:** Trigger "Reset Drawing State" event → Calls `stopAllDrawingTools()` + resets states
- **Done:** Call `window.finishCurrentDrawing()` → Calls wrapper → Toolbox (with output1/2/3) → Bubble workflow
- **Point Tracking:** JavaScript calls `pointAdded({tool, pointCount})` → Wrapper extracts count → Toolbox element
- **State Reset:** Bubble "Reset Drawing State" event handles both JS cleanup and state reset
- **Bubble States:** `activeTool` (text), `pointCount` (number) - updated via Toolbox elements
- **Architecture:** Page Header → Wrappers (plain names) → Toolbox (bubble_fn_ prefix + outputs) → Workflows
- **Toolbox Format:** Wrappers pass `{output1, output2, output3}` to match Bubble's Toolbox plugin requirements
- **Lazy loading:** Wrappers initialize on first Line button click (not page load)

### 4. Map Access Pattern

```javascript
var map = window.__leafy_found_map;  // Captured Leaflet map instance
if (!map) {
  console.error('Map not found');
  return;
}
```

### 5. Coordinate Simplification

For freehand drawings exceeding 1MB text field limit:

```javascript
simplifyPath(points, 0.0001);  // Douglas-Peucker algorithm
// Increase tolerance if still too large: 0.0001 → 0.0005
```

---

## 📊 Current Implementation Status

| Phase | Status | Key Features |
|-------|--------|--------------|
| **1. Foundation** | ✅ Complete | Database schema, Option Sets, User roles |
| **2. Map Setup** | ✅ Complete | Leafy Maps integration, map capture, load drawings |
| **3. Drawing Tools** | ✅ Complete | Point, Line, Area, Freehand + tooltips + @ badge |
| **4. UI Components** | 🔜 Next | Toolbar, Layers Panel, Details Panel |
| **5. Business Logic** | ⏳ Pending | Privacy filtering, approval workflows |
| **6. Mobile** | ⏳ Pending | Responsive design, touch optimization |
| **7. Testing** | ⏳ Pending | QA, bug fixes, performance |
| **8. Deployment** | ⏳ Pending | Data migration, launch |

**See**: `bubble/docs/BUBBLE_IMPLEMENTATION_PLAN.md` for full details

---

## 🗄️ Core Data Models

### Drawing (Bubble.io)

**Fields**:
- `type`: "point" | "line" | "area" | "draw" (lowercase, matches DrawingTypes Option Set)
- `coordinates`: Text (JSON array of [lng, lat] pairs)
- `markerPosition`: Text (JSON [lat, lng] for markers)
- `name`: Text
- `color`: Text (hex color)
- `elementType`: Option Set (Canal, Headgate, etc.)
- `approvalStatus`: Option Set (pending, approved, rejected)
- `showTooltip`: Text ("yes" | "no")
- `privacy`: List of Account Types (User, Ditch Rider, Admin)
- `createdBy`: User
- `createdByRole`: Text
- `properties`: Text (full GeoJSON Feature)

**Option Sets**: DrawingTypes, ElementTypes, Roles, ApprovalStatus

---

## 🔑 Key Features

### Drawing Tools (4 types)
1. **Point** - Single-click marker with SVG pin
2. **Line** - Click vertices, double-click to finish
3. **Freehand** - Click-drag for smooth polylines
4. **Area** - Click vertices, double-click to close polygon

### User Roles
- **Admin**: Full access, approve/reject drawings, create entities
- **Ditch Rider**: Create drawings (pending approval), filtered view
- **User**: View only, report issues

### Visual Features
- Rich 4-line tooltips (name, type, pending status, privacy)
- @ badge for pending approval
- SVG pin markers (25x41) for Points and center markers
- Auto-render option for immediate visual feedback

---

## 🎯 AI Session Workflow

### Start of Session
1. Read `bubble/README.md` for latest status and recent updates
2. Check current phase and next steps
3. Review any blockers or open questions

### During Session
1. Follow existing patterns (especially storage and list field formats)
2. Use workflow snippets from `bubble/scripts/workflows/*.js`
3. Test changes thoroughly (especially color updates, delete, tooltip display)
4. Document any new patterns discovered

### End of Session
1. Update `bubble/README.md` with session summary under "Recent Updates"
2. Update CLAUDE.md if new critical patterns discovered
3. Clean up both files - remove outdated info

---

## 🧪 Common Bubble.io Issues

### Issue: privacy.join is not a function
**Cause**: Privacy field not formatted as JavaScript array
**Solution**: Use `[<privacy:each item Display:formatted as text>]` syntax (see pattern #1 above)

### Issue: Color updates don't show until page reload
**Cause**: Using array storage instead of object
**Solution**: Use `window.__drawing_layers[id] = {}` pattern (see pattern #2 above)

### Issue: Map not found
**Cause**: Leaflet not loaded or script timing issue
**Solution**: Check `window.__leafy_found_map` in console, ensure page header script loaded first

### Issue: Coordinates too large (>1MB)
**Cause**: Too many points in freehand drawing
**Solution**: Increase Douglas-Peucker tolerance: `0.0001` → `0.0005`

---

## ⚡ Quick Reference

### Workflow Files
- `bubble-point-tool.js` - Point tool snippets (6 snippets)
- `bubble-line-tool.js` - Line tool snippets (5 snippets)
- `bubble-area-tool.js` - Area tool snippets (5 snippets)
- `bubble-load-drawings.js` - Load all drawings on page load

### Page Header Script
- `bubble-drawing-tools-v4.html` - Main script with all 4 tools + utilities

### Key Bubble Elements
**Wrapper Functions (initialized on Line button click):**
- `pointAdded(data)` - Receives {tool, pointCount} → Calls `bubble_fn_update_point_count()`
- `lineComplete(geojson)` - Calculates marker position → Calls `bubble_fn_saveLineDrawing({output1, output2, output3})`
- `areaComplete(geojson)` - Calculates marker position → Calls `bubble_fn_saveAreaDrawing({output1, output2, output3})`

**Toolbox (JavaScript to Bubble):**
- `bubble_fn_update_point_count` - Receives point count from wrapper
- `bubble_fn_saveLineDrawing` - Receives 3 outputs:
  - `output1` = Full GeoJSON Feature (properties field)
  - `output2` = Coordinates array (coordinates field)
  - `output3` = Marker position [lat, lng] (markerPosition field)
- `bubble_fn_saveAreaDrawing` - Receives 3 outputs:
  - `output1` = Full GeoJSON Feature (properties field)
  - `output2` = Coordinates array (coordinates field)
  - `output3` = Marker position [lat, lng] (markerPosition field)

**Custom Events:**
- "Reset Drawing State" - Stops tools + resets states (prevents circular dependency)

### Key Bubble Workflows
1. "When Page is loaded" - Load drawings on map
2. "When Line button is clicked" - Initialize wrappers + Trigger "Reset Drawing State" + start tool
3. "When [Toolbox element] value returned" - Save to database + render on map
4. "When Drawing is selected" - Show Details Panel
5. "When Color Picker changed" - Update drawing + call utility function

**Note:** Wrappers are initialized lazily on first Line button click, then reused for both Line and Area tools.

---

## 📋 Bubble.io Best Practices

### Always
- Use Option Sets for predefined values (types, statuses, roles)
- Test drawings save/reload correctly
- Use object storage: `window.__drawing_layers[id]`
- Format list fields properly before passing to JavaScript
- Call `window.stopAllDrawingTools()` before starting new tool
- Set `showTooltip` to "yes" by default

### Never
- Use array storage for drawings
- Pass list fields without proper formatting
- Skip privacy filtering in workflows
- Create drawings without tracking `createdBy` and `createdByRole`
- Forget to add click handlers for selection

---

## 🔗 External Resources

- **Leaflet Docs**: https://leafletjs.com/reference.html
- **Leafy Maps Plugin**: https://docs.zeroqode.com/plugins/leafy-maps
- **Bubble Manual**: https://manual.bubble.io/
- **GeoJSON Spec**: https://geojson.org/

---
