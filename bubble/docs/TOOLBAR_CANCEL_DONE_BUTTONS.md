# Cancel & Done Buttons for Drawing Toolbar

Simple implementation using Toolbox "JavaScript to Bubble" plugin + Custom Events + Wrapper Functions.

**Time:** ~18 minutes (7 parts)

---

## Part 1: Toolbox Elements (7 min)

Create 3 "JavaScript to Bubble" elements in your Bubble editor:

### Element 1: "UpdatePointCount"
- **Element name:** UpdatePointCount
- **Function suffix:** `update_point_count`
- **Return value type:** number

**Workflow:** "When UpdatePointCount's value is returned"
```
Action: Set State
  Element: Page
  Custom state: pointCount
  Value: UpdatePointCount's value
```

### Element 2: "SaveLineDrawing"
- **Element name:** SaveLineDrawing
- **Function suffix:** `saveLineDrawing`
- **Return value type:** text

**Receives 3 outputs from JavaScript:**
- `output1` - Full GeoJSON Feature (string)
- `output2` - Coordinates array [[lng,lat],...] (string)
- `output3` - Marker position [lat,lng] (string)

**Workflow:** "When SaveLineDrawing's value is returned"
```
Action 1: Create new Drawing
  type = "line"
  coordinates = SaveLineDrawing's output2 (already JSON string)
  markerPosition = SaveLineDrawing's output3 (already JSON string)
  properties = SaveLineDrawing's output1 (full GeoJSON)
  name = "Line - " + Current date/time
  color = "#3B82F6"
  elementType = "custom"
  approvalStatus = (Current User's role = "Admin" ? "approved" : "pending")
  createdBy = Current User
  createdByRole = Current User's role
  showTooltip = "yes"
  privacy = [List of Account Types]

Action 2: Render on map (optional if using load drawings workflow)

Action 3: Trigger Custom Event
  Event: "Reset Drawing State"
```

### Element 3: "SaveAreaDrawing"
- **Element name:** SaveAreaDrawing
- **Function suffix:** `saveAreaDrawing`
- **Return value type:** text

**Receives 3 outputs from JavaScript:**
- `output1` - Full GeoJSON Feature (string)
- `output2` - Coordinates array [[[lng,lat],...]] (string)
- `output3` - Marker position [lat,lng] (string)

**Workflow:** "When SaveAreaDrawing's value is returned"
```
Action 1: Create new Drawing
  type = "area"
  coordinates = SaveAreaDrawing's output2 (already JSON string)
  markerPosition = SaveAreaDrawing's output3 (already JSON string)
  properties = SaveAreaDrawing's output1 (full GeoJSON)
  name = "Area - " + Current date/time
  color = "#3B82F6"
  elementType = "custom"
  approvalStatus = (Current User's role = "Admin" ? "approved" : "pending")
  createdBy = Current User
  createdByRole = Current User's role
  showTooltip = "yes"
  privacy = [List of Account Types]

Action 2: Render on map (optional if using load drawings workflow)

Action 3: Trigger Custom Event
  Event: "Reset Drawing State"
```

---

## Part 2: Custom States (2 min)

**Location:** Page element

| State Name | Type | Default |
|------------|------|---------|
| `activeTool` | text | empty |
| `pointCount` | number | 0 |

---

## Part 3: Custom Event "Reset Drawing State" (2 min)

Create a custom event that handles both JavaScript cleanup and Bubble state reset.

**Event name:** "Reset Drawing State"

**Steps:**
```
Step 1: Run JavaScript
  window.stopAllDrawingTools();

Step 2: Set State
  pointCount = 0

Step 3: Set State
  activeTool = "select"
```

**Purpose:** Prevents circular dependency by having Bubble orchestrate the full reset (JavaScript cleanup + state management).

---

## Part 5: Line Button Workflow (4 min)

**Workflow:** "When Line button is clicked"

