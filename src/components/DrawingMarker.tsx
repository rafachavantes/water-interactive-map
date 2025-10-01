'use client';

import { DivIcon } from 'leaflet';
import { Marker, Tooltip } from 'react-leaflet';
import { useMemo } from 'react';
import { DrawingElement } from '@/types';
import { getPrivacyDisplayString } from '@/lib/utils';

interface DrawingMarkerProps {
  element: DrawingElement;
  position: [number, number];
  onElementSelect: (element: DrawingElement) => void;
}


// Color fill mapping for drawing markers
  const getColorFill = (color: string) => {
    // Convert color names to hex values to match existing system
    switch (color) {
      case 'blue':
        return '#3b82f6';
      case 'red':
        return '#ef4444';
      case 'green':
        return '#22c55e';
      case 'yellow':
        return '#eab308';
      case 'purple':
        return '#a855f7';
      case 'orange':
        return '#f97316';
      default:
        return color; // Use the value directly if it's already hex
    }
  };

// Helper function to get SVG path for element type icons
const getElementTypeIconSVG = (elementType: string): string => {
  switch (elementType) {
    case 'ride':
      return '<polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="white"></polygon>';
    case 'canal':
      return '<path d="M3 12h18M8 6l-4 6 4 6M16 6l4 6-4 6" stroke="white" stroke-width="2" fill="none"></path>';
    case 'headgate':
      return '<rect x="2" y="6" width="20" height="12" stroke="white" stroke-width="2" fill="none" rx="2"></rect><path d="M8 10v4M16 10v4" stroke="white" stroke-width="2"></path>';
    case 'meter':
      return '<circle cx="12" cy="12" r="8" fill="white"></circle><path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"></path>';
    case 'pump':
      return '<path d="M13 10V3L4 14h7v7l9-11h-7z" fill="white"></path>';
    case 'pivot':
      return '<circle cx="12" cy="12" r="9" fill="white"></circle><path d="M15 9l3 3-3 3M18 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"></path>';
    case 'land':
      return '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="white"></path><circle cx="12" cy="10" r="3" fill="currentColor"></circle>';
    case 'hazard':
      return '<path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" fill="white"></path>';
    case 'maintenance':
      return '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" fill="white"></path>';
    case 'custom':
      return '<circle cx="12" cy="12" r="8" fill="white"></circle><path d="M12 4v8m4-4H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"></path>';
    default:
      return '<circle cx="12" cy="12" r="3" fill="white"></circle>';
  }
};

// Helper function to get SVG path for drawing tool icons (fallback)
const getDrawingToolIconSVG = (tool: string): string => {
  switch (tool) {
    case 'point':
      return '<circle cx="12" cy="12" r="3" fill="white"></circle>';
    case 'line':
      return '<path d="M5 12h14" stroke="white" stroke-width="2.5" stroke-linecap="round"></path>';
    case 'draw':
      return '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="white" stroke-width="2" fill="none"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="white" stroke-width="2" fill="none"></path>';
    case 'area':
      return '<rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="white" stroke-width="2.5" fill="none"></rect>';
    default:
      return '<circle cx="12" cy="12" r="3" fill="white"></circle>';
  }
};

