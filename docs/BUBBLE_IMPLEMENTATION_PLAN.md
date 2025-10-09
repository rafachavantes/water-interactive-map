# Bubble.io Implementation Plan
## Using Leafy Maps Plugin + Custom Freehand Extension

**Based on:** PRD requirements, current Next.js implementation, proven freehand drawing solution

---

## 📸 UI Analysis from Screenshots

### Screenshot 1: Main Map View (Page Load State)
**Visible Elements:**
- ✅ Map with OpenStreetMap tiles
- ✅ Multiple drawing types rendered:
  - Green polygons (Land areas)
  - Blue polyline (Canal route)
  - Various colored markers (headgates, farms, meters, points, canals)
- ✅ Bottom toolbar: Edit/View toggle + drawing tools (Select, Line, Draw, Area, Point)
- ✅ Top-left: Layers button with badge (1), Search bar
- ✅ Top-right: Export button
- ✅ "To Review" indicator with count

### Screenshot 2: Details Panel Open
**Left Sidebar (Layers Panel):**
- ✅ "To Review" section with badge (1)
- ✅ Categorized element types:
  - INFRASTRUCTURE: Rides (1), Canals (6), Headgates (0)
  - MONITORING: Meters (3), Pumps (0), Pivots (0)
  - OTHER: Land (1), Hazards (2), Maintenance (2), Custom (5)
- ✅ Search functionality

**Right Panel (Element Details):**
- ✅ Element name header with delete/close buttons
- ✅ Issues section with "Add issue" button
- ✅ Details accordion:
  - Type dropdown
  - Link to entity
  - Description field
  - Privacy controls (Users, Ditch Riders, Admins checkboxes)
- ✅ Contact Information accordion:
  - Name, Role, Phone, Email fields
  - Contact Privacy controls
- ✅ Files & Links section
- ✅ Notes, Metadata sections (collapsed)

---

## 🎯 Implementation Strategy

### Phase 1: Foundation & Database (Week 1)
### Phase 2: Map & Rendering (Week 2)
### Phase 3: Drawing Tools (Week 3)
### Phase 4: UI Components (Week 4)
### Phase 5: Business Logic (Week 5-6)
### Phase 6: Polish & Testing (Week 7-8)

---

## 📊 PHASE 1: Database Setup (Week 1)

### Bubble Database Tables

#### 1. **Drawings** (Main table)
```
Fields:
- id (unique id) - auto
- name (text)
- type (option set: DrawingTypes) - line | polygon | polyline | point
- coordinates (text) - JSON array of [lat, lng]
- markerPosition (text) - JSON [lat, lng] for marker placement
- elementType (option set: ElementTypes) - ride | canal | lateral | headgate | meter | pump | pivot | land | hazard | maintenance | custom
- linkedEntity (Drawing Entity) - relationship
- color (text) - hex color (e.g., "#3B82F6") - kept as text for custom colors
- description (text)
- status (option set: ElementStatus) - active | inactive | maintenance
- category (option set: Categories) - infrastructure | monitoring | other
- privacy (text) - JSON: {roles: {users: bool, ditchRiders: bool, admins: bool}, specificUsers: [ids], linkedEntity: bool}
- approvalStatus (option set: ApprovalStatus) - pending | approved | rejected
- createdBy (User) - relationship
- createdByRole (option set: Roles) - User | Ditch Rider | Admin
- reviewedBy (User) - relationship
- reviewedAt (date)
- reviewNotes (text)
- contactName (text)
- contactPhone (text)
- contactEmail (text)
- contactRole (text)
- contactPrivacy (text) - JSON privacy object
- files (text) - JSON array of file objects
- notes (text)
- properties (text) - JSON: {strokeWeight: number, fillOpacity: number, tool: string}
- Created Date (date) - auto (use Bubble's built-in field)
- Modified Date (date) - auto (use Bubble's built-in field)
```

**Note:** Use Bubble's built-in "Created Date" and "Modified Date" fields instead of custom createdAt/modifiedAt. Enable these in the Data Type settings.

#### 2. **Drawing Entities** (Infrastructure entities)
```
Fields:
- id (unique id)
- type (option set: ValidEntityTypes) - canal | ride | lateral | headgate | meter | pump | pivot | land
- name (text)
- description (text)
- status (option set: ElementStatus) - active | inactive | maintenance
- contactName (text)
- contactPhone (text)
- contactEmail (text)
- contactRole (text)
- maxFlow (number) - CFS
- currentOrder (number) - CFS (calculated from daily_recurring_order_item)
- metadata (text) - JSON for type-specific fields AND drawing origin tracking:
  Example: {
    // Type-specific fields (varies by entity type)
    "maxFlow": 100,      // for canals, headgates
    "acres": 50,         // for land, pivots
    "horsepower": 75,    // for pumps

    // Drawing origin tracking (when created from drawing via "Create Entity from Drawing" feature)
    "createdFromDrawingId": "abc123",
    "coordinates": [[lat, lng], ...],
    "markerPosition": [lat, lng],
    "color": "#3B82F6"
  }
- Created Date (date) - auto (use Bubble's built-in field)
- Modified Date (date) - auto (use Bubble's built-in field)
```