```
Action 1: Run JavaScript (Initialize wrappers - lazy load, runs once)
  if (!window.pointAdded) {
    // Wrapper: Point counting for Line/Area tools
    window.pointAdded = function(data) {
      bubble_fn_update_point_count(data.pointCount);
    };

    // Wrapper: Line tool completion
    window.lineComplete = function(geojsonString) {
      var geojson = JSON.parse(geojsonString);

      // Calculate marker position (center of line)
      var coords = geojson.geometry.coordinates;
      var sumLat = 0, sumLng = 0;
      coords.forEach(function(coord) {
        sumLng += coord[0];
        sumLat += coord[1];
      });
      var centerLng = sumLng / coords.length;
      var centerLat = sumLat / coords.length;
      var markerPosition = [centerLat, centerLng];

      // Call Toolbox element with output1, output2, output3
      bubble_fn_saveLineDrawing({
        output1: geojsonString,                    // Full GeoJSON Feature
        output2: JSON.stringify(coords),           // Coordinates array
        output3: JSON.stringify(markerPosition)    // Marker position [lat,lng]
      });
    };

    // Wrapper: Area tool completion
    window.areaComplete = function(geojsonString) {
      var geojson = JSON.parse(geojsonString);

      // Calculate marker position (centroid of polygon)
      var coords = geojson.geometry.coordinates[0];  // First ring
      var sumLat = 0, sumLng = 0;
      coords.forEach(function(coord) {
        sumLng += coord[0];
        sumLat += coord[1];
      });
      var centerLng = sumLng / coords.length;
      var centerLat = sumLat / coords.length;
      var markerPosition = [centerLat, centerLng];

      // Call Toolbox element with output1, output2, output3
      bubble_fn_saveAreaDrawing({
        output1: geojsonString,                               // Full GeoJSON Feature
        output2: JSON.stringify(geojson.geometry.coordinates), // Coordinates array
        output3: JSON.stringify(markerPosition)               // Marker position [lat,lng]
      });
    };

    console.log('✅ Wrappers initialized');
  }

Action 2: Trigger Custom Event
  Event: "Reset Drawing State"

Action 3: Set State
  activeTool = "line"

Action 4: Run JavaScript
  window.__leafy_line.start();
```

**Note:** Wrappers are initialized once on first button click (lazy loading) and handle data transformation before calling Toolbox elements.

---

## Part 6: Area Button (1 min)

Same as Line button, but:
- Action 3: `activeTool = "area"`
- Action 4: `window.__leafy_area.start()`

**Note:** Wrappers are already initialized by Line button, so all actions are the same except tool name.

---

## Part 7: Cancel & Done Buttons (2 min)

### Cancel Button

**Visibility:** `Page's activeTool is "line" OR "area"`

**Workflow:**
```
Trigger Custom Event: "Reset Drawing State"
```

### Done Button

**Visibility:** `(activeTool="line" AND pointCount>=2) OR (activeTool="area" AND pointCount>=3)`

**Workflow:**
```
Run JavaScript: window.finishCurrentDrawing();
// finishCurrentDrawing() calls the appropriate tool's finish() method
// which triggers the save wrapper (lineComplete or areaComplete)
// The wrapper calls the Toolbox element which triggers the save workflow
// After save completes, your save workflow should trigger "Reset Drawing State" event
```

---

## Testing

1. Click Line → Click map twice → Done appears → Click Done → Saves
2. Click Area → Click map 3 times → Done appears → Click Done → Saves
3. Click Line → Click map → Click Cancel → Drawing discards, states reset

---

## How It Works

```
User clicks Line button
  → Initialize wrappers (first time only)
  → Trigger "Reset Drawing State" (stops tools + resets states)
  → Set activeTool="line"
  → Start line tool

User clicks map
  → Page header: pointAdded({tool, pointCount:1})
  → Wrapper: bubble_fn_update_point_count(1)
  → Toolbox: Triggers workflow, sets pointCount=1
  → Cancel button appears

User clicks map again
  → Page header: pointAdded({tool, pointCount:2})
  → Wrapper: bubble_fn_update_point_count(2)
  → Toolbox: Sets pointCount=2
  → Done button appears

User clicks Done
  → finishCurrentDrawing()
  → Page header: lineComplete(geojson)
  → Wrapper: Calculates marker position → bubble_fn_saveLineDrawing({output1, output2, output3})
  → Toolbox: Triggers save workflow
  → Save workflow receives 3 outputs: properties, coordinates, markerPosition
  → Save workflow final step: Trigger "Reset Drawing State"
```

---

## Summary

**Architecture:**
Page Header → Wrappers → Toolbox Elements → Bubble Workflows

**Wrapper Functions (initialized on Line button click):**
- `pointAdded(data)` → Extracts point count → `bubble_fn_update_point_count()`
- `lineComplete(geojson)` → Calculates marker position → `bubble_fn_saveLineDrawing()`
- `areaComplete(geojson)` → Calculates marker position → `bubble_fn_saveAreaDrawing()`

**Toolbox Elements (JavaScript to Bubble):**
- `bubble_fn_update_point_count` - Receives point count → Updates Bubble state
- `bubble_fn_saveLineDrawing` - Receives {output1, output2, output3} → Triggers save workflow
  - output1 = Full GeoJSON Feature
  - output2 = Coordinates array
  - output3 = Marker position [lat, lng]
- `bubble_fn_saveAreaDrawing` - Receives {output1, output2, output3} → Triggers save workflow
  - output1 = Full GeoJSON Feature
  - output2 = Coordinates array
  - output3 = Marker position [lat, lng]

**Custom Event:**
- "Reset Drawing State" - Calls `stopAllDrawingTools()` + resets Bubble states

**Benefits:**
- Wrappers handle data transformation (marker position calculation)
- Toolbox elements receive clean, structured data
- No circular dependencies
- Lazy loading (wrappers initialize on first use)
