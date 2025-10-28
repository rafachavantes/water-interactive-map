// ===== STEP 8: AREA DRAWING TOOL =====
//
// Purpose: Enable click-based polygon drawing on map (click vertices, double-click to close)
// Usage: Copy code snippets below into appropriate Bubble workflows
//
// Prerequisites:
//   - Page header script v4 installed (bubble-drawing-tools-v4.html)
//   - Map captured (window.__leafy_found_map available)
//   - Wrapper functions initialized (see TOOLBAR_CANCEL_DONE_BUTTONS.md)
//
// IMPORTANT: Before using these snippets, you MUST initialize wrapper functions in your
// Line button workflow. See bubble/docs/TOOLBAR_CANCEL_DONE_BUTTONS.md for complete guide.
// The wrappers (pointAdded, lineComplete, areaComplete) handle data transformation and
// call Toolbox elements with output1, output2, output3 format.
//
// Version: 2.0 (Wrapper Architecture)
// Date: 2025-10-28

// =====================================================
// SNIPPET 1: ACTIVATE AREA TOOL
// =====================================================
// Location: "When Area button is clicked" workflow (shares wrappers with Line tool)
// Tool: Plugins → Toolbox → Run JavaScript
// Note: Wrappers are initialized once in Line button workflow - reused for Area

console.log('🔶 Activating Area tool...');

// Start Area mode (without auto-render, we'll render after save)
window.__leafy_area.start();

console.log('✅ Area tool activated - click to add vertices, double-click to close polygon');

// =====================================================
// SNIPPET 2: SAVE AREA DRAWING TO DATABASE
// =====================================================
// Location: Workflow triggered by Toolbox element "bubble_fn_saveAreaDrawing"
// Parameters received: output1 (properties), output2 (coordinates), output3 (markerPosition)
// Tool: Create a new thing → Drawing
//
// IMPORTANT: Toolbox element receives data from wrapper (see TOOLBAR_CANCEL_DONE_BUTTONS.md):
//   - output1 = properties (full GeoJSON Feature)
//   - output2 = coordinates (extracted first ring of polygon)
//   - output3 = markerPosition (center point [lat, lng])

// BUBBLE ACTION: Create a new Drawing
// In the Bubble editor, create these field assignments:
//
// type = "area"
// coordinates = <coordinates parameter>         // Array of [lng, lat] pairs (ring) - double-nested!
// markerPosition = <markerPosition parameter>   // [lat, lng] center point
// name = "Area - " + Current date/time (formatted as "MMM d, yyyy h:mm a")
// color = "#3B82F6"
// elementType = "custom" (or from custom state)
// properties = <properties parameter>           // Full GeoJSON Feature object
// approvalStatus = if Current User's role = "Admin" then "approved" else "pending"
// createdBy = Current User
// createdByRole = Current User's role
// createdAt = Current date/time
// showTooltip = "yes" (default)
// privacy = [List of Account Types]:
//   - Add: All Account Types (User, Ditch Rider, Admin)
//   OR
//   - Use custom state/dropdown selection for privacy
//
// NOTE: privacy is a LIST field (type: Account Type), NOT JSON text!

// =====================================================
// SNIPPET 3: RENDER POLYGON ON MAP AFTER SAVE
// =====================================================
// Location: "Save Area Drawing" workflow, AFTER database create action
// Tool: Plugins → Toolbox → Run JavaScript
//
// IMPORTANT: Replace <PLACEHOLDERS> with Bubble dynamic data:
//   <COORDINATES> → Result of Step X's coordinates
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

console.log('🖼️ Rendering area on map...');

// Parse coordinates from database field
var coordsText = '<COORDINATES>';
var coords = JSON.parse(coordsText);  // [[lng, lat], [lng, lat], ...]

// Convert GeoJSON [lng, lat] to Leaflet [lat, lng]
var leafletCoords = coords.map(function(c) {
  return [c[1], c[0]];  // Swap to [lat, lng]
});

