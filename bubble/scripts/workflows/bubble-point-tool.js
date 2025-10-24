// ===== STEP 6: POINT DRAWING TOOL =====
//
// Purpose: Enable single-click marker placement on map
// Usage: Copy code snippets below into appropriate Bubble workflows
//
// Prerequisites:
//   - Page header script v4 installed (bubble-drawing-tools-v4.html)
//   - Map captured (window.__leafy_found_map available)
//   - Drawing layers storage (window.__drawing_layers)
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
//   <APPROVAL_STATUS> → Result of Step X's approvalStatus
//   <ELEMENT_TYPE> → Result of Step X's elementType
//   <SHOW_TOOLTIP> → Result of Step X's showTooltip
//   <PRIVACY> → [Result of Step X's privacy:each item Display:formatted as text]
//     ⚠️ IMPORTANT: In "formatted as text" field enter: "This Text"
//     ⚠️ IMPORTANT: Set delimiter to: ,
//     Result format: ["User", "Ditch Rider", "Admin"]

// EXAMPLE - In Bubble, set privacy variable like this:
// var privacy = [<Result of Step X's privacy:each item Display:formatted as text>];
// Where "formatted as text" contains: "This Text"
// And delimiter is set to: ,
// This creates a proper JavaScript array: ["User", "Ditch Rider", "Admin"]

console.log('🖼️ Rendering point marker on map...');

// Parse marker position from database field
var markerPosText = '<MARKER_POSITION>';
var markerPos = JSON.parse(markerPosText);  // [-23.xxx, -47.xxx]
var lat = markerPos[0];
var lng = markerPos[1];

var drawingId = '<DRAWING_ID>';
var color = '<COLOR>';
var name = '<NAME>';
var approvalStatus = '<APPROVAL_STATUS>';
var elementType = '<ELEMENT_TYPE>';
var showTooltip = '<SHOW_TOOLTIP>';
var privacy = '<PRIVACY>';  // List of Account Types from Bubble

var map = window.__leafy_found_map;
var isPending = approvalStatus === 'pending';

if (!map) {
  console.error('❌ Map not found');
} else {
  // Build marker icon with colored SVG pin
  var markerHtml = '<svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 21.9 12.5 41 12.5 41S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0Z" ' +
    'fill="' + color + '" stroke="white" stroke-width="2"/>' +
    '<circle cx="12.5" cy="12.5" r="4" fill="white"/>' +
    '</svg>';

  // Add @ symbol if pending review
  if (isPending) {
    markerHtml += '<div style="position:absolute;top:-5px;right:-5px;width:16px;height:16px;' +
      'background:#EF4444;border:2px solid white;border-radius:50%;' +
      'display:flex;align-items:center;justify-content:center;' +
      'font-size:10px;font-weight:bold;color:white;">@</div>';
  }

  // Create marker
  var marker = L.marker([lat, lng], {
    icon: L.divIcon({
      html: markerHtml,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      className: 'drawing-marker-point'
    })
  }).addTo(map);

  // Add rich tooltip if enabled
  if (showTooltip === 'yes' || showTooltip === true) {
    var tooltipLines = [];

    // Line 1: Name (bold)
    tooltipLines.push('<div style="font-weight:bold;margin-bottom:4px;">' + name + '</div>');

    // Line 2: Element type
    tooltipLines.push('<div style="color:#666;margin-bottom:4px;">' + elementType + '</div>');

    // Line 3: Pending review (if applicable)
    if (isPending) {
      tooltipLines.push('<div style="color:#EF4444;font-size:12px;margin-bottom:4px;">⚠️ Pending Admin Review</div>');
    }

    // Line 4: Privacy info
    var privacyText = 'Privacy: ';
    if (privacy && privacy.length > 0) {
      if (privacy.length === 3) {
        privacyText += 'All users';
      } else {
        privacyText += privacy.join(', ');
      }
    } else {
      privacyText += 'All users';
    }
    tooltipLines.push('<div style="color:#999;font-size:11px;">' + privacyText + '</div>');

    var tooltipHtml = tooltipLines.join('');

    marker.bindTooltip(tooltipHtml, {
      permanent: false,
      direction: 'top',
      offset: [0, -41],
      className: 'custom-point-tooltip',
      opacity: 1
    });
  }

  // Make clickable for selection
  marker.on('click', function(e) {
    L.DomEvent.stopPropagation(e);
    console.log('🖱️ Point marker clicked:', drawingId);

    // Trigger Bubble selection workflow
    if (window.bubble_fn_drawing_selected) {
      bubble_fn_drawing_selected(drawingId);
    }
  });

  // Store reference for later management (IMPORTANT: Use object, not array!)
  if (!window.__drawing_layers) {
    window.__drawing_layers = {};
  }

  window.__drawing_layers[drawingId] = {
    layer: marker,
    marker: marker,
    type: 'point'
  };

  console.log('✅ Point marker rendered and stored:', drawingId);
}

