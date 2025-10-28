// ===== ROLE SELECTOR: RELOAD FILTERED DRAWINGS =====
//
// Purpose: Clear map and reload drawings filtered by selected role
// Usage: Copy code snippets below into Bubble workflows for role selector dropdown
//
// Prerequisites:
//   - Page loaded with drawings initially rendered
//   - Role selector dropdown in toolbar (Admin only)
//   - Custom state: viewAsRole (text) - stores selected role
//
// Version: 1.0
// Date: 2025-10-28

// =====================================================
// SNIPPET 1: CLEAR ALL EXISTING DRAWINGS
// =====================================================
// Location: "When Role selector value is changed" workflow
// Tool: Plugins → Toolbox → Run JavaScript
// Order: Run this FIRST, before database search

console.log('🧹 Clearing all existing drawings...');

var map = window.__leafy_found_map;

if (!map) {
  console.error('❌ Map not found');
} else if (!window.__drawing_layers) {
  console.log('ℹ️ No drawings to clear');
} else {
  var count = 0;

  // Remove all drawing layers from map
  Object.keys(window.__drawing_layers).forEach(function(id) {
    try {
      var item = window.__drawing_layers[id];

      // Remove main layer (line/area/point)
      if (item.layer) {
        map.removeLayer(item.layer);
      }

      // Remove center marker (if exists)
      if (item.marker) {
        map.removeLayer(item.marker);
      }

      count++;
    } catch (error) {
      console.error('❌ Error removing drawing', id, ':', error);
    }
  });

  // Clear storage
  window.__drawing_layers = {};

  console.log('✅ Cleared', count, 'drawings from map');
}

// =====================================================
// SNIPPET 2: RELOAD DRAWINGS WITH ROLE FILTER
// =====================================================
// Location: "When Role selector value is changed" workflow
// Tool: Plugins → Toolbox → Run JavaScript
// Order: Run this AFTER database search returns filtered drawings
//
// IMPORTANT: Replace <BUBBLE_DATA_INJECTION> with Bubble dynamic data
// Example: Do a search for Drawings:each item's {...}
// Constraints:
//   - privacy contains <viewAsRole state value>
//   - approvalStatus = "approved" (or include pending for admins)

console.log('🔄 Reloading filtered drawings...');

// BUBBLE DATA INJECTION POINT
// Replace with: Do a search for Drawings (filtered by role):each item's {...}
var drawings = <BUBBLE_DATA_INJECTION>;

console.log('📊 Found', drawings.length, 'drawings for selected role');

var map = window.__leafy_found_map;