var drawingId = '<DRAWING_ID>';
var color = '<COLOR>';
var name = '<NAME>';
var approvalStatus = '<APPROVAL_STATUS>';
var elementType = '<ELEMENT_TYPE>';
var showTooltip = '<SHOW_TOOLTIP>';
var privacy = '<PRIVACY>';  // List of Account Types from Bubble

// Parse marker position
var markerPosText = '<MARKER_POSITION>';
var markerPos = JSON.parse(markerPosText);  // [lat, lng]

var map = window.__leafy_found_map;
var isPending = approvalStatus === 'pending';

if (!map) {
  console.error('❌ Map not found');
} else {
  // Create polygon
  var layer = L.polygon(leafletCoords, {
    color: color,
    weight: 3,
    opacity: 1,
    fillOpacity: 0.3
  }).addTo(map);

  // Add click handler to polygon
  layer.on('click', function(e) {
    L.DomEvent.stopPropagation(e);
    console.log('🖱️ Polygon clicked:', drawingId);

    if (window.bubble_fn_drawing_selected) {
      bubble_fn_drawing_selected(drawingId);
    }
  });

  // Build center marker icon with colored SVG pin
  var centerMarkerHtml = '<svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 21.9 12.5 41 12.5 41S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0Z" ' +
    'fill="' + color + '" stroke="white" stroke-width="2"/>' +
    '<circle cx="12.5" cy="12.5" r="4" fill="white"/>' +
    '</svg>';

  // Add @ symbol if pending review
  if (isPending) {
    centerMarkerHtml += '<div style="position:absolute;top:-5px;right:-5px;width:16px;height:16px;' +
      'background:#EF4444;border:2px solid white;border-radius:50%;' +
      'display:flex;align-items:center;justify-content:center;' +
      'font-size:10px;font-weight:bold;color:white;">@</div>';
  }

  // Create center marker for selection
  var centerMarker = L.marker([markerPos[0], markerPos[1]], {
    icon: L.divIcon({
      html: centerMarkerHtml,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      className: 'drawing-marker-center'
    })
  }).addTo(map);

  // Add rich tooltip to center marker if enabled
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

    centerMarker.bindTooltip(tooltipHtml, {
      permanent: false,
      direction: 'top',
      offset: [0, -41],
      className: 'custom-area-tooltip',
      opacity: 1
    });
  }

  // Click handler for center marker
  centerMarker.on('click', function(e) {
    L.DomEvent.stopPropagation(e);
    console.log('🖱️ Center marker clicked:', drawingId);

    if (window.bubble_fn_drawing_selected) {
      bubble_fn_drawing_selected(drawingId);
    }
  });

  // Store references
  if (!window.__drawing_layers) {
    window.__drawing_layers = {};
  }

  window.__drawing_layers[drawingId] = {
    layer: layer,
    marker: centerMarker,
    type: 'polygon'
  };

  console.log('✅ Polygon rendered and stored:', drawingId);
}
// ⚠️ CRITICAL: Ensure the closing brace } above is included in your Bubble workflow!
// Missing this brace will cause "SyntaxError: Unexpected end of input"

// =====================================================
// SNIPPET 4: STOP ALL DRAWING TOOLS (UNIVERSAL)
// =====================================================
// Location: "When Select button is clicked" or "Cancel" button or any tool button clicked
// Tool: Plugins → Toolbox → Run JavaScript
// Use this BEFORE starting any new tool to ensure clean state

window.stopAllDrawingTools();
console.log('🛑 All drawing tools stopped');

// Then optionally start a new tool:
// window.__leafy_area.start({ autoRender: true });

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
// Updates both the polygon stroke AND center marker color
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

// Test if Area tool is available
console.log('🧪 Area tool test:');
console.log('  - window.__leafy_area:', typeof window.__leafy_area);
console.log('  - window.__leafy_found_map:', typeof window.__leafy_found_map);
console.log('  - window.bubble_fn_areaComplete:', typeof window.bubble_fn_areaComplete);

// Manual test: Start Area tool
// window.__leafy_area.start();

// Manual test: Check last created polygon
// console.log('Last area:', window.__leafy_last_area);