const createDrawingMarkerIcon = (element: DrawingElement) => {
  // Create a temporary container
  const container = document.createElement('div');
  
  // Check if element needs review indicator or has an issue
  const needsReview = element.approvalStatus === 'pending';
  const hasIssue = element.issue !== undefined;
  
  // Create the marker HTML structure with unified pin design similar to CustomMapMarker
  container.innerHTML = `
    <div class="relative flex items-start">
      <!-- Drawing marker pin shape -->
      <div class="relative flex flex-col items-center">
        <svg width="40" height="42" viewBox="0 0 40 42" class="drop-shadow-lg" style="z-index: 1;">
          <!-- Pin path with drawing element color -->
          <path d="M20 2 C29 2, 36 9, 36 18 C36 22, 34 25, 32 27 Q26 34, 20 40 Q14 34, 8 27 C6 25, 4 22, 4 18 C4 9, 11 2, 20 2 Z" 
                fill="${getColorFill(element.color)}" 
                stroke="white" 
                stroke-width="2.5" 
                stroke-linejoin="round"/>
        </svg>
        <!-- Icon overlay centered in the circular part -->
        <div class="absolute inset-0 flex items-center justify-center text-white" style="top: 7px; left: 0; right: 0; height: 22px; z-index: 2;">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke-width="2">
            ${element.elementType ? getElementTypeIconSVG(element.elementType) : getDrawingToolIconSVG(element.properties.tool)}
          </svg>
        </div>
      </div>
      <!-- Label with black text and white outline -->
      <div class="ml-3 mt-2">
        <div class="text-sm font-semibold text-black whitespace-nowrap" style="text-shadow: 1px 1px 0 white, -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 0 1px 0 white, 1px 0 0 white, 0 -1px 0 white, -1px 0 0 white;">
          ${element.name || 'Drawing'}
        </div>
        ${(element.order !== undefined && element.order !== null) || (element.cfs !== undefined && element.cfs !== null) ? `
        <div class="text-sm font-semibold whitespace-nowrap" style="color: #00ff00; text-shadow: 1px 1px 0 black, -1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black, 0 1px 0 black, 1px 0 0 black, 0 -1px 0 black, -1px 0 0 black;">
          ${element.order !== undefined && element.order !== null ? `O: ${element.order} CFS` : ''}${(element.order !== undefined && element.order !== null) && (element.cfs !== undefined && element.cfs !== null) ? ' | ' : ''}${element.cfs !== undefined && element.cfs !== null ? `L: ${element.cfs} CFS` : ''}
        </div>
        ` : ''}
      </div>
      ${needsReview ? `
      <!-- Pending review indicator - red exclamation mark at top-right, positioned outside the pin container -->
      <div class="absolute" style="top: -2px; left: 24px; z-index: 1000;">
        <div class="bg-red-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white" style="width: 16px; height: 16px;">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="white" stroke="none">
            <path d="M12 2L12 14M12 18L12 22" stroke="white" stroke-width="3" stroke-linecap="round"/>
          </svg>
        </div>
      </div>
      ` : ''}
      ${hasIssue && !needsReview ? `
      <!-- Issue indicator - amber exclamation mark at top-right, positioned outside the pin container -->
      <div class="absolute" style="top: -2px; left: 24px; z-index: 1000;">
        <div class="bg-amber-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white" style="width: 16px; height: 16px;">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="white" stroke="none">
            <path d="M12 2L12 14M12 18L12 22" stroke="white" stroke-width="3" stroke-linecap="round"/>
          </svg>
        </div>
      </div>
      ` : ''}
    </div>
  `;

  return new DivIcon({
    html: container.innerHTML,
    className: 'drawing-marker',
    iconSize: [220, 42],
    iconAnchor: [20, 40], // Point to the bottom tip of the pin
  });
};

export function DrawingMarker({ element, position, onElementSelect }: DrawingMarkerProps) {
  const customIcon = useMemo(() => {
    return createDrawingMarkerIcon(element);
  }, [element]);

  // Helper function to get default name based on element type
  const getDefaultName = (type: DrawingElement['type']): string => {
    switch (type) {
      case 'line': return 'unnamed line';
      case 'polyline': return 'unnamed line';
      case 'polygon': return 'unnamed area';
      case 'point': return 'unnamed point';
      default: return 'unnamed element';
    }
  };

  const getDisplayName = () => {
    // If elementType is set, show the type label
    if (element.elementType) {
      const elementTypes = [
        { value: 'ride', label: 'Ride' },
        { value: 'canal', label: 'Canal' },
        { value: 'headgate', label: 'Headgate' },
        { value: 'meter', label: 'Meter' },
        { value: 'pump', label: 'Pump' },
        { value: 'pivot', label: 'Pivot' },
        { value: 'land', label: 'Land' },
        { value: 'hazard', label: 'Hazard' },
        { value: 'maintenance', label: 'Maintenance' },
        { value: 'custom', label: 'Custom' },
      ];
      const typeInfo = elementTypes.find(t => t.value === element.elementType);
      return typeInfo ? typeInfo.label : element.elementType;
    }

    // Fallback to tool-based display
    switch (element.properties.tool) {
      case 'point':
        return 'Point';
      case 'line':
        return 'Line';
      case 'draw':
        return 'Drawing';
      case 'area':
        return 'Area';
      default:
        return element.type;
    }
  };

  return (
    <Marker
      position={position}
      icon={customIcon}
      eventHandlers={{
        click: () => onElementSelect(element),
      }}
    >
      <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
        <div className="text-sm">
          <div className="font-semibold">
            {element.name || getDefaultName(element.type)}
          </div>
          <div className="text-muted-foreground">
            {getDisplayName()}
          </div>
          {element.approvalStatus === 'pending' && (
            <div className="text-xs mt-1 text-red-600 font-semibold">
              ⚠️ Pending Admin Review
            </div>
          )}
          {element.issue && (
            <div className="text-xs mt-1 text-amber-600 font-semibold">
              ⚠️ Issue: {element.issue.description}
            </div>
          )}
          {element.description && (
            <div className="text-xs mt-1 text-muted-foreground">
              {element.description}
            </div>
          )}
          <div className="text-xs mt-1 text-muted-foreground">
            Privacy: {getPrivacyDisplayString(element.privacy)}
          </div>
        </div>
      </Tooltip>
    </Marker>
  );
}
