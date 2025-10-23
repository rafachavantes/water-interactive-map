// ===== STEP 6: POINT DRAWING TOOL =====
//
// Purpose: Enable single-click marker placement on map
// Usage: Copy code snippets below into appropriate Bubble workflows
//
// Prerequisites:
//   - Page header script v4 installed (bubble-drawing-tools-v4.html)
//   - Map captured (window.__leafy_found_map available)
//   - Drawing state initialized (window.__drawing_state)
//
// Version: 1.0
// Date: 2025-10-23

// =====================================================
// SNIPPET 1: REGISTER POINT COMPLETION CALLBACK
// =====================================================
// Location: "When Page is loaded" workflow OR in Point button click workflow
// Tool: Plugins → Toolbox → Run JavaScript

console.log('📍 Registering Point tool callback...');

// Receives object with 3 outputs (matching freehand pattern):
//   output1 = properties (full GeoJSON Feature)
//   output2 = coordinates [[-47.xxx, -23.xxx]] - array of coordinate pairs
//   output3 = marker_position ([-23.xxx, -47.xxx] - reversed!)

window.bubble_fn_pointComplete = function(data) {
  console.log('📍 Point placement callback triggered');
  console.log('  - Properties:', data.output1);
  console.log('  - Coordinates:', data.output2);
  console.log('  - Marker Position:', data.output3);

  // Trigger Bubble workflow to save drawing
  // IMPORTANT: Use JavaScript to Bubble element with 3 outputs
  if (window.bubble_fn_savePointDrawing) {
    bubble_fn_savePointDrawing({
      output1: data.output1,   // Full GeoJSON Feature object
      output2: data.output2,   // Coordinates: [[-47.xxx, -23.xxx]]
      output3: data.output3    // Marker position: [-23.xxx, -47.xxx]
    });
  } else {
    console.warn('⚠️ window.bubble_fn_savePointDrawing not defined. Create the save workflow first.');
  }
};

console.log('✅ Point completion callback registered');

// Example of what the outputs look like:
// data.output1: '{"type":"Feature","geometry":{"type":"Point","coordinates":[-47.598,-23.512]},"properties":{"tool":"point","color":"#3B82F6"}}'
// data.output2: '[[-47.59843826293945,-23.51272126716066]]'  // Note: wrapped in array!
// data.output3: '[-23.51272126716066,-47.59843826293945]'

// =====================================================
// SNIPPET 2: ACTIVATE POINT TOOL
// =====================================================
// Location: "When Point button is clicked" workflow
// Tool: Plugins → Toolbox → Run JavaScript

console.log('📍 Activating Point tool...');

// Start Point mode with auto-render enabled
window.__leafy_point.start({ autoRender: true });

console.log('✅ Point tool activated - click map to place marker');

// =====================================================
// SNIPPET 3: SAVE POINT DRAWING TO DATABASE
// =====================================================
// Location: Custom Event workflow "Save Point Drawing"
// Parameters needed: output1 (text), output2 (text), output3 (text)
// Tool: Create a new thing → Drawing

// BUBBLE ACTION: Create a new Drawing
// In the Bubble editor, create these field assignments:
//
// type = "point"
// coordinates = <output2 parameter>          // Already formatted as "[-47.xxx,-23.xxx]"
// markerPosition = <output3 parameter>       // Already formatted as "[-23.xxx,-47.xxx]"
// name = "Point - " + Current date/time (formatted as "MMM d, yyyy h:mm a")
// color = "#3B82F6"
// elementType = "custom" (or from custom state)
// properties = <output1 parameter>           // Full GeoJSON Feature object
// approvalStatus = if Current User's role = "Admin" then "approved" else "pending"
// createdBy = Current User
// createdByRole = Current User's role
// createdAt = Current date/time
// privacy = [List of Account Types]:
//   - Add: All Account Types (User, Ditch Rider, Admin)
//   OR
//   - Use custom state/dropdown selection for privacy
//
// NOTE: privacy is a LIST field (type: Account Type), NOT JSON text!

// =====================================================
// SNIPPET 4: RENDER POINT MARKER ON MAP AFTER SAVE
// =====================================================
// Location: "Save Point Drawing" workflow, AFTER database create action
// Tool: Plugins → Toolbox → Run JavaScript
//
// IMPORTANT: Replace <PLACEHOLDERS> with Bubble dynamic data:
//   <MARKER_POSITION> → Result of Step X's markerPosition
//   <DRAWING_ID> → Result of Step X's _id
//   <COLOR> → Result of Step X's color
//   <NAME> → Result of Step X's name

console.log('🖼️ Rendering point marker on map...');

// Parse marker position from database field
var markerPosText = '<MARKER_POSITION>';
var markerPos = JSON.parse(markerPosText);  // [-23.xxx, -47.xxx]
var lat = markerPos[0];
var lng = markerPos[1];

