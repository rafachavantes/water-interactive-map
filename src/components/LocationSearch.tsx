'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';

// Mock Idaho locations with coordinates
const idahoLocations = [
  // Major Cities
  { name: 'Boise', lat: 43.6150, lng: -116.2023, type: 'city' },
  { name: 'Meridian', lat: 43.6121, lng: -116.3915, type: 'city' },
  { name: 'Nampa', lat: 43.5407, lng: -116.5635, type: 'city' },
  { name: 'Idaho Falls', lat: 43.4666, lng: -112.0340, type: 'city' },
  { name: 'Pocatello', lat: 42.8713, lng: -112.4455, type: 'city' },
  { name: 'Caldwell', lat: 43.6629, lng: -116.6873, type: 'city' },
  { name: 'Coeur d\'Alene', lat: 47.6777, lng: -116.7805, type: 'city' },
  { name: 'Twin Falls', lat: 42.5630, lng: -114.4608, type: 'city' },
  { name: 'Lewiston', lat: 46.4165, lng: -117.0177, type: 'city' },
  { name: 'Post Falls', lat: 47.7168, lng: -116.9516, type: 'city' },
  { name: 'Grace', lat: 42.5746, lng: -111.7410, type: 'city' },

  // Counties
  { name: 'Ada County', lat: 43.4527, lng: -116.2375, type: 'county' },
  { name: 'Canyon County', lat: 43.5656, lng: -116.6089, type: 'county' },
  { name: 'Kootenai County', lat: 47.6804, lng: -116.7804, type: 'county' },
  { name: 'Bannock County', lat: 42.8046, lng: -112.3085, type: 'county' },
  { name: 'Bonneville County', lat: 43.4927, lng: -111.8860, type: 'county' },

  // Agricultural Areas
  { name: 'Snake River Plain', lat: 43.2081, lng: -114.5103, type: 'region' },
  { name: 'Magic Valley', lat: 42.5584, lng: -114.4609, type: 'region' },
  { name: 'Treasure Valley', lat: 43.6150, lng: -116.2023, type: 'region' },
  { name: 'Palouse Region', lat: 46.7298, lng: -117.1817, type: 'region' },

  // Water Features
  { name: 'Snake River', lat: 43.6150, lng: -116.2023, type: 'water' },
  { name: 'Payette River', lat: 44.0832, lng: -116.9348, type: 'water' },
  { name: 'Salmon River', lat: 45.3311, lng: -114.8165, type: 'water' },
  { name: 'Clearwater River', lat: 46.4165, lng: -117.0177, type: 'water' },
  { name: 'Bear River', lat: 42.1021, lng: -111.6982, type: 'water' },

  // Agricultural/Irrigation Areas
  { name: 'Boise River Valley', lat: 43.6150, lng: -116.2023, type: 'irrigation' },
  { name: 'Wood River Valley', lat: 43.7022, lng: -114.3668, type: 'irrigation' },
  { name: 'Bear Lake Valley', lat: 42.0963, lng: -111.3258, type: 'irrigation' },
  { name: 'Camas Prairie', lat: 43.5207, lng: -115.0024, type: 'irrigation' },
];

interface LocationSearchProps {
  onLocationSelect: (lat: number, lng: number, name: string) => void;
  className?: string;
}

export function LocationSearch({ onLocationSelect, className = '' }: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<typeof idahoLocations>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Filter locations based on query
  useEffect(() => {
    if (query.trim().length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = idahoLocations.filter(location =>
      location.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 8); // Limit to 8 suggestions

    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
    setSelectedIndex(-1);
  }, [query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleLocationSelect = (location: typeof idahoLocations[0]) => {
    setQuery(location.name);
    setShowSuggestions(false);
    onLocationSelect(location.lat, location.lng, location.name);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleLocationSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Delay hiding suggestions to allow click on suggestion
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(e.relatedTarget as Node)) {
        setShowSuggestions(false);
      }
    }, 150);
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'city':
        return '🏙️';
      case 'county':
        return '🗺️';
      case 'region':
        return '🌾';
      case 'water':
        return '💧';
      case 'irrigation':
        return '🚰';
      default:
        return '📍';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          ref={inputRef}
          placeholder="Search Idaho locations..."
          className="pl-10 pr-4 bg-white shadow-lg border border-border/20"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-border/20 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto"
        >
          {suggestions.map((location, index) => (
            <button
              key={`${location.name}-${location.lat}-${location.lng}`}
              className={`w-full px-3 py-2 text-left hover:bg-muted/50 transition-colors flex items-center gap-3 ${
                index === selectedIndex ? 'bg-muted/50' : ''
              }`}
              onClick={() => handleLocationSelect(location)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <span className="text-lg">{getLocationIcon(location.type)}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {location.name}
                </div>
                <div className="text-xs text-muted-foreground capitalize">
                  {location.type}
                </div>
              </div>
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
