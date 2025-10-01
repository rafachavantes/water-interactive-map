'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Minus, PenTool, Square, MapPin, MousePointer2, Edit3, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { DrawingDoneButton } from "./DrawingDoneButton";

type UserRole = 'User' | 'Ditch Rider' | 'Admin';

interface DrawingToolsProps {
  onToolSelect: (tool: string | null) => void;
  activeTool: string | null;
  drawingState?: {
    isDrawing: boolean;
    currentPath: [number, number][];
    drawingMode: string | null;
  };
  onDrawingDone?: () => void;
  onDrawingCancel?: () => void;
  isEditMode: boolean;
  onModeToggle: () => void;
  viewAsRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export function DrawingTools({ onToolSelect, activeTool, onDrawingDone, onDrawingCancel, isEditMode, onModeToggle, viewAsRole, onRoleChange }: DrawingToolsProps) {
  // Get current drawing state from global window object (updated by DrawingOverlay)
  const [currentDrawingState, setCurrentDrawingState] = useState({
    isDrawing: false,
    currentPath: [],
    drawingMode: null
  });

  // Listen for drawing state change events (much better than polling!)
  useEffect(() => {
    const handleDrawingStateChange = (event: CustomEvent) => {
      setCurrentDrawingState(event.detail);
    };

    // Listen for custom events
    window.addEventListener('drawingStateChanged', handleDrawingStateChange as EventListener);
    
    return () => {
      window.removeEventListener('drawingStateChanged', handleDrawingStateChange as EventListener);
    };
  }, []);

  // Determine if we should show the done button
  const shouldShowDoneButton = Boolean(currentDrawingState && 
    currentDrawingState.isDrawing && 
    currentDrawingState.drawingMode && 
    ['line', 'draw', 'area'].includes(currentDrawingState.drawingMode) &&
    (
      (currentDrawingState.drawingMode === 'line' && currentDrawingState.currentPath.length >= 2) ||
      (currentDrawingState.drawingMode === 'draw' && currentDrawingState.currentPath.length >= 2) ||
      (currentDrawingState.drawingMode === 'area' && currentDrawingState.currentPath.length >= 3)
    ));

  // When done button is shown, other tools should be disabled
  const areOtherToolsDisabled = shouldShowDoneButton;

  const allTools = [
    {
      id: 'move',
      name: 'Select',
      icon: MousePointer2,
      description: 'Select elements and navigate the map'
    },
    {
      id: 'line',
      name: 'Line',
      icon: Minus,
      description: 'Draw straight lines'
    },
    {
      id: 'draw',
      name: 'Draw',
      icon: PenTool,
      description: 'Freehand drawing'
    },
    {
      id: 'area',
      name: 'Area',
      icon: Square,
      description: 'Draw rectangular areas'
    },
    {
      id: 'point',
      name: 'Point',
      icon: MapPin,
      description: 'Add point coordinates'
    }
  ];

  // Filter tools based on role - Users only get move and point tools
  const tools = viewAsRole === 'User' 
    ? allTools.filter(tool => ['move', 'point'].includes(tool.id))
    : allTools;

  return (
    <Card className="fixed bottom-6 left-1/2 transform -translate-x-1/2 p-2 shadow-lg z-10 max-w-[calc(100vw-2rem)] overflow-x-auto">
      <div className="flex items-center gap-1 min-w-max">
        {/* Edit/View Mode Toggle - iOS Style - Hidden when drawing */}
        {!shouldShowDoneButton && (
          <div className="flex items-center bg-secondary rounded-lg p-1 mr-2">
              <Button
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center gap-1 h-auto py-2 px-2 sm:px-3 min-w-[50px] ${
                isEditMode 
                  ? "bg-white text-blue-600 shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => !isEditMode && onModeToggle()}
              title="Edit Mode"
            >
              <Edit3 className="h-4 w-4" />
              <span className="text-xs hidden sm:block">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center gap-1 h-auto py-2 px-2 sm:px-3 min-w-[50px] ${
                !isEditMode 
                  ? "bg-white text-blue-600 shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => isEditMode && onModeToggle()}
              title="View Mode"
            >
              <Eye className="h-4 w-4" />
              <span className="text-xs hidden sm:block">View</span>
            </Button>
          </div>
        )}

        {/* View As Dropdown - Only show in view mode and when not drawing */}
        {!isEditMode && !shouldShowDoneButton && (
          <div className="flex items-center gap-2 mr-2">
            <span className="text-sm text-muted-foreground">View as:</span>
            <Select value={viewAsRole} onValueChange={onRoleChange}>
              <SelectTrigger className="w-32 sm:w-auto sm:min-w-[100px] h-8 text-xs sm:text-sm whitespace-nowrap">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="User">User</SelectItem>
                <SelectItem value="Ditch Rider">Ditch Rider</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Separator - Hidden when drawing */}
        {isEditMode && !shouldShowDoneButton && <div className="w-px h-8 bg-border mx-1" />}
        
        {/* Drawing Tools - Only show in edit mode */}
        {isEditMode && (
          <>
            {tools.map((tool) => {
              const Icon = tool.icon;
              const isCurrentTool = activeTool === tool.id;
              const isDisabled = areOtherToolsDisabled && !isCurrentTool;
              
              return (
                <Button
                  key={tool.id}
                  variant={isCurrentTool ? "default" : "ghost"}
                  size="sm"
                  className={`flex flex-col items-center gap-1 h-auto py-2 px-2 sm:px-3 min-w-[50px] sm:min-w-[60px] ${
                    isDisabled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={() => !isDisabled && onToolSelect(tool.id)}
                  disabled={isDisabled}
                  title={isDisabled ? "Finish current drawing first" : tool.description}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs hidden sm:block">{tool.name}</span>
                  <span className="text-xs sm:hidden">{tool.name.slice(0, 3)}</span>
                </Button>
              );
            })}
            
            {/* Done Button */}
            <DrawingDoneButton
              isVisible={shouldShowDoneButton}
              onDone={() => onDrawingDone?.()}
              onCancel={() => onDrawingCancel?.()}
            />
          </>
        )}
      </div>
    </Card>
  );
}