if (!map) {
  console.error('❌ Map not found');
} else {
  // Initialize storage if needed
  if (!window.__drawing_layers) {
    window.__drawing_layers = {};
  }

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
        // Point: wrapped array of one coordinate pair [[-47.xxx, -23.xxx]]
        leafletCoords = [coords[0][1], coords[0][0]];  // Unwrap first pair, swap to [lat, lng]
      } else {
        // Line/Polygon: array of coordinate pairs
        leafletCoords = coords.map(function(c) {
          return [c[1], c[0]];  // Swap: [lng, lat] → [lat, lng]
        });
      }

      // Create appropriate Leaflet layer based on type
      var layer;

      if (drawing.type === 'point') {
        // Point marker with colored pin
        var isPending = drawing.approvalStatus === 'pending';

        // Build marker icon with SVG pin
        var markerHtml = '<svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">' +
          '<path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 21.9 12.5 41 12.5 41S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0Z" ' +
          'fill="' + drawing.color + '" stroke="white" stroke-width="2"/>' +
          '<circle cx="12.5" cy="12.5" r="4" fill="white"/>' +
          '</svg>';

        // Add @ symbol if pending review
        if (isPending) {
          markerHtml += '<div style="position:absolute;top:-5px;right:-5px;width:16px;height:16px;' +
            'background:#EF4444;border:2px solid white;border-radius:50%;' +
            'display:flex;align-items:center;justify-content:center;' +
            'font-size:10px;font-weight:bold;color:white;">@</div>';
        }

        layer = L.marker(leafletCoords, {
          icon: L.divIcon({
            html: markerHtml,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            className: 'drawing-marker-point'
          })
        }).addTo(map);

        // Add tooltip if enabled
        if (drawing.showTooltip) {
          var tooltipLines = [];

          // Line 1: Name (bold)
          tooltipLines.push('<div style="font-weight:bold;margin-bottom:4px;">' + drawing.name + '</div>');

          // Line 2: Element type
          var elementType = drawing.elementType || 'Custom';
          tooltipLines.push('<div style="color:#666;margin-bottom:4px;">' + elementType + '</div>');

          // Line 3: Pending review (if applicable)
          if (isPending) {
            tooltipLines.push('<div style="color:#EF4444;font-size:12px;margin-bottom:4px;">⚠️ Pending Admin Review</div>');
          }

          // Line 4: Privacy info
          var privacyText = 'Privacy: ';
          if (drawing.privacy && drawing.privacy.length > 0) {
            if (drawing.privacy.length === 3) {
              privacyText += 'All users';
            } else {
              privacyText += drawing.privacy.join(', ');
            }
          } else {
            privacyText += 'All users';
          }
          tooltipLines.push('<div style="color:#999;font-size:11px;">' + privacyText + '</div>');

          var tooltipHtml = tooltipLines.join('');

          layer.bindTooltip(tooltipHtml, {
            permanent: false,
            direction: 'top',
            offset: [0, -41],
            className: 'custom-point-tooltip',
            opacity: 1
          });
        }

        console.log('📍 Created point marker with colored pin' + (isPending ? ' (@)' : ''));

      } else if (drawing.type === 'area') {
        // Area (polygon)
        layer = L.polygon(leafletCoords, {
          color: drawing.color,
          weight: 3,
          fillOpacity: 0.3,
          opacity: 1
        }).addTo(map);

        console.log('🔷 Created area polygon with', leafletCoords.length, 'vertices');

      } else {
        // Line or Draw (polyline)
        layer = L.polyline(leafletCoords, {
          color: drawing.color,
          weight: 3,
          opacity: 1,
          smoothFactor: 1.0
        }).addTo(map);

        console.log('📏 Created polyline with', leafletCoords.length, 'points (type: ' + drawing.type + ')');
      }

      // Add click handler to layer for selection
      layer.on('click', function(e) {
        L.DomEvent.stopPropagation(e);
        console.log('🖱️ Drawing clicked:', drawing.id);

        // Trigger Bubble selection workflow
        if (window.bubble_fn_drawing_selected) {
          bubble_fn_drawing_selected(drawing.id);
        }
      });

      // Create center marker for easier selection (except for point type)
      var centerMarker = null;
      if (markerPos && drawing.type !== 'point') {
        var isPending = drawing.approvalStatus === 'pending';

        // Build center marker icon with SVG pin (same as Point markers)
        var centerMarkerHtml = '<svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">' +
          '<path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 21.9 12.5 41 12.5 41S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0Z" ' +
          'fill="' + drawing.color + '" stroke="white" stroke-width="2"/>' +
          '<circle cx="12.5" cy="12.5" r="4" fill="white"/>' +
          '</svg>';

        // Add @ symbol if pending review
        if (isPending) {
          centerMarkerHtml += '<div style="position:absolute;top:-5px;right:-5px;width:16px;height:16px;' +
            'background:#EF4444;border:2px solid white;border-radius:50%;' +
            'display:flex;align-items:center;justify-content:center;' +
            'font-size:10px;font-weight:bold;color:white;">@</div>';
        }

        centerMarker = L.marker([markerPos[0], markerPos[1]], {
          icon: L.divIcon({
            html: centerMarkerHtml,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            className: 'drawing-marker-center'
          })
        }).addTo(map);

        // Add tooltip if enabled
        if (drawing.showTooltip) {
          var tooltipLines = [];

          // Line 1: Name (bold)
          tooltipLines.push('<div style="font-weight:bold;margin-bottom:4px;">' + drawing.name + '</div>');

          // Line 2: Element type
          var elementType = drawing.elementType || 'Custom';
          tooltipLines.push('<div style="color:#666;margin-bottom:4px;">' + elementType + '</div>');

          // Line 3: Pending review (if applicable)
          if (isPending) {
            tooltipLines.push('<div style="color:#EF4444;font-size:12px;margin-bottom:4px;">⚠️ Pending Admin Review</div>');
          }

          // Line 4: Privacy info
          var privacyText = 'Privacy: ';
          if (drawing.privacy && drawing.privacy.length > 0) {
            if (drawing.privacy.length === 3) {
              privacyText += 'All users';
            } else {
              privacyText += drawing.privacy.join(', ');
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
            className: 'custom-center-tooltip',
            opacity: 1
          });
        }

        // Click handler for center marker
        centerMarker.on('click', function(e) {
          L.DomEvent.stopPropagation(e);
          console.log('🖱️ Center marker clicked:', drawing.id);

          if (window.bubble_fn_drawing_selected) {
            bubble_fn_drawing_selected(drawing.id);
          }
        });

        console.log('📍 Added center marker at', markerPos, drawing.showTooltip ? '(with tooltip)' : '');
      }

      // Store references for future use (selection, deletion, etc.)
      window.__drawing_layers[drawing.id] = {
        layer: layer,
        marker: centerMarker,
        data: drawing
      };

      console.log('✅ Drawing rendered successfully');

    } catch (error) {
      console.error('❌ Error rendering drawing', drawing.id, ':', error);
    }
  });

  console.log('🎉 Filtered drawings reloaded! Total:', drawings.length);
}

