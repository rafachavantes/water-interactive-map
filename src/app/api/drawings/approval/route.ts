import { NextRequest, NextResponse } from 'next/server';
import { drawingDb, initDatabase } from '@/lib/database-supabase';

// GET - Get pending review count and pending items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    await initDatabase(); // Initialize database on first access
    
    if (action === 'count') {
      const count = await drawingDb.getPendingReviewCount();
      return NextResponse.json({ count });
    } else if (action === 'pending') {
      const pendingDrawings = await drawingDb.getDrawingsForReview();
      return NextResponse.json({ drawings: pendingDrawings });
    } else {
      const count = await drawingDb.getPendingReviewCount();
      const pendingDrawings = await drawingDb.getDrawingsForReview();
      return NextResponse.json({ 
        count, 
        drawings: pendingDrawings 
      });
    }
  } catch (error) {
    console.error('Failed to get approval data:', error);
    return NextResponse.json(
      { error: 'Failed to get approval data', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST - Approve or reject a drawing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { elementId, action, reviewedBy, reviewNotes } = body;
    
    if (!elementId || !action || !reviewedBy) {
      return NextResponse.json(
        { error: 'Missing required fields: elementId, action, reviewedBy' },
        { status: 400 }
      );
    }
    
    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }
    
    const status = action === 'approve' ? 'approved' : 'rejected';
    await initDatabase(); // Initialize database on first access
    const success = await drawingDb.updateApprovalStatus(elementId, status, reviewedBy, reviewNotes);
    
    if (success) {
      const updatedElement = await drawingDb.loadDrawing(elementId);
      return NextResponse.json({ 
        message: `Drawing ${action}d successfully`,
        element: updatedElement 
      });
    } else {
      return NextResponse.json(
        { error: `Failed to ${action} drawing` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Failed to update approval status:', error);
    return NextResponse.json(
      { error: 'Failed to update approval status', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
