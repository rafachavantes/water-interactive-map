'use client';

import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface DrawingDoneButtonProps {
  onDone: () => void;
  onCancel: () => void;
  isVisible: boolean;
}

export function DrawingDoneButton({ onDone, onCancel, isVisible }: DrawingDoneButtonProps) {
  if (!isVisible) return null;

  const handleDoneClick = () => {
    // Try to call the global handler first, fallback to onDone prop
    const globalHandler = (window as typeof window & { drawingOverlayDoneHandler?: () => void }).drawingOverlayDoneHandler;
    if (globalHandler) {
      globalHandler();
    } else if (onDone) {
      onDone();
    }
  };

  const handleCancelClick = () => {
    // Try to call the global cancel handler first, fallback to onCancel prop
    const globalCancelHandler = (window as typeof window & { drawingOverlayCancelHandler?: () => void }).drawingOverlayCancelHandler;
    if (globalCancelHandler) {
      globalCancelHandler();
    } else if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="ml-2 flex items-center">
      <div className="w-px h-8 bg-border mx-2" /> {/* Separator */}
      
      {/* Cancel Button */}
      <Button
        onClick={handleCancelClick}
        variant="outline"
        size="sm"
        className="flex flex-col items-center gap-1 h-auto py-2 px-3 mr-1"
      >
        <X className="h-4 w-4" />
        <span className="text-xs">Cancel</span>
      </Button>
      
      {/* Done Button */}
      <Button
        onClick={handleDoneClick}
        variant="default"
        size="sm"
        className="flex flex-col items-center gap-1 h-auto py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white"
      >
        <Check className="h-4 w-4" />
        <span className="text-xs">Done</span>
      </Button>
    </div>
  );
}
