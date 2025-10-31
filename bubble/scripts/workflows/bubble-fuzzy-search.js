// ===== FUZZY SEARCH: REAL-TIME DRAWING FILTERING =====
//
// Purpose: Filter visible drawings on map based on fuzzy search results
// Usage: Copy code snippets below into Bubble workflows for search input
//
// Prerequisites:
//   - Fuzzy Search Plugin installed from Bubble marketplace
//   - Drawings loaded on map (window.__drawing_layers populated)
//   - Search Input element in toolbar or header
//   - Custom state: searchQuery (text)
//
// Version: 1.0
// Date: 2025-10-28

// =====================================================
// SNIPPET 1: FILTER DRAWINGS BY SEARCH QUERY
// =====================================================
// Location: "When Fuzzy Search matches is not empty" workflow
// Tool: Plugins → Toolbox → Run JavaScript
// Order: Run this workflow when fuzzy search finds matches
//
// IMPORTANT: Pass matched IDs via Toolbox param1
// Format: Comma-separated string (e.g., "abc123,def456,ghi789")
// In Bubble: param1 = <Fuzzy Search Results:each item's _id:join with ,>

console.log('🔍 Filtering drawings by search query...');

// Parse comma-separated IDs from Toolbox param1
var matchedIdsString = properties.param1 || "";
var matchedIds = matchedIdsString.split(",").map(function(id) {
   return id.trim();  // Trim each ID
 }).filter(function(id) {
   return id !== "";  // Filter out empty strings
 });

console.log('📊 Found', matchedIds.length, 'drawings matching search query');

var map = window.__leafy_found_map;

if (!map) {
  console.error('❌ Map not found');
} else if (!window.__drawing_layers) {
  console.log('ℹ️ No drawings loaded yet');
} else {
  var showCount = 0;
  var hideCount = 0;

  // Loop through all loaded drawings
  Object.keys(window.__drawing_layers).forEach(function(id) {
    var item = window.__drawing_layers[id];

    if (matchedIds.includes(id)) {
   // MATCHED: Show this drawing with full opacity
   if (item.layer) {
     // Check if it's a marker or a polyline/polygon
     if (typeof item.layer.setStyle === 'function') {
       // Polyline or Polygon
       item.layer.setStyle({opacity: 1});
       if (item.layer.options.fillOpacity !== undefined) {
         item.layer.setStyle({fillOpacity: 0.3});
       }
     } else {
       // Marker (Point) - use setOpacity
       item.layer.setOpacity(1);
     }
   }

   if (item.marker) {
     item.marker.setOpacity(1);
   }

   showCount++;
 } else {
   // NOT MATCHED: Dim this drawing
   if (item.layer) {
     if (typeof item.layer.setStyle === 'function') {
       // Polyline or Polygon
       item.layer.setStyle({opacity: 0.2});
       if (item.layer.options.fillOpacity !== undefined) {
         item.layer.setStyle({fillOpacity: 0.1});
       }
     } else {
       // Marker (Point)
       item.layer.setOpacity(0.2);
     }
   }

   if (item.marker) {
     item.marker.setOpacity(0.2);
   }

   hideCount++;
 }
  });

  console.log('✅ Filtered drawings:', showCount, 'shown,', hideCount, 'dimmed');
}

// =====================================================
// SNIPPET 2: HIGHLIGHT MATCHED DRAWINGS (OPTIONAL)
// =====================================================
// Location: Same workflow as SNIPPET 1 (optional enhancement)
// Tool: Plugins → Toolbox → Run JavaScript
// Purpose: Add pulsing/glow effect to matched drawings
// Note: Uses same param1 format as SNIPPET 1

console.log('✨ Adding highlight effect to matched drawings...');

// Parse comma-separated IDs from Toolbox param1
var matchedIdsString = properties.param1 || "";
var matchedIds = matchedIdsString.split(",").filter(function(id) {
  return id.trim() !== "";
});
var map = window.__leafy_found_map;

if (map && window.__drawing_layers) {
  matchedIds.forEach(function(id) {
    var item = window.__drawing_layers[id];

    if (item && item.layer) {
      // Add pulsing animation or thicker stroke to matched drawings
      var originalWeight = item.layer.options.weight || 3;

      // Temporarily increase stroke weight for emphasis
      item.layer.setStyle({
        weight: originalWeight + 2,
        opacity: 1
      });

      // Optional: Reset after 2 seconds
      setTimeout(function() {
        item.layer.setStyle({
          weight: originalWeight
        });
      }, 2000);
    }
  });

  console.log('✨ Highlighted', matchedIds.length, 'matched drawings');
}

