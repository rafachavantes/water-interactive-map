# Step 4 Testing Checklist

> **Quick testing guide for Step 4: Load Drawings on Page Refresh**

## Before You Start Testing

**Prerequisites:**
- [ ] Step 3 complete (at least one drawing saved in database)
- [ ] Database has drawings with `approvalStatus = "approved"`
- [ ] Page header has `bubble-freehand-header-v2.html` script
- [ ] Page load workflow created with JavaScript action

## Testing Scenarios

### Test 1: Basic Page Load (Single Drawing)

**Setup:**
1. Ensure database has exactly 1 approved drawing
2. Note the drawing's ID and type from database

**Test Steps:**
1. Open page in preview mode
2. Open browser console (F12)
3. Wait for page to fully load

**Expected Results:**
- [ ] Console shows: `🔄 Step 4: Loading drawings from database...`
- [ ] Console shows: `📊 Found 1 approved drawings to render`
- [ ] Console shows: `✅ Map ready, starting to render 1 drawings`
- [ ] Console shows: `🖼️ Rendering drawing 1/1 - ID: [id]`
- [ ] Console shows: `✅ Drawing rendered successfully`
- [ ] Console shows: `🎉 All drawings rendered! Total: 1`
- [ ] Console shows: `🗺️ Map bounds fitted to show all drawings`
- [ ] Drawing visible on map in correct location
- [ ] Center marker visible (for line/polygon)
- [ ] No errors in console

**Debug Commands:**
```javascript
// Check if map captured
window.__leafy_found_map

// Check stored layers
window.__drawing_layers

// Count layers
Object.keys(window.__drawing_layers).length  // Should be 1
```

---

### Test 2: Multiple Drawings Load

**Setup:**
1. Create 3-5 approved drawings using Step 3
2. Vary drawing types (mix of polylines, polygons)
3. Use different colors

**Test Steps:**
1. Refresh page (or open in new preview)
2. Watch console output

**Expected Results:**
- [ ] Console shows correct count: `Found X approved drawings`
- [ ] All drawings appear on map
- [ ] Each drawing has correct color from database
- [ ] All center markers visible
- [ ] Map zooms to fit all drawings
- [ ] No coordinate conversion errors
- [ ] No rendering errors

**Visual Check:**
- [ ] Polylines are solid lines (not dashed)
- [ ] Colors match database values
- [ ] Drawings in Brazil region (lat ~-23, lng ~-47)
- [ ] No drawings in ocean/wrong continent

---

### Test 3: Empty Database (Zero Drawings)

**Setup:**
1. Delete all drawings OR change all to `approvalStatus = "pending"`

**Test Steps:**
1. Refresh page
2. Check console

**Expected Results:**
- [ ] Console shows: `Found 0 approved drawings to render`
- [ ] Console shows: `ℹ️ No drawings to display, keeping default map view`
- [ ] No errors about undefined/null
- [ ] Map shows default view (no crash)

---

### Test 4: Coordinate Format Verification

**Setup:**
1. Have at least one drawing in database
2. Note the first coordinate pair from database

**Test Steps:**
1. Load page with console open
2. Look for coordinate conversion logs

**Expected Results:**
- [ ] Console shows: `🔄 Converted X coordinates from GeoJSON to Leaflet format`
- [ ] If first coordinate in DB is `[-47.607, -23.499]` (GeoJSON [lng, lat])
- [ ] Console log should show conversion to `[-23.499, -47.607]` (Leaflet [lat, lng])
- [ ] Drawing appears in correct location (Brazil)

**Debug:**
```javascript
// Check a specific drawing's stored data
var firstDrawingId = Object.keys(window.__drawing_layers)[0];
window.__drawing_layers[firstDrawingId].data
```

---

### Test 5: Click Handler Functionality

**Setup:**
1. Load page with drawings visible

**Test Steps:**
1. Click on a drawing line
2. Click on a center marker

**Expected Results:**
- [ ] Console shows: `🖱️ Drawing clicked: [id]` (when clicking line)
- [ ] Console shows: `🖱️ Center marker clicked: [id]` (when clicking marker)
- [ ] Warning about `bubble_fn_drawing_selected` not being a function is OK (Step 5 not implemented yet)

---

### Test 6: Map Bounds Fitting

**Setup:**
1. Have 2-3 drawings spread across different locations

**Test Steps:**
1. Load page
2. Observe initial map view

