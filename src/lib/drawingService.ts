import { DrawingElement } from '@/types';

class DrawingService {
  private baseUrl = '/api/drawings';

  // Load all drawings
  async loadAllDrawings(): Promise<DrawingElement[]> {
    try {
      const response = await fetch(this.baseUrl);
      if (!response.ok) {
        throw new Error(`Failed to load drawings: ${response.statusText}`);
      }
      const data = await response.json();
      return data.drawings;
    } catch (error) {
      console.error('Error loading drawings:', error);
      throw error;
    }
  }

  // Load a specific drawing by ID
  async loadDrawing(id: string): Promise<DrawingElement | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      if (response.status === 404) {
        return null;
      }
      if (!response.ok) {
        throw new Error(`Failed to load drawing: ${response.statusText}`);
      }
      const data = await response.json();
      return data.drawing;
    } catch (error) {
      console.error('Error loading drawing:', error);
      throw error;
    }
  }

  // Save a single drawing
  async saveDrawing(element: DrawingElement): Promise<void> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ drawing: element }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save drawing: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error saving drawing:', error);
      throw error;
    }
  }

  // Save multiple drawings
  async saveDrawings(elements: DrawingElement[]): Promise<void> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ drawings: elements }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save drawings: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error saving drawings:', error);
      throw error;
    }
  }

  // Update a drawing
  async updateDrawing(id: string, updates: Partial<DrawingElement>): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (response.status === 404) {
        return false;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to update drawing: ${response.statusText}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error updating drawing:', error);
      throw error;
    }
  }

  // Delete a drawing
  async deleteDrawing(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });
      
      if (response.status === 404) {
        return false;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to delete drawing: ${response.statusText}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting drawing:', error);
      throw error;
    }
  }

  // Clear all drawings
  async clearAllDrawings(): Promise<void> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to clear drawings: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error clearing drawings:', error);
      throw error;
    }
  }

  // Get drawing count (derived from loadAllDrawings)
  async getDrawingCount(): Promise<number> {
    try {
      const drawings = await this.loadAllDrawings();
      return drawings.length;
    } catch (error) {
      console.error('Error getting drawing count:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const drawingService = new DrawingService();