// =====================================================
// SNIPPET 3: CLEAR SEARCH (SHOW ALL DRAWINGS)
// =====================================================
// Location: "When Search Input's value is empty" workflow OR "When Clear button clicked"
// Tool: Plugins → Toolbox → Run JavaScript
// Purpose: Reset all drawings to full visibility

console.log('🔄 Clearing search filter - showing all drawings...');

var map = window.__leafy_found_map;

if (!map) {
  console.error('❌ Map not found');
} else if (!window.__drawing_layers) {
  console.log('ℹ️ No drawings loaded yet');
} else {
  var count = 0;

  // Reset all drawings to full visibility
  Object.keys(window.__drawing_layers).forEach(function(id) {
    var item = window.__drawing_layers[id];

    // Restore full opacity
    if (item.layer) {
      // Check if it's a marker or a polyline/polygon
      if (typeof item.layer.setStyle === 'function') {
        // Polyline or Polygon
        item.layer.setStyle({opacity: 1});
        if (item.layer.options.fillOpacity !== undefined) {
          // Polygon - restore original fill opacity
          item.layer.setStyle({fillOpacity: 0.3});
        }
      } else {
        // Marker (Point) - use setOpacity
        item.layer.setOpacity(1);
      }
    }

    if (item.marker) {
      item.marker.setOpacity(1);
    }

    count++;
  });

  console.log('✅ Reset', count, 'drawings to full visibility');
}

// =====================================================
// SNIPPET 4: ALTERNATIVE - REMOVE NON-MATCHES (STRICT)
// =====================================================
// Location: Same as SNIPPET 1 (alternative approach)
// Tool: Plugins → Toolbox → Run JavaScript
// Purpose: Completely remove non-matching drawings from map (instead of dimming)
// Note: Use this if you prefer matched drawings only, not dimmed non-matches
// Uses same param1 format as SNIPPET 1

console.log('🔍 Showing only matched drawings (removing non-matches)...');

// Parse comma-separated IDs from Toolbox param1
var matchedIdsString = properties.param1 || "";
var matchedIds = matchedIdsString.split(",").filter(function(id) {
  return id.trim() !== "";
});
var map = window.__leafy_found_map;

if (map && window.__drawing_layers) {
  var showCount = 0;
  var hideCount = 0;

  Object.keys(window.__drawing_layers).forEach(function(id) {
    var item = window.__drawing_layers[id];

    if (matchedIds.includes(id)) {
      // MATCHED: Ensure drawing is on map
      if (item.layer && !map.hasLayer(item.layer)) {
        item.layer.addTo(map);
      }
      if (item.marker && !map.hasLayer(item.marker)) {
        item.marker.addTo(map);
      }
      showCount++;
    } else {
      // NOT MATCHED: Remove from map
      if (item.layer && map.hasLayer(item.layer)) {
        map.removeLayer(item.layer);
      }
      if (item.marker && map.hasLayer(item.marker)) {
        map.removeLayer(item.marker);
      }
      hideCount++;
    }
  });

  console.log('✅ Filtered:', showCount, 'shown,', hideCount, 'hidden');
}

// To restore all (use with SNIPPET 3 alternative):
// Simply re-add all layers to map

// =====================================================
// IMPLEMENTATION GUIDE
// =====================================================

