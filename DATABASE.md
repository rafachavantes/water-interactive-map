# Database Integration for Water Interactive Map

This document describes the database system implemented for persistent storage
of drawing elements.

## Overview

The application now includes a simple SQLite database system that automatically
saves and loads drawing elements, ensuring that all drawings persist between app
sessions.

## Implementation Details

### Database Setup

- **Database**: SQLite using `better-sqlite3`
- **Location**: `data/drawings.db` (created automatically)
- **Schema**: Single table `drawings` with all drawing element properties

### Key Components

1. **Database Layer** (`src/lib/database.ts`)
   - `DrawingDatabase` class for all database operations
   - Automatic schema creation and migration
   - CRUD operations for drawing elements
   - JSON serialization for coordinates and complex data

2. **Persistent Drawing Hook** (`src/lib/usePersistentDrawing.ts`)
   - Replaces the original `useDrawing` hook
   - Automatic loading of drawings on app startup
   - Real-time saving to database when drawings are created, updated, or deleted
   - All original drawing functionality maintained

3. **Main App Integration** (`src/app/page.tsx`)
   - Uses `usePersistentDrawing` instead of manual state management
   - Loading indicator while database initializes
   - Seamless integration with existing UI components

### Database Schema

```sql
CREATE TABLE drawings (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  coordinates TEXT NOT NULL,
  marker_position TEXT,
  element_type TEXT,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  farm TEXT,
  description TEXT,
  status TEXT,
  last_updated TEXT,
  category TEXT,
  privacy TEXT,
  stroke_weight INTEGER NOT NULL,
  fill_opacity REAL,
  tool TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### Features

- **Auto-save**: All drawing operations are automatically saved to the database
- **Auto-load**: Drawings are loaded when the app starts
- **Real-time updates**: Changes are immediately persisted
- **Error handling**: Graceful handling of database errors with console logging
- **Performance**: Indexed columns for fast queries
- **Atomic operations**: Uses transactions for bulk operations

### Usage

The database system is completely transparent to the user. Simply:

1. Draw elements using the drawing tools
2. Elements are automatically saved to the database
3. When you restart the app, all drawings are loaded automatically
4. Edit or delete drawings - changes are immediately saved

### Manual Database Operations

The `usePersistentDrawing` hook also exposes manual save/load functions for
debugging:

```javascript
const { saveAllDrawings, loadAllDrawings } = usePersistentDrawing();

// Manual save (not normally needed)
saveAllDrawings();

// Manual reload from database
loadAllDrawings();
```

### Database File

The SQLite database file is created at `data/drawings.db` in the project root.
This file contains all persistent drawing data and can be backed up or
transferred as needed.

## Technical Notes

- The database automatically handles JSON serialization for coordinates and
  marker positions
- All date fields are stored as ISO strings and automatically converted to Date
  objects
- The system gracefully handles missing or corrupted database files by creating
  new ones
- Database operations are synchronous for simplicity but could be made async if
  needed
- Foreign key constraints are enabled for data integrity

## Future Enhancements

Potential improvements could include:

- User authentication and multi-user support
- Cloud database synchronization
- Export/import functionality
- Database versioning and migrations
- Backup and restore features