#### 3. **Issues**
```
Fields:
- id (unique id)
- drawing (Drawing) - relationship
- description (text)
- createdBy (User) - relationship
- createdByRole (option set: Roles) - User | Ditch Rider | Admin
- resolvedBy (User) - relationship
- resolvedAt (date)
- status (option set: IssueStatus) - open | resolved
- Created Date (date) - auto (use Bubble's built-in field)
```

#### 4. **Users** (extend built-in User type)
```
Custom fields:
- role (option set: Roles) - User | Ditch Rider | Admin
- assignedRides (list of Drawing Entities) - for ditch riders
```

### Option Sets

**Required Option Sets** (must be created before database tables):

```
- DrawingTypes: line, polygon, polyline, point
  (Used in: Drawings.type)

- ElementTypes: ride, canal, lateral, headgate, meter, pump, pivot, land, hazard, maintenance, custom
  (Used in: Drawings.elementType)

- ValidEntityTypes: canal, ride, lateral, headgate, meter, pump, pivot, land
  (Used in: Drawing Entities.type - excludes hazard, maintenance, custom)

- ElementStatus: active, inactive, maintenance
  (Used in: Drawings.status, Drawing Entities.status)

- Categories: infrastructure, monitoring, other
  (Used in: Drawings.category)

- Roles: User, Ditch Rider, Admin
  (Used in: Users.role, Drawings.createdByRole, Issues.createdByRole)

- ApprovalStatus: pending, approved, rejected
  (Used in: Drawings.approvalStatus)

- IssueStatus: open, resolved
  (Used in: Issues.status)
```

