# Bubble.io Freehand Drawing - Complete Workflow Guide

> **🎯 Goal:** Implement freehand drawing that saves to database and renders on map using Toolbox plugin

**Prerequisites:**
- ✅ Leafy Maps plugin installed
- ✅ Toolbox plugin installed
- ✅ Database tables created (Drawings, etc.)
- ✅ Page header with `bubble-freehand-header-v2.html`

---

## 📐 Architecture Overview

```
User clicks "Freehand" button
    ↓
JavaScript registers callback
    ↓
JavaScript starts freehand mode
    ↓
User draws on map
    ↓
JavaScript captures coordinates & simplifies
    ↓
JavaScript sends data to Bubble via "JavaScript to Bubble" element
    ↓
Bubble workflow triggered automatically
    ↓
Create Drawing record in database
    ↓
Run JavaScript to render on map
    ↓
Done! Drawing is saved and visible
```

---

## 🔧 Step 1: Add "JavaScript to Bubble" Element

### 1.1 Add the Element

1. **Open your map page** in Bubble editor
2. **Click anywhere** on the canvas
3. **Click "Insert Element"** → **Plugins** → **Toolbox** → **JavaScript to Bubble**
4. **Place it anywhere** (it will be invisible)

### 1.2 Configure the Element

**Element Inspector Settings:**

| Setting | Value |
|---------|-------|
| Element name | `js_to_bubble_freehand` |
| bubble_fn_suffix | `freehand` |
| This element is visible | ❌ Unchecked (or resize to 1px x 1px) |

**IMPORTANT:** The element must be visible for the global function to be created. Either:
- Keep it visible but resize very small (1px x 1px)
- OR keep it hidden initially and show it programmatically on page load

**In the "Appearance" tab, scroll to "JavaScript to Bubble" settings:**

| Output | Type | Notes |
|--------|------|-------|
| output1 | text | Fixed name (cannot be customized) |
| output2 | text | Fixed name (cannot be customized) |
| output3 | text | Fixed name (cannot be customized) |

**How to configure outputs:**
1. Set "# of outputs" dropdown to **3**
2. For each output (output1, output2, output3):
   - Set "Type" dropdown to **text**
   - Check "Publish value" ✓ (makes it available in workflows)
3. Optionally set "Trigger event" if you want to trigger a custom event

**Note:** Output names (`output1`, `output2`, `output3`) are **fixed by Toolbox** and cannot be renamed. You'll reference them in workflows by these exact names.

### 1.3 Understanding the Function Name

**Element configuration:**
- Element name: `js_to_bubble_freehand`
- bubble_fn_suffix: `freehand` (optional, simplifies function name)

**Generated function:**
- **Without suffix:** `bubble_fn_js_to_bubble_freehand()`
- **With suffix:** `bubble_fn_freehand()`

**We'll use the full name** for clarity: `bubble_fn_js_to_bubble_freehand`

### 1.4 What Each Output Will Store

- **output1:** Full GeoJSON with all properties
- **output2:** Just coordinates array (for database)
- **output3:** Center point [lat, lng] for marker

We'll send data to these outputs from JavaScript using:
```javascript
bubble_fn_js_to_bubble_freehand({
  output1: "geojson data here",
  output2: "coordinates array here",
  output3: "marker position here"
});
```

---

## 🖱️ Step 2: Create "Freehand Tool" Button

### 2.1 Add Button Element

1. **Add a Button** to your toolbar area
2. **Properties:**
   - Text: "Freehand" (or use icon)
   - Style: Primary or custom
   - ID attribute: `btn_freehand` (optional, for styling)

### 2.2 Create Button Workflow

**Click "Start/Edit workflow"** on the button

**Add Action: Plugins → Toolbox → Run JavaScript**

**JavaScript Code (copy exactly):**