// =====================================================
// IMPLEMENTATION GUIDE
// =====================================================

// BUBBLE WORKFLOW: "When Role selector value is changed"
//
// Step 1: Set state
//   - Element: Page or Toolbar
//   - State: viewAsRole
//   - Value: Role selector's value
//
// Step 2: Run JavaScript (SNIPPET 1 - Clear drawings)
//   - Plugins → Toolbox → Run JavaScript
//   - Code: Copy SNIPPET 1 above
//
// Step 3: Do a search for Drawings
//   - Data type: Drawing
//   - Add constraint: privacy contains <viewAsRole state>
//   - Add constraint: approvalStatus = "approved"
//   - (Optional for Admins: OR approvalStatus = "pending")
//
// Step 4: Run JavaScript (SNIPPET 2 - Reload drawings)
//   - Plugins → Toolbox → Run JavaScript
//   - Code: Copy SNIPPET 2 above
//   - Replace <BUBBLE_DATA_INJECTION> with:
//     [{"id":"<Result of Step 3's _id>","coords":"<Result of Step 3's coordinates>","color":"<Result of Step 3's color>","type":"<Result of Step 3's type>","markerPos":"<Result of Step 3's markerPosition>","name":"<Result of Step 3's name>","elementType":"<Result of Step 3's elementType>","approvalStatus":"<Result of Step 3's approvalStatus>","showTooltip":"<Result of Step 3's showTooltip>","privacy":[<Result of Step 3's privacy:each item Display:formatted as text>]}]
//
// PRIVACY FIELD FORMAT (IMPORTANT):
// In "formatted as text" field, enter: "This Text"
// Set delimiter to: ,
// Result: ["User", "Ditch Rider", "Admin"]

// =====================================================
// TESTING
// =====================================================

// Test role filtering:
// 1. As Admin, open toolbar
// 2. Click role selector dropdown
// 3. Select "User" → Should see only drawings with privacy containing "User"
// 4. Select "Ditch Rider" → Should see drawings with privacy containing "Ditch Rider"
// 5. Select "Admin" → Should see all approved drawings
// 6. Verify drawings clear and reload each time
