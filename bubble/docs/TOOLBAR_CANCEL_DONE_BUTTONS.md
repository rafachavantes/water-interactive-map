# Cancel & Done Buttons for Drawing Toolbar

Simple implementation using Toolbox "JavaScript to Bubble" plugin.

**Time:** ~20 minutes

---

## Part 1: Toolbox Elements (5 min)

Create 2 "JavaScript to Bubble" elements in your Bubble editor:

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

### Element 2: "ResetDrawing"
- **Element name:** ResetDrawing
- **Function suffix:** `reset_drawing`
- **Return value type:** text (doesn't matter)

**Workflow:** "When ResetDrawing's value is returned"
```
Action 1: Set State
  pointCount = 0

Action 2: Set State
  activeTool = empty
```

---

## Part 2: Custom States (2 min)

**Location:** Page element

| State Name | Type | Default |
|------------|------|---------|
| `activeTool` | text | empty |
| `pointCount` | number | 0 |

---

## Part 3: Line Button Workflow (8 min)

**Workflow:** "When Line button is clicked"

```
Action 1: Run JavaScript (initialize on first use)
  if (!window.bubble_fn_pointAdded) {
    // When map is clicked, page header calls: bubble_fn_pointAdded({tool:"line", pointCount:1})
    // We extract the number and pass to Toolbox element
    window.bubble_fn_pointAdded = function(data) {
      update_point_count(data.pointCount);
    };

    // When drawing stops, page header calls: bubble_fn_drawingReset()
    // We trigger the Toolbox element to reset states
    window.bubble_fn_drawingReset = function() {
      reset_drawing();
    };
  }

Action 2: Run JavaScript
  window.stopAllDrawingTools();
  // This calls bubble_fn_drawingReset() which triggers ResetDrawing element

Action 3: Set State
  activeTool = "line"

Action 4: Run JavaScript
  window.__leafy_line.start();
```

**Note:** We don't manually reset pointCount here - `stopAllDrawingTools()` already does it via the ResetDrawing Toolbox element.

---

## Part 4: Area Button (2 min)

Same as Line button, but:
- Action 3: `activeTool = "area"`
- Action 4: `window.__leafy_area.start()`

---

## Part 5: Cancel & Done Buttons (3 min)

### Cancel Button

**Visibility:** `Page's activeTool is "line" OR "area"`

**Workflow:**
```
Run JavaScript: window.stopAllDrawingTools();
```

### Done Button

**Visibility:** `(activeTool="line" AND pointCount>=2) OR (activeTool="area" AND pointCount>=3)`

**Workflow:**
```
Run JavaScript: window.finishCurrentDrawing();
// finishCurrentDrawing() calls the appropriate tool's finish() method
// which triggers the save callback (bubble_fn_lineComplete or bubble_fn_areaComplete)
// After save completes, your save workflow should call window.stopAllDrawingTools()
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
  → Initialize callbacks (first time only)
  → Stop all tools (resets states via ResetDrawing element)
  → Set activeTool="line"
  → Start line tool

User clicks map
  → Page header: bubble_fn_pointAdded({tool:"line", pointCount:1})
  → Your code: update_point_count(1)
  → Toolbox: Triggers workflow, sets pointCount=1
  → Cancel button appears

User clicks map again
  → Page header: bubble_fn_pointAdded({tool:"line", pointCount:2})
  → Your code: update_point_count(2)
  → Toolbox: Sets pointCount=2
  → Done button appears

User clicks Done
  → finishCurrentDrawing() → Saves → stopAllDrawingTools()
  → Page header: bubble_fn_drawingReset()
  → Your code: reset_drawing()
  → Toolbox: Resets both states
```

---

## Summary

**Toolbox Elements:**
- `update_point_count` - Updates pointCount state
- `reset_drawing` - Resets pointCount and activeTool states

**Wrapper Functions:**
- `window.bubble_fn_pointAdded(data)` - Extracts number, calls `update_point_count()`
- `window.bubble_fn_drawingReset()` - Calls `reset_drawing()`

**No duplication:** `stopAllDrawingTools()` handles all resets via Toolbox element.
