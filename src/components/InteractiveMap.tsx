'use client';

import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import { LatLngExpression, Map as LeafletMap } from 'leaflet';
import L from 'leaflet';
import 'leaflet-simple-map-screenshoter';

// Type declaration for leaflet-simple-map-screenshoter
interface SimpleMapScreenshoterOptions {
  hidden?: boolean;
  screenName?: string;
  hideElementsWithSelectors?: string[];
  cropImageByInnerWH?: boolean;
  onCropBorderSize?: number;
  domtoimageOptions?: Record<string, unknown>;
}

interface SimpleMapScreenshoter extends L.Control {
  takeScreen(format: 'blob' | 'image' | 'canvas'): Promise<Blob>;
}
import { DrawingOverlay } from './DrawingOverlay';
import { DrawingElements } from './DrawingElements';
import { LocationSearch } from './LocationSearch';
import { MapController, MapControllerRef } from './MapController';
import { getDefaultMarkerColor } from '@/lib/utils';
import { FilterState, DrawingElement } from '@/types';
import { Button } from '@/components/ui/button';
import { Layers, PanelLeftOpen, Map, Satellite, Download } from 'lucide-react';
import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { calculateCenterPoint, calculateElementsBounds, MapBounds } from '@/lib/utils';

// Fix for default markers in Leaflet with Next.js
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface InteractiveMapProps {
  activeDrawingTool: string | null;
  onToggleLayerPanel: () => void;
  showLayerPanel: boolean;
  filterState: FilterState;
  drawingElements: DrawingElement[];
  selectedDrawingElement: DrawingElement | null;
  onDrawingComplete?: (partialElement: Partial<DrawingElement>) => void;
  onDrawingCancel?: () => void;
  onDrawingMarkerSelect?: (element: DrawingElement) => void;
  onDrawingElementDelete?: (elementId: string) => void;
  pendingReviewCount?: number;
  userRole?: 'User' | 'Ditch Rider' | 'Admin';
  centerOnPosition?: { lat: number; lng: number; zoom?: number } | null;
}

