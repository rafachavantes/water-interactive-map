import { NextRequest, NextResponse } from 'next/server';
import { drawingDb, initDatabase } from '@/lib/database-supabase';
import { DrawingElement } from '@/types';

// Helper function to ensure dates are Date objects
function normalizeDates(updates: Partial<DrawingElement> & Record<string, unknown>): Partial<DrawingElement> {
  const normalized: Partial<DrawingElement> = { ...updates };
  
  // Normalize date fields with error handling
  if (updates.createdAt) {
    try {
      normalized.createdAt = updates.createdAt instanceof Date ? updates.createdAt : new Date(updates.createdAt as string);
    } catch {
      console.warn('Invalid createdAt in update, ignoring:', updates.createdAt);
      delete normalized.createdAt;
    }
  }
  
  if (updates.updatedAt) {
    try {
      normalized.updatedAt = updates.updatedAt instanceof Date ? updates.updatedAt : new Date(updates.updatedAt as string);
    } catch {
      console.warn('Invalid updatedAt in update, ignoring:', updates.updatedAt);
      delete normalized.updatedAt;
    }
  }
  
  if (updates.lastUpdated) {
    try {
      normalized.lastUpdated = updates.lastUpdated instanceof Date ? updates.lastUpdated : new Date(updates.lastUpdated as string);
    } catch {
      console.warn('Invalid lastUpdated in update, ignoring:', updates.lastUpdated);
      delete normalized.lastUpdated;
    }
  }
  
  if (updates.reviewedAt) {
    try {
      normalized.reviewedAt = updates.reviewedAt instanceof Date ? updates.reviewedAt : new Date(updates.reviewedAt as string);
    } catch {
      console.warn('Invalid reviewedAt in update, ignoring:', updates.reviewedAt);
      delete normalized.reviewedAt;
    }
  }
  
  return normalized;
}

// GET - Load a specific drawing by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await initDatabase(); // Initialize database on first access
    const drawing = await drawingDb.loadDrawing(id);
    if (!drawing) {
      return NextResponse.json(
        { error: 'Drawing not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ drawing });
  } catch (error) {
    console.error('Failed to load drawing:', error);
    return NextResponse.json(
      { error: 'Failed to load drawing' },
      { status: 500 }
    );
  }
}

// PUT - Update a specific drawing
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await request.json();
    const normalizedUpdates = normalizeDates(updates);
    await initDatabase(); // Initialize database on first access
    const success = await drawingDb.updateDrawing(id, normalizedUpdates);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Drawing not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Drawing updated successfully' });
  } catch (error) {
    console.error('Failed to update drawing:', error);
    return NextResponse.json(
      { error: 'Failed to update drawing' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a specific drawing
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await initDatabase(); // Initialize database on first access
    const success = await drawingDb.deleteDrawing(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Drawing not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Drawing deleted successfully' });
  } catch (error) {
    console.error('Failed to delete drawing:', error);
    return NextResponse.json(
      { error: 'Failed to delete drawing' },
      { status: 500 }
    );
  }
}
