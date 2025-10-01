'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DrawingElement, MapElement } from "@/types";

interface DeleteConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  element?: DrawingElement | MapElement | null;
  elementType?: 'drawing' | 'map';
}

export function DeleteConfirmationModal({
  open,
  onOpenChange,
  onConfirm,
  element,
  elementType = 'drawing'
}: DeleteConfirmationModalProps) {
  if (!element) return null;

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const getElementName = () => {
    if (elementType === 'drawing') {
      const drawingElement = element as DrawingElement;
      return drawingElement.name || getDefaultNameForDrawingType(drawingElement.type);
    }
    return (element as MapElement).name || 'Unnamed Element';
  };

  const getDefaultNameForDrawingType = (type: DrawingElement['type']): string => {
    switch (type) {
      case 'line': return 'unnamed line';
      case 'polyline': return 'unnamed line';
      case 'polygon': return 'unnamed area';
      case 'point': return 'unnamed point';
      default: return 'unnamed element';
    }
  };

  const getElementType = () => {
    if (elementType === 'drawing') {
      const drawingElement = element as DrawingElement;
      return drawingElement.elementType || drawingElement.type;
    }
    return (element as MapElement).type;
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {elementType === 'drawing' ? 'Drawing' : 'Map'} Element</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span className="block">
              Are you sure you want to delete <strong>&ldquo;{getElementName()}&rdquo;</strong>?
            </span>
            <span className="block text-sm text-muted-foreground">
              Type: {getElementType()} • This action cannot be undone.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-white"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
