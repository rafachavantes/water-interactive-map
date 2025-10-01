'use client';

import dynamic from 'next/dynamic';
import { useState, useCallback, useEffect } from 'react';
import { LayerFilters } from '@/components/LayerFilters';
// ElementDetailsPanel removed - no longer needed without dummy markers
import { DrawingElementDetailsPanel } from '@/components/DrawingElementDetailsPanel';
import { DrawingTools } from '@/components/DrawingTools';
import { FilterState, FilterUpdate, DrawingElement } from '@/types';
import { usePersistentDrawing } from '@/lib/usePersistentDrawing';
import { getDefaultMarkerColor, canRoleAccessPrivacy } from '@/lib/utils';

// Dynamically import the map component to avoid SSR issues with Leaflet
const InteractiveMap = dynamic(() => import('@/components/InteractiveMap').then((mod) => ({ default: mod.InteractiveMap })), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-muted animate-pulse" />
});

type UserRole = 'User' | 'Ditch Rider' | 'Admin';

// Function to filter elements based on user role and privacy settings
function filterElementsByRole(elements: DrawingElement[], role: UserRole): DrawingElement[] {
  return elements.filter(element => {
    // Use the privacy helper function to check access
    return canRoleAccessPrivacy(element.privacy, role);
  });
}

export default function Home() {
  const [activeDrawingTool, setActiveDrawingTool] = useState<string | null>('move');
  const [isEditMode, setIsEditMode] = useState<boolean>(true);
  const [viewAsRole, setViewAsRole] = useState<UserRole>('Admin');
  
  // Use persistent drawing hook for database integration
  const {
    drawingState,
    setCurrentTool,
    deleteElement,
    selectElement,
    updateElement,
    isLoaded,
    createElement,
    cancelDrawing
  } = usePersistentDrawing();

  // Get pending review count for admins - only when needed, no polling
  const updatePendingCount = useCallback(async () => {
    if (viewAsRole !== 'Admin') {
      setPendingReviewCount(0);
      return;
    }
    
    try {
      const response = await fetch('/api/drawings/approval?action=count');
      if (response.ok) {
        const data = await response.json();
        setPendingReviewCount(data.count);
      } else {
        console.error('Failed to fetch pending review count');
        setPendingReviewCount(0);
      }
    } catch (error) {
      console.error('Error getting pending review count:', error);
      setPendingReviewCount(0);
    }
  }, [viewAsRole]);

  // Update pending count only when role changes to Admin or when data loads initially
  useEffect(() => {
    if (viewAsRole === 'Admin' && isLoaded) {
      updatePendingCount();
    } else if (viewAsRole !== 'Admin') {
      setPendingReviewCount(0);
    }
  }, [viewAsRole, isLoaded, updatePendingCount]);

  // Update pending count when drawings are modified (only for admins)
  useEffect(() => {
    if (viewAsRole === 'Admin' && isLoaded) {
      updatePendingCount();
    }
  }, [drawingState.elements.length, viewAsRole, isLoaded, updatePendingCount]);
  const [filterState, setFilterState] = useState<FilterState>({
    searchQuery: '',
    categories: {},
    items: {},
    types: {
      // All types unchecked by default (which means show all)
      // MapElement types
      ride: false,
      canal: false,
      headgate: false,
      meter: false,
      pump: false,
      pivot: false,
      land: false,
      hazard: false,
      maintenance: false,
      custom: false,
      // DrawingElement types
      line: false,
      polygon: false,
      polyline: false,
      point: false
    }
  });
  const [showLayerPanel, setShowLayerPanel] = useState<boolean>(false);
  const [pendingReviewCount, setPendingReviewCount] = useState<number>(0);
  const [centerOnPosition, setCenterOnPosition] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);



  const handleFilterChange = (update: FilterUpdate) => {
    setFilterState(prevState => {
      const newState = { ...prevState };
      
      if (update.searchQuery !== undefined) {
        newState.searchQuery = update.searchQuery;
      }
      
      if (update.showPendingReview !== undefined) {
        newState.showPendingReview = update.showPendingReview;
      }
      
      if (update.type !== undefined && update.checked !== undefined) {
        newState.types = { ...newState.types, [update.type]: update.checked };
        
        // If unchecking a type, also uncheck all items of that type
        if (!update.checked) {
          // This would require knowing which items belong to which type
          // For now, we'll handle this in the filtering logic
        }
      }
      
      if (update.item !== undefined && update.checked !== undefined) {
        newState.items = { ...newState.items, [update.item]: update.checked };
      }
      
      if (update.category !== undefined && update.checked !== undefined) {
        newState.categories = { ...newState.categories, [update.category]: update.checked };
      }
      
      return newState;
    });
  };

  const handleToolSelect = (tool: string | null) => {
    setActiveDrawingTool(tool);
    setCurrentTool(tool);
    console.log('Tool selected:', tool);
  };

  const handleModeToggle = () => {
    setIsEditMode(!isEditMode);
    // When switching to view mode, reset to move tool
    if (isEditMode) {
      setActiveDrawingTool('move');
      setCurrentTool('move');
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setViewAsRole(role);
    console.log('View as role changed to:', role);
  };

  const handleDrawingComplete = useCallback((partialElement: Partial<DrawingElement>) => {
    // Determine approval status based on user role
    const needsApproval = viewAsRole !== 'Admin';
    
    // Create a complete DrawingElement and add it to the persistent state
    const fullElement: DrawingElement = {
      id: `drawing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: partialElement.type || 'point',
      coordinates: partialElement.coordinates || [0, 0],
      markerPosition: partialElement.markerPosition,
      name: partialElement.name || 'Unnamed drawing',
      color: partialElement.color || getDefaultMarkerColor(viewAsRole),
      status: partialElement.status || 'active',
      // Add approval system fields
      approvalStatus: needsApproval ? 'pending' : 'approved',
      createdBy: 'current-user', // In a real app, this would be the actual user ID
      createdByRole: viewAsRole,
      ...(needsApproval ? {} : { 
        reviewedBy: 'current-user',
        reviewedAt: new Date()
      }),
      properties: {
        strokeWeight: partialElement.properties?.strokeWeight || 3,
        tool: partialElement.properties?.tool || 'point',
        ...(partialElement.properties?.fillOpacity != null && { 
          fillOpacity: partialElement.properties.fillOpacity 
        }),
        ...partialElement.properties,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      ...partialElement,
    };

    console.log('Drawing completed:', fullElement);
    
    // Add the element to the persistent state (which will auto-save to database)
    createElement(fullElement);
    
    // Reset tool to "move" (select) after completing a drawing
    setActiveDrawingTool('move');
    setCurrentTool('move');
  }, [createElement, setCurrentTool, viewAsRole]);

  const handleDrawingMarkerSelect = useCallback((element: DrawingElement) => {
    selectElement(element);
    
    // Center map on selected element's marker position when details panel opens
    if (element.markerPosition) {
      setCenterOnPosition({
        lat: element.markerPosition[0],
        lng: element.markerPosition[1]
        // No zoom specified - preserve current zoom level
      });
    }
  }, [selectElement]);

  const handleDrawingElementClose = () => {
    selectElement(null);
    setCenterOnPosition(null); // Clear center position when closing details panel
  };

  const handleDrawingElementSave = (element: DrawingElement) => {
    // Update the drawing element using the persistent hook
    updateElement(element.id, element);
    console.log('Drawing element saved:', element);
  };

  const handleDrawingElementDelete = (elementId: string) => {
    deleteElement(elementId);
    selectElement(null);
    console.log('Drawing element deleted:', elementId);
  };

  const handleApproveElement = async (elementId: string, reviewNotes?: string) => {
    try {
      const response = await fetch('/api/drawings/approval', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          elementId,
          action: 'approve',
          reviewedBy: 'current-admin',
          reviewNotes,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.element) {
          updateElement(elementId, data.element);
        }
        // Refresh pending count after approval
        if (viewAsRole === 'Admin') {
          updatePendingCount();
        }
        console.log('Element approved:', elementId);
      } else {
        const error = await response.json();
        console.error('Failed to approve element:', error.error);
      }
    } catch (error) {
      console.error('Error approving element:', error);
    }
  };

  const handleRejectElement = async (elementId: string, reviewNotes?: string) => {
    try {
      const response = await fetch('/api/drawings/approval', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          elementId,
          action: 'reject',
          reviewedBy: 'current-admin',
          reviewNotes,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.element) {
          updateElement(elementId, data.element);
        }
        // Refresh pending count after rejection
        if (viewAsRole === 'Admin') {
          updatePendingCount();
        }
        console.log('Element rejected:', elementId);
      } else {
        const error = await response.json();
        console.error('Failed to reject element:', error.error);
      }
    } catch (error) {
      console.error('Error rejecting element:', error);
    }
  };

  // Drawing state change handler no longer needed

  const handleToggleLayerPanel = () => {
    setShowLayerPanel(!showLayerPanel);
  };

  const handleCloseLayerPanel = () => {
    setShowLayerPanel(false);
  };

  // Filter drawing elements based on role when in view mode and pending review filter
  const filteredDrawingElements = (() => {
    let elements = isEditMode 
      ? drawingState.elements // In edit mode, show all elements
      : filterElementsByRole(drawingState.elements, viewAsRole); // In view mode, filter by role
    
    // Apply pending review filter if active
    if (filterState.showPendingReview) {
      elements = elements.filter(element => element.approvalStatus === 'pending');
    }
    
    return elements;
  })();

  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      <div className="flex h-full">
        {/* Left Sidebar - Layer Filters */}
        {showLayerPanel && (
          <LayerFilters 
            onFilterChange={handleFilterChange} 
            onClose={handleCloseLayerPanel}
            filterState={filterState}
            drawingElements={filteredDrawingElements}
            userRole={viewAsRole}
            pendingReviewCount={pendingReviewCount}
          />
        )}
        
        {/* Main Map Area */}
        <div className={`flex-1 relative mobile-map-container ${drawingState.selectedElement ? 'details-panel-open' : ''}`}>
          <InteractiveMap
            activeDrawingTool={isEditMode ? activeDrawingTool : 'move'}
            onToggleLayerPanel={handleToggleLayerPanel}
            showLayerPanel={showLayerPanel}
            filterState={filterState}
            drawingElements={filteredDrawingElements}
            selectedDrawingElement={drawingState.selectedElement}
            onDrawingComplete={handleDrawingComplete}
            onDrawingCancel={cancelDrawing}
            onDrawingMarkerSelect={handleDrawingMarkerSelect}
            onDrawingElementDelete={handleDrawingElementDelete}
            pendingReviewCount={pendingReviewCount}
            userRole={viewAsRole}
            centerOnPosition={centerOnPosition}
          />
          
          {/* Drawing Tools - Bottom Center */}
          <DrawingTools
            onToolSelect={handleToolSelect}
            activeTool={activeDrawingTool}
            onDrawingCancel={cancelDrawing}
            isEditMode={isEditMode}
            onModeToggle={handleModeToggle}
            viewAsRole={viewAsRole}
            onRoleChange={handleRoleChange}
          />
        </div>
      </div>
      
      {/* ElementDetailsPanel removed - no longer needed without dummy markers */}

      {/* Drawing Element Details Panel - Responsive positioning */}
      {drawingState.selectedElement && (
        <DrawingElementDetailsPanel
          element={drawingState.selectedElement}
          onClose={handleDrawingElementClose}
          onSave={handleDrawingElementSave}
          onDelete={handleDrawingElementDelete}
          userRole={viewAsRole}
          onApprove={handleApproveElement}
          onReject={handleRejectElement}
          isViewMode={!isEditMode}
        />
      )}

      {/* Loading indicator while database loads */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Loading drawings...</span>
          </div>
        </div>
      )}
    </div>
  );
}
