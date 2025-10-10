# Step 4 Quick Reference - Load Drawings on Page Refresh

> **For implementing drawing reload functionality**

## ✅ Prerequisites

- Step 3 complete (drawings save to database)
- Drawings table has records with: coordinates, markerPosition, color, type, elementType
- Map capture working (`window.__leafy_found_map` available)

## 🎯 What You're Building

When the page loads, automatically:
1. Query all approved drawings from database
2. Convert coordinates from GeoJSON to Leaflet format
3. Render each drawing on the map (polylines, polygons, markers)
4. Add clickable center markers for selection
5. Fit map to show all drawings

## 📐 Workflow Overview

```
Page is loaded
    ↓
Wait for map to initialize (500ms delay)
    ↓
Query database for approved drawings
    ↓
For each drawing:
  - Parse coordinates
  - Convert format (GeoJSON → Leaflet)
  - Create Leaflet layer
  - Add center marker
  - Add click handlers
  - Store references
    ↓
Fit map bounds to show all drawings
```

## 🔧 Implementation Steps

### Step 1: Create Page Load Workflow

1. Go to **Workflow tab**
2. Click **"Click here to add an event..."**
3. Select **"General" → "When Page is loaded"**

### Step 2: Add "Load Drawings" Action

**Action:** Plugins → Toolbox → Run JavaScript

**JavaScript Code:**

```javascript
// ===== STEP 4: LOAD ALL DRAWINGS ON PAGE LOAD =====

console.log('🔄 Step 4: Loading drawings from database...');

// IMPORTANT: Bubble will inject drawing data here
// You'll insert dynamic data in the Bubble editor
var drawings = <BUBBLE_DATA_INJECTION>;

console.log('📊 Found', drawings.length, 'approved drawings to render');

// Function to render all drawings
var renderAllDrawings = function() {
  var map = window.__leafy_found_map;

  // Check if map is ready
  if (!map) {
    console.log('⏳ Map not ready yet, waiting 500ms...');
    setTimeout(renderAllDrawings, 500);
    return;
  }

  console.log('✅ Map ready, starting to render', drawings.length, 'drawings');

  // Initialize storage for layer references
  if (!window.__drawing_layers) {
    window.__drawing_layers = {};
  }

  // Keep track of all layers for bounds fitting
  var allLayers = [];

  // Render each drawing
  drawings.forEach(function(drawing, index) {
    try {
      console.log('🖼️ Rendering drawing', (index + 1) + '/' + drawings.length, '- ID:', drawing.id, '- Type:', drawing.type);

      // Parse coordinates and marker position
      var coords = JSON.parse(drawing.coords);
      var markerPos = drawing.markerPos ? JSON.parse(drawing.markerPos) : null;

      // Convert GeoJSON [lng, lat] to Leaflet [lat, lng]
      var leafletCoords;
      if (drawing.type === 'point') {
        // Point: single coordinate pair
        leafletCoords = [coords[1], coords[0]];
      } else {
        // Line/Polygon: array of coordinate pairs
        leafletCoords = coords.map(function(c) {
          return [c[1], c[0]];  // Swap: [lng, lat] → [lat, lng]
        });
      }

      console.log('🔄 Converted', coords.length || 1, 'coordinates from GeoJSON to Leaflet format');

      // Create appropriate Leaflet layer based on type
      var layer;

      if (drawing.type === 'point') {
        // Point marker
        layer = L.marker(leafletCoords, {
          icon: L.divIcon({
            html: '<div class="custom-marker" style="width:24px;height:24px;background:' + drawing.color + ';border:3px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>',
            iconSize: [24, 24],
            className: 'drawing-marker-point'
          })
        }).addTo(map);

        console.log('📍 Created point marker');

      } else if (drawing.type === 'polygon') {
        // Polygon (area)
        layer = L.polygon(leafletCoords, {
          color: drawing.color,
          weight: 3,
          fillOpacity: 0.3,
          opacity: 1
        }).addTo(map);

        console.log('🔷 Created polygon with', leafletCoords.length, 'vertices');

      } else {
        // Polyline (line or freehand)
        layer = L.polyline(leafletCoords, {
          color: drawing.color,
          weight: 3,
          opacity: 1,
          smoothFactor: 1.0
        }).addTo(map);

        console.log('📏 Created polyline with', leafletCoords.length, 'points');
      }

      // Add click handler to layer for selection
      layer.on('click', function(e) {
        L.DomEvent.stopPropagation(e);
        console.log('🖱️ Drawing clicked:', drawing.id);

        // Trigger Bubble selection workflow (Step 5)
        if (window.bubble_fn_drawing_selected) {
          bubble_fn_drawing_selected({ output1: drawing.id });
        }
      });

      // Create center marker for easier selection (except for point type)
      var centerMarker = null;
      if (markerPos && drawing.type !== 'point') {
        centerMarker = L.marker([markerPos[0], markerPos[1]], {
          icon: L.divIcon({
            html: '<div class="center-marker" style="width:16px;height:16px;background:' + drawing.color + ';border:2px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.4);cursor:pointer;"></div>',
            iconSize: [16, 16],
            className: 'drawing-marker-center'
          })
        }).addTo(map);

        // Click handler for center marker
        centerMarker.on('click', function(e) {
          L.DomEvent.stopPropagation(e);
          console.log('🖱️ Center marker clicked:', drawing.id);

          if (window.bubble_fn_drawing_selected) {
            bubble_fn_drawing_selected({ output1: drawing.id });
          }
        });

        console.log('📍 Added center marker at', markerPos);
      }

      // Store references for future use (selection, deletion, etc.)
      window.__drawing_layers[drawing.id] = {
        layer: layer,
        marker: centerMarker,
        data: drawing
      };

      // Add to array for bounds fitting
      allLayers.push(layer);

      console.log('✅ Drawing rendered successfully');

    } catch (error) {
      console.error('❌ Error rendering drawing', drawing.id, ':', error);
    }
  });

  console.log('🎉 All drawings rendered! Total layers:', allLayers.length);

  // Fit map bounds to show all drawings (if any exist)
  if (allLayers.length > 0) {
    try {
      var group = L.featureGroup(allLayers);
      map.fitBounds(group.getBounds(), {
        padding: [50, 50],
        maxZoom: 15  // Prevent over-zooming on single drawing
      });
      console.log('🗺️ Map bounds fitted to show all drawings');
    } catch (error) {
      console.warn('⚠️ Could not fit bounds:', error);
    }
  } else {
    console.log('ℹ️ No drawings to display, keeping default map view');
  }
};

// Start rendering process
renderAllDrawings();
```