export function InteractiveMap({ 
  activeDrawingTool, 
  onToggleLayerPanel, 
  showLayerPanel, 
  filterState, 
  drawingElements,
  selectedDrawingElement,
  onDrawingComplete,
  onDrawingCancel,
  onDrawingMarkerSelect,
  onDrawingElementDelete,
  pendingReviewCount = 0,
  userRole = 'User',
  centerOnPosition = null
}: InteractiveMapProps) {
  const defaultCenter: LatLngExpression = [44.0682, -114.7420]; // Center of Idaho
  const defaultZoom = 7;
  
  // State for location navigation
  const [targetPosition, setTargetPosition] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);
  const [targetBounds, setTargetBounds] = useState<MapBounds | null>(null);
  const [hasInitiallyFitted, setHasInitiallyFitted] = useState(false);
  const mapControllerRef = useRef<MapControllerRef>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  
  // State for map view type
  const [isSatelliteView, setIsSatelliteView] = useState(false);

  // Helper function to get default name based on element type
  const getDefaultNameForType = (type: DrawingElement['type']): string => {
    switch (type) {
      case 'line': return 'unnamed line';
      case 'polyline': return 'unnamed line';
      case 'polygon': return 'unnamed area';
      case 'point': return 'unnamed point';
      default: return 'unnamed element';
    }
  };

  // Note: Drawing state is now managed by the parent component

  // Handle drawing completion
  const handleDrawingComplete = (partialElement: Partial<DrawingElement>) => {
    // Calculate marker position if not provided
    if (!partialElement.markerPosition && partialElement.type && partialElement.coordinates) {
      const tempElement = {
        ...partialElement,
        id: 'temp',
        name: partialElement.name || getDefaultNameForType(partialElement.type),
        color: partialElement.color || getDefaultMarkerColor(userRole),
        properties: partialElement.properties || { strokeWeight: 3, tool: 'point' },
        createdAt: new Date(),
        updatedAt: new Date(),
      } as DrawingElement;
      partialElement.markerPosition = calculateCenterPoint(tempElement);
    }

    // Notify parent component to handle creation with database persistence
    if (onDrawingComplete) {
      onDrawingComplete(partialElement);
    }
  };

  const handleDrawingCancel = () => {
    // Call the cancel function passed from parent
    if (onDrawingCancel) {
      onDrawingCancel();
    }
    console.log('Drawing cancelled');
  };

  // Handle location selection from search
  const handleLocationSelect = useCallback((lat: number, lng: number, name: string) => {
    console.log(`Navigating to ${name} at ${lat}, ${lng}`);
    setTargetPosition({ lat, lng, zoom: 12 });
  }, []);

  // Handle navigation completion
  const handleNavigationComplete = useCallback(() => {
    setTargetPosition(null);
    setTargetBounds(null);
  }, []);

  const handleExportMap = () => {
    if (mapRef.current) {
      try {
        // Check if the plugin is available
        if (!(L as typeof L & { Control: { SimpleMapScreenshoter: new (options?: SimpleMapScreenshoterOptions) => SimpleMapScreenshoter } }).Control.SimpleMapScreenshoter) {
          console.error('Leaflet SimpleMapScreenshoter plugin not loaded');
          alert('Map export plugin is not available. Please refresh the page and try again.');
          return;
        }

        // Use leaflet-simple-map-screenshoter for reliable map export
        const screenshoter = new (L as typeof L & { Control: { SimpleMapScreenshoter: new (options?: SimpleMapScreenshoterOptions) => SimpleMapScreenshoter } }).Control.SimpleMapScreenshoter({
          hidden: true, // Don't add button, just use programmatically
          screenName: 'water-map-export',
          hideElementsWithSelectors: [
            '.leaflet-control-container',
            '.leaflet-control-zoom',
            '.leaflet-control-attribution'
          ],
          cropImageByInnerWH: true, // Crop to remove empty borders
          onCropBorderSize: 0, // Remove border padding
          domtoimageOptions: {
            style: {
              // Override any border styles
              border: 'none !important',
              outline: 'none !important',
              boxShadow: 'none !important'
            }
          }
        });
        
        // Add to map temporarily
        screenshoter.addTo(mapRef.current);
        
        // Add temporary CSS to remove borders during screenshot
        const tempStyle = document.createElement('style');
        tempStyle.id = 'temp-screenshot-style';
        tempStyle.textContent = `
          .leaflet-container,
          .leaflet-container * {
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
          }
          .leaflet-zoom-box {
            border: none !important;
          }
          .leaflet-control {
            border: none !important;
            box-shadow: none !important;
          }
          /* Remove any drawing element borders */
          .drawing-element,
          .drawing-element-selected {
            border: none !important;
            outline: none !important;
          }
        `;
        document.head.appendChild(tempStyle);
        
        // Take the screenshot
        screenshoter.takeScreen('blob').then((blob: Blob) => {
          // Create download link
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'water-map-export.png';
          link.click();
          
          // Clean up
          URL.revokeObjectURL(url);
          console.log('Map exported successfully');
          
          // Remove temporary styles and control
          const tempStyleElement = document.getElementById('temp-screenshot-style');
          if (tempStyleElement) {
            tempStyleElement.remove();
          }
          mapRef.current?.removeControl(screenshoter);
        }).catch((error: Error) => {
          console.error('Error exporting map:', error);
          alert('Unable to export map. Please try again.');
          // Remove temporary styles and control on error too
          const tempStyleElement = document.getElementById('temp-screenshot-style');
          if (tempStyleElement) {
            tempStyleElement.remove();
          }
          mapRef.current?.removeControl(screenshoter);
        });
      } catch (error) {
        console.error('Error initializing map screenshoter:', error);
        alert('Map export is not available. Please refresh the page and try again.');
      }
    } else {
      alert('Map is not ready for export. Please wait for the map to load.');
    }
  };

  // Auto-fit bounds when drawing elements are first loaded
  useEffect(() => {
    if (drawingElements.length > 0 && !hasInitiallyFitted) {
      const bounds = calculateElementsBounds(drawingElements);
      setTargetBounds(bounds);
      setHasInitiallyFitted(true);
    }
  }, [drawingElements, hasInitiallyFitted]);

  // Center map when centerOnPosition prop changes
  useEffect(() => {
    if (centerOnPosition) {
      // Check if we're on mobile and details panel is open
      const isMobile = window.innerWidth <= 768;
      const detailsPanelOpen = selectedDrawingElement !== null;
      
      if (isMobile && detailsPanelOpen) {
        // On mobile with details panel open, try to use the offset method
        // If it's not available, use setTimeout to retry or fallback to approximate offset
        
        // Try to use the offset method if available
        if (mapControllerRef.current && typeof mapControllerRef.current.flyToWithOffset === 'function') {
          const viewportHeight = window.innerHeight;
          // On mobile, map is 40vh tall, details panel is 60vh
          // We want the marker to appear in the center of the visible 40vh area
          // Adjusting to find the right balance
          const offsetPixels = viewportHeight * 0.25; // 25% of viewport height
          
          mapControllerRef.current.flyToWithOffset(
            centerOnPosition.lat,
            centerOnPosition.lng,
            offsetPixels
          );
        } else {
          // Try again after a short delay to allow MapController to initialize
          const timeout = setTimeout(() => {
            if (mapControllerRef.current && typeof mapControllerRef.current.flyToWithOffset === 'function') {
              const viewportHeight = window.innerHeight;
              const offsetPixels = viewportHeight * 0.25;
              
              mapControllerRef.current.flyToWithOffset(
                centerOnPosition.lat,
                centerOnPosition.lng,
                offsetPixels
              );
            } else {
              // Final fallback: approximate latitude offset
              // This is less precise but better than no offset
              const latOffset = -0.001; // Small negative offset to move center up slightly
              setTargetPosition({
                lat: centerOnPosition.lat + latOffset,
                lng: centerOnPosition.lng,
                zoom: undefined // Preserve current zoom
              });
            }
          }, 100);
          
          return () => clearTimeout(timeout);
        }
      } else {
        // Desktop or no details panel - use normal centering
        setTargetPosition({
          lat: centerOnPosition.lat,
          lng: centerOnPosition.lng,
          zoom: undefined // Preserve current zoom
        });
      }
    }
  }, [centerOnPosition, selectedDrawingElement]);

  // Drawing state is now managed globally via window object in DrawingOverlay

  // Filter drawing elements based on filter state
  const filteredDrawingElements = useMemo(() => {
    return drawingElements.filter(element => {
      // Check search query
      const searchMatch = !filterState.searchQuery || 
        element.name.toLowerCase().includes(filterState.searchQuery.toLowerCase()) ||
        (element.elementType && element.elementType.toLowerCase().includes(filterState.searchQuery.toLowerCase())) ||
        element.type.toLowerCase().includes(filterState.searchQuery.toLowerCase()) ||
        (element.category && element.category.toLowerCase().includes(filterState.searchQuery.toLowerCase())) ||
        (element.farm && element.farm.toLowerCase().includes(filterState.searchQuery.toLowerCase()));
      
      if (!searchMatch) return false;
      
      // Type filtering - use elementType or fallback to drawing type
      const elementTypeToCheck = element.elementType || element.type;
      
      // If no types are selected (all false), show everything
      const anyTypeSelected = Object.values(filterState.types).some(selected => selected === true);
      
      if (!anyTypeSelected) {
        // No types selected = show all, but check individual item filtering
        const anyItemSelected = Object.values(filterState.items).some(selected => selected === true);
        
        if (!anyItemSelected) {
          return true; // Show all items
        } else {
          // Some items are specifically selected, only show those
          return filterState.items[element.id] === true;
        }
      } else {
        // Some types are selected = only show selected types
        const typeSelected = filterState.types[elementTypeToCheck as keyof typeof filterState.types] === true;
        if (!typeSelected) return false;
        
        // Within selected types, apply individual item filtering
        const anyItemOfThisTypeSelected = drawingElements
          .filter(el => (el.elementType || el.type) === elementTypeToCheck)
          .some(el => filterState.items[el.id] === true);
        
        if (!anyItemOfThisTypeSelected) {
          return true; // Show all items of this selected type
        } else {
          // Some items of this type are selected, only show selected ones
          return filterState.items[element.id] === true;
        }
      }
    });
  }, [drawingElements, filterState]);

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className="w-full h-full z-0"
        scrollWheelZoom={true}
        zoomControl={false}
        ref={(mapInstance) => {
          if (mapInstance) {
            mapRef.current = mapInstance;
          }
        }}
      >
        {/* Conditional tile layers based on view type */}
        {isSatelliteView ? (
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, Maxar, Earthstar Geographics, CNES/Airbus DS, USDA FSA, USGS, Aerogrid, IGN, IGP, and the GIS User Community'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}
        
        {/* Custom positioned zoom control */}
        <ZoomControl position="bottomright" />
        
        {/* Dummy markers removed - now using drawing elements only */}

        {/* Drawing Overlay for active drawing */}
        <DrawingOverlay
          activeTool={activeDrawingTool}
          onDrawingComplete={handleDrawingComplete}
          onDrawingCancel={handleDrawingCancel}
          userRole={userRole}
        />

        {/* Render filtered drawing elements */}
        <DrawingElements
          elements={filteredDrawingElements}
          selectedElement={selectedDrawingElement}
          onElementSelect={onDrawingMarkerSelect || (() => {})}
          onElementDelete={onDrawingElementDelete || (() => {})}
          onMarkerSelect={onDrawingMarkerSelect}
        />

        {/* Map Controller for programmatic navigation */}
        <MapController
          ref={mapControllerRef}
          targetPosition={targetPosition}
          targetBounds={targetBounds}
          onNavigationComplete={handleNavigationComplete}
        />
      </MapContainer>
      
      {/* Top Controls - Left Side */}
      {!showLayerPanel && (
        <div className="absolute top-4 left-4 z-10 flex flex-col sm:flex-row items-start sm:items-center gap-3 mobile-map-controls">
          {/* Layers Toggle Button */}
          <Button
            onClick={onToggleLayerPanel}
            variant="secondary"
            size="sm"
            className="bg-white shadow-lg hover:shadow-xl transition-shadow border border-border/20 mobile-layer-button"
          >
            <Layers className="h-4 w-4 mr-2" />
            Layers
            {/* Red badge for pending reviews - only show for admins */}
            {userRole === 'Admin' && pendingReviewCount > 0 && (
              <div className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium ml-2 mr-1">
                {pendingReviewCount > 99 ? '99+' : pendingReviewCount}
              </div>
            )}
            <PanelLeftOpen className="h-4 w-4 ml-1" />
          </Button>

          {/* Location Search */}
          <LocationSearch
            onLocationSelect={handleLocationSelect}
            className="w-64 mobile-search"
          />
        </div>
      )}

      {/* Map View Toggle - Bottom Right Above Zoom Controls */}
      <div className="absolute bottom-24 right-3 z-10">
        <Button
          onClick={() => setIsSatelliteView(!isSatelliteView)}
          variant="secondary"
          size="sm"
          className="bg-white shadow-lg hover:shadow-xl transition-shadow border border-border/20 px-1 py-1.5"
          title={isSatelliteView ? "Switch to Street View" : "Switch to Satellite View"}
        >
          {isSatelliteView ? (
            <Map className="h-4 w-4" />
          ) : (
            <Satellite className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Export Button */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          onClick={handleExportMap}
          variant="secondary"
          size="sm"
          className="bg-white shadow-lg hover:shadow-xl transition-shadow border border-border/20"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  );
}
