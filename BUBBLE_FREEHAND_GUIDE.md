# Bubble.io Freehand Drawing Implementation Guide

> **🎯 Goal:** Get freehand drawing working in your Bubble.io app using the proven solution from the investigation report.

---

## 📋 Quick Setup (5 minutes)

### Step 1: Replace Page Header

1. **Open your Bubble.io app**
2. **Go to your map page** (the one with Leafy Maps plugin)
3. **Delete your current header script** (the one trying to use Geoman)
4. **Copy the entire contents** of `bubble-freehand-header.html`
5. **Paste into your page's HTML header section**

### Step 2: Test Map Capture

1. **Preview your page** (Bubble preview mode)
2. **Open browser console** (F12 → Console tab)
3. **Look for these messages:**
   ```
   ✅ Leaflet map captured -> window.__leafy_found_map
   🎉 Map capture successful! Freehand tool ready.
   ```

If you see these ✅ **Map capture is working!**

If you don't see them:
- Wait a few seconds (map might still be loading)
- Type `window.__leafy_try_capture_now()` in console to retry
- Check that Leafy Maps plugin element exists on page

### Step 3: Test Freehand Drawing

**In browser console, run:**

```javascript
// Start freehand mode
window.__leafy_freehand.start()
```

**Then:**
1. Click and drag on the map to draw
2. Release mouse to finish
3. Check console for success message:
   ```
   📉 Path simplified: 245 -> 89 points
   ✅ Freehand drawing complete -> window.__leafy_last_freehand
   ```

**Get the result:**

```javascript
// View the GeoJSON result
console.log(window.__leafy_last_freehand)
```

You should see:
```javascript
{
  type: "Feature",
  geometry: {
    type: "LineString",
    coordinates: [[lng, lat], [lng, lat], ...]  // Simplified coordinates
  },
  properties: {
    tool: 'freehand',
    color: '#3B82F6',
    strokeWeight: 3,
    originalPointCount: 245,
    simplifiedPointCount: 89
  }
}
```

✅ **If you see this, freehand is working perfectly!**

---

## 🔌 Bubble Workflow Integration

### Workflow 1: Enable Freehand on Button Click

**When "Freehand Tool" button is clicked:**

1. **Add element action: "Run JavaScript" (Toolbox plugin)**

   ```javascript
   // Enable freehand mode
   window.__leafy_freehand.start();

   // Register completion callback
   window.bubble_fn_freehandComplete = function(geojsonString) {
     var geojson = JSON.parse(geojsonString);

     // Extract coordinates for Bubble database
     var coordinates = JSON.stringify(geojson.geometry.coordinates);

     // Trigger Bubble workflow to save drawing
     // (Create a custom event that accepts coordinates parameter)
     bubble_fn_saveDrawing('polyline', coordinates, geojson.properties);
   };
   ```

### Workflow 2: Save Drawing to Database

**Create custom workflow: "Save Drawing"** (triggered from JavaScript)

**Parameters:**
- `type` (text): "polyline"
- `coordinates` (text): JSON string of coordinates
- `properties` (text): JSON string of properties

**Actions:**

1. **Calculate marker position (center of line)**

   Run JavaScript:
   ```javascript
   var coords = JSON.parse('<coordinates parameter>');
   var center = window.calculateCenter(coords);
   return JSON.stringify(center);
   ```

2. **Create new Drawing record**

   ```
   Create a new thing: Drawing

   Fields:
   - type = "polyline"
   - coordinates = <coordinates parameter>
   - markerPosition = Result of Step 1
   - name = "Unnamed Drawing " + Current date/time
   - color = "#3B82F6"
   - elementType = Current state elementType (or "custom")
   - properties = <properties parameter>
   - approvalStatus = if Current User's role = "Admin" then "approved" else "pending"
   - createdBy = Current User
   - createdByRole = Current User's role
   ```

3. **Render drawing on map**

   Run JavaScript:
   ```javascript
   var map = window.__leafy_found_map;
   var drawing = {
     id: '<Result of Step 2's unique id>',
     coordinates: JSON.parse('<coordinates parameter>'),
     color: '#3B82F6'
   };

   var layer = L.polyline(drawing.coordinates.map(c => [c[1], c[0]]), {
     color: drawing.color,
     weight: 3
   }).addTo(map);

   console.log('Drawing rendered:', drawing.id);
   ```

4. **Reset tool to select mode**

   Set state: `currentTool = "select"`

---

## 🛠️ Advanced Features

### Custom Drawing Colors

**Before calling `.start()`, customize the color:**

```javascript
// In your "Freehand Tool" button workflow, modify the JavaScript:

// Option 1: Use current state color
var currentColor = '<Current state drawingColor>';

window.__leafy_freehand.customColor = currentColor;
window.__leafy_freehand.start();
```