**Note:** The `color` field in Drawings table is kept as **text** (not Option Set) to allow custom hex colors like "#3B82F6". If you want to restrict users to predefined colors, you can create a Colors Option Set with values like: blue (#3B82F6), red (#EF4444), green (#10B981), yellow (#F59E0B), purple (#8B5CF6), orange (#F97316).

### Why Use Option Sets?

**Benefits:**
1. **Data Integrity:** Prevents typos ("Admn" vs "Admin", "activ" vs "active")
2. **Performance:** Option Sets are indexed by Bubble, resulting in faster database queries
3. **UI Auto-generation:** Dropdowns automatically populate from Option Sets
4. **Validation:** Bubble validates values automatically (no invalid statuses possible)
5. **Easy Refactoring:** Changing option display names updates all references automatically
6. **Better Conditionals:** Cleaner workflow logic (e.g., "This Drawing's status is active" vs text comparison)

**When to Use Text Instead:**
- Complex nested structures (JSON): privacy, metadata, coordinates, files, properties
- User-generated content: name, description, notes, contactName
- Custom values: color (hex codes), contactPhone, contactEmail
- Large text fields: reviewNotes, description

---

## 📍 PHASE 2: Map Setup & Rendering (Week 2)

### 2.1 Page Structure

```
Main Page (index)
├── Group: Full-page container
│   ├── Group: Header (z-index: 50)
│   │   ├── Floating Group: Top-left controls
│   │   │   ├── Button: Layers toggle (with badge for "To Review")
│   │   │   └── Input: Search bar (Idaho locations)
│   │   └── Floating Group: Top-right controls
│   │       └── Button: Export
│   │
│   ├── Group: Map container (z-index: 0)
│   │   └── Leafy Map element (ID: "main_map")
│   │
│   ├── Floating Group: Layers panel (left, conditional, z-index: 40)
│   │   └── Reusable Element: LayersPanel
│   │
│   ├── Floating Group: Details panel (right, conditional, z-index: 40)
│   │   └── Reusable Element: DetailsPanel
│   │
│   └── Floating Group: Bottom toolbar (z-index: 30)
│       └── Reusable Element: DrawingToolbar
```

### 2.2 Map Initialization Script (Page Header)

```javascript
<script>
// 1. Capture Leaflet map instance (from your investigation)
(function() {
  const originalMapInit = L.Map.prototype.initialize;
  L.Map.prototype.initialize = function(id, options) {
    const result = originalMapInit.call(this, id, options);
    if (id === 'main_map' || this._container.id.includes('leafy')) {
      window.__leafy_found_map = this;
      console.log('✅ Leaflet map captured:', this);

      // Trigger Bubble workflow when map is ready
      if (window.bubble_fn_mapReady) {
        window.bubble_fn_mapReady();
      }
    }
    return result;
  };
})();

// 2. Initialize drawing state storage
window.__drawing_state = {
  currentTool: null,
  isDrawing: false,
  drawings: [],
  selectedDrawing: null
};

// 3. Douglas-Peucker simplification (for freehand coordinates)
window.simplifyPath = function(points, tolerance = 0.0001) {
  // Implementation here
  return simplifiedPoints;
};

// 4. GeoJSON helpers
window.createGeoJSON = function(type, coordinates, properties) {
  return {
    type: "Feature",
    geometry: { type: type, coordinates: coordinates },
    properties: properties
  };
};
</script>
```

### 2.3 Load & Render Existing Drawings

**Workflow: "Load Drawings on Page Load"**
```
When Page is loaded:

  Step 1: Search for Drawings
    → Do a search for Drawings
    → Filter: approvalStatus = "approved"
    → Filter: privacy allows current user (custom function)
    → Sort by: createdAt (descending)

  Step 2: Wait for map ready
    → Run JavaScript (Toolbox):
        // Register map ready callback
        window.bubble_fn_mapReady = function() {
          console.log('Map ready, can now render drawings');
          // Trigger next workflow step
        };

  Step 3: Render each drawing
    → For each Drawing in search results:
        → Run JavaScript (Toolbox - "Render Drawing"):
            var map = window.__leafy_found_map;
            var drawing = {
              id: '<Drawing's id>',
              type: '<Drawing's type>',
              coordinates: JSON.parse('<Drawing's coordinates>'),
              color: '<Drawing's color>',
              elementType: '<Drawing's elementType>',
              name: '<Drawing's name>',
              properties: JSON.parse('<Drawing's properties>')
            };

            var layer;
            switch(drawing.type) {
              case 'point':
                layer = L.marker(drawing.coordinates, {
                  icon: L.divIcon({
                    html: '<div class="custom-marker" style="background:' + drawing.color + '"></div>',
                    className: 'marker-' + drawing.elementType,
                    iconSize: [24, 24]
                  })
                });
                break;

              case 'line':
              case 'polyline':
                layer = L.polyline(drawing.coordinates, {
                  color: drawing.color,
                  weight: drawing.properties.strokeWeight || 3
                });
                break;

              case 'polygon':
                layer = L.polygon(drawing.coordinates, {
                  color: drawing.color,
                  weight: drawing.properties.strokeWeight || 3,
                  fillOpacity: drawing.properties.fillOpacity || 0.3
                });
                break;
            }

            // Add marker at center for selection
            if (drawing.markerPosition) {
              var centerMarker = L.marker(JSON.parse('<Drawing's markerPosition>'), {
                icon: getIconForType(drawing.elementType)
              });

              centerMarker.on('click', function() {
                bubble_fn_selectDrawing('<Drawing's id>');
              });

              centerMarker.addTo(map);
            }

            layer.drawingId = drawing.id;
            layer.addTo(map);

            // Store reference
            window.__drawing_state.drawings.push({
              id: drawing.id,
              layer: layer,
              marker: centerMarker
            });

  Step 4: Fit map to drawings bounds
    → Run JavaScript:
        var map = window.__leafy_found_map;
        var group = L.featureGroup(
          window.__drawing_state.drawings.map(d => d.layer)
        );
        if (group.getBounds().isValid()) {
          map.fitBounds(group.getBounds(), { padding: [50, 50] });
        }
```

---

## 🎨 PHASE 3: Drawing Tools (Week 3)

### 3.1 Custom Freehand Drawing (Already Proven!)

**Script: Inject your working freehand implementation**

```javascript
<script>
// From your investigation report - the working implementation
window.__leafy_freehand = {
  isDrawing: false,
  currentPath: [],
  previewLayer: null,

  start: function() {
    var map = window.__leafy_found_map;
    var self = this;

    map.dragging.disable();
    map.getContainer().style.cursor = 'crosshair';

    map.once('pointerdown', function(e) {
      self.isDrawing = true;
      self.currentPath = [[e.latlng.lat, e.latlng.lng]];

      var onMove = function(e) {
        if (self.isDrawing) {
          self.currentPath.push([e.latlng.lat, e.latlng.lng]);

          // Update preview
          if (self.previewLayer) map.removeLayer(self.previewLayer);
          self.previewLayer = L.polyline(self.currentPath, {
            color: '#3B82F6',
            weight: 3,
            dashArray: '5, 5'
          }).addTo(map);
        }
      };

      var onUp = function(e) {
        self.isDrawing = false;
        map.off('pointermove', onMove);
        map.off('pointerup', onUp);
        map.dragging.enable();
        map.getContainer().style.cursor = '';

        if (self.currentPath.length >= 2) {
          // Simplify path
          var simplified = window.simplifyPath(self.currentPath, 0.0001);

          // Create GeoJSON
          var geojson = {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: simplified.map(p => [p[1], p[0]]) // [lng, lat]
            },
            properties: {
              tool: 'freehand',
              color: '#3B82F6',
              strokeWeight: 3
            }
          };

          window.__leafy_last_freehand = geojson;

          // Clear preview
          if (self.previewLayer) {
            map.removeLayer(self.previewLayer);
            self.previewLayer = null;
          }

          // Notify Bubble
          if (window.bubble_fn_freehandComplete) {
            window.bubble_fn_freehandComplete(JSON.stringify(geojson));
          }
        }

        self.currentPath = [];
      };

      map.on('pointermove', onMove);
      map.on('pointerup', onUp);
    });
  },

  stop: function() {
    var map = window.__leafy_found_map;
    this.isDrawing = false;
    this.currentPath = [];
    if (this.previewLayer) {
      map.removeLayer(this.previewLayer);
      this.previewLayer = null;
    }
    map.dragging.enable();
    map.getContainer().style.cursor = '';
  }
};
</script>
```

### 3.2 Other Drawing Tools

**Point Tool:**
```javascript
window.__leafy_point = {
  enable: function() {
    var map = window.__leafy_found_map;
    map.getContainer().style.cursor = 'crosshair';

    map.once('click', function(e) {
      var geojson = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [e.latlng.lng, e.latlng.lat]
        },
        properties: { tool: 'point' }
      };

      map.getContainer().style.cursor = '';

      if (window.bubble_fn_pointComplete) {
        window.bubble_fn_pointComplete(JSON.stringify(geojson));
      }
    });
  }
};
```

**Line Tool (click-based polyline):**
```javascript
window.__leafy_line = {
  points: [],
  previewLayer: null,
  markers: [],

  enable: function() {
    var map = window.__leafy_found_map;
    var self = this;

    map.getContainer().style.cursor = 'crosshair';

    var onClick = function(e) {
      self.points.push([e.latlng.lat, e.latlng.lng]);

      // Add vertex marker
      var marker = L.circleMarker(e.latlng, {
        radius: 4,
        color: '#3B82F6',
        fillColor: '#fff',
        fillOpacity: 1
      }).addTo(map);
      self.markers.push(marker);

      // Update preview
      if (self.points.length >= 2) {
        if (self.previewLayer) map.removeLayer(self.previewLayer);
        self.previewLayer = L.polyline(self.points, {
          color: '#3B82F6',
          weight: 3,
          dashArray: '5, 5'
        }).addTo(map);
      }
    };

    var onDblClick = function(e) {
      L.DomEvent.stop(e);
      self.finish();
    };

    map.on('click', onClick);
    map.on('dblclick', onDblClick);

    // Store for cleanup
    this._onClick = onClick;
    this._onDblClick = onDblClick;
  },

  finish: function() {
    var map = window.__leafy_found_map;

    if (this.points.length >= 2) {
      var geojson = {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: this.points.map(p => [p[1], p[0]])
        },
        properties: { tool: 'line' }
      };

      if (window.bubble_fn_lineComplete) {
        window.bubble_fn_lineComplete(JSON.stringify(geojson));
      }
    }

    this.cleanup();
  },

  cleanup: function() {
    var map = window.__leafy_found_map;

    // Remove event listeners
    if (this._onClick) map.off('click', this._onClick);
    if (this._onDblClick) map.off('dblclick', this._onDblClick);

    // Clear visual elements
    this.markers.forEach(m => map.removeLayer(m));
    if (this.previewLayer) map.removeLayer(this.previewLayer);

    this.points = [];
    this.markers = [];
    this.previewLayer = null;
    map.getContainer().style.cursor = '';
  }
};
```

**Area/Polygon Tool:**
```javascript
window.__leafy_area = {
  // Similar to line but creates polygon and closes on finish
  // ... implementation ...
};
```

### 3.3 Bubble Workflows for Drawing Tools

**Workflow: "Freehand Tool Clicked"**
```
When DrawingToolbar's freehand button is clicked:

  Step 1: Set current tool state
    → Set state currentTool = "freehand"

  Step 2: Enable freehand mode
    → Run JavaScript:
        window.__leafy_freehand.start();

  Step 3: Register completion callback
    → Run JavaScript:
        window.bubble_fn_freehandComplete = function(geojsonString) {
          var geojson = JSON.parse(geojsonString);

          // Trigger Bubble workflow to save
          // Pass coordinates as text
          bubble_fn_saveDrawing(
            'polyline',
            JSON.stringify(geojson.geometry.coordinates),
            geojson.properties
          );
        };
```

**Workflow: "Save Drawing"**
```
When bubble_fn_saveDrawing is called:

  Step 1: Calculate marker position (center of geometry)
    → Run JavaScript:
        var coords = JSON.parse('<coordinates>');
        var center = calculateCenter(coords);
        return JSON.stringify(center);

  Step 2: Create Drawing record
    → Create a new Drawing:
        type = <type parameter>
        coordinates = <coordinates parameter>
        markerPosition = Result of Step 1
        name = "Unnamed " + <elementType> + " " + current date/time
        color = "#3B82F6" (default blue)
        elementType = current state elementType (default "custom")
        properties = <properties parameter>
        approvalStatus = if current user role = "Admin" then "approved" else "pending"
        createdBy = Current User
        createdByRole = Current User's role
        createdAt = Current date/time
        privacy = default privacy object

  Step 3: Render on map
    → Run JavaScript (render layer)

  Step 4: Select new drawing
    → Set state selectedDrawing = Result of Step 2

  Step 5: Reset tool
    → Set state currentTool = "select"
```

---

## 🎛️ PHASE 4: UI Components (Week 4)

### 4.1 Reusable Element: Drawing Toolbar

**Layout:**
```
Floating Group (bottom center, z-index: 30)
├── Group: Mode toggle (Edit/View) - only visible to admins
│   ├── Button: Edit (primary when selected)
│   └── Button: View (primary when selected)
├── Separator (vertical line)
├── Group: Role selector (only visible in View mode for admins)
│   ├── Text: "View as:"
│   └── Dropdown: Role selection
├── Separator
└── Group: Drawing tools (only visible in Edit mode)
    ├── Button: Select (icon: cursor)
    ├── Button: Line (icon: minus)
    ├── Button: Freehand/Draw (icon: pen)
    ├── Button: Area (icon: square)
    └── Button: Point (icon: map-pin)
```

**Custom States:**
- currentTool (text)
- isEditMode (yes/no)
- viewAsRole (text)

**Workflows:**
- When tool button clicked → enable corresponding drawing mode
- When mode toggled → show/hide tools
- When role changed → re-filter drawings

### 4.2 Reusable Element: Layers Panel

**Layout:**
```
Group (left sidebar, conditional visibility)
├── Group: Header
│   ├── Text: "Layers"
│   └── Icon: Close button
├── Group: Search
│   └── Input: Search map elements
├── Group: To Review section (only for admins)
│   ├── Text: "To Review"
│   └── Badge: Count of pending drawings
├── Repeating Group: Categories
│   └── For each category (INFRASTRUCTURE, MONITORING, OTHER):
│       ├── Group: Category header
│       │   ├── Text: Category name
│       │   └── Icon: Expand/collapse
│       └── Repeating Group: Element types
│           └── For each type in category:
│               ├── Checkbox: Type filter
│               ├── Text: Type name
│               └── Text: Count
```

**Data Sources:**
```
Categories (custom state list):
- INFRASTRUCTURE: [rides, canals, laterals, headgates]
- MONITORING: [meters, pumps, pivots]
- OTHER: [land, hazards, maintenance, custom]

Counts:
- Do a search for Drawings
- Constraint: elementType = this type
- Constraint: filtered by current role's privacy
- :count
```

**Workflows:**
- When checkbox clicked → update filter state → re-render map layers
- When search input changes → filter visible drawings

### 4.3 Reusable Element: Details Panel

**Layout:**
```
Floating Group (right sidebar, conditional visibility)
├── Group: Header
│   ├── Text: Drawing's name (editable on click)
│   ├── Icon: Delete button
│   ├── Icon: Create Entity button (NEW - Admin only)
│   │   ├── Tooltip: "Create reusable entity from this drawing"
│   │   ├── Icon: Database/plus icon (distinct from delete)
│   │   └── Conditional visibility:
│   │       - Current User's role = "Admin"
│   │       - Drawing's linkedEntity is empty
│   │       - Drawing's elementType is in ValidEntityTypes option set
│   └── Icon: Close button
├── Separator
├── Group: Issues section
│   ├── Group: Header
│   │   ├── Text: "Issues"
│   │   └── Button: "Add issue"
│   └── Repeating Group: Issues list
│       └── Text: Issue description + status
├── Accordion: Details
│   ├── Dropdown: Type (elementType)
│   ├── Dropdown: Link to (Drawing Entities search)
│   ├── Input: Description
│   └── Group: Privacy controls
│       ├── Checkbox: Users
│       ├── Checkbox: Ditch Riders
│       └── Checkbox: Admins (disabled, always checked)
├── Accordion: Contact Information
│   ├── Input: Name (auto-populated if linked)
│   ├── Input: Role (auto-populated if linked)
│   ├── Input: Phone (auto-populated if linked)
│   ├── Input: Email (auto-populated if linked)
│   └── Group: Contact Privacy controls
├── Accordion: Files & Links
│   ├── Repeating Group: Files
│   └── Button: Add file/link
├── Accordion: Notes
│   └── Textarea: Notes
└── Accordion: Metadata
    ├── Text: Created by + date
    ├── Text: Modified date
    ├── Text: Reviewed by + date (if approved/rejected)
    └── Text: Review notes (if any)
```

**Workflows:**
- When Link to entity selected → auto-populate contact info
- When privacy checkbox clicked → update privacy JSON
- When save → update Drawing record with all fields
- When delete → show confirmation → delete Drawing + remove from map

---

## 🔐 PHASE 5: Business Logic (Week 5-6)

### 5.1 Privacy Filtering

**Backend Workflow: "Can User Access Drawing"**
```
Input: Drawing, User

Logic:
  Set result = "no" (default)

  If Drawing's privacy's roles's admins = "yes" AND User's role = "Admin":
    Set result = "yes"

  Else If Drawing's privacy's roles's ditchRiders = "yes" AND User's role = "Ditch Rider":
    Set result = "yes"

  Else If Drawing's privacy's roles's users = "yes" AND User's role = "User":
    Set result = "yes"

  Else If Drawing's privacy's specificUsers contains User's unique id:
    Set result = "yes"

  Else If Drawing's privacy's linkedEntity = "yes" AND Drawing's linkedEntity's ... (check relationship):
    Set result = "yes"

  Return result
```

**Apply to searches:**
```
Search for Drawings:
  Advanced filters:
    - Custom filter using "Can User Access Drawing" = "yes"
```

### 5.2 Approval Workflow

**Workflow: "Admin Approves Drawing"**
```
When Approve button clicked:

  Step 1: Update Drawing
    → Make changes to Drawing (selected):
        approvalStatus = "approved"
        reviewedBy = Current User
        reviewedAt = Current date/time
        reviewNotes = (optional admin notes)

  Step 2: Send notification
    → Send email to Drawing's createdBy:
        Subject: "Your map element has been approved"
        Body: "Your <elementType> '<name>' has been approved by <admin name>"

  Step 3: Re-render map
    → Trigger "Load Drawings" workflow

  Step 4: Close details panel
    → Set state selectedDrawing = empty
```

**Workflow: "Admin Rejects Drawing"**
```
Similar to approve but:
  - approvalStatus = "rejected"
  - Remove from map
  - Send rejection notification
```

### 5.3 Issue Management

**Workflow: "User Creates Issue"**
```
When "Add issue" button clicked:

  Step 1: Show issue creation popup
    → Show Popup: "Create Issue"

  Step 2: Create Issue record
    → Create a new Issue:
        drawing = Current Drawing
        description = Input value
        createdBy = Current User
        createdByRole = Current User's role
        createdAt = Current date/time
        status = "open"

  Step 3: Update Drawing's issue reference
    → Make changes to Drawing:
        issue = Result of Step 2

  Step 4: Update marker appearance
    → Run JavaScript:
        // Add issue indicator to marker
        var marker = findMarkerById('<Drawing's id>');
        marker.setIcon(getIconWithIssueIndicator());

  Step 5: Close popup
```

### 5.4 Entity Linking & Contact Auto-population

#### 5.4.1 Create Entity from Drawing (Admin Only)

**Overview:**
Solves the architecture gap where drawings cannot be linked to other drawings. This feature allows admins to promote drawings into reusable Drawing Entities that can then be linked to other drawings.

**Workflow: "Admin Creates Entity from Drawing"**
```
When "Create Entity" button clicked in Details Panel:

  Step 1: Validate drawing eligibility
    → Run JavaScript validation:
        var validTypes = ['canal', 'ride', 'lateral', 'headgate', 'meter', 'pump', 'pivot', 'land'];
        var elementType = '<Drawing's elementType>';

        if (!validTypes.includes(elementType)) {
          alert('This drawing type (' + elementType + ') cannot be converted to an entity.');
          return false;
        }

        if ('<Drawing's linkedEntity>' !== '') {
          alert('This drawing is already linked to an entity.');
          return false;
        }

        return true;

  Step 2: Show confirmation dialog
    → Show custom popup: "Create Entity Confirmation"
        Title: "Create Entity from Drawing?"
        Message: "This will create a new <Drawing's elementType> entity that can be linked to other drawings. The entity will inherit contact info and coordinates from this drawing. Other users will be able to link their drawings to this new entity."
        Buttons:
          - "Cancel" (closes popup)
          - "Create Entity" (proceeds to Step 3)

  Step 3: Create Drawing Entity record
    → Create a new Drawing Entity:
        type = Drawing's elementType
        name = Drawing's name
        description = Drawing's description (if exists)
        status = "active" (default)
        contactName = Drawing's contactName
        contactPhone = Drawing's contactPhone
        contactEmail = Drawing's contactEmail
        contactRole = Drawing's contactRole
        maxFlow = (empty, admin can fill later)
        currentOrder = 0 (default)
        metadata = JSON object:
          {
            "createdFromDrawingId": "<Drawing's id>",
            "coordinates": "<Drawing's coordinates>",
            "markerPosition": "<Drawing's markerPosition>",
            "color": "<Drawing's color>",
            "createdAt": "<Current date/time ISO string>"
          }
        createdAt = Current date/time
        modifiedAt = Current date/time

  Step 4: Auto-link drawing to new entity
    → Make changes to current Drawing:
        linkedEntity = Result of Step 3

  Step 5: Show success notification
    → Show alert (or temporary banner):
        "✅ Entity created successfully! This drawing is now linked to the new <elementType> entity. Other drawings can now link to this entity for contact auto-population."

  Step 6: Refresh details panel
    → Hide "Create Entity" button (now that linkedEntity exists)
    → Update "Link to" dropdown to show newly selected entity
    → Auto-populate contact fields from entity (trigger existing "Link to Entity Selected" workflow)
```

**Error Handling:**
```
When Create Entity fails:

  If API error occurs:
    → Show alert: "Error creating entity: <error message>. Please try again or contact support."
    → Log error to Bubble server logs
    → Rollback: Do not link drawing

  If validation fails:
    → Show specific validation message
    → Keep details panel open
    → Keep button visible
```

**UI Notes:**
- Button appears only when all conditions met (Admin + not linked + valid type)
- Button icon: Database with plus symbol (e.g., FontAwesome "fa-database" + "fa-plus")
- Button style: Blue/primary color, matches app theme
- Confirmation dialog: Clear explanation of what will happen
- Success feedback: Brief, informative message

**Benefits:**
- **Self-service:** Admins don't need database access to create entities
- **Data accuracy:** Entity inherits exact coordinates and contact info from drawing
- **Clear workflow:** Visual button in UI, obvious action
- **Quality control:** Admin-only feature ensures data integrity
- **Scalability:** Enables bottom-up entity creation as infrastructure is mapped

---

#### 5.4.2 Link to Existing Entity

**Workflow: "Link to Entity Selected"**
```
When Link to dropdown's value is changed:

  Step 1: Get selected entity
    → Do a search for Drawing Entities:
        Constraint: unique id = dropdown's value
        :first item

  Step 2: Auto-populate contact fields
    → Set Input (Contact Name)'s value = Result of Step 1's contactName
    → Set Input (Contact Phone)'s value = Result of Step 1's contactPhone
    → Set Input (Contact Email)'s value = Result of Step 1's contactEmail
    → Set Input (Contact Role)'s value = Result of Step 1's contactRole

  Step 3: Get current water order (if water system type)
    → If Result of Step 1's type is in ["canal", "ride", "lateral", "headgate"]:
        → Do a search for daily_recurring_order_item:
            Constraint: entity = Result of Step 1
            Constraint: date = Current date
            :first item

        → Display order value as CFS
        → Display max flow if available
```

### 5.5 Water Order Data Integration

**Custom Workflow: "Get Current Water Order"**
```
Input: Drawing Entity

Logic:
  If entity type is in water system types:
    Search for daily_recurring_order_item:
      - entity = input entity
      - date = current date
      :first item

    Return order value (CFS)
  Else:
    Return empty
```

---

## 📱 PHASE 6: Mobile Responsiveness (Week 7)

### 6.1 Responsive Layout Adjustments

**CSS (in page HTML header):**
```css
<style>
@media (max-width: 768px) {
  /* Map takes 40vh when details panel open */
  .mobile-map-container.details-panel-open {
    height: 40vh !important;
  }

  /* Details panel as bottom sheet */
  .details-panel-mobile {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60vh;
    border-radius: 16px 16px 0 0;
    overflow-y: auto;
  }

  /* Layers panel full width */
  .layers-panel-mobile {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 100vh;
    background: white;
  }

  /* Toolbar responsive */
  .drawing-toolbar {
    width: 100%;
    justify-content: space-around;
    padding: 8px;
  }
}
</style>
```

### 6.2 Mobile-Specific Workflows

**Workflow: "Center Marker on Mobile Selection"**
```
When Drawing marker is clicked on mobile:

  If window width < 768px:

    Step 1: Calculate offset for bottom sheet
      → Run JavaScript:
          var viewportHeight = window.innerHeight;
          var bottomSheetHeight = viewportHeight * 0.6;
          var offsetPixels = bottomSheetHeight / 2;
          return offsetPixels;

    Step 2: Pan map with offset
      → Run JavaScript:
          var map = window.__leafy_found_map;
          var markerLatLng = [<Drawing's markerPosition>];

          // Pan to marker with offset
          var point = map.project(markerLatLng, map.getZoom());
          point.y += <Result of Step 1> / 2;
          var newLatLng = map.unproject(point, map.getZoom());

          map.panTo(newLatLng, { animate: true, duration: 0.3 });
```

### 6.3 BDK Native Map Integration

**Check BN Native plugin for:**
- Trigger native map app with coordinates
- If not available, provide copy coordinates button

**Workflow: "Open in Native Maps"**
```
When "Open in Maps" button clicked:

  Step 1: Check if BN Native available
    → Run JavaScript:
        if (window.BN && window.BN.maps) {
          // Use BN Native
          BN.maps.open(<lat>, <lng>);
        } else {
          // Fallback: copy coordinates
          navigator.clipboard.writeText(<lat> + ', ' + <lng>);
          alert('Coordinates copied to clipboard');
        }
```

---

## 🧪 PHASE 7: Testing & Quality Assurance (Week 8)

### Test Checklist

**Drawing Functionality:**
- [ ] Freehand drawing creates polyline
- [ ] Line tool creates click-based polyline
- [ ] Area tool creates polygon
- [ ] Point tool creates marker
- [ ] All drawings save to database
- [ ] All drawings reload on page refresh
- [ ] Drawings persist across sessions

**Privacy & Access:**
- [ ] Admin sees all drawings
- [ ] Ditch Rider sees filtered drawings per privacy
- [ ] User sees filtered drawings per privacy
- [ ] Privacy settings update correctly
- [ ] Linked entity privacy works

**Approval Workflow:**
- [ ] Non-admin drawings default to pending
- [ ] Admin can approve/reject
- [ ] Pending count badge updates
- [ ] Notifications sent on approval/rejection
- [ ] Approved drawings visible per privacy
- [ ] Rejected drawings removed

**Entity Linking:**
- [ ] Contact info auto-populates from linked entity
- [ ] Water order data displays (CFS)
- [ ] Max flow displays when available
- [ ] User sees only their farm/system data

**Entity Creation from Drawing:**
- [ ] "Create Entity" button visible to Admins on eligible drawings
- [ ] "Create Entity" button hidden for non-Admins
- [ ] "Create Entity" button hidden when drawing already linked to entity
- [ ] "Create Entity" button hidden for invalid types (hazard, maintenance, custom)
- [ ] Confirmation dialog shows before entity creation
- [ ] Entity created with all inherited fields (name, description, contact info)
- [ ] Entity metadata includes drawing origin tracking (coordinates, markerPosition, color)
- [ ] Drawing auto-links to newly created entity after creation
- [ ] "Create Entity" button disappears after entity creation
- [ ] New entity appears in "Link to" dropdowns immediately
- [ ] Other drawings can successfully link to newly created entity
- [ ] Contact info auto-populates when linking to newly created entity
- [ ] Validation prevents creating entity from already-linked drawing
- [ ] Validation prevents creating entity from invalid drawing types
- [ ] Success message displays after entity creation
- [ ] Error handling works correctly if entity creation fails

**Issues:**
- [ ] Issues can be created on eligible markers
- [ ] Issue status shows in tooltips
- [ ] Hazard markers require approval
- [ ] Issue resolution workflow works

**Mobile:**
- [ ] Map renders on Android/iOS
- [ ] Bottom sheet functions properly
- [ ] Map centering on selection works
- [ ] Native map integration works (if BN Native available)
- [ ] Touch drawing works

**Performance:**
- [ ] Map loads <2 seconds
- [ ] Freehand coordinates simplified
- [ ] Large drawing sets render smoothly
- [ ] Search/filter is responsive

---

## 📦 Data Migration Plan

### Export from Current Next.js App

**Script: Export all drawings**
```javascript
// Run in browser console on current app
const drawings = await fetch('/api/drawings').then(r => r.json());
const exportData = JSON.stringify(drawings, null, 2);
console.log(exportData);
// Copy to clipboard or download
```

### Import to Bubble

**Workflow: "Import Drawings"**
```
When Import button clicked:

  Step 1: Upload JSON file
    → File Uploader input

  Step 2: Parse JSON
    → Run JavaScript:
        var data = JSON.parse(<file content>);
        return data;

  Step 3: Create Drawing records
    → For each item in Result of Step 2:
        → Create a new Drawing:
            (map all fields from JSON to Bubble fields)

  Step 4: Reload map
    → Trigger "Load Drawings" workflow
```

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All drawings save and load correctly
- [ ] Privacy filters work as expected
- [ ] Approval workflow tested
- [ ] Mobile responsive on real devices
- [ ] Performance benchmarks met
- [ ] Security review completed

### Bubble Settings
- [ ] Set up custom domain
- [ ] Configure environment variables
- [ ] Set up database backups
- [ ] Configure user roles and permissions
- [ ] Set up email notifications

### Sub-apps
- [ ] Push changes to all sub-apps
- [ ] Test each sub-app individually
- [ ] Verify data isolation between sub-apps

---

## 📊 Success Metrics

**Technical:**
- Map load time < 2 seconds
- Drawing save/load < 500ms
- Support 1000+ drawings without performance degradation
- 99.9% uptime

**User Experience:**
- 100% feature parity with Next.js app
- Mobile-friendly on all devices
- Intuitive UI matching current design
- No data loss during operations

---

## 🔄 Maintenance Plan

### Regular Tasks
- **Weekly:** Review pending approvals, check error logs
- **Monthly:** Database optimization, performance review
- **Quarterly:** Security audit, feature updates

### Monitoring
- Set up Bubble app monitoring
- Track API usage
- Monitor database size
- User feedback collection

---

## ⚙️ Technical Configuration Summary

### Bubble Plugins Required
1. **Leafy Maps** (ZeroQode) - Free
2. **Toolbox** - For JavaScript execution
3. **BN Native** (optional) - For native map integration

### External Scripts (Page Header)
1. Map capture hook
2. Drawing tools (freehand, line, area, point)
3. GeoJSON helpers
4. Douglas-Peucker simplification
5. Geoman-free (optional) for editing UI

### API Integrations
1. Google Maps API (for location search)
2. OpenStreetMap tiles (via Leaflet)
3. Bubble Data API (for sub-app sync)

---

**Document Version**: 2.0
**Created**: 2025-10-06
**Status**: Ready for Implementation
