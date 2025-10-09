# Freehand-draw investigation — detailed report

## Executive summary

- **Goal:** enable **freehand drawing** on a Leaflet map embedded via the ZeroQode Leafy plugin in Bubble, without editing the plugin code.
- **Approach:** DOM & script scanning, runtime hooks (capture `L.Map`), tried Leaflet-Geoman built-in freehand handlers, fallback to a custom pointer-based freehand implementation.
- **Outcome:**
  - Successfully **captured the Leaflet map instance** (`window.__leafy_found_map`).
  - Geoman (`L.PM`) is present (v2.18.3) but the **Freehand draw handler is missing** in the bundle.
  - `enableDraw('Freehand')` failed due to missing handler. `Polygon` with `freehand:true` was not true continuous freehand.
  - Implemented a working **custom freehand tool** using pointer events that outputs GeoJSON to `window.__leafy_last_freehand`.

---

## Environment & sources used

- Leaflet (bundled via ZeroQode plugin).
- Leaflet.draw (present).
- Leaflet-Geoman (L.PM v2.18.3) — present, but missing Freehand handler in this build.
- ZeroQode Leafy plugin (obfuscated; can't edit plugin code directly).
- Injected page scripts discovered: `drawing-lib.js`, `usefulFunctions.js`, `leaflet.js`, `leaflet.draw.js`, `leaflet-routing-machine.js`, `leaflet.markercluster.js`, `leaflet-geoman` bundle (unpkg or CDN present in scanned script list).

---

## Tests performed (ordered)

1. **Page scan & leafy probe**

   - Searched DOM for `.leaflet-container`, checked inline scripts and global variables.
   - Found `#leafy_main` container and multiple script sources (Leaflet, drawing libs, Geoman bundle candidate).

2. **L.Map capture via hooking**

   - Hooked `L.Map.prototype.initialize` and `L.map` factory to capture instances when created.
   - Result: `window.__leafy_found_map` set and accessible in console.

3. **Tried Geoman built-in Freehand**

   - Command: `window.__leafy_found_map.pm.enableDraw('Freehand', {...})`.
   - Result: **TypeError** reading `enable` (handler undefined) — Freehand handler absent.

4. **Diagnosed available PM draw handlers and version**

   - Printed available keys: `Object.keys(map.pm.Draw)` and `Object.keys(L.PM.Draw)`.
   - Observed keys: `['Marker','CircleMarker','Line','Polygon','Rectangle','Circle','Cut','Text']` — **no **``.
   - `L.PM.version` reported `2.18.3`.

5. **Tried Polygon freehand option**

   - Command: `map.pm.enableDraw('Polygon', { freehand: true })`.
   - Result: still click-to-place vertices — not continuous freehand stroke.

6. **Fallback — custom freehand listener**

   - Implemented pointer event handlers on `map.getContainer()` converting pointer positions to `LatLng` via `map.mouseEventToLatLng`.
   - Built `L.polyline` in real time and finalized to GeoJSON on `pointerup`.
   - Stored result at `window.__leafy_last_freehand` for downstream workflows.
   - Result: **Works reliably** for continuous freehand drawing.

---

## Results summary (table)

| Test                                     | Action                                       | Result                         | Notes                                             |
| ---------------------------------------- | -------------------------------------------- | ------------------------------ | ------------------------------------------------- |
| Map capture                              | Hooked `L.Map` and `L.map` factories         | **Passed**                     | `window.__leafy_found_map` available              |
| Geoman presence                          | Inspect `L.PM.version`                       | **Passed** (v2.18.3)           | Geoman core loaded                                |
| `enableDraw('Freehand')`                 | `map.pm.enableDraw('Freehand', ...)`         | **Failed**                     | Handler undefined → missing in bundle             |
| `enableDraw('Polygon', {freehand:true})` | Try fallback freehand option                 | **Failed (not true freehand)** | Click-mode behavior persists                      |
| Custom pointer listener                  | Pointer/mouse listeners → real-time polyline | **Passed**                     | Outputs GeoJSON to `window.__leafy_last_freehand` |

---

## Findings & root-cause analysis

- **Missing Geoman Freehand module:** Geoman core exists, but this particular build/bundle loaded on the page does **not include** the `Freehand` draw handler. Different Geoman distributions include optional modules; the site’s bundle lacks the Freehand handler.
- **Polygon **``** is insufficient:** Passing `freehand: true` to `Polygon` does not guarantee continuous stroke in this bundle—likely a partial/older implementation or disabled behavior.
- **Obfuscated plugin prevents edits:** The ZeroQode plugin code is obfuscated and not editable in-place, forcing us to rely on header script injection or runtime hooks instead of modifying plugin internals.
- **Custom approach is robust:** A pointer-based custom freehand capture bypasses the missing handler and gives a clean GeoJSON output suitable for saving.

---

## Recommendation & integration options

### Option 1 — Preferred (clean solution)

- **Load the GeoMan Freehand module** in the page header to expose `Freehand` handler and the standard Geoman UI/tooling.
- Example header includes (paste to Bubble page header):

```html
<script src="https://unpkg.com/@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.min.js"></script>
<link rel="stylesheet" href="https://unpkg.com/@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css" />
```

- After loading, call:

```js
map.pm.enableDraw('Freehand', {
  freehandOptions: { tolerance: 5 },
  pathOptions: { color: '#ff5722', weight: 3, fillOpacity: 0.15 }
});
```

### Option 2 — Non-invasive (fallback, already implemented)

- Keep the current plugin files; **inject our custom freehand script** via a header snippet or run-it-once JS action.
- Advantages: no dependency on missing Geoman modules; under your control; immediate.

### Option 3 — Hybrid

- Load Geoman full freehand bundle and keep the custom listener as a feature-detection fallback.

---

## Implementation details & example snippets

- **Add Geoman-free to header** (Option 1):

```html
<script src="https://unpkg.com/@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.min.js"></script>
<link rel="stylesheet" href="https://unpkg.com/@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css" />
```

- **Custom freehand tool** (summary of implemented behavior):

  - Listens to `pointerdown` / `pointermove` / `pointerup` on `map.getContainer()`.
  - Converts screen coordinates to lat/lng via `map.mouseEventToLatLng(ev)`.
  - Builds an `L.polyline` while dragging and finalizes a GeoJSON polyline on `pointerup`.
  - Saves final GeoJSON to `window.__leafy_last_freehand`.
  - API provided: `window.__leafy_freehand.start()`, `stop()`, `clearFreehandLayers()`, etc.

- **Read captured GeoJSON**:

```js
console.log(window.__leafy_last_freehand);
```

- **Clear previously drawn freehand layers**:

```js
window.__leafy_freehand.clearFreehandLayers();
```

---

## Operational considerations & next steps

- **Where to add the code:**

  - If you can edit Bubble page header: add the Geoman-free script + CSS (Option 1). That should enable `Freehand` and make `map.pm.enableDraw('Freehand', ...)` work.
  - If not possible: use custom freehand script via a “Run JavaScript” action or include it in the page header through Bubble settings.

- **Saving shapes to Bubble:**

  - The custom tool stores GeoJSON in `window.__leafy_last_freehand`.
  - To persist: use a Run JavaScript step to pass GeoJSON to a Bubble workflow, or use a plugin that bridges JS → Bubble state.

- **UX polish:**

  - Add a toggle button to enable/disable freehand mode.
  - Add point simplification (Douglas-Peucker) to reduce GeoJSON size before saving.
  - Convert polyline → polygon if area shapes are required.

---

## Risks & limitations

- Loading external scripts from CDNs may be restricted by network policies or CSP.
- Obfuscated plugin internals prevent direct modification; header injection is the safest approach.
- Custom freehand bypasses Geoman editing UI; if user needs Geoman edit tools for freehand shapes, include Geoman modules or wire edit functionality.

---

## Attachments / key console outputs

- `L.PM.version`: `2.18.3`
- `pm.Draw` keys seen: `['options','_map','shapes','Marker','CircleMarker','Line','Polygon','Rectangle','Circle','Cut','Text']`
- Error for `enableDraw('Freehand')`: `TypeError: Cannot read properties of undefined (reading 'enable')` (indicates missing handler)

---

## Concrete recommended next actions (pick one)

1. **Best** — Add Geoman Freehand bundle into the page header and re-run `map.pm.enableDraw('Freehand', ...)`.
2. **Quick** — Keep the custom freehand script and wire `window.__leafy_last_freehand` into a Bubble workflow to save shapes.
3. **Hybrid** — Add Geoman-free and keep custom freehand as fallback; implement a toggle to prefer Geoman when available.

---

*Prepared on 2025-10-06.*