Then update the header script to use `this.customColor` if set.

### Different Tools (Line, Area, Point)

You can add similar tools using the same pattern:

**Line Tool (click-based):**
```javascript
window.__leafy_line = {
  points: [],
  previewLayer: null,

  start: function() {
    var map = window.__leafy_found_map;
    var self = this;

    map.on('click', function(e) {
      self.points.push([e.latlng.lat, e.latlng.lng]);

      // Visual feedback
      L.circleMarker(e.latlng, {
        radius: 4,
        color: '#3B82F6'
      }).addTo(map);

      // Update preview line
      if (self.points.length >= 2) {
        if (self.previewLayer) map.removeLayer(self.previewLayer);
        self.previewLayer = L.polyline(self.points, {
          color: '#3B82F6',
          dashArray: '5, 5'
        }).addTo(map);
      }
    });

    map.on('dblclick', function(e) {
      L.DomEvent.stop(e);
      self.finish();
    });
  },

  finish: function() {
    if (this.points.length >= 2) {
      var geojson = {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: this.points.map(p => [p[1], p[0]])
        },
        properties: { tool: 'line' }
      };

      window.__leafy_last_line = geojson;
      if (window.bubble_fn_lineComplete) {
        window.bubble_fn_lineComplete(JSON.stringify(geojson));
      }
    }

    // Cleanup
    this.points = [];
    if (this.previewLayer) {
      window.__leafy_found_map.removeLayer(this.previewLayer);
      this.previewLayer = null;
    }
  }
};
```

**Point Tool (single click):**
```javascript
window.__leafy_point = {
  enable: function() {
    var map = window.__leafy_found_map;

    map.once('click', function(e) {
      var geojson = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [e.latlng.lng, e.latlng.lat]
        },
        properties: { tool: 'point' }
      };

      window.__leafy_last_point = geojson;
      if (window.bubble_fn_pointComplete) {
        window.bubble_fn_pointComplete(JSON.stringify(geojson));
      }
    });
  }
};
```

---

## 🐛 Troubleshooting

### Problem: "Map not found" error

**Check:**
1. Is Leafy Maps element on the page?
2. Does it have ID `leafy_main` or class `.leaflet-container`?
3. Run `window.__leafy_try_capture_now()` in console

**Solution:**
```javascript
// In console, check:
document.querySelector('.leaflet-container')  // Should return element
window.L  // Should return Leaflet object
window.__leafy_found_map  // Should return map instance

// If map exists but not captured, manually set:
window.__leafy_found_map = /* find your map instance */
```

### Problem: Coordinates too large (>1MB)

**The script already handles this!** Douglas-Peucker simplification runs automatically.

**But if you still hit the limit:**
- Increase tolerance in header script: `window.simplifyPath(self.currentPath, 0.0005)` (was `0.0001`)
- Higher tolerance = fewer points = smaller JSON

### Problem: Drawing doesn't show preview while drawing

**Check:**
1. Browser console for JavaScript errors
2. Map dragging should be disabled during drawing
3. Cursor should change to crosshair

**Debug:**
```javascript
// Check if freehand is in drawing state
window.__leafy_freehand.isDrawing  // Should be true during drag

// Check preview layer exists
window.__leafy_freehand.previewLayer  // Should be Leaflet polyline object
```

### Problem: GeoJSON not saving to database

**Check coordinate format:**
- GeoJSON uses `[lng, lat]` (longitude first)
- Leaflet uses `[lat, lng]` (latitude first)
- The script already handles conversion: `.map(p => [p[1], p[0]])`

**Test:**
```javascript
// After drawing, check result format:
var result = window.__leafy_last_freehand;
console.log(result.geometry.coordinates[0]);
// Should be [lng, lat] where lng is ~-116 for Idaho
```

### Problem: Drawing works but callback not firing

**Check callback registration:**
```javascript
// Before calling .start(), register callback:
window.bubble_fn_freehandComplete = function(geojsonString) {
  console.log('Callback fired!', geojsonString);
  // Your save logic here
};

// Then call:
window.__leafy_freehand.start();
```

**Callback must be registered BEFORE `.start()` is called!**

---

## 📊 Performance Optimization

### Coordinate Simplification Levels

**Current setting:** `tolerance = 0.0001` (recommended)

| Tolerance | Points Reduction | Quality | Use Case |
|-----------|-----------------|---------|----------|
| 0.00001   | ~30%            | ⭐⭐⭐⭐⭐ | High detail (small drawings) |
| 0.0001    | ~60%            | ⭐⭐⭐⭐   | **Recommended default** |
| 0.0005    | ~80%            | ⭐⭐⭐     | Large freehand drawings |
| 0.001     | ~90%            | ⭐⭐       | Very large areas only |

