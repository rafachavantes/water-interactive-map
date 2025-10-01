import { useState, useCallback, useRef, useEffect } from 'react';
import { DrawingElement, DrawingState } from '@/types';
import { drawingService } from './drawingService';

export function usePersistentDrawing() {
  const [drawingState, setDrawingState] = useState<DrawingState>({
    isDrawing: false,
    currentTool: null,
    elements: [],
    selectedElement: null,
  });

  const drawingPathRef = useRef<[number, number][]>([]);
  const isDrawingRef = useRef(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load drawings from database on mount
  useEffect(() => {
    const loadDrawings = async () => {
      try {
        const drawings = await drawingService.loadAllDrawings();
        setDrawingState(prev => ({
          ...prev,
          elements: drawings,
        }));
        setIsLoaded(true);
        console.log(`Loaded ${drawings.length} drawings from database`);
      } catch (error) {
        console.error('Failed to load drawings from database:', error);
        setIsLoaded(true); // Still mark as loaded even if there's an error
      }
    };

    loadDrawings();
  }, []);

  // Auto-save when elements change (after initial load)
  const lastSaveRef = useRef<string>('');
  useEffect(() => {
    if (!isLoaded) return; // Don't save during initial load

    // Create a hash of the current elements to avoid unnecessary saves
    const currentHash = JSON.stringify(drawingState.elements.map(e => e.id).sort());
    if (currentHash === lastSaveRef.current) {
      return; // No changes since last save
    }

    const saveDrawings = async () => {
      try {
        // Validate and clean up elements
        const validElements = drawingState.elements.map(element => {
          // Create a clean copy of the element
          const cleanElement = { ...element };

          // Check for problematic files with blob URLs
          if (cleanElement.files && Array.isArray(cleanElement.files)) {
            const hasProblematicFiles = cleanElement.files.some(file => 
              file.url && file.url.startsWith('blob:')
            );
            if (hasProblematicFiles) {
              console.warn('Element has files with blob URLs:', cleanElement.id, 'cleaning up...');
              // Create a clean files array without blob URLs
              cleanElement.files = cleanElement.files.filter(file => 
                !file.url || !file.url.startsWith('blob:')
              );
              if (cleanElement.files.length === 0) {
                delete cleanElement.files;
              }
            }
          }

          return cleanElement;
        }).filter(element => {
          // Filter out invalid elements after cleaning
          if (!element.id || !element.name || !element.type || !element.coordinates) {
            console.warn('Skipping invalid element:', element.id || 'no-id', 'missing required fields');
            return false;
          }
          if (!element.createdAt || !element.updatedAt) {
            console.warn('Skipping element with invalid dates:', element.id);
            return false;
          }
          if (!element.properties || typeof element.properties !== 'object') {
            console.warn('Skipping element with invalid properties:', element.id);
            return false;
          }
          return true;
        });

        if (validElements.length !== drawingState.elements.length) {
          console.warn(`Filtered out ${drawingState.elements.length - validElements.length} invalid elements`);
        }

        await drawingService.saveDrawings(validElements);
        lastSaveRef.current = currentHash;
        console.log(`Saved ${validElements.length} drawings to database`);
      } catch (error) {
        console.error('Failed to save drawings to database:', error);
      }
    };

    // Debounce saves to avoid too frequent calls
    const timeoutId = setTimeout(saveDrawings, 500);
    return () => clearTimeout(timeoutId);
  }, [drawingState.elements, isLoaded]);

  const generateId = () => {
    return `drawing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const setCurrentTool = useCallback((tool: string | null) => {
    setDrawingState(prev => ({
      ...prev,
      currentTool: tool,
      isDrawing: false,
      // Close element details panel when switching to drawing tools
      selectedElement: (tool && tool !== 'move') ? null : prev.selectedElement,
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

    // Add to state
    setDrawingState(prev => ({
      ...prev,
      elements: [...prev.elements, newElement],
      isDrawing: false,
      selectedElement: newElement, // Automatically select the new element
    }));

    // Save to database immediately
    if (isLoaded) {
      const saveDrawing = async () => {
        try {
          await drawingService.saveDrawing(newElement);
          console.log(`Saved new drawing ${newElement.id} to database`);
        } catch (error) {
          console.error('Failed to save new drawing to database:', error);
        }
      };
      saveDrawing();
    }

    isDrawingRef.current = false;
    drawingPathRef.current = [];
  }, [drawingState.currentTool, isLoaded]);

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

    // Also delete from database immediately
    const deleteDrawing = async () => {
      try {
        await drawingService.deleteDrawing(elementId);
        console.log(`Deleted drawing ${elementId} from database`);
      } catch (error) {
        console.error('Failed to delete drawing from database:', error);
      }
    };
    deleteDrawing();
  }, []);

  const selectElement = useCallback((element: DrawingElement | null) => {
    setDrawingState(prev => ({
      ...prev,
      selectedElement: element,
    }));
  }, []);

  const updateElement = useCallback((elementId: string, updates: Partial<DrawingElement>) => {
    const updatedElement = { ...updates, updatedAt: new Date() };
    
    setDrawingState(prev => ({
      ...prev,
      elements: prev.elements.map(el => 
        el.id === elementId 
          ? { ...el, ...updatedElement }
          : el
      ),
      selectedElement: prev.selectedElement?.id === elementId 
        ? { ...prev.selectedElement, ...updatedElement }
        : prev.selectedElement,
    }));

    // Update in database immediately
    const updateDrawing = async () => {
      try {
        await drawingService.updateDrawing(elementId, updatedElement);
        console.log(`Updated drawing ${elementId} in database`);
      } catch (error) {
        console.error('Failed to update drawing in database:', error);
      }
    };
    updateDrawing();
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

    // Also clear from database
    const clearDrawings = async () => {
      try {
        await drawingService.clearAllDrawings();
        console.log('Cleared all drawings from database');
      } catch (error) {
        console.error('Failed to clear drawings from database:', error);
      }
    };
    clearDrawings();
  }, []);

  // Get current drawing path for live preview
  const getCurrentPath = useCallback(() => {
    return drawingPathRef.current;
  }, []);

  // Manual save function (in case auto-save fails)
  const saveAllDrawings = useCallback(async () => {
    try {
      await drawingService.saveDrawings(drawingState.elements);
      console.log(`Manually saved ${drawingState.elements.length} drawings to database`);
      return true;
    } catch (error) {
      console.error('Failed to manually save drawings:', error);
      return false;
    }
  }, [drawingState.elements]);

  // Manual load function
  const loadAllDrawings = useCallback(async () => {
    try {
      const drawings = await drawingService.loadAllDrawings();
      setDrawingState(prev => ({
        ...prev,
        elements: drawings,
        selectedElement: null,
      }));
      console.log(`Manually loaded ${drawings.length} drawings from database`);
      return true;
    } catch (error) {
      console.error('Failed to manually load drawings:', error);
      return false;
    }
  }, []);

  // Create new element function
  const createElement = useCallback((element: DrawingElement) => {
    setDrawingState(prev => ({
      ...prev,
      elements: [...prev.elements, element],
      selectedElement: element,
    }));

    // Save to database immediately if loaded
    if (isLoaded) {
      const saveDrawing = async () => {
        try {
          await drawingService.saveDrawing(element);
          console.log(`Saved new drawing ${element.id} to database`);
        } catch (error) {
          console.error('Failed to save new drawing to database:', error);
        }
      };
      saveDrawing();
    }
  }, [isLoaded]);

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
    isLoaded,
    saveAllDrawings,
    loadAllDrawings,
    createElement,
  };
}