**Expected Results:**
- [ ] Map automatically zooms to show all drawings
- [ ] Padding visible around drawings (not cut off at edges)
- [ ] Zoom level reasonable (not too close, not too far)
- [ ] Max zoom = 15 applied (doesn't over-zoom for single drawing)

---

### Test 7: Different Drawing Types

**Setup:**
1. Create one of each type:
   - Point marker
   - Polyline (line or freehand)
   - Polygon (area)

**Test Steps:**
1. Load page with all three visible

**Expected Results:**

**For Point:**
- [ ] Console shows: `📍 Created point marker`
- [ ] Single marker appears
- [ ] No center marker created (point itself is the marker)
- [ ] Marker has colored circle with white border

**For Polyline:**
- [ ] Console shows: `📏 Created polyline with X points`
- [ ] Line appears solid (not dashed)
- [ ] Center marker appears
- [ ] Both line and marker clickable

**For Polygon:**
- [ ] Console shows: `🔷 Created polygon with X vertices`
- [ ] Polygon shape appears
- [ ] Fill opacity = 0.3 (semi-transparent)
- [ ] Center marker appears
- [ ] Both polygon and marker clickable

---

### Test 8: Performance Test (Large Dataset)

**Setup:**
1. Create 20+ approved drawings

**Test Steps:**
1. Load page
2. Measure time from "Loading drawings" to "All drawings rendered"

**Expected Results:**
- [ ] Page loads in < 3 seconds
- [ ] All drawings render smoothly
- [ ] No browser lag or freezing
- [ ] Map interactions still responsive
- [ ] No memory issues

---

### Test 9: Page Refresh Persistence

**Setup:**
1. Load page with drawings visible

**Test Steps:**
1. Hard refresh page (Ctrl+F5 or Cmd+Shift+R)
2. Close preview and reopen

**Expected Results:**
- [ ] All drawings reappear on refresh
- [ ] Same count of drawings
- [ ] Same colors and positions
- [ ] Layer storage recreated correctly

---

### Test 10: Privacy Filtering (If Implemented)

**Setup:**
1. Have drawings with different privacy settings
2. Test as different user roles

**Test Steps:**
1. Login as Admin → Load page → Note visible drawings
2. Login as Ditch Rider → Load page → Note visible drawings
3. Login as User → Load page → Note visible drawings

**Expected Results:**
- [ ] Admin sees all approved drawings
- [ ] Ditch Rider sees filtered drawings per privacy
- [ ] User sees filtered drawings per privacy
- [ ] Console count matches visible count

---

## Common Issues & Solutions

### Issue: "Map not ready yet" loops forever

**Check:**
```javascript
window.__leafy_found_map  // Should return map object after ~1-2 seconds
```

**Solutions:**
- Ensure page header script is present
- Check Leafy Maps element is visible
- Run `window.__leafy_try_capture_now()` manually

---

### Issue: Drawings don't appear but console shows success

**Check:**
1. Are coordinates reasonable? (Not [0,0] or [null, null])
2. Run in console:
   ```javascript
   Object.values(window.__drawing_layers).map(d => d.data)
   ```
3. Pan/zoom map manually to look for drawings

**Solutions:**
- Check coordinate format in database
- Verify coordinate conversion is happening
- Check if drawings are outside current map view

---

### Issue: Drawings in wrong location (ocean, wrong country)

**Check coordinate conversion:**
```javascript
// Example Brazil coordinate
var testCoord = [-47.607, -23.499];  // GeoJSON [lng, lat]
var leafletCoord = [testCoord[1], testCoord[0]];  // Should be [-23.499, -47.607]
console.log('GeoJSON:', testCoord, '→ Leaflet:', leafletCoord);
```

**Solutions:**
- Verify `.map(c => [c[1], c[0]])` is in code
- Check database coordinates are in GeoJSON format
- Brazil: lat should be ~-23 (not -47)

---

### Issue: Console errors about JSON.parse

**Check data types:**
```javascript
// In database, coordinates should be text field containing:
'[[-47.607, -23.499], [-47.608, -23.500], ...]'

// NOT:
- Empty string
- "null"
- Invalid JSON
```

**Solutions:**
- Check database field is not null
- Verify JSON is valid (use JSON validator)
- Re-save drawing using Step 3 if corrupted

---

## Success Criteria Summary

**All tests passing means:**
- ✅ Drawings load automatically on page refresh
- ✅ Correct coordinate format conversion
- ✅ All drawing types render correctly
- ✅ Click handlers working
- ✅ Map bounds fitting working
- ✅ Performance acceptable
- ✅ No console errors
- ✅ Ready for Step 5 (drawing selection)

---

## Next Steps After All Tests Pass

1. **Proceed to Step 5:** Drawing selection workflow
2. **Add privacy filtering:** If not yet implemented
3. **Optimize performance:** If loading >100 drawings

---

**Version:** 1.0
**Date:** 2025-10-10
**Status:** Ready for testing