var drawingId = '<DRAWING_ID>';
var color = '<COLOR>';
var name = '<NAME>';

var map = window.__leafy_found_map;

if (!map) {
  console.error('❌ Map not found');
} else {
  // Create marker with custom styling
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

    // Trigger Bubble selection workflow
    if (window.bubble_fn_drawing_selected) {
      bubble_fn_drawing_selected(drawingId);
    }
  });

  // Store reference for later management
  if (!window.__drawing_state) {
    window.__drawing_state = { drawings: [] };
  }

  window.__drawing_state.drawings.push({
    id: drawingId,
    layer: marker,
    marker: marker,
    type: 'point'
  });

  console.log('✅ Point marker rendered and stored:', drawingId);
}

// =====================================================
// SNIPPET 5: ALTERNATIVE - RENDER WITH STANDARD LEAFLET ICON
// =====================================================
// Use this if you prefer the default Leaflet blue marker pin
// Replace SNIPPET 4 with this code

console.log('🖼️ Rendering point marker with standard icon...');

// Parse marker position from database field
var markerPosText = '<MARKER_POSITION>';
var markerPos = JSON.parse(markerPosText);  // [-23.xxx, -47.xxx]
var lat = markerPos[0];
var lng = markerPos[1];

var drawingId = '<DRAWING_ID>';
var name = '<NAME>';

var map = window.__leafy_found_map;

if (!map) {
  console.error('❌ Map not found');
} else {
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

  marker.bindTooltip(name, {
    permanent: false,
    direction: 'top',
    offset: [0, -41]
  });

  marker.on('click', function(e) {
    L.DomEvent.stopPropagation(e);
    if (window.bubble_fn_drawing_selected) {
      bubble_fn_drawing_selected(drawingId);
    }
  });

  if (!window.__drawing_state) {
    window.__drawing_state = { drawings: [] };
  }

  window.__drawing_state.drawings.push({
    id: drawingId,
    layer: marker,
    marker: marker,
    type: 'point'
  });

  console.log('✅ Standard marker rendered:', drawingId);
}

// =====================================================
// SNIPPET 6: STOP POINT TOOL
// =====================================================
// Location: "When Select button is clicked" or "Cancel" button
// Tool: Plugins → Toolbox → Run JavaScript

window.__leafy_point.stop();
console.log('🛑 Point tool stopped');

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

// Function to remove a point marker by ID
window.removePointMarker = function(drawingId) {
  if (!window.__drawing_state) return;

  var index = window.__drawing_state.drawings.findIndex(function(d) {
    return d.id === drawingId;
  });

  if (index !== -1) {
    var drawing = window.__drawing_state.drawings[index];
    var map = window.__leafy_found_map;

    if (map && drawing.marker) {
      map.removeLayer(drawing.marker);
    }

    window.__drawing_state.drawings.splice(index, 1);
    console.log('🗑️ Point marker removed:', drawingId);
  }
};

// Function to update point marker color
window.updatePointMarkerColor = function(drawingId, newColor) {
  if (!window.__drawing_state) return;

  var drawing = window.__drawing_state.drawings.find(function(d) {
    return d.id === drawingId;
  });

  if (drawing && drawing.marker && drawing.type === 'point') {
    var map = window.__leafy_found_map;
    var latlng = drawing.marker.getLatLng();

    // Remove old marker
    map.removeLayer(drawing.marker);

    // Create new marker with updated color
    var newMarker = L.marker(latlng, {
      icon: L.divIcon({
        html: '<div class="custom-marker" style="width:24px;height:24px;background:' + newColor + ';border:3px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3);cursor:pointer;"></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        className: 'drawing-marker-point'
      })
    }).addTo(map);

    // Re-attach click handler
    newMarker.on('click', function(e) {
      L.DomEvent.stopPropagation(e);
      if (window.bubble_fn_drawing_selected) {
        bubble_fn_drawing_selected(drawingId);
      }
    });

    // Update reference
    drawing.marker = newMarker;
    drawing.layer = newMarker;

    console.log('🎨 Point marker color updated:', drawingId, newColor);
  }
};

// =====================================================
// TESTING & DEBUGGING
// =====================================================

// Test if Point tool is available
console.log('🧪 Point tool test:');
console.log('  - window.__leafy_point:', typeof window.__leafy_point);
console.log('  - window.__leafy_found_map:', typeof window.__leafy_found_map);
console.log('  - window.bubble_fn_pointComplete:', typeof window.bubble_fn_pointComplete);

// Manual test: Start Point tool
// window.__leafy_point.start({ autoRender: true });

// Manual test: Check last placed point
// console.log('Last point:', window.__leafy_last_point);
