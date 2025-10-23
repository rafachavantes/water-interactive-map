// ===== STEP 4: LOAD ALL DRAWINGS ON PAGE LOAD =====
//
// Purpose: Load all approved drawings from database and render on map
// Usage: Copy this code into Toolbox "Run JavaScript" action in "When Page is loaded" workflow
//
// IMPORTANT: Replace <BUBBLE_DATA_INJECTION> with Bubble dynamic data
// Format: [{"id":"...","coords":"...","color":"...","type":"...","markerPos":"...","name":"...","elementType":"..."}]
//
// Version: 1.1
// Date: 2025-10-23

console.log('🔄 Step 4: Loading drawings from database...');

// BUBBLE DATA INJECTION POINT
// In Bubble editor, replace this with: Do a search for Drawings:each item's {...}
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
        // Point: wrapped array of one coordinate pair [[-47.xxx, -23.xxx]]
        leafletCoords = [coords[0][1], coords[0][0]];  // Unwrap first pair, swap to [lat, lng]
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
          bubble_fn_drawing_selected(drawing.id);
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
            bubble_fn_drawing_selected(drawing.id);
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