### Step 3: Insert Bubble Dynamic Data

In the JavaScript code above, replace `<BUBBLE_DATA_INJECTION>` with Bubble's dynamic data:

1. **Click on** `<BUBBLE_DATA_INJECTION>` in the code editor
2. **Click "Insert dynamic data"**
3. **Select** "Do a search for..."
4. **Type:** Drawings
5. **Add constraints:**
   - approvalStatus = "approved"
   - (Add privacy filter based on current user - see privacy filtering section)
6. **Click ":each item's"**
7. **Select "arbitrary text"**
8. **Enter this EXACT format:**

```
{"id":"<This Drawing's unique id>","coords":"<This Drawing's coordinates>","color":"<This Drawing's color>","type":"<This Drawing's type>","markerPos":"<This Drawing's markerPosition>","name":"<This Drawing's name>","elementType":"<This Drawing's elementType>"}
```

9. **For each `<This Drawing's ...>`**, click on it and select the corresponding field:
   - `<This Drawing's unique id>` → Click → Select "This Drawing" → "unique id"
   - `<This Drawing's coordinates>` → Click → Select "This Drawing" → "coordinates"
   - `<This Drawing's color>` → Click → Select "This Drawing" → "color"
   - `<This Drawing's type>` → Click → Select "This Drawing" → "type"
   - `<This Drawing's markerPosition>` → Click → Select "This Drawing" → "markerPosition"
   - `<This Drawing's name>` → Click → Select "This Drawing" → "name"
   - `<This Drawing's elementType>` → Click → Select "This Drawing" → "elementType"

