import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { DrawingElement, PrivacySettings } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Map bounds interface
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
  center: [number, number];
  hasElements: boolean;
}

// Calculate the center point of a drawing element
export function calculateCenterPoint(element: DrawingElement): [number, number] {
  if (element.type === 'point') {
    return element.coordinates as [number, number];
  }
  
  const coordinates = element.coordinates as [number, number][];
  
  if (coordinates.length === 0) {
    return [0, 0];
  }
  
  const bounds = coordinates.reduce(
    (acc, [lat, lng]) => ({
      minLat: Math.min(acc.minLat, lat),
      maxLat: Math.max(acc.maxLat, lat),
      minLng: Math.min(acc.minLng, lng),
      maxLng: Math.max(acc.maxLng, lng),
    }),
    {
      minLat: coordinates[0][0],
      maxLat: coordinates[0][0],
      minLng: coordinates[0][1],
      maxLng: coordinates[0][1],
    }
  );
  
  const centerLat = (bounds.minLat + bounds.maxLat) / 2;
  const centerLng = (bounds.minLng + bounds.maxLng) / 2;
  
  return [centerLat, centerLng];
}

// Calculate bounds for multiple drawing elements
export function calculateElementsBounds(elements: DrawingElement[]): MapBounds | null {
  if (elements.length === 0) {
    // Return Idaho center when no elements
    return {
      north: 44.0682,
      south: 44.0682,
      east: -114.7420,
      west: -114.7420,
      center: [44.0682, -114.7420],
      hasElements: false
    };
  }
  
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;
  
  elements.forEach(element => {
    if (element.type === 'point') {
      const [lat, lng] = element.coordinates as [number, number];
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
    } else {
      const coordinates = element.coordinates as [number, number][];
      coordinates.forEach(([lat, lng]) => {
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
      });
    }
  });
  
  // Add some padding to the bounds
  const latPadding = (maxLat - minLat) * 0.1;
  const lngPadding = (maxLng - minLng) * 0.1;
  
  const north = maxLat + latPadding;
  const south = minLat - latPadding;
  const east = maxLng + lngPadding;
  const west = minLng - lngPadding;
  
  return {
    north,
    south,
    east,
    west,
    center: [(north + south) / 2, (east + west) / 2],
    hasElements: true
  };
}

// Get default marker color based on user role
export function getDefaultMarkerColor(userRole: string): string {
  switch (userRole) {
    case 'Admin':
      return 'red';
    case 'Moderator':
      return 'orange';
    case 'User':
    default:
      return 'blue';
  }
}

// Privacy helper functions

/**
 * Check if a user role can access content based on privacy settings
 */
export function canRoleAccessPrivacy(privacy: PrivacySettings | undefined, userRole: 'User' | 'Ditch Rider' | 'Admin'): boolean {
  // If no privacy settings, default to allowing all roles
  if (!privacy) {
    return true;
  }

  switch (userRole) {
    case 'Admin':
      return privacy.roles.admins;
    case 'Ditch Rider':
      return privacy.roles.ditchRiders;
    case 'User':
      return privacy.roles.users;
    default:
      return false;
  }
}

/**
 * Get a human-readable privacy display string
 */
export function getPrivacyDisplayString(privacy: PrivacySettings | undefined): string {
  if (!privacy) {
    return 'All users';
  }

  const allowedRoles = [];
  if (privacy.roles.users) allowedRoles.push('Users');
  if (privacy.roles.ditchRiders) allowedRoles.push('Ditch Riders');
  if (privacy.roles.admins) allowedRoles.push('Admins');

  if (allowedRoles.length === 0) {
    return 'Admins only';
  }

  if (allowedRoles.length === 3) {
    return 'All users';
  }

  return allowedRoles.join(' + ');
}