```javascript
// STEP 1: Define callback function to handle completed drawings
window.bubble_fn_freehand_callback = function(geojsonString) {
  console.log('🎨 Freehand callback fired!');

  var geojson = JSON.parse(geojsonString);
  var coords = geojson.geometry.coordinates;

  // Calculate center point for marker placement
  var sumLat = 0, sumLng = 0;
  coords.forEach(function(c) {
    sumLat += c[1];  // c[1] is latitude in GeoJSON [lng, lat] format
    sumLng += c[0];  // c[0] is longitude
  });
  var centerLat = sumLat / coords.length;
  var centerLng = sumLng / coords.length;

  console.log('📊 Coordinates:', coords.length, 'points');
  console.log('📍 Center:', [centerLat, centerLng]);

  // STEP 2: Send data to Bubble via JavaScript to Bubble element
  // This triggers the Bubble workflow automatically
  bubble_fn_js_to_bubble_freehand({
    output1: geojsonString,           // Full GeoJSON
    output2: JSON.stringify(coords),  // Coordinates array
    output3: JSON.stringify([centerLat, centerLng])  // Center point
  });

  console.log('✅ Data sent to Bubble workflow');
};

// STEP 3: Register callback with freehand system
window.bubble_fn_freehandComplete = window.bubble_fn_freehand_callback;

// STEP 4: Start freehand drawing mode
window.__leafy_freehand.start();

console.log('🎨 Freehand mode activated - draw on the map now!');
```

**Important Notes:**

- `bubble_fn_js_to_bubble_freehand` is auto-generated by Toolbox based on element name
- Format: `bubble_fn_` + element_name in snake_case
- Element name `js_to_bubble_freehand` → `bubble_fn_js_to_bubble_freehand`

### 2.3 Test Button (Before Full Workflow)

**Preview your app and:**
1. Open browser console (F12)
2. Click "Freehand" button
3. Should see: "🎨 Freehand mode activated"
4. Draw on map
5. Should see callback messages with coordinates

---

## 💾 Step 3: Create "Save and Render Drawing" Workflow

This workflow is triggered **automatically** when JavaScript sends data to the "JavaScript to Bubble" element.

### 3.1 Create Custom Event

