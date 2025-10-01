'use client';

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, PanelLeftClose } from "lucide-react";
import { FilterState, FilterUpdate, MapElement, DrawingElement } from '@/types';

import { useState, useMemo } from 'react';

interface LayerFiltersProps {
  onFilterChange: (filters: FilterUpdate) => void;
  onClose: () => void;
  filterState: FilterState;
  drawingElements: DrawingElement[];
  userRole?: 'User' | 'Ditch Rider' | 'Admin';
  pendingReviewCount?: number;
}

export function LayerFilters({ onFilterChange, onClose, filterState, drawingElements, userRole = 'User', pendingReviewCount = 0 }: LayerFiltersProps) {
  const [searchQuery, setSearchQuery] = useState(filterState.searchQuery || '');

  // Group drawing elements by category and type
  const categorizedData = useMemo(() => {
    // First group drawing elements by category and elementType
    const byCategory = drawingElements.reduce((acc, element) => {
      // Use element's category or default to 'other'
      const category = element.category || 'other';
      // Use elementType (like 'meter', 'pump') or fallback to drawing type ('line', 'point', etc.)
      const type = element.elementType || element.type;
      
      if (!acc[category]) {
        acc[category] = {} as Record<string, DrawingElement[]>;
      }
      if (!acc[category][type]) {
        acc[category][type] = [];
      }
      acc[category][type].push(element);
      return acc;
    }, {} as Record<string, Record<string, DrawingElement[]>>);

    // Define the filter structure
    const filterCategories = [
      {
        id: 'infrastructure',
        name: 'Infrastructure',
        types: [
          { id: 'ride' as const, name: 'Rides' },
          { id: 'canal' as const, name: 'Canals' },
          { id: 'headgate' as const, name: 'Headgates' }
        ]
      },
      {
        id: 'monitoring',
        name: 'Monitoring',
        types: [
          { id: 'meter' as const, name: 'Meters' },
          { id: 'pump' as const, name: 'Pumps' },
          { id: 'pivot' as const, name: 'Pivots' }
        ]
      },
      {
        id: 'other',
        name: 'Other',
        types: [
          { id: 'land' as const, name: 'Land' },
          { id: 'hazard' as const, name: 'Hazards' },
          { id: 'maintenance' as const, name: 'Maintenance' },
          { id: 'custom' as const, name: 'Custom' }
        ]
      }
    ];

    // Build the result structure with counts and items
    return filterCategories.map(category => ({
      ...category,
      types: category.types.map(type => ({
        ...type,
        count: byCategory[category.id]?.[type.id]?.length || 0,
        items: (byCategory[category.id]?.[type.id] || []).map(element => ({
          id: element.id,
          name: element.name,
          visible: filterState.items[element.id] !== false, // Default to visible
          element
        }))
      }))
    }));
  }, [drawingElements, filterState.items]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onFilterChange({ searchQuery: value });
  };

  const handleCategoryToggle = (categoryType: MapElement['type'] | DrawingElement['type'], checked: boolean) => {
    onFilterChange({ type: categoryType, checked });
  };

  const handleItemToggle = (itemId: string, checked: boolean) => {
    onFilterChange({ item: itemId, checked });
  };

  const handlePendingReviewToggle = (checked: boolean) => {
    // Update the filter state to show only pending review items
    const update: FilterUpdate = {
      showPendingReview: checked,
    };
    onFilterChange(update);
  };

  return (
    <div className="w-64 bg-background border-r border-border h-full overflow-y-auto">
      {/* Header with title and close button */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Layers</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-muted"
            title="Close panel"
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search map elements"
            className="pl-10"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex-1 pt-4">
        {/* To Review Filter - Only show for admins */}
        {userRole === 'Admin' && pendingReviewCount > 0 && (
          <div className="mb-6 px-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="pending-review-filter"
                  checked={filterState.showPendingReview === true}
                  onCheckedChange={handlePendingReviewToggle}
                />
                <label
                  htmlFor="pending-review-filter"
                  className="text-sm font-medium text-red-800 cursor-pointer flex-1"
                >
                  To Review
                </label>
                <div className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {pendingReviewCount > 99 ? '99+' : pendingReviewCount}
                </div>
              </div>
              {filterState.showPendingReview && (
                <p className="text-xs text-red-600 mt-2">
                  Showing markers that need admin review
                </p>
              )}
            </div>
          </div>
        )}
        {categorizedData.map((category) => (
          <div key={category.id} className="mb-4">
            {/* Category Header */}
            <h3 className="text-xs font-semibold text-muted-foreground mb-2 px-4 uppercase tracking-wide">
              {category.name}
            </h3>
            
            {/* Types in this category */}
            <div className="space-y-0">
              {category.types.map((type) => (
                <div key={type.id} className="border-b border-border/10 last:border-b-0">
                  {type.items.length > 0 ? (
                    <details className="group">
                      <summary className="cursor-pointer list-none py-2 px-4 hover:bg-muted/30 transition-colors min-h-[40px] flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <Checkbox
                            checked={filterState.types[type.id as keyof typeof filterState.types] === true}
                            onCheckedChange={(checked) => {
                              handleCategoryToggle(type.id as keyof typeof filterState.types, checked as boolean);
                            }}
                          />
                          <span className="text-sm font-medium">{type.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground text-sm">
                            {type.count}
                          </span>
                          <svg 
                            className="w-4 h-4 transition-transform group-open:rotate-180 text-muted-foreground" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </summary>
                      <div className="space-y-0 bg-muted/20">
                        {type.items.length === 0 ? (
                          <div className="text-sm text-muted-foreground py-1.5 px-4 ml-6">
                            No items available
                          </div>
                        ) : (
                          type.items.map((item: { id: string; name: string; visible: boolean; element: DrawingElement }) => (
                            <div key={item.id} className="flex items-center hover:bg-muted/50 py-1.5 px-4 ml-6 transition-colors">
                              <Checkbox
                                id={item.id}
                                checked={item.visible}
                                onCheckedChange={(checked) => {
                                  handleItemToggle(item.id, checked as boolean);
                                }}
                              />
                              <label
                                htmlFor={item.id}
                                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1 ml-3"
                              >
                                {item.name}
                              </label>
                            </div>
                          ))
                        )}
                      </div>
                    </details>
                  ) : (
                    <div className="flex items-center justify-between py-2 px-4 hover:bg-muted/30 transition-colors min-h-[40px]">
                      <div className="flex items-center gap-3 flex-1">
                        <Checkbox
                          checked={filterState.types[type.id as keyof typeof filterState.types] === true}
                          onCheckedChange={(checked) => {
                            handleCategoryToggle(type.id as keyof typeof filterState.types, checked as boolean);
                          }}
                        />
                        <span className="text-sm font-medium">{type.name}</span>
                      </div>
                      <span className="text-muted-foreground text-sm">
                        {type.count}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
