# Step 3 Quick Reference - Render Drawing on Map

> **For user who is currently implementing Step 3.4**

## ✅ What's Working

- Drawing saves to database ✓
- Coordinates format correct (GeoJSON) ✓
- Marker position calculated ✓
- Custom event triggering ✓

## 🎯 What You Need to Add

### Action 2: Render on Map (Copy This)

**In your "Save and Render Drawing" custom event, add this action:**

**Action:** Plugins → Toolbox → Run JavaScript

**Code (copy exactly, then insert dynamic data):**

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
    opacity: 1,
    smoothFactor: 1.0
  }).addTo(map);

  console.log('✅ Polyline created and added to map');

  // Store layer reference
  if (!window.__drawing_layers) {
    window.__drawing_layers = {};
  }
  window.__drawing_layers[drawingId] = layer;

  // Add click handler
  layer.on('click', function(e) {
    L.DomEvent.stopPropagation(e);
    console.log('📍 Drawing clicked:', drawingId);
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

## 🔧 How to Insert Dynamic Data

After pasting the code, replace these placeholders:

1. **`<js_to_bubble_freehand's output1>`**
   - Click on it
   - Insert dynamic data
   - Select "js_to_bubble_freehand" element
   - Choose "output1"

2. **`<Result of Step 1's unique id>`**
   - Click on it
   - Insert dynamic data
   - Select "Result of Step 1" (Create Drawing action)
   - Choose "unique id"

3. **`<Result of Step 1's color>`**
   - Click on it
   - Insert dynamic data
   - Select "Result of Step 1"
   - Choose "color"

## 📊 Expected Console Output

When you draw, you should see:

```
🖼️ Rendering drawing: 1736291234567
📊 Total coordinates: 27 points
🔍 First coord from GeoJSON (lng,lat): [-47.607, -23.499]
🔍 First coord for Leaflet (lat,lng): [-23.499, -47.607]
✅ Coordinate conversion complete
✅ Polyline created and added to map
✅ Drawing rendered successfully!
```

## 🐛 If Drawing Doesn't Appear

**Check console for errors:**

1. **"Map not found"** → Map not ready yet
   - Run `window.__leafy_found_map` in console
   - Should return Leaflet map object
   - If undefined, run `window.__leafy_try_capture_now()`

2. **No console output** → JavaScript not running
   - Check Action 2 exists in workflow
   - Check dynamic data insertions are correct
   - Preview in debug mode to see if action runs

3. **Drawing in wrong location** → Coordinate swap issue
   - Verify console shows coordinate swap
   - Before: `[-47.xxx, -23.xxx]`
   - After: `[-23.xxx, -47.xxx]`
   - Brazil latitude should be ~-23 (not -47)

## ✅ Success Criteria

- [ ] Console shows all debug messages
- [ ] Blue line appears on map at your drawing location
- [ ] Line is solid (not dashed)
- [ ] Drawing persists after releasing mouse
- [ ] Can draw multiple times (all appear)

## 🎯 Next Step

After this works, proceed to **Step 4: Load Drawings on Page Load** so drawings reload after refresh.

---

**Your Current Data Format:**

```javascript
// Coordinates (from database):
[[-47.607, -23.499], [-47.608, -23.500], ...]  // GeoJSON [lng, lat]

// Marker Position (from database):
[-23.503, -47.604]  // Already in Leaflet [lat, lng]

// Properties (from database):
{
  "type": "Feature",
  "geometry": {...},
  "properties": {
    "tool": "freehand",
    "color": "#3B82F6",
    "strokeWeight": 3,
    "originalPointCount": 113,
    "simplifiedPointCount": 27
  }
}
```

All formats are correct! Just need to add the rendering JavaScript. 🚀
