'use client';

import { Polyline, Polygon, Marker } from 'react-leaflet';
import L from 'leaflet';
import { DrawingElement } from '@/types';
import { DrawingMarker } from './DrawingMarker';
import { calculateCenterPoint } from '@/lib/utils';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { useState } from 'react';

interface DrawingElementsProps {
  elements: DrawingElement[];
  selectedElement: DrawingElement | null;
  onElementSelect: (element: DrawingElement) => void;
  onElementDelete: (elementId: string) => void;
  onMarkerSelect?: (element: DrawingElement) => void;
}

export function DrawingElements({ 
  elements, 
  selectedElement, 
  onElementSelect, 
  onElementDelete,
  onMarkerSelect
}: DrawingElementsProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [elementToDelete, setElementToDelete] = useState<DrawingElement | null>(null);
  
  const createCustomIcon = (element: DrawingElement) => {
    const isSelected = selectedElement?.id === element.id;
    // Convert color names to hex values
    const getColorHex = (colorName: string) => {
      switch (colorName) {
        case 'blue': return '#3b82f6';
        case 'red': return '#ef4444';
        case 'green': return '#22c55e';
        case 'yellow': return '#eab308';
        case 'purple': return '#a855f7';
        case 'orange': return '#f97316';
        default: return colorName; // Use as-is if already hex
      }
    };
    
    const color = getColorHex(element.color);
    const size = isSelected ? 16 : 12;
    const borderColor = isSelected ? '#FFD700' : 'white';
    const borderWidth = isSelected ? 3 : 2;

    return L.divIcon({
      className: 'drawing-point-marker',
      html: `
        <div style="
          width: ${size}px; 
          height: ${size}px; 
          background: ${color}; 
          border: ${borderWidth}px solid ${borderColor}; 
          border-radius: 50%; 
          box-shadow: 0 0 4px rgba(0,0,0,0.3);
          ${isSelected ? 'box-shadow: 0 0 8px rgba(255,215,0,0.6);' : ''}
        "></div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  };

  const getPathOptions = (element: DrawingElement) => {
    const isSelected = selectedElement?.id === element.id;
    // Convert color names to hex values for Leaflet
    const getColorHex = (colorName: string) => {
      switch (colorName) {
        case 'blue': return '#3b82f6';
        case 'red': return '#ef4444';
        case 'green': return '#22c55e';
        case 'yellow': return '#eab308';
        case 'purple': return '#a855f7';
        case 'orange': return '#f97316';
        default: return colorName; // Use as-is if already hex
      }
    };
    
    return {
      color: getColorHex(element.color),
      weight: element.properties.strokeWeight + (isSelected ? 2 : 0),
      opacity: isSelected ? 1 : 0.8,
      fillOpacity: element.properties.fillOpacity || 0.3,
      className: isSelected ? 'drawing-element-selected' : 'drawing-element'
    };
  };

  const handleElementClick = (element: DrawingElement, e: L.LeafletMouseEvent) => {
    e.originalEvent?.stopPropagation();
    onElementSelect(element);
  };


  const handleConfirmDelete = () => {
    if (elementToDelete) {
      onElementDelete(elementToDelete.id);
      setElementToDelete(null);
    }
  };



  return (
    <>
      {/* Render the drawing elements (lines, polygons, polylines) */}
      {elements.map((element) => {
        switch (element.type) {
          case 'point':
            const coordinates = element.coordinates as [number, number];
            return (
              <Marker
                key={element.id}
                position={coordinates}
                icon={createCustomIcon(element)}
                eventHandlers={{
                  click: (e) => handleElementClick(element, e)
                }}
              />
            );

          case 'line':
          case 'polyline':
            const lineCoordinates = element.coordinates as [number, number][];
            return (
              <Polyline
                key={element.id}
                positions={lineCoordinates}
                pathOptions={getPathOptions(element)}
                eventHandlers={{
                  click: (e) => handleElementClick(element, e)
                }}
              />
            );

          case 'polygon':
            const polygonCoordinates = element.coordinates as [number, number][];
            return (
              <Polygon
                key={element.id}
                positions={polygonCoordinates}
                pathOptions={getPathOptions(element)}
                eventHandlers={{
                  click: (e) => handleElementClick(element, e)
                }}
              />
            );

          default:
            return null;
        }
      })}

      {/* Render center markers for all drawing elements */}
      {elements.map((element) => {
          // For points, use their direct coordinates; for others, use center position
          const markerPosition = element.type === 'point' 
            ? element.coordinates as [number, number]
            : element.markerPosition || calculateCenterPoint(element);
          
          return (
            <DrawingMarker
              key={`marker-${element.id}-${element.elementType || 'none'}-${element.color}-${element.updatedAt instanceof Date ? element.updatedAt.getTime() : new Date(element.updatedAt || 0).getTime()}`}
              element={element}
              position={markerPosition}
              onElementSelect={onMarkerSelect || onElementSelect}
            />
          );
        })}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={handleConfirmDelete}
        element={elementToDelete}
        elementType="drawing"
      />
    </>
  );
}