1. **Go to Workflow tab**
2. **Click "Create a new workflow"** → **Custom event**
3. **Name:** `Save and Render Drawing`
4. **No parameters needed** (we'll use element values directly)

### 3.2 Set Trigger (Two Methods)

**Method 1: Element Trigger (RECOMMENDED - Easier Setup)**

If the workflow trigger dropdown isn't showing the options you need, use the element's built-in trigger:

1. **Go to your js_to_bubble_freehand element** on the page
2. **In Element Inspector**, find **"Trigger event"** setting
3. **Select:** "Save and Render Drawing" (your custom event)
4. Done! Now when JavaScript calls the function, it automatically triggers your workflow

**Method 2: Workflow Trigger (Alternative)**

**Event:** When **js_to_bubble_freehand's** output1 **is changed**

**How to set:**
1. Click "+ Click here to add a trigger" at top of workflow
2. Select "Elements" → "js_to_bubble_freehand" → "A Javascript to Bubble's value is changed"
3. Which value? → Select **"output1"**

**Note:** Use Method 1 if Method 2's trigger options aren't available in your Bubble version. Both methods work - Method 1 is simpler.

---

### 3.3 Action 1: Create Drawing Record

**Action:** Data (Things) → Create a new thing

**Type:** Drawing

**Fields:**

| Field | Value | Notes |
|-------|-------|-------|
| name | "Freehand Drawing " + Current date/time:formatted as MM/DD/YYYY HH:mm | Auto-generated name |
| type | "polyline" | Fixed value |
| coordinates | js_to_bubble_freehand's output2 | Coordinates array |
| markerPosition | js_to_bubble_freehand's output3 | Center point |
| color | "#3B82F6" | Blue color (or use custom state) |
| elementType | "custom" | Or use custom state elementType |
| properties | js_to_bubble_freehand's output1 | Full GeoJSON for reference |
| approvalStatus | Current User's role is "Admin"? "approved" : "pending" | Conditional |
| createdBy | Current User | Relationship |
| createdByRole | Current User's role | Option Set |
| privacy | {"roles":{"users":false,"ditchRiders":true,"admins":true}} | Default privacy JSON |

**How to set conditional approvalStatus:**
1. Click "Insert dynamic data" next to approvalStatus field
2. Select "Current User" → "role"
3. Add ":when" → "is" → "Admin"
4. True value: "approved"
5. Otherwise: "pending"

**How to set privacy JSON:**
1. Type the JSON directly as text (Bubble accepts this)
2. Or create a custom state with default privacy and reference it

---

### 3.4 Action 2: Render Drawing on Map

**Action:** Plugins → Toolbox → Run JavaScript

**⚠️ CRITICAL: Understanding Coordinate Formats**

Your coordinates are saved in **GeoJSON format** (longitude first):
```javascript
// Real example from your database:
[
  [-47.60736465454102, -23.49902600758877],
  [-47.60809421539307, -23.50040346877795],
  [-47.6109266281128, -23.5037880265397],
  ...
]
// Format: [longitude, latitude]
// Longitude ~-47 = Brazil (west of Greenwich)
// Latitude ~-23 = São Paulo region (south of equator)
```

Leaflet needs **latitude first**:
```javascript
// After conversion for Leaflet:
[
  [-23.49902600758877, -47.60736465454102],
  [-23.50040346877795, -47.60809421539307],
  [-23.5037880265397, -47.6109266281128],
  ...
]
// Format: [latitude, longitude]
```

**Marker Position** (already in Leaflet format):
```javascript
// Your saved marker position: [-23.503161217706367, -47.60409673055013]
// Already correct: [latitude, longitude] ✓
```

**JavaScript Code (with debug logging):**

```javascript
// Get data from JavaScript to Bubble element outputs
var propertiesJson = '<js_to_bubble_freehand's output1>';
var geojson = JSON.parse(propertiesJson);
var coords = geojson.geometry.coordinates;
var drawingId = '<Result of Step 1's unique id>';
var color = '<Result of Step 1's color>';

console.log('🖼️ Rendering drawing:', drawingId);
console.log('📊 Total coordinates:', coords.length, 'points');
console.log('🔍 First coord from GeoJSON (lng,lat):', coords[0]);

// Check if map exists
var map = window.__leafy_found_map;
if (map) {
  // Convert GeoJSON [lng, lat] to Leaflet [lat, lng]
  var leafletCoords = coords.map(function(c) {
    return [c[1], c[0]];  // Swap: [lng, lat] → [lat, lng]
  });

  console.log('🔍 First coord for Leaflet (lat,lng):', leafletCoords[0]);
  console.log('✅ Coordinate conversion complete');

  // Create permanent polyline on map
  var layer = L.polyline(leafletCoords, {
    color: color,
    weight: 3,
    opacity: 1,  // Solid line (not dashed like preview)
    smoothFactor: 1.0
  }).addTo(map);

  console.log('✅ Polyline created and added to map');

  // Store layer reference for future selection/deletion
  if (!window.__drawing_layers) {
    window.__drawing_layers = {};
  }
  window.__drawing_layers[drawingId] = layer;

  // Add click handler to select drawing
  layer.on('click', function(e) {
    L.DomEvent.stopPropagation(e);  // Prevent map click
    console.log('📍 Drawing clicked:', drawingId);

    // Trigger Bubble selection workflow (for Step 5)
    if (window.bubble_fn_js_to_bubble_selected) {
      bubble_fn_js_to_bubble_selected({ output1: drawingId });
    }
  });

  console.log('✅ Drawing rendered successfully!');
} else {
  console.error('❌ Map not found! Cannot render.');
  console.error('💡 Try running: window.__leafy_try_capture_now()');
}
```

**Expected Console Output:**
```
🖼️ Rendering drawing: 1234567890
📊 Total coordinates: 27 points
🔍 First coord from GeoJSON (lng,lat): [-47.607, -23.499]
🔍 First coord for Leaflet (lat,lng): [-23.499, -47.607]
✅ Coordinate conversion complete
✅ Polyline created and added to map
✅ Drawing rendered successfully!
```

**If you see the drawing in wrong location:**
- Check console output - coords should swap from `[lng, lat]` to `[lat, lng]`
- Verify first coordinate changes from negative-40s to negative-20s (latitude for Brazil)
- If still wrong, coordinates might already be in Leaflet format - remove the `.map()` conversion

**Dynamic Data Insertions:**

- `<js_to_bubble_freehand's output1>`: Click, select element "js_to_bubble_freehand", select **"output1"**
- `<Result of Step 1's unique id>`: Click, select "Result of Step 1", select "unique id"
- `<Result of Step 1's color>`: Click, select "Result of Step 1", select "color"

---

### 3.5 Action 3: Reset Tool State (Optional)

**Action:** Element Actions → Set state

**Element:** Your toolbar group or page

**Custom state:** currentTool

**Value:** "select"

*This resets the UI to select mode after drawing is saved.*

---

### 3.6 Action 4: Show Success Message (Optional)

**Action:** Element Actions → Show an alert

**Message:** "Drawing saved successfully!"

Or use a nicer notification:

**Action:** Show/Hide element

**Element:** success_notification_group (create a reusable element)

---

## 🔄 Step 4: Load Drawings on Page Load

> **See STEP_4_LOAD_DRAWINGS.md for detailed quick reference**

### Overview

When the page loads, automatically query all approved drawings from the database and render them on the map with:
- Correct coordinate format conversion (GeoJSON → Leaflet)
- Appropriate layer types (point, line, polygon)
- Clickable layers for selection
- Center markers for easier interaction
- Automatic map bounds fitting

### 4.1 Create Page Load Workflow

1. Go to **Workflow tab**
2. Click **"Click here to add an event..."**
3. Select **"General" → "When Page is loaded"**

### 4.2 Add "Load All Drawings" JavaScript Action

**Action:** Plugins → Toolbox → Run JavaScript

**Code:** (See `bubble-load-drawings.js` or copy from below)

```javascript
console.log('🔄 Step 4: Loading drawings from database...');

// BUBBLE DATA INJECTION - Replace <BUBBLE_DATA_INJECTION> with dynamic data
var drawings = <BUBBLE_DATA_INJECTION>;

console.log('📊 Found', drawings.length, 'approved drawings to render');

var renderAllDrawings = function() {
  var map = window.__leafy_found_map;

  if (!map) {
    console.log('⏳ Map not ready yet, waiting 500ms...');
    setTimeout(renderAllDrawings, 500);
    return;
  }

  console.log('✅ Map ready, starting to render', drawings.length, 'drawings');

  if (!window.__drawing_layers) {
    window.__drawing_layers = {};
  }

  var allLayers = [];

  drawings.forEach(function(drawing, index) {
    try {
      console.log('🖼️ Rendering drawing', (index + 1) + '/' + drawings.length, '- ID:', drawing.id);

      var coords = JSON.parse(drawing.coords);
      var markerPos = drawing.markerPos ? JSON.parse(drawing.markerPos) : null;

      // Convert GeoJSON [lng, lat] to Leaflet [lat, lng]
      var leafletCoords;
      if (drawing.type === 'point') {
        leafletCoords = [coords[1], coords[0]];
      } else {
        leafletCoords = coords.map(function(c) { return [c[1], c[0]]; });
      }

      // Create appropriate Leaflet layer
      var layer;
      if (drawing.type === 'point') {
        layer = L.marker(leafletCoords, {
          icon: L.divIcon({
            html: '<div style="width:24px;height:24px;background:' + drawing.color + ';border:3px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>',
            iconSize: [24, 24],
            className: 'drawing-marker-point'
          })
        }).addTo(map);
      } else if (drawing.type === 'polygon') {
        layer = L.polygon(leafletCoords, {
          color: drawing.color,
          weight: 3,
          fillOpacity: 0.3,
          opacity: 1
        }).addTo(map);
      } else {
        layer = L.polyline(leafletCoords, {
          color: drawing.color,
          weight: 3,
          opacity: 1
        }).addTo(map);
      }

      // Add click handler
      layer.on('click', function(e) {
        L.DomEvent.stopPropagation(e);
        if (window.bubble_fn_drawing_selected) {
          bubble_fn_drawing_selected({ output1: drawing.id });
        }
      });

      // Add center marker (except for points)
      var centerMarker = null;
      if (markerPos && drawing.type !== 'point') {
        centerMarker = L.marker([markerPos[0], markerPos[1]], {
          icon: L.divIcon({
            html: '<div style="width:16px;height:16px;background:' + drawing.color + ';border:2px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.4);cursor:pointer;"></div>',
            iconSize: [16, 16],
            className: 'drawing-marker-center'
          })
        }).addTo(map);

        centerMarker.on('click', function(e) {
          L.DomEvent.stopPropagation(e);
          if (window.bubble_fn_drawing_selected) {
            bubble_fn_drawing_selected({ output1: drawing.id });
          }
        });
      }

      // Store references
      window.__drawing_layers[drawing.id] = {
        layer: layer,
        marker: centerMarker,
        data: drawing
      };

      allLayers.push(layer);

    } catch (error) {
      console.error('❌ Error rendering drawing', drawing.id, error);
    }
  });

  console.log('🎉 All drawings rendered! Total:', allLayers.length);

  // Fit map bounds
  if (allLayers.length > 0) {
    try {
      var group = L.featureGroup(allLayers);
      map.fitBounds(group.getBounds(), { padding: [50, 50], maxZoom: 15 });
    } catch (error) {
      console.warn('⚠️ Could not fit bounds:', error);
    }
  }
};

renderAllDrawings();
```

### 4.3 Insert Bubble Dynamic Data

Replace `<BUBBLE_DATA_INJECTION>` with Bubble's search:

1. **Click on** `<BUBBLE_DATA_INJECTION>` in the code
2. **Insert dynamic data** → "Do a search for"
3. **Type:** Drawings
4. **Constraints:**
   - approvalStatus = "approved"
   - (Add privacy filter if needed)
5. **Click ":each item's"** → Select "arbitrary text"
6. **Format:**
   ```
   {"id":"<This Drawing's unique id>","coords":"<This Drawing's coordinates>","color":"<This Drawing's color>","type":"<This Drawing's type>","markerPos":"<This Drawing's markerPosition>","name":"<This Drawing's name>","elementType":"<This Drawing's elementType>"}
   ```
7. **Click each `<This Drawing's ...>`** and select the corresponding field
8. **Wrap in square brackets** `[...]` to create array

**Final format example:**
```javascript
var drawings = [{"id":"abc123","coords":"[[-47.6, -23.5], ...]","color":"#3B82F6",...}, {...}];
```

### 4.4 Expected Results

**Console output:**
```
🔄 Step 4: Loading drawings from database...
📊 Found 5 approved drawings to render
✅ Map ready, starting to render 5 drawings
🖼️ Rendering drawing 1/5 - ID: abc123
...
🎉 All drawings rendered! Total: 5
```

**Visual results:**
- All approved drawings appear on map
- Drawings in correct location (Brazil: lat ~-23, lng ~-47)
- Center markers visible on lines/polygons
- Map automatically zooms to show all drawings

---

## 🎯 Step 5: Drawing Selection (Click to Open Details)

### 5.1 Add Another "JavaScript to Bubble" Element

**Element:** JavaScript to Bubble

**Name:** `js_to_bubble_selected`

**bubble_fn_suffix:** `drawing_selected` (optional)

**Configure outputs:**
- # of outputs: **1**
- output1 type: **text**
- Check "Publish value" ✓

---

### 5.2 Create Selection Workflow

**Event:** When js_to_bubble_selected's output1 is changed

**Action 1:** Set state
- Element: Page (or details panel)
- State: selectedDrawingId
- Value: js_to_bubble_selected's output1

**Action 2:** Do a search and display
- Search for: Drawings
- Constraint: unique id = js_to_bubble_selected's output1
- :first item

**Action 3:** Show element
- Element: details_panel_group

**Action 4:** Populate details panel fields
(These happen automatically if you bind fields to "Parent group's Drawing")

---

## 🧪 Testing Checklist

### Test 1: Drawing Creation

- [ ] Click "Freehand" button
- [ ] Cursor changes to crosshair
- [ ] Draw on map shows dashed preview
- [ ] Release mouse
- [ ] Console shows "Data sent to Bubble workflow"
- [ ] Console shows "Drawing rendered on map"
- [ ] Solid line appears on map
- [ ] Check database - new Drawing record exists
- [ ] Coordinates field is populated (not null)
- [ ] markerPosition field is populated

### Test 2: Page Reload

- [ ] Refresh page
- [ ] Console shows "Loading X drawings from database"
- [ ] Console shows "Rendered X drawings on map"
- [ ] All drawings appear on map
- [ ] Center markers visible
- [ ] Map fits to show all drawings

### Test 3: Drawing Selection

- [ ] Click on a drawing line
- [ ] Console shows "Drawing selected: [id]"
- [ ] Details panel opens
- [ ] Correct drawing details displayed

### Test 4: Multiple Drawings

- [ ] Draw 3+ different drawings
- [ ] All save successfully
- [ ] All render without overlapping issues
- [ ] All selectable

### Test 5: Privacy & Approval

- [ ] Non-admin user creates drawing
- [ ] approvalStatus = "pending"
- [ ] Drawing not visible on refresh (until approved)
- [ ] Admin approves drawing
- [ ] Drawing becomes visible

---

## 🐛 Troubleshooting

### Issue: Drawing saves but doesn't appear on map

**Cause:** Rendering JavaScript not running or map not found

**Solution:**
1. Check console for "Map not found" error
2. Verify Action 2 (Run JavaScript) exists in your workflow
3. Check dynamic data insertions are correct (output1, drawing ID, color)
4. Verify map is captured: Run `window.__leafy_found_map` in console (should return map object)
5. Add the debug logging from Section 3.4 to see exactly where it fails

**Debug checklist:**
```javascript
// In console, check each step:
window.__leafy_found_map  // Should return Leaflet map object
window.__drawing_layers   // Should be {} or have previous drawings
bubble_fn_js_to_bubble_freehand  // Should be function
```

### Issue: Drawing appears in wrong location (different country/ocean)

**Cause:** Coordinate order not swapped (GeoJSON vs Leaflet format)

**Solution:**
1. Check console logs show coordinate swap:
   - Before: `[-47.xxx, -23.xxx]` (longitude, latitude)
   - After: `[-23.xxx, -47.xxx]` (latitude, longitude)
2. Verify the `.map(c => [c[1], c[0]])` line is in your rendering code
3. For Brazil, latitude should be ~-23 (not -47)

### Issue: "bubble_fn_js_to_bubble_freehand is not a function"

**Cause:** Element name doesn't match function name or element not visible

**Solution:**
- Check element name is exactly: `js_to_bubble_freehand`
- Toolbox converts to: `bubble_fn_` + name
- Use underscores, not hyphens
- Element must be visible (or 1px x 1px) - invisible elements don't create functions

### Issue: Workflow doesn't trigger after drawing

**Cause:** "JavaScript to Bubble" element trigger not set up correctly

**Solution:**
1. Check workflow has trigger: "When js_to_bubble_freehand's output1 is changed"
2. Not "is not empty" - use "is changed"
3. Make sure element is visible (or 1px x 1px) - hidden elements don't create functions

### Issue: Drawings don't reload on page refresh

**Cause:** JavaScript trying to render before map is ready

**Solution:**
- Add `setTimeout` wrapper in rendering code
- Check console for "Map not found" errors
- Increase timeout if needed (500ms → 1000ms)

### Issue: Coordinates saving as text but showing [Object object]

**Cause:** Not stringifying before sending to Bubble

**Solution:**
- Always use `JSON.stringify(coords)` when sending to Bubble
- Bubble text fields store strings, not objects

### Issue: Drawing renders but in wrong location

**Cause:** Coordinate order confusion (lat/lng vs lng/lat)

**Solution:**
- GeoJSON format: `[longitude, latitude]`
- Leaflet format: `[latitude, longitude]`
- Always convert: `coords.map(c => [c[1], c[0]])`

### Issue: Map doesn't capture (window.__leafy_found_map is undefined)

**Cause:** Header script not running or running too early

**Solution:**
1. Check page header has script
2. Check console for errors
3. Run `window.__leafy_try_capture_now()` manually
4. Check Leafy Maps element exists and is visible

---

## 📊 Performance Optimization

### Coordinate Simplification

Already handled by Douglas-Peucker algorithm in header script.

**Current tolerance:** `0.0001` (reduces points by ~60%)

**If you hit 1MB limit:**
- Increase tolerance to `0.0005` in header script
- Check console for "Path simplified: X → Y points"
- Aim for < 500 points per drawing

### Loading Many Drawings (100+)

**Option 1:** Paginate loading
```javascript
// Load first 50, then next 50, etc.
```

**Option 2:** Load only visible area
```javascript
// Filter by map bounds before rendering
```

**Option 3:** Use clustering
```javascript
// Leaflet.markercluster for center markers
```

---

## 🎨 Next Steps

1. ✅ **Freehand working?** → Add other tools (Line, Area, Point)
2. **Add Element Type Selector** → Dropdown before drawing
3. **Add Color Picker** → Let users choose color
4. **Privacy Controls** → Checkboxes in Details Panel
5. **Approval Workflow** → Admin approval buttons
6. **Edit/Delete** → Modify existing drawings
7. **Layers Panel** → Filter by type
8. **Search** → Find drawings by name
9. **Export** → Download as GeoJSON

---

## 📞 Support Commands

**Browser Console Debug Commands:**

```javascript
// Check map
window.__leafy_found_map

// Check last drawing
window.__leafy_last_freehand

// Check rendered layers
window.__drawing_layers

// Manually trigger callback
window.bubble_fn_freehand_callback(JSON.stringify(window.__leafy_last_freehand))

// Check Toolbox functions
bubble_fn_js_to_bubble_freehand
bubble_fn_drawing_selected

// Force map capture
window.__leafy_try_capture_now()
```

---

**Document Version:** 1.0
**Last Updated:** 2025-10-10
**Status:** Production Ready ✅
**Based On:** Toolbox plugin documentation + Investigation report
