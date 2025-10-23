# Step 6 Quick Reference - Point Drawing Tool

> **For implementing single-click marker placement**

## ✅ Prerequisites

- Steps 1-5 complete (Map setup, freehand drawing, load drawings, selection)
- Page header script updated to v4 (`bubble-drawing-tools-v4.html`)
- Map capture working (`window.__leafy_found_map` available)
- Drawing save workflow functional

## 🎯 What You're Building

A Point tool that allows users to:
1. Click a button to activate Point mode
2. Click once on the map to place a marker
3. Automatically save to database
4. Render marker on map with selection capability

## 📐 Workflow Overview

```
User clicks "Point" button
    ↓
Activate Point mode (cursor: crosshair)
    ↓
User clicks map location
    ↓
Create GeoJSON Point data
    ↓
Save to database (type: "point")
    ↓
Render marker on map
    ↓
Enable selection
    ↓
Reset to Select mode
```

## 🔧 Implementation Steps

### Step 1: Update Page Header Script

1. **Replace old header script** with new v4 version
2. **Location:** Settings → SEO/Meta tags → Script/meta tags in header
3. **File:** Copy contents from `bubble/scripts/page-header/bubble-drawing-tools-v4.html`
4. **Verify:** Open browser console and check for: `"🚀 Leafy Drawing Tools v4 initialized"`

### Step 2: Add Point Button to Drawing Toolbar

1. Go to your **DrawingToolbar** reusable element
2. **Add new Button:**
   - Text: "Point" (or use icon: 📍)
   - Style: Same as other tool buttons
   - Conditional formatting: Background color = blue when `currentTool = "point"`
3. **Place button** next to Freehand button

### Step 3: Create "Point Tool Clicked" Workflow

**Trigger:** When Point button is clicked

**Actions:**

#### Action 1: Set Current Tool State
```
Element → Set state
  State: currentTool = "point"
```

#### Action 2: Enable Point Drawing Mode
```
Plugins → Toolbox → Run JavaScript

Code:
window.__leafy_point.start({ autoRender: true });
```

### Step 4: Create Point Completion Callback

**Trigger:** Page is loaded (or in same workflow as Step 3)

**Action:** Run JavaScript
```javascript
// Register callback for when point is placed
// Receives object with 3 outputs (matching freehand pattern):
//   output1 = properties (full GeoJSON Feature)
//   output2 = coordinates [[-47.xxx, -23.xxx]] - array of coordinate pairs
//   output3 = marker_position ([-23.xxx, -47.xxx] - reversed!)

window.bubble_fn_pointComplete = function(data) {
  console.log('📍 Point tool callback triggered');
  console.log('  - Properties:', data.output1);
  console.log('  - Coordinates:', data.output2);
  console.log('  - Marker Position:', data.output3);

  // Trigger Bubble workflow to save
  // You'll create this in Step 5
  if (window.bubble_fn_savePointDrawing) {
    bubble_fn_savePointDrawing({
      output1: data.output1,   // Full GeoJSON Feature object
      output2: data.output2,   // Coordinates: [[-47.xxx, -23.xxx]]
      output3: data.output3    // Marker position: [-23.xxx, -47.xxx]
    });
  }
};

console.log('✅ Point completion callback registered');
```

### Step 5: Create "Save Point Drawing" Workflow

**Trigger:** Custom Event (triggered by JavaScript above)

**Actions:**

#### Action 1: Create Drawing Record
```
Data → Create a new thing
  Type: Drawing
  Fields:
    type = "point"
    coordinates = <output2_coords parameter>
    markerPosition = <output3_markerPos parameter>
    name = "Point - " + Current date/time (formatted as "MMM d, yyyy h:mm a")
    color = "#3B82F6"
    elementType = "custom" (or use state)
    properties = <output1_properties parameter>
    approvalStatus = if Current User's role = "Admin" then "approved" else "pending"
    createdBy = Current User
    createdByRole = Current User's role
    createdAt = Current date/time
    privacy = [List of Account Type]:
      - Add: All Account Types (User, Ditch Rider, Admin)
      OR
      - Use custom state/dropdown selection for privacy
```

**Note on privacy field:**
- Type: List of "Account Type" (Option Set)
- Default: Add all three types (everyone can see)
- To restrict: Only add specific types (e.g., only "Admin" and "Ditch Rider")

#### Action 2: Render Marker on Map
```
Plugins → Toolbox → Run JavaScript

Code:
// Parse marker position from database field
var markerPosText = '<Result of Step 1's markerPosition>';
var markerPos = JSON.parse(markerPosText);  // [-23.xxx, -47.xxx]
var lat = markerPos[0];
var lng = markerPos[1];

var drawingId = '<Result of Step 1's _id>';
var color = '<Result of Step 1's color>';
var name = '<Result of Step 1's name>';

var map = window.__leafy_found_map;

// Create marker with custom colored circle
var marker = L.marker([lat, lng], {
  icon: L.divIcon({
    html: '<div class="custom-marker" style="width:24px;height:24px;background:' + color + ';border:3px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3);cursor:pointer;"></div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    className: 'drawing-marker-point'
  })
}).addTo(map);

// Add tooltip
marker.bindTooltip(name, {
  permanent: false,
  direction: 'top',
  offset: [0, -12]
});

// Make clickable for selection
marker.on('click', function(e) {
  L.DomEvent.stopPropagation(e);
  console.log('🖱️ Point marker clicked:', drawingId);

  if (window.bubble_fn_drawing_selected) {
    bubble_fn_drawing_selected(drawingId);
  }
});

// Store reference
if (!window.__drawing_state) window.__drawing_state = { drawings: [] };
window.__drawing_state.drawings.push({
  id: drawingId,
  layer: marker,
  marker: marker,
  type: 'point'
});

console.log('✅ Point marker rendered:', drawingId);
```

