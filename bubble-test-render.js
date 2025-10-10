/* ========================================
   BUBBLE FREEHAND - TEST RENDERING SCRIPT
   Copy/paste this into browser console to test rendering
   ======================================== */

// Test 1: Render the last freehand drawing immediately
function renderLastFreehand() {
  const map = window.__leafy_found_map;
  const geojson = window.__leafy_last_freehand;

  if (!map) {
    console.error('❌ Map not found');
    return;
  }

  if (!geojson) {
    console.error('❌ No freehand drawing found. Draw something first with window.__leafy_freehand.start()');
    return;
  }

  // Convert GeoJSON coordinates [lng, lat] back to Leaflet format [lat, lng]
  const leafletCoords = geojson.geometry.coordinates.map(coord => [coord[1], coord[0]]);

  // Create permanent polyline
  const layer = L.polyline(leafletCoords, {
    color: geojson.properties.color || '#3B82F6',
    weight: geojson.properties.strokeWeight || 3,
    opacity: 1  // Solid, not dashed
  }).addTo(map);

  console.log('✅ Drawing rendered on map!', layer);
  console.log('📍 Coordinates:', leafletCoords.length, 'points');

  // Store reference for later removal if needed
  window.__last_rendered_layer = layer;

  return layer;
}

// Test 2: Draw with immediate rendering
function drawAndRender() {
  // Clear any previous test layers
  if (window.__last_rendered_layer) {
    window.__leafy_found_map.removeLayer(window.__last_rendered_layer);
  }

  // Register callback to auto-render when drawing completes
  window.bubble_fn_freehandComplete = function(geojsonString) {
    console.log('🎨 Freehand complete callback fired!');

    const geojson = JSON.parse(geojsonString);
    const leafletCoords = geojson.geometry.coordinates.map(coord => [coord[1], coord[0]]);

    const layer = L.polyline(leafletCoords, {
      color: '#3B82F6',
      weight: 3,
      opacity: 1
    }).addTo(window.__leafy_found_map);

    console.log('✅ Auto-rendered after drawing!', layer);
    window.__last_rendered_layer = layer;
  };

  // Start freehand mode
  window.__leafy_freehand.start();

  console.log('🎨 Draw on the map now. It will auto-render when you release the mouse.');
}

// Test 3: Save to simulated Bubble database (JSON)
function saveDrawingToJSON() {
  const geojson = window.__leafy_last_freehand;

  if (!geojson) {
    console.error('❌ No drawing to save. Draw something first.');
    return;
  }

  // Calculate center point for marker position
  const coords = geojson.geometry.coordinates;
  let sumLat = 0, sumLng = 0;
  coords.forEach(c => {
    sumLat += c[1];  // lat
    sumLng += c[0];  // lng
  });
  const centerLat = sumLat / coords.length;
  const centerLng = sumLng / coords.length;

  // Create Bubble-compatible drawing object
  const drawingData = {
    id: 'drawing_' + Date.now(),
    name: 'Test Freehand Drawing',
    type: 'polyline',
    coordinates: JSON.stringify(coords),  // Store as JSON string (Bubble text field)
    markerPosition: JSON.stringify([centerLat, centerLng]),
    color: '#3B82F6',
    elementType: 'custom',
    properties: JSON.stringify(geojson.properties),
    approvalStatus: 'approved',
    createdAt: new Date().toISOString()
  };

  console.log('💾 Drawing data ready for Bubble database:', drawingData);
  console.log('📋 Copy this JSON to save:', JSON.stringify(drawingData, null, 2));

  // Store for later retrieval
  window.__bubble_drawing_data = drawingData;

  return drawingData;
}

// Test 4: Render from saved JSON (simulating page reload)
function renderFromSavedJSON() {
  const drawingData = window.__bubble_drawing_data;

  if (!drawingData) {
    console.error('❌ No saved drawing. Run saveDrawingToJSON() first.');
    return;
  }

  const map = window.__leafy_found_map;
  const coordinates = JSON.parse(drawingData.coordinates);
  const leafletCoords = coordinates.map(coord => [coord[1], coord[0]]);

  const layer = L.polyline(leafletCoords, {
    color: drawingData.color,
    weight: 3,
    opacity: 1
  }).addTo(map);

  // Add marker at center
  const markerPos = JSON.parse(drawingData.markerPosition);
  const marker = L.marker([markerPos[0], markerPos[1]], {
    icon: L.divIcon({
      html: '<div style="background: ' + drawingData.color + '; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white;"></div>',
      className: 'custom-marker',
      iconSize: [24, 24]
    })
  }).addTo(map);

  marker.on('click', function() {
    console.log('📍 Drawing clicked:', drawingData);
  });

  console.log('✅ Rendered from saved JSON (simulating reload)');
  console.log('🎯 Drawing:', drawingData.name);
  console.log('📊 Points:', leafletCoords.length);

  window.__last_rendered_layer = layer;
  window.__last_rendered_marker = marker;

  return { layer, marker };
}

// Test 5: Complete workflow test
function testCompleteWorkflow() {
  console.log('🧪 TESTING COMPLETE WORKFLOW');
  console.log('================================');
  console.log('');
  console.log('Step 1: Draw on map...');

  window.bubble_fn_freehandComplete = function(geojsonString) {
    console.log('');
    console.log('Step 2: ✅ Drawing captured');

    const geojson = JSON.parse(geojsonString);
    console.log('  - Points:', geojson.geometry.coordinates.length);
    console.log('  - Simplified from:', geojson.properties.originalPointCount);

    console.log('');
    console.log('Step 3: Saving to simulated database...');
    const saved = saveDrawingToJSON();
    console.log('  - ✅ Saved with ID:', saved.id);

    console.log('');
    console.log('Step 4: Rendering from saved data (simulating reload)...');
    renderFromSavedJSON();
    console.log('  - ✅ Rendered on map');

    console.log('');
    console.log('🎉 WORKFLOW COMPLETE!');
    console.log('================================');
  };

  window.__leafy_freehand.start();
}

// Make functions globally available
window.renderLastFreehand = renderLastFreehand;
window.drawAndRender = drawAndRender;
window.saveDrawingToJSON = saveDrawingToJSON;
window.renderFromSavedJSON = renderFromSavedJSON;
window.testCompleteWorkflow = testCompleteWorkflow;

// Print instructions
console.log('🧪 BUBBLE FREEHAND TEST FUNCTIONS LOADED');
console.log('========================================');
console.log('');
console.log('Quick Tests:');
console.log('');
console.log('1. Render your last drawing:');
console.log('   renderLastFreehand()');
console.log('');
console.log('2. Draw with auto-rendering:');
console.log('   drawAndRender()');
console.log('');
console.log('3. Save drawing to JSON:');
console.log('   saveDrawingToJSON()');
console.log('');
console.log('4. Render from saved JSON:');
console.log('   renderFromSavedJSON()');
console.log('');
console.log('5. Test complete workflow:');
console.log('   testCompleteWorkflow()');
console.log('');
console.log('========================================');