10. **Wrap the search in square brackets** `[...]` to create a JavaScript array

**Final format should look like:**
```javascript
var drawings = [{"id":"1234","coords":"[[...]]","color":"#3B82F6",...}, {...}, ...];
```

## 📊 Expected Console Output

When page loads successfully:

```
🔄 Step 4: Loading drawings from database...
📊 Found 5 approved drawings to render
✅ Map ready, starting to render 5 drawings
🖼️ Rendering drawing 1/5 - ID: abc123 - Type: polyline
🔄 Converted 27 coordinates from GeoJSON to Leaflet format
📏 Created polyline with 27 points
📍 Added center marker at [-23.503, -47.604]
✅ Drawing rendered successfully
🖼️ Rendering drawing 2/5 - ID: def456 - Type: polygon
🔄 Converted 8 coordinates from GeoJSON to Leaflet format
🔷 Created polygon with 8 vertices
📍 Added center marker at [-23.510, -47.610]
✅ Drawing rendered successfully
...
🎉 All drawings rendered! Total layers: 5
🗺️ Map bounds fitted to show all drawings
```

## 🐛 Troubleshooting

### Issue: Console shows "Map not ready yet, waiting..."

**Cause:** Map takes longer than expected to initialize

**Solution:**
- This is normal, script will retry automatically
- If persists beyond 3-4 seconds, check:
  - Is Leafy Maps element visible on page?
  - Is page header script loaded? (Check for "✅ Leaflet map captured")
  - Run `window.__leafy_found_map` in console - should return map object

### Issue: Drawings appear in wrong location

**Cause:** Coordinate format not converted properly

**Solution:**
1. Check console for coordinate conversion logs
2. Verify coordinates swap from `[lng, lat]` to `[lat, lng]`
3. For Brazil: Latitude should be ~-23, Longitude ~-47
4. Check database - coordinates should be GeoJSON format: `[[-47.xxx, -23.xxx], ...]`

### Issue: No drawings appear but console shows success

**Cause:** Drawings rendered outside visible map area

**Solution:**
1. Check if bounds fitting worked
2. Manually pan/zoom map to look for drawings
3. Verify coordinate values in database are reasonable (not [0, 0])

### Issue: "bubble_fn_drawing_selected is not a function"

**Cause:** Step 5 (selection workflow) not implemented yet

**Solution:**
- This is expected if Step 5 not done yet
- Drawings will still render, just won't be selectable
- Click functionality will work once Step 5 is complete

### Issue: Drawings render but no center markers

**Cause:** `markerPosition` field is null or empty

**Solution:**
1. Check database - markerPosition should have value like `[-23.503, -47.604]`
2. If null for existing drawings, run Step 3 workflow again to calculate and save markerPosition
3. For point-type drawings, center markers are intentionally not shown (point itself is the marker)

## ✅ Success Criteria

- [ ] Console shows "Found X approved drawings to render"
- [ ] Console shows "All drawings rendered! Total layers: X"
- [ ] All drawings visible on map
- [ ] Drawings in correct location (Brazil coordinates)
- [ ] Center markers visible and hoverable
- [ ] Map automatically fits to show all drawings
- [ ] No errors in console
- [ ] Page reload works consistently
- [ ] Works with 0 drawings (no errors)
- [ ] Works with 10+ drawings (performance OK)

## 🎯 Next Step

After Step 4 works:
- **Step 5**: Implement drawing selection (click to open Details Panel)

---

**Quick Debug Commands:**

```javascript
// Check if map loaded
window.__leafy_found_map

// Check stored layers
window.__drawing_layers

// Count rendered drawings
Object.keys(window.__drawing_layers).length

// Get all drawing IDs
Object.keys(window.__drawing_layers)

// Manually trigger selection
bubble_fn_drawing_selected({ output1: 'DRAWING_ID_HERE' })
```

---

**Version:** 1.0
**Date:** 2025-10-10
**Status:** Ready to implement
