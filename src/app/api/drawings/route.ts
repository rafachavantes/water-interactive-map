import { NextRequest, NextResponse } from 'next/server';
import { drawingDb, initDatabase } from '@/lib/database-supabase';
import { DrawingElement } from '@/types';

// Helper function to ensure dates are Date objects
function normalizeDates(element: Partial<DrawingElement> & { createdAt: string | Date; updatedAt: string | Date }): DrawingElement {
  try {
    // Ensure required fields exist
    if (!element.id || !element.name || !element.type || !element.coordinates) {
      throw new Error(`Missing required fields: id=${!!element.id}, name=${!!element.name}, type=${!!element.type}, coordinates=${!!element.coordinates}`);
    }

    // Normalize dates with error handling
    let createdAt: Date;
    let updatedAt: Date;
    let lastUpdated: Date | undefined;

    try {
      createdAt = element.createdAt instanceof Date ? element.createdAt : new Date(element.createdAt);
      if (isNaN(createdAt.getTime())) {
        throw new Error('Invalid createdAt date');
      }
    } catch {
      console.warn('Invalid createdAt, using current date:', element.createdAt);
      createdAt = new Date();
    }

    try {
      updatedAt = element.updatedAt instanceof Date ? element.updatedAt : new Date(element.updatedAt);
      if (isNaN(updatedAt.getTime())) {
        throw new Error('Invalid updatedAt date');
      }
    } catch {
      console.warn('Invalid updatedAt, using current date:', element.updatedAt);
      updatedAt = new Date();
    }

    if (element.lastUpdated) {
      try {
        lastUpdated = element.lastUpdated instanceof Date ? element.lastUpdated : new Date(element.lastUpdated);
        if (isNaN(lastUpdated.getTime())) {
          lastUpdated = undefined;
        }
      } catch {
        console.warn('Invalid lastUpdated, ignoring:', element.lastUpdated);
        lastUpdated = undefined;
      }
    }

    let reviewedAt: Date | undefined;
    if (element.reviewedAt) {
      try {
        reviewedAt = element.reviewedAt instanceof Date ? element.reviewedAt : new Date(element.reviewedAt as string);
        if (isNaN(reviewedAt.getTime())) {
          reviewedAt = undefined;
        }
      } catch {
        console.warn('Invalid reviewedAt, ignoring:', element.reviewedAt);
        reviewedAt = undefined;
      }
    }

    // Ensure all optional array/object fields are properly structured
    const normalizedElement = {
      ...element,
      createdAt,
      updatedAt,
      lastUpdated,
      reviewedAt,
      // Ensure properties object exists
      properties: element.properties || { strokeWeight: 3, tool: 'point' },
      // Clean up problematic fields that might cause serialization issues
      files: Array.isArray(element.files) ? element.files.filter(file => {
        // Filter out files with blob URLs or invalid data
        if (file.url && file.url.startsWith('blob:')) {
          console.warn(`Skipping file with blob URL: ${file.name}`);
          return false;
        }
        return file.id && file.name && file.type;
      }) : undefined,
    } as DrawingElement;

    // Remove undefined fields to avoid serialization issues
    Object.keys(normalizedElement).forEach(key => {
      if (normalizedElement[key as keyof DrawingElement] === undefined) {
        delete normalizedElement[key as keyof DrawingElement];
      }
    });

    return normalizedElement;
  } catch (error) {
    console.error('Error normalizing element:', error, 'Element:', element);
    throw error;
  }
}

// GET - Load all drawings
export async function GET() {
  try {
    console.log('Loading all drawings...');
    await initDatabase(); // Initialize database on first access
    const drawings = await drawingDb.loadAllDrawings();
    console.log(`Successfully loaded ${drawings.length} drawings`);
    return NextResponse.json({ drawings });
  } catch (error) {
    console.error('Failed to load drawings:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to load drawings', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST - Save multiple drawings or create a new drawing
export async function POST(request: NextRequest) {
  try {
    console.log('Saving drawings...');
    await initDatabase(); // Initialize database on first access
    const body = await request.json();
    console.log('Request body type:', typeof body, 'keys:', Object.keys(body || {}));
    
    if (body.drawings && Array.isArray(body.drawings)) {
      // Save multiple drawings
      console.log(`Saving ${body.drawings.length} drawings`);
      console.log('First drawing sample:', body.drawings[0] ? JSON.stringify(body.drawings[0], null, 2) : 'none');
      
      const normalizedDrawings = body.drawings.map((drawing: Partial<DrawingElement> & { createdAt: string | Date; updatedAt: string | Date }, index: number) => {
        try {
          console.log(`Normalizing drawing ${index}:`, drawing.id || 'no-id');
          return normalizeDates(drawing);
        } catch (error) {
          console.error(`Error normalizing drawing ${index}:`, error);
          throw error;
        }
      });
      
      console.log('About to save drawings to database...');
      await drawingDb.saveDrawings(normalizedDrawings);
      console.log('Multiple drawings saved successfully');
      return NextResponse.json({ message: 'Drawings saved successfully' });
    } else if (body.drawing) {
      // Save single drawing
      console.log('Saving single drawing:', body.drawing.id);
      const normalizedDrawing = normalizeDates(body.drawing);
      await drawingDb.saveDrawing(normalizedDrawing);
      console.log('Single drawing saved successfully');
      return NextResponse.json({ message: 'Drawing saved successfully' });
    } else {
      console.log('Invalid request body - missing drawings or drawing');
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Failed to save drawings:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to save drawings', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// DELETE - Clear all drawings
export async function DELETE() {
  try {
    await initDatabase(); // Initialize database on first access
    await drawingDb.clearAllDrawings();
    return NextResponse.json({ message: 'All drawings cleared successfully' });
  } catch (error) {
    console.error('Failed to clear drawings:', error);
    return NextResponse.json(
      { error: 'Failed to clear drawings' },
      { status: 500 }
    );
  }
}