// =====================================================
// SNIPPET 5: ALTERNATIVE - RENDER WITH STANDARD LEAFLET ICON
// =====================================================
// Use this if you prefer the default Leaflet blue marker pin
// Replace SNIPPET 4 with this code
//
// IMPORTANT: Replace <PLACEHOLDERS> with Bubble dynamic data:
//   <MARKER_POSITION> → Result of Step X's markerPosition
//   <DRAWING_ID> → Result of Step X's _id
//   <NAME> → Result of Step X's name
//   <APPROVAL_STATUS> → Result of Step X's approvalStatus
//   <ELEMENT_TYPE> → Result of Step X's elementType
//   <SHOW_TOOLTIP> → Result of Step X's showTooltip
//   <PRIVACY> → [Result of Step X's privacy:each item Display:formatted as text]
//     ⚠️ IMPORTANT: In "formatted as text" field enter: "This Text"
//     ⚠️ IMPORTANT: Set delimiter to: ,

console.log('🖼️ Rendering point marker with standard icon...');

// Parse marker position from database field
var markerPosText = '<MARKER_POSITION>';
var markerPos = JSON.parse(markerPosText);  // [-23.xxx, -47.xxx]
var lat = markerPos[0];
var lng = markerPos[1];

var drawingId = '<DRAWING_ID>';
var name = '<NAME>';
var approvalStatus = '<APPROVAL_STATUS>';
var elementType = '<ELEMENT_TYPE>';
var showTooltip = '<SHOW_TOOLTIP>';
var privacy = '<PRIVACY>';  // List of Account Types from Bubble

var map = window.__leafy_found_map;
var isPending = approvalStatus === 'pending';

if (!map) {
  console.error('❌ Map not found');
} else {
  // Create marker with standard Leaflet icon
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

  // Add rich tooltip if enabled
  if (showTooltip === 'yes' || showTooltip === true) {
    var tooltipLines = [];

    // Line 1: Name (bold)
    tooltipLines.push('<div style="font-weight:bold;margin-bottom:4px;">' + name + '</div>');

    // Line 2: Element type
    tooltipLines.push('<div style="color:#666;margin-bottom:4px;">' + elementType + '</div>');

    // Line 3: Pending review (if applicable)
    if (isPending) {
      tooltipLines.push('<div style="color:#EF4444;font-size:12px;margin-bottom:4px;">⚠️ Pending Admin Review</div>');
    }

    // Line 4: Privacy info
    var privacyText = 'Privacy: ';
    if (privacy && privacy.length > 0) {
      if (privacy.length === 3) {
        privacyText += 'All users';
      } else {
        privacyText += privacy.join(', ');
      }
    } else {
      privacyText += 'All users';
    }
    tooltipLines.push('<div style="color:#999;font-size:11px;">' + privacyText + '</div>');

    var tooltipHtml = tooltipLines.join('');

    marker.bindTooltip(tooltipHtml, {
      permanent: false,
      direction: 'top',
      offset: [0, -41],
      className: 'custom-point-tooltip',
      opacity: 1
    });
  }

  // Make clickable for selection
  marker.on('click', function(e) {
    L.DomEvent.stopPropagation(e);
    console.log('🖱️ Point marker clicked:', drawingId);

    if (window.bubble_fn_drawing_selected) {
      bubble_fn_drawing_selected(drawingId);
    }
  });

  // Store reference for later management (IMPORTANT: Use object, not array!)
  if (!window.__drawing_layers) {
    window.__drawing_layers = {};
  }

  window.__drawing_layers[drawingId] = {
    layer: marker,
    marker: marker,
    type: 'point'
  };

  console.log('✅ Standard marker rendered:', drawingId);
}

// NOTE: This snippet does NOT include @ badge for pending drawings
// If you need the @ badge, use SNIPPET 4 instead

// =====================================================
// SNIPPET 6: STOP ALL DRAWING TOOLS (UNIVERSAL)
// =====================================================
// Location: "When Select button is clicked" or "Cancel" button or any tool button clicked
// Tool: Plugins → Toolbox → Run JavaScript
// Use this BEFORE starting any new tool to ensure clean state

window.stopAllDrawingTools();
console.log('🛑 All drawing tools stopped');

// Then optionally start a new tool:
// window.__leafy_point.start({ autoRender: true });

// =====================================================
// UTILITY FUNCTIONS (UNIVERSAL - WORK FOR ALL TYPES)
// =====================================================

// Remove any drawing from map by ID
// Works for: Point, Line, Polygon, Freehand
// Usage in "Delete Drawing" workflow (AFTER database delete):
window.removeDrawing('<Drawing_ID>');

// Example implementation:
// var drawingId = '<Result of deleted Drawing's _id>';
// window.removeDrawing(drawingId);

// Update drawing color by ID
// Works for: Point, Line, Polygon, Freehand
// Usage in "Color Picker changed" workflow:
window.updateDrawingColor('<Drawing_ID>', '#FF5733');

// Example implementation:
// var drawingId = '<Current Drawing's _id>';
// var newColor = '<Color Picker's value>';
// window.updateDrawingColor(drawingId, newColor);
// Then update database: Make changes to Drawing: color = newColor

// Update polygon opacity by ID
// Works for: Polygon only (safe to call on any type)
// Usage in "Opacity Slider changed" workflow:
window.updateDrawingOpacity('<Drawing_ID>', 0.5);

// Example implementation:
// var drawingId = '<Current Drawing's _id>';
// var newOpacity = '<Slider's value>';  // 0.0 to 1.0
// window.updateDrawingOpacity(drawingId, newOpacity);
// Then update database: Make changes to Drawing: properties (update fillOpacity)

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
