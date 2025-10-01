'use client';

import { useMap } from 'react-leaflet';
import { useEffect, useImperativeHandle, forwardRef } from 'react';
import { LatLngBounds, Point } from 'leaflet';
import { MapBounds } from '@/lib/utils';

export interface MapControllerRef {
  flyTo: (lat: number, lng: number, zoom?: number) => void;
  setView: (lat: number, lng: number, zoom?: number) => void;
  fitBounds: (bounds: MapBounds, padding?: number) => void;
  flyToWithOffset: (lat: number, lng: number, offsetY?: number) => void;
}

interface MapControllerProps {
  targetPosition?: { lat: number; lng: number; zoom?: number } | null;
  targetBounds?: MapBounds | null;
  onNavigationComplete?: () => void;
}

export const MapController = forwardRef<MapControllerRef, MapControllerProps>(
  ({ targetPosition, targetBounds, onNavigationComplete }, ref) => {
    const map = useMap();

    useImperativeHandle(ref, () => ({
      flyTo: (lat: number, lng: number, zoom = 12) => {
        map.flyTo([lat, lng], zoom, {
          duration: 0.8,
          easeLinearity: 0.5
        });
      },
      setView: (lat: number, lng: number, zoom = 12) => {
        map.setView([lat, lng], zoom);
      },
      fitBounds: (bounds: MapBounds, padding = 20) => {
        if (!bounds.hasElements) {
          // If no elements, just center on Idaho
          map.setView(bounds.center, 7);
          return;
        }

        const leafletBounds = new LatLngBounds(
          [bounds.south, bounds.west],
          [bounds.north, bounds.east]
        );

        map.fitBounds(leafletBounds, {
          padding: [padding, padding],
          maxZoom: 16,
          animate: true,
          duration: 0.8
        });
      },
      flyToWithOffset: (lat: number, lng: number, offsetY = 0) => {
        // Get current zoom level to preserve it
        const currentZoom = map.getZoom();
        
        // Convert the lat/lng to pixel coordinates at current zoom
        const targetPoint = map.latLngToContainerPoint([lat, lng]);
        
        // Apply the Y offset to move the point up/down in the visible area
        const offsetPoint = new Point(targetPoint.x, targetPoint.y + offsetY);
        
        // Convert back to lat/lng coordinates
        const offsetLatLng = map.containerPointToLatLng(offsetPoint);
        
        // Fly to the offset position while preserving zoom
        map.flyTo(offsetLatLng, currentZoom, {
          duration: 0.8,
          easeLinearity: 0.5
        });
      }
    }), [map]);

    useEffect(() => {
      if (targetPosition) {
        const { lat, lng, zoom } = targetPosition;
        
        // Use current zoom if none specified
        const targetZoom = zoom !== undefined ? zoom : map.getZoom();
        
        // Use flyTo for smooth animation
        map.flyTo([lat, lng], targetZoom, {
          duration: 0.8,
          easeLinearity: 0.5
        });

        // Call callback when navigation is complete
        if (onNavigationComplete) {
          const timeout = setTimeout(() => {
            onNavigationComplete();
          }, 800); // Match the flyTo duration

          return () => clearTimeout(timeout);
        }
      }
    }, [targetPosition, map, onNavigationComplete]);

    useEffect(() => {
      if (targetBounds) {
        if (!targetBounds.hasElements) {
          // If no elements, just center on Idaho
          map.setView(targetBounds.center, 7);
        } else {
          const leafletBounds = new LatLngBounds(
            [targetBounds.south, targetBounds.west],
            [targetBounds.north, targetBounds.east]
          );

          map.fitBounds(leafletBounds, {
            padding: [20, 20],
            maxZoom: 16,
            animate: true,
            duration: 0.8
          });
        }

        // Call callback when navigation is complete
        if (onNavigationComplete) {
          const timeout = setTimeout(() => {
            onNavigationComplete();
          }, 800); // Match the animation duration

          return () => clearTimeout(timeout);
        }
      }
    }, [targetBounds, map, onNavigationComplete]);

    return null;
  }
);

MapController.displayName = 'MapController';