// BUBBLE SETUP:
//
// 1. Install Fuzzy Search Plugin
//    - Go to Plugins tab in Bubble
//    - Search for "Fuzzy Search"
//    - Install the plugin
//
// 2. Add Search Input Element
//    - Location: Toolbar or header
//    - Placeholder: "Search drawings..."
//
// 3. Add Custom States to Page
//    - State 1: searchQuery (text) - stores current search query
//    - State 2: isSearchActive (yes/no, default: no) - prevents continuous trigger
//
// 4. Add Fuzzy Search Element (invisible)
//    - Element type: Fuzzy Search (from plugin)
//    - Data source: Do a search for Drawings
//      - Constraint: privacy contains Current User's role (or viewAsRole state)
//      - Constraint: approvalStatus = "approved" (optional)
//    - Search in: name
//    - Search for: Search Input's value
//    - Options:
//      - Threshold: 0.6 (0 = exact match, 1 = match anything)
//      - Distance: 100 (max distance between characters)
//      - Include score: yes (optional, for debugging)
//
// 5. Create Workflow 1: "When Fuzzy Search matches is not empty"
//    (This prevents continuous trigger and only runs when there are results)
//
//    Step 1: Set state isSearchActive = yes
//      - Element: Page
//      - State: isSearchActive
//      - Value: yes
//
//    Step 2: Set state searchQuery
//      - Element: Page
//      - State: searchQuery
//      - Value: Search Input's value
//
//    Step 3: Run JavaScript (SNIPPET 1 - Filter drawings)
//      - Plugins → Toolbox → Run JavaScript
//      - Code: Copy SNIPPET 1 above
//      - param1: <Fuzzy Search Results:each item's _id:join with ,>
//      - ⚠️ IMPORTANT: Do NOT wrap the dynamic expression in quotes!
//      - ❌ WRONG: "<Fuzzy Search Results:each item's _id:join with ,>"
//      - ✅ CORRECT: <Fuzzy Search Results:each item's _id:join with ,>
//      - Note: This creates comma-separated string of IDs
//
//    Step 4 (Optional): Run JavaScript (SNIPPET 2 - Highlight)
//      - Add highlight effect to matched drawings
//      - param1: <Fuzzy Search Results:each item's _id:join with ,>
//      - ⚠️ Same warning: No quotes around the dynamic expression!
//
// 6. Create Workflow 2: "When Search Input's value is changed AND This Input's value is empty"
//    (This restores all drawings when user clears/deletes search)
//
//    Condition: Only when Page's isSearchActive is yes
//    (This prevents continuous loop when input stays empty!)
//
//    Step 1: Set state isSearchActive = no
//      - Element: Page
//      - State: isSearchActive
//      - Value: no
//
//    Step 2: Set state searchQuery = (empty)
//      - Element: Page
//      - State: searchQuery
//      - Value: (empty)
//
//    Step 3: Run JavaScript (SNIPPET 3 - Clear search)
//      - Plugins → Toolbox → Run JavaScript
//      - Code: Copy SNIPPET 3 above
//      - No params needed
//      - Restores all drawings to full visibility

// =====================================================
// FUZZY SEARCH SETTINGS
// =====================================================

// Threshold (0 to 1):
// - 0.0 = Perfect match required
// - 0.3 = Fairly strict (recommended for names)
// - 0.6 = Moderate fuzziness (default, good for typos)
// - 0.9 = Very fuzzy (almost anything matches)

// Distance:
// - Maximum distance between characters
// - 100 = Default (good balance)
// - 50 = Stricter (characters must be closer)
// - 200 = More lenient

// Examples of fuzzy matching with threshold 0.6:
// Query: "head" → Matches: "Headgate 1", "Main Headgate", "Ahead Farm"
// Query: "cnal" → Matches: "Canal A", "Main Canal" (typo tolerance)
// Query: "pump" → Matches: "Pump 1", "Pump Station", "Sump Pump"

// =====================================================
// PERFORMANCE NOTES
// =====================================================

// - Fuzzy Search runs client-side on already-loaded drawings
// - No database query on every keystroke (fast!)
// - Works with existing loaded drawings (from page load or role selector)
// - Debouncing recommended for very large datasets (500+ drawings)
//   → Use Bubble's "Only when input value is finished changing" option
// - Consider limiting search to first 100-200 results for performance

// =====================================================
// COMBINING WITH ROLE SELECTOR
// =====================================================

// Search works seamlessly with role selector:
// 1. Admin selects "User" role → Drawings reload filtered by privacy
// 2. Admin types in search → Fuzzy search filters within visible drawings
// 3. Admin clears search → All User-visible drawings show again
// 4. Admin switches to "Admin" role → Drawings reload, search clears

// Optional: Clear search when role changes
// In "When Role selector value is changed" workflow:
//   - Add step: Reset Search Input's value to empty

// =====================================================
// TESTING
// =====================================================

// Test fuzzy search:
// 1. Load page with drawings
// 2. Type "canal" → Should dim/hide non-canal drawings
// 3. Type "cnal" (typo) → Should still match "canal" drawings
// 4. Clear search → All drawings should restore
// 5. Type partial name → Should match drawings containing that text
// 6. Test with different threshold values to find optimal fuzziness

// Debug mode:
// - Check browser console for match counts
// - Verify matched IDs array: console.log(matchedIds)
// - Check window.__drawing_layers to see all loaded drawings