**To change:**

In `bubble-freehand-header.html`, find:
```javascript
const simplified = window.simplifyPath(self.currentPath, 0.0001);
```

Change `0.0001` to your desired tolerance.

### Memory Management

**Clear old freehand layers:**
```javascript
window.__leafy_freehand.clearLayers();
```

**Stop freehand mode:**
```javascript
window.__leafy_freehand.stop();
```

---

## ✅ Integration Checklist

- [ ] Page header replaced with new script
- [ ] Map capture confirmed (check console for ✅ messages)
- [ ] Freehand test successful (`window.__leafy_freehand.start()`)
- [ ] GeoJSON output verified (`window.__leafy_last_freehand`)
- [ ] "Freehand Tool" button workflow created
- [ ] JavaScript callback registered (`bubble_fn_freehandComplete`)
- [ ] "Save Drawing" custom workflow created
- [ ] Database fields configured (type, coordinates, markerPosition, etc.)
- [ ] Rendering workflow created (polyline on map)
- [ ] Tool reset after save (currentTool = "select")
- [ ] Tested save → reload cycle (drawings persist)

---

## 🎓 Understanding the Code

### Why This Works vs. Geoman

**Problem with Geoman:**
- Geoman v2.18.3 loaded on your page is **missing the Freehand handler**
- `map.pm.enableDraw('Freehand')` fails with: `Cannot read properties of undefined`
- Investigation report proved this conclusively

**This Solution:**
- ✅ No Geoman dependency for freehand
- ✅ Custom pointer event listeners (`pointerdown`, `pointermove`, `pointerup`)
- ✅ Converts screen coordinates to lat/lng via `map.mouseEventToLatLng()`
- ✅ Builds polyline in real-time for visual feedback
- ✅ Douglas-Peucker simplification reduces coordinate count
- ✅ Clean GeoJSON output ready for database

### Key Components

1. **Map Capture System**
   - Hooks `L.Map.prototype.initialize` to intercept map creation
   - Searches window properties for existing maps
   - Stores reference at `window.__leafy_found_map`

2. **Freehand Tool**
   - Disables map dragging during drawing
   - Captures pointer events (works on desktop + mobile)
   - Shows dashed preview line while drawing
   - Simplifies path on completion
   - Outputs GeoJSON to `window.__leafy_last_freehand`

3. **Douglas-Peucker Algorithm**
   - Recursive path simplification
   - Maintains shape accuracy while reducing points
   - Critical for staying under Bubble's 1MB text field limit
   - Example: 500 points → 150 points (70% reduction)

4. **Bubble Integration**
   - Callback system (`bubble_fn_freehandComplete`)
   - Helper functions (`calculateCenter`, `createGeoJSON`)
   - Map ready notification (`bubble_fn_mapReady`)

---

## 🚀 Next Steps

1. **✅ Freehand Working?** → Add Line, Area, Point tools (see Advanced Features)
2. **Add Element Type Selection** → Dropdown to set `elementType` before drawing
3. **Add Color Picker** → Allow users to choose drawing color
4. **Implement Privacy Controls** → Checkboxes for role-based visibility
5. **Add Approval Workflow** → Admin approval for non-admin drawings
6. **Enable Editing** → Click existing drawing to edit/delete
7. **Layer Filtering** → Show/hide drawings by type

**Follow the Bubble Implementation Plan** (`docs/BUBBLE_IMPLEMENTATION_PLAN.md`) for complete feature roadmap!

---

## 📞 Support

**Console Commands for Debugging:**
```javascript
// Check map capture status
window.__leafy_found_map  // Should return Leaflet map object

// Retry map capture
window.__leafy_try_capture_now()

// Start freehand (test)
window.__leafy_freehand.start()

// View last result
window.__leafy_last_freehand

// Stop freehand mode
window.__leafy_freehand.stop()

// Simplify test coordinates
window.simplifyPath([[40.1, -116.2], [40.11, -116.21], ...], 0.0001)

// Calculate center of coordinates
window.calculateCenter([[40.1, -116.2], [40.2, -116.3]])
```

**Useful Browser Console Checks:**
```javascript
// Is Leaflet loaded?
window.L  // Should return object with version, Map, etc.

// Is Toolbox plugin loaded?
typeof bubble_fn_saveDrawing  // Should be 'function' if defined

// Check page elements
document.querySelector('#leafy_main')  // Leafy Maps element
document.querySelector('.leaflet-container')  // Leaflet container
```

---

**Last Updated:** 2025-10-09
**Based On:** Investigation Report (proven solution)
**Status:** Production Ready ✅
