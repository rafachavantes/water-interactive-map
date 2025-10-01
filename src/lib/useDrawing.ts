import { useState, useCallback, useRef } from 'react';
import { DrawingElement, DrawingState } from '@/types';

export function useDrawing() {
  const [drawingState, setDrawingState] = useState<DrawingState>({
    isDrawing: false,
    currentTool: null,
    elements: [],
    selectedElement: null,
  });

  const drawingPathRef = useRef<[number, number][]>([]);
  const isDrawingRef = useRef(false);

  const generateId = () => {
    return `drawing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const setCurrentTool = useCallback((tool: string | null) => {
    setDrawingState(prev => ({
      ...prev,
      currentTool: tool,
      isDrawing: false,
    }));
    drawingPathRef.current = [];
    isDrawingRef.current = false;
  }, []);

  const startDrawing = useCallback((latlng: [number, number]) => {
    if (!drawingState.currentTool) return;

    isDrawingRef.current = true;
    drawingPathRef.current = [latlng];
    
    setDrawingState(prev => ({
      ...prev,
      isDrawing: true,
    }));
  }, [drawingState.currentTool]);

  const addPoint = useCallback((latlng: [number, number]) => {
    if (!isDrawingRef.current || !drawingState.currentTool) return;

    drawingPathRef.current.push(latlng);
  }, [drawingState.currentTool]);

  const finishDrawing = useCallback(() => {
    if (!isDrawingRef.current || !drawingState.currentTool || drawingPathRef.current.length === 0) {
      isDrawingRef.current = false;
      setDrawingState(prev => ({ ...prev, isDrawing: false }));
      return;
    }

    const coordinates = drawingPathRef.current;
    let elementType: DrawingElement['type'];
    let finalCoordinates: DrawingElement['coordinates'];

    // Determine element type and coordinates based on tool
    switch (drawingState.currentTool) {
      case 'point':
        elementType = 'point';
        finalCoordinates = coordinates[0];
        break;
      case 'line':
        elementType = 'line';
        finalCoordinates = coordinates;
        break;
      case 'draw':
        elementType = 'polyline';
        finalCoordinates = coordinates;
        break;
      case 'area':
        elementType = 'polygon';
        // Close the polygon by adding the first point at the end
        finalCoordinates = [...coordinates];
        if (coordinates.length > 2 && 
            (coordinates[0][0] !== coordinates[coordinates.length - 1][0] || 
             coordinates[0][1] !== coordinates[coordinates.length - 1][1])) {
          finalCoordinates.push(coordinates[0]);
        }
        break;
      default:
        isDrawingRef.current = false;
        setDrawingState(prev => ({ ...prev, isDrawing: false }));
        return;
    }

    const newElement: DrawingElement = {
      id: generateId(),
      type: elementType,
      coordinates: finalCoordinates,
      name: `${drawingState.currentTool.charAt(0).toUpperCase() + drawingState.currentTool.slice(1)} ${new Date().toLocaleTimeString()}`,
      color: 'red', // Default red color
      properties: {
        strokeWeight: 3,
        ...(elementType === 'polygon' && { fillOpacity: 0.3 }),
        tool: drawingState.currentTool as 'line' | 'draw' | 'area' | 'point',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setDrawingState(prev => ({
      ...prev,
      elements: [...prev.elements, newElement],
      isDrawing: false,
    }));

    isDrawingRef.current = false;
    drawingPathRef.current = [];
  }, [drawingState.currentTool]);

  const cancelDrawing = useCallback(() => {
    isDrawingRef.current = false;
    drawingPathRef.current = [];
    setDrawingState(prev => ({
      ...prev,
      isDrawing: false,
    }));
  }, []);

  const deleteElement = useCallback((elementId: string) => {
    setDrawingState(prev => ({
      ...prev,
      elements: prev.elements.filter(el => el.id !== elementId),
      selectedElement: prev.selectedElement?.id === elementId ? null : prev.selectedElement,
    }));
  }, []);

  const selectElement = useCallback((element: DrawingElement | null) => {
    setDrawingState(prev => ({
      ...prev,
      selectedElement: element,
    }));
  }, []);

  const updateElement = useCallback((elementId: string, updates: Partial<DrawingElement>) => {
    setDrawingState(prev => ({
      ...prev,
      elements: prev.elements.map(el => 
        el.id === elementId 
          ? { ...el, ...updates, updatedAt: new Date() }
          : el
      ),
      selectedElement: prev.selectedElement?.id === elementId 
        ? { ...prev.selectedElement, ...updates, updatedAt: new Date() }
        : prev.selectedElement,
    }));
  }, []);

  const clearAllDrawings = useCallback(() => {
    setDrawingState(prev => ({
      ...prev,
      elements: [],
      selectedElement: null,
      isDrawing: false,
    }));
    drawingPathRef.current = [];
    isDrawingRef.current = false;
  }, []);

  // Get current drawing path for live preview
  const getCurrentPath = useCallback(() => {
    return drawingPathRef.current;
  }, []);

  return {
    drawingState,
    setCurrentTool,
    startDrawing,
    addPoint,
    finishDrawing,
    cancelDrawing,
    deleteElement,
    selectElement,
    updateElement,
    clearAllDrawings,
    getCurrentPath,
    isDrawing: isDrawingRef.current,
  };
}
