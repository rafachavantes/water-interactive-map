import { NextRequest, NextResponse } from 'next/server';
import { drawingDb, initDatabase } from '@/lib/database-supabase';
import { MapElement } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    
    // Validate the type parameter
    const validTypes = ['canal', 'ride', 'headgate', 'meter', 'pump', 'pivot', 'land'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid entity type' },
        { status: 400 }
      );
    }

    await initDatabase(); // Initialize database on first access
    const entities = await drawingDb.getEntitiesByType(type as MapElement['type']);
    
    return NextResponse.json(entities);
  } catch (error) {
    console.error('Error fetching entities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entities' },
      { status: 500 }
    );
  }
}
