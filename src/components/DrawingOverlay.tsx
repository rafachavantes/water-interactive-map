'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { DrawingElement } from '@/types';
import { calculateCenterPoint, getDefaultMarkerColor } from '@/lib/utils';

// Drawing state interface
interface DrawingState {
  isDrawing: boolean;
  currentPath: [number, number][];
  drawingMode: string | null;
}

// Extend window interface for drawing state management
declare global {
  interface Window {
    currentDrawingState?: DrawingState;
    drawingOverlayDoneHandler?: () => void;
    drawingOverlayCancelHandler?: () => void;
  }
}

interface DrawingOverlayProps {
  activeTool: string | null;
  onDrawingComplete: (element: Partial<DrawingElement>) => void;
  onDrawingCancel: () => void;
  userRole: 'User' | 'Ditch Rider' | 'Admin';
}

export function DrawingOverlay({ activeTool, onDrawingComplete, onDrawingCancel, userRole }: DrawingOverlayProps) {
  const map = useMap();
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<[number, number][]>([]);
  const tempLayerRef = useRef<L.Layer | null>(null);
  const drawingModeRef = useRef<string | null>(null);
  const isDrawingRef = useRef(false);
  const drawingPathRef = useRef<[number, number][]>([]);

  // Keep refs in sync with state
  useEffect(() => {
    isDrawingRef.current = isDrawing;
  }, [isDrawing]);

  useEffect(() => {
    drawingPathRef.current = currentPath;
  }, [currentPath]);

  // Dispatch events when drawing state changes (much better than polling!)
  useEffect(() => {
    const state = {
      isDrawing,
      currentPath,
      drawingMode: drawingModeRef.current
    };
    
    // Update global state for reference
    window.currentDrawingState = state;
    
    // Dispatch event for immediate updates
    const event = new CustomEvent('drawingStateChanged', { detail: state });
    window.dispatchEvent(event);
  }, [isDrawing, currentPath]);

  // Clear temporary drawing layer
  const clearTempLayer = useCallback(() => {
    if (tempLayerRef.current) {
      map.removeLayer(tempLayerRef.current);
      tempLayerRef.current = null;
    }
  }, [map]);

  // Create temporary visual feedback during drawing
  const updateTempLayer = useCallback((path: [number, number][], tool: string) => {
    clearTempLayer();

    if (path.length === 0) return;

    const color = '#3B82F6';
    const weight = 3;

    switch (tool) {
      case 'point':
        if (path.length > 0) {
          tempLayerRef.current = L.marker(path[0], {
            icon: L.divIcon({
              className: 'drawing-point-preview',
              html: `<div style="width: 12px; height: 12px; background: ${color}; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>`,
              iconSize: [12, 12],
              iconAnchor: [6, 6]
            })
          });
        }
        break;

      case 'line':
        if (path.length >= 2) {
          tempLayerRef.current = L.polyline(path, {
            color,
            weight,
            opacity: 0.8,
            dashArray: '5, 5'
          });
        } else if (path.length === 1) {
          // Show starting point
          tempLayerRef.current = L.marker(path[0], {
            icon: L.divIcon({
              className: 'drawing-start-point',
              html: `<div style="width: 8px; height: 8px; background: ${color}; border: 1px solid white; border-radius: 50%;"></div>`,
              iconSize: [8, 8],
              iconAnchor: [4, 4]
            })
          });
        }
        break;

      case 'draw':
        if (path.length >= 2) {
          tempLayerRef.current = L.polyline(path, {
            color,
            weight,
            opacity: 0.8,
            dashArray: '3, 3'
          });
        }
        break;

      case 'area':
        if (path.length >= 3) {
          // Show polygon preview
          tempLayerRef.current = L.polygon(path, {
            color,
            weight,
            opacity: 0.8,
            fillOpacity: 0.2,
            dashArray: '5, 5'
          });
        } else if (path.length >= 2) {
          // Show line until we have enough points for polygon
          tempLayerRef.current = L.polyline(path, {
            color,
            weight,
            opacity: 0.8,
            dashArray: '5, 5'
          });
        } else if (path.length === 1) {
          // Show starting point
          tempLayerRef.current = L.marker(path[0], {
            icon: L.divIcon({
              className: 'drawing-start-point',
              html: `<div style="width: 8px; height: 8px; background: ${color}; border: 1px solid white; border-radius: 50%;"></div>`,
              iconSize: [8, 8],
              iconAnchor: [4, 4]
            })
          });
        }
        break;
    }

    if (tempLayerRef.current) {
      tempLayerRef.current.addTo(map);
    }
  }, [map, clearTempLayer]);

  // Handle map events for drawing
  useMapEvents({
    click: (e) => {
      if (!activeTool || activeTool === 'move') return;

      const latlng: [number, number] = [e.latlng.lat, e.latlng.lng];

      switch (activeTool) {
        case 'point':
          // Point tool - single click creates point
          onDrawingComplete({
            type: 'point',
            coordinates: latlng,
            markerPosition: latlng, // Point marker is at the same position
            name: `Point ${new Date().toLocaleTimeString()}`,
            color: getDefaultMarkerColor(userRole),
            status: 'active',
            properties: {
              tool: 'point',
              strokeWeight: 3,
            }
          });
          break;

        case 'line':
          if (!isDrawing) {
            // Start line drawing
            setIsDrawing(true);
            setCurrentPath([latlng]);
            drawingModeRef.current = 'line';
          } else {
            // Add point to line
            const newPath = [...currentPath, latlng];
            setCurrentPath(newPath);
            updateTempLayer(newPath, 'line');
          }
          break;

        case 'area':
          if (!isDrawing) {
            // Start area drawing
            setIsDrawing(true);
            setCurrentPath([latlng]);
            drawingModeRef.current = 'area';
          } else {
            // Add point to area
            const newPath = [...currentPath, latlng];
            setCurrentPath(newPath);
            updateTempLayer(newPath, 'area');
          }
          break;

        case 'draw':
          // Freehand drawing starts on mousedown, not click
          break;
      }
    },

    dblclick: (e) => {
      e.originalEvent.preventDefault();
      
      if (!isDrawing || !drawingModeRef.current) return;

      // Finish drawing on double-click for line and area tools
      if (drawingModeRef.current === 'line' && currentPath.length >= 2) {
        const element = {
          type: 'line' as const,
          coordinates: currentPath,
          name: `Line ${new Date().toLocaleTimeString()}`,
          color: getDefaultMarkerColor(userRole),
          status: 'active' as const,
          properties: {
            tool: 'line' as const,
            strokeWeight: 3,
          }
        };
        const tempElement = { ...element, id: 'temp', createdAt: new Date(), updatedAt: new Date() } as DrawingElement;
        const markerPosition = calculateCenterPoint(tempElement);
        
        onDrawingComplete({
          ...element,
          markerPosition,
        });
      } else if (drawingModeRef.current === 'area' && currentPath.length >= 3) {
        const element = {
          type: 'polygon' as const,
          coordinates: currentPath,
          name: `Area ${new Date().toLocaleTimeString()}`,
          color: getDefaultMarkerColor(userRole),
          status: 'active' as const,
          properties: {
            tool: 'area' as const,
            strokeWeight: 3,
            fillOpacity: 0.3,
          }
        };
        const tempElement = { ...element, id: 'temp', createdAt: new Date(), updatedAt: new Date() } as DrawingElement;
        const markerPosition = calculateCenterPoint(tempElement);
        
        onDrawingComplete({
          ...element,
          markerPosition,
        });
      }

      // Reset drawing state
      setIsDrawing(false);
      setCurrentPath([]);
      drawingModeRef.current = null;
      clearTempLayer();
    },

    mousedown: (e) => {
      if (activeTool === 'draw' && !isDrawing) {
        // Start freehand drawing
        setIsDrawing(true);
        const latlng: [number, number] = [e.latlng.lat, e.latlng.lng];
        setCurrentPath([latlng]);
        drawingModeRef.current = 'draw';
        
        // Prevent map dragging during drawing
        map.dragging.disable();
      }
    },

    mousemove: (e) => {
      if (activeTool === 'draw' && isDrawing && drawingModeRef.current === 'draw') {
        // Add points during freehand drawing
        const latlng: [number, number] = [e.latlng.lat, e.latlng.lng];
        const newPath = [...currentPath, latlng];
        setCurrentPath(newPath);
        updateTempLayer(newPath, 'draw');
      }
    },

    mouseup: () => {
      if (activeTool === 'draw' && isDrawing && drawingModeRef.current === 'draw') {
        // Finish freehand drawing
        if (currentPath.length >= 2) {
          const element = {
            type: 'polyline' as const,
            coordinates: currentPath,
            name: `Drawing ${new Date().toLocaleTimeString()}`,
            color: getDefaultMarkerColor(userRole),
            status: 'active' as const,
            properties: {
              tool: 'draw' as const,
              strokeWeight: 3,
            }
          };
          const tempElement = { ...element, id: 'temp', createdAt: new Date(), updatedAt: new Date() } as DrawingElement;
          const markerPosition = calculateCenterPoint(tempElement);
          
          onDrawingComplete({
            ...element,
            markerPosition,
          });
        }

        // Reset drawing state
        setIsDrawing(false);
        setCurrentPath([]);
        drawingModeRef.current = null;
        clearTempLayer();
        
        // Re-enable map dragging
        map.dragging.enable();
      }
    },

    keydown: (e) => {
      // ESC key cancels current drawing
      if (e.originalEvent.key === 'Escape' && isDrawing) {
        setIsDrawing(false);
        setCurrentPath([]);
        drawingModeRef.current = null;
        clearTempLayer();
        map.dragging.enable();
        onDrawingCancel();
      }
    }
  });

  // Update temp layer when path changes
  useEffect(() => {
    if (isDrawing && activeTool && currentPath.length > 0) {
      updateTempLayer(currentPath, activeTool);
    }
  }, [currentPath, activeTool, isDrawing, updateTempLayer]);

  // Handle tool changes and auto-complete drawings
  useEffect(() => {
    const mapContainer = map.getContainer();
    
    // Remove all mode classes first
    mapContainer.classList.remove('drawing-mode', 'move-mode');
    
    if (!activeTool || activeTool === 'move') {
      // Before clearing, check if there's an incomplete drawing to save
      const currentDrawingMode = drawingModeRef.current;
      const currentIsDrawing = isDrawingRef.current;
      const currentDrawingPath = drawingPathRef.current;
      
      if (currentIsDrawing && currentDrawingPath.length > 0 && currentDrawingMode) {
        // Auto-complete the drawing when switching tools
        if (currentDrawingMode === 'line' && currentDrawingPath.length >= 2) {
          const element = {
            type: 'line' as const,
            coordinates: currentDrawingPath,
            name: `Line ${new Date().toLocaleTimeString()}`,
            color: getDefaultMarkerColor(userRole),
            status: 'active' as const,
            properties: {
              tool: 'line' as const,
              strokeWeight: 3,
            }
          };
          const tempElement = { ...element, id: 'temp', createdAt: new Date(), updatedAt: new Date() } as DrawingElement;
          const markerPosition = calculateCenterPoint(tempElement);
          
          onDrawingComplete({
            ...element,
            markerPosition,
          });
        } else if (currentDrawingMode === 'area' && currentDrawingPath.length >= 3) {
          const element = {
            type: 'polygon' as const,
            coordinates: currentDrawingPath,
            name: `Area ${new Date().toLocaleTimeString()}`,
            color: getDefaultMarkerColor(userRole),
            status: 'active' as const,
            properties: {
              tool: 'area' as const,
              strokeWeight: 3,
              fillOpacity: 0.3,
            }
          };
          const tempElement = { ...element, id: 'temp', createdAt: new Date(), updatedAt: new Date() } as DrawingElement;
          const markerPosition = calculateCenterPoint(tempElement);
          
          onDrawingComplete({
            ...element,
            markerPosition,
          });
        }
      }
      
      // Enable map dragging for move tool or no tool
      setIsDrawing(false);
      setCurrentPath([]);
      drawingModeRef.current = null;
      isDrawingRef.current = false;
      drawingPathRef.current = [];
      clearTempLayer();
      map.dragging.enable();
      map.touchZoom.enable();
      map.doubleClickZoom.enable();
      map.scrollWheelZoom.enable();
      map.boxZoom.enable();
      map.keyboard.enable();
      
      if (activeTool === 'move') {
        mapContainer.classList.add('move-mode');
      }
    } else {
      // When switching between drawing tools, also auto-complete if there's an incomplete drawing
      const currentDrawingMode = drawingModeRef.current;
      const currentIsDrawing = isDrawingRef.current;
      const currentDrawingPath = drawingPathRef.current;
      
      if (currentIsDrawing && currentDrawingPath.length > 0 && currentDrawingMode) {
        if (currentDrawingMode === 'line' && currentDrawingPath.length >= 2) {
          const element = {
            type: 'line' as const,
            coordinates: currentDrawingPath,
            name: `Line ${new Date().toLocaleTimeString()}`,
            color: getDefaultMarkerColor(userRole),
            status: 'active' as const,
            properties: {
              tool: 'line' as const,
              strokeWeight: 3,
            }
          };
          const tempElement = { ...element, id: 'temp', createdAt: new Date(), updatedAt: new Date() } as DrawingElement;
          const markerPosition = calculateCenterPoint(tempElement);
          
          onDrawingComplete({
            ...element,
            markerPosition,
          });
        } else if (currentDrawingMode === 'area' && currentDrawingPath.length >= 3) {
          const element = {
            type: 'polygon' as const,
            coordinates: currentDrawingPath,
            name: `Area ${new Date().toLocaleTimeString()}`,
            color: getDefaultMarkerColor(userRole),
            status: 'active' as const,
            properties: {
              tool: 'area' as const,
              strokeWeight: 3,
              fillOpacity: 0.3,
            }
          };
          const tempElement = { ...element, id: 'temp', createdAt: new Date(), updatedAt: new Date() } as DrawingElement;
          const markerPosition = calculateCenterPoint(tempElement);
          
          onDrawingComplete({
            ...element,
            markerPosition,
          });
        }
        
        // Reset for new tool
        setIsDrawing(false);
        setCurrentPath([]);
        drawingModeRef.current = null;
        isDrawingRef.current = false;
        drawingPathRef.current = [];
        clearTempLayer();
      }
      
      // Disable map interactions for drawing tools
      map.dragging.disable();
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      map.scrollWheelZoom.disable();
      map.boxZoom.disable();
      map.keyboard.disable();
      mapContainer.classList.add('drawing-mode');
    }
  }, [activeTool, map, onDrawingComplete, clearTempLayer, userRole]);

  // Cleanup on unmount
  useEffect(() => {
    const mapContainer = map.getContainer();
    return () => {
      clearTempLayer();
      // Re-enable all map interactions on cleanup
      map.dragging.enable();
      map.touchZoom.enable();
      map.doubleClickZoom.enable();
      map.scrollWheelZoom.enable();
      map.boxZoom.enable();
      map.keyboard.enable();
      mapContainer.classList.remove('drawing-mode', 'move-mode');
    };
  }, [map, clearTempLayer]);

  // Handle done button click - expose this function globally so DrawingTools can call it
  const handleDoneClick = useCallback(() => {
    if (!isDrawing || !drawingModeRef.current || !['line', 'draw', 'area'].includes(drawingModeRef.current)) {
      return;
    }

    if (drawingModeRef.current === 'line' && currentPath.length >= 2) {
      const element = {
        type: 'line' as const,
        coordinates: currentPath,
        name: 'unnamed line',
        color: getDefaultMarkerColor(userRole),
        status: 'active' as const,
        properties: {
          tool: 'line' as const,
          strokeWeight: 3,
        }
      };
      const tempElement = { ...element, id: 'temp', createdAt: new Date(), updatedAt: new Date() } as DrawingElement;
      const markerPosition = calculateCenterPoint(tempElement);
      
      onDrawingComplete({
        ...element,
        markerPosition,
      });
    } else if (drawingModeRef.current === 'draw' && currentPath.length >= 2) {
      const element = {
        type: 'polyline' as const,
        coordinates: currentPath,
        name: 'unnamed line',
        color: getDefaultMarkerColor(userRole),
        status: 'active' as const,
        properties: {
          tool: 'draw' as const,
          strokeWeight: 3,
        }
      };
      const tempElement = { ...element, id: 'temp', createdAt: new Date(), updatedAt: new Date() } as DrawingElement;
      const markerPosition = calculateCenterPoint(tempElement);
      
      onDrawingComplete({
        ...element,
        markerPosition,
      });
    } else if (drawingModeRef.current === 'area' && currentPath.length >= 3) {
      const element = {
        type: 'polygon' as const,
        coordinates: currentPath,
        name: 'unnamed area',
        color: getDefaultMarkerColor(userRole),
        status: 'active' as const,
        properties: {
          tool: 'area' as const,
          strokeWeight: 3,
          fillOpacity: 0.3,
        }
      };
      const tempElement = { ...element, id: 'temp', createdAt: new Date(), updatedAt: new Date() } as DrawingElement;
      const markerPosition = calculateCenterPoint(tempElement);
      
      onDrawingComplete({
        ...element,
        markerPosition,
      });
    }

    // Reset drawing state
    setIsDrawing(false);
    setCurrentPath([]);
    drawingModeRef.current = null;
    clearTempLayer();
  }, [isDrawing, currentPath, onDrawingComplete, clearTempLayer, userRole]);

  // Handle cancel button click - expose this function globally so DrawingTools can call it
  const handleCancelClick = useCallback(() => {
    if (!isDrawing || !drawingModeRef.current) {
      return;
    }

    // Reset drawing state without saving
    setIsDrawing(false);
    setCurrentPath([]);
    drawingModeRef.current = null;
    clearTempLayer();
    
    // Call the cancel handler from props
    onDrawingCancel();
  }, [isDrawing, onDrawingCancel, clearTempLayer]);

  // Expose the done handler globally so DrawingTools can access it
  useEffect(() => {
    window.drawingOverlayDoneHandler = handleDoneClick;
    return () => {
      delete window.drawingOverlayDoneHandler;
    };
  }, [handleDoneClick]);

  // Expose the cancel handler globally so DrawingTools can access it
  useEffect(() => {
    window.drawingOverlayCancelHandler = handleCancelClick;
    return () => {
      delete window.drawingOverlayCancelHandler;
    };
  }, [handleCancelClick]);

  return null;
}