**Alternative: Use standard Leaflet blue pin icon**
```javascript
// Replace the marker creation above with:
var marker = L.marker([lat, lng], {
  icon: L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })
}).addTo(map);
```

#### Action 3: Select New Drawing
```
Element → Set state
  State: selectedDrawing = Result of Step 1
```

#### Action 4: Reset Tool to Select Mode
```
Element → Set state
  State: currentTool = "select"
```

## 🧪 Testing Checklist

### Basic Functionality
- [ ] Point button appears in toolbar
- [ ] Clicking Point button changes cursor to crosshair
- [ ] Point button highlights when active
- [ ] Single click places marker
- [ ] Marker appears on map at clicked location
- [ ] Cursor returns to normal after placing marker

### Database & Persistence
- [ ] Drawing record created in database with type = "point"
- [ ] Coordinates saved correctly `[lat, lng]`
- [ ] markerPosition matches coordinates
- [ ] createdBy and createdByRole populated
- [ ] approvalStatus = "pending" for non-admins
- [ ] Page refresh loads point markers correctly

### Selection & Interaction
- [ ] Clicking marker selects the drawing
- [ ] Selection panel shows point details
- [ ] Can edit point properties (name, color, element type)
- [ ] Can delete point
- [ ] Privacy settings work correctly

### User Roles
- [ ] Admin: Point immediately approved and visible
- [ ] Ditch Rider: Point pending approval, visible to admin only
- [ ] User: (May not have drawing permissions based on your rules)

## 🐛 Troubleshooting

### Issue: Point button doesn't activate
**Solution:**
1. Check browser console for JavaScript errors
2. Verify v4 header script is installed
3. Test: `window.__leafy_point` (should return object)
4. Test: `window.__leafy_found_map` (should return Leaflet map)

### Issue: Marker doesn't appear after clicking
**Check:**
1. Console shows: `"📍 Point placed -> window.__leafy_last_point"`
2. `window.bubble_fn_pointComplete` is defined
3. Database record was created (check Data tab)
4. JavaScript render code executed without errors

### Issue: Can't click marker to select it
**Solution:**
1. Verify click handler is attached in render code
2. Check `window.bubble_fn_drawing_selected` is defined
3. Test: Click marker and check console for `"🖱️ Drawing clicked"`

### Issue: Markers don't load on page refresh
**Solution:**
1. Verify load drawings workflow includes type = "point"
2. Check rendering logic handles Point geometry type
3. Look for JavaScript errors during page load
4. Ensure coordinates are in array format: `[[-47.xxx, -23.xxx]]` not `[-47.xxx, -23.xxx]`

### Issue: Double markers showing (Point + center marker)
**Solution:**
1. The load drawings script should skip center marker creation for Points
2. Check for condition: `if (markerPos && drawing.type !== 'point')`
3. Point markers are already clickable, no center marker needed

## 📊 Database Schema Reminder

**Point Drawing Example (matches freehand pattern):**

**Coordinates (text):**
```
[[-47.59843826293945,-23.51272126716066]]
```
Array containing one `[lng, lat]` pair - **wrapped in array for consistency with polylines/polygons**

**Marker Position (text):**
```
[-23.51272126716066,-47.59843826293945]
```
Same location but `[lat, lng]` - **REVERSED from coordinates!**

**Properties (text):**
```json
{"type":"Feature","geometry":{"type":"Point","coordinates":[-47.59843826293945,-23.51272126716066]},"properties":{"tool":"point","color":"#3B82F6"}}
```
Full GeoJSON Feature object

**Complete Database Record:**
```javascript
{
  type: "point",
  coordinates: "[[-47.59843826293945,-23.51272126716066]]",  // [[lng, lat]] - array format!
  markerPosition: "[-23.51272126716066,-47.59843826293945]",  // [lat, lng] - reversed!
  name: "Point - Oct 23, 2025 3:45 PM",
  color: "#3B82F6",
  elementType: "custom",
  properties: "{\"type\":\"Feature\",\"geometry\":{...}}",  // Full GeoJSON
  approvalStatus: "pending",
  createdBy: [User],
  createdByRole: "Ditch Rider",
  privacy: [List of Account Types: "User", "Ditch Rider", "Admin"]  // Not JSON!
}
```

**Key Points:**
- ✅ Coordinates: `[[lng, lat]]` - wrapped in array like polylines/polygons for consistent parsing
- ✅ MarkerPosition: `[lat, lng]` - reversed from coordinates (Leaflet format)
- ✅ Properties: Full GeoJSON Feature object
- ✅ Privacy: List of Account Type option set, not JSON text
- ✅ Uses object pattern for JS-to-Bubble communication

## 🎯 Success Criteria

✅ Point tool fully functional
✅ Markers save to database
✅ Markers persist across page refreshes
✅ Selection works on click
✅ Privacy filtering applies
✅ Approval workflow functions

## 🚀 Next Steps

After Point tool is working:
- **Step 7:** Implement Line tool (click-based polyline)
- **Step 8:** Implement Area tool (click-based polygon)
- **Step 9:** Add drawing editing capabilities
- **Step 10:** Polish UI/UX and add validation

## 📚 Related Files

- **Header Script:** `bubble/scripts/page-header/bubble-drawing-tools-v4.html`
- **Workflow Helper:** `bubble/scripts/workflows/bubble-point-tool.js` (if created)
- **Implementation Plan:** `bubble/docs/BUBBLE_IMPLEMENTATION_PLAN.md`
- **Load Drawings:** Use existing workflow from Step 4, ensure it handles "point" type
