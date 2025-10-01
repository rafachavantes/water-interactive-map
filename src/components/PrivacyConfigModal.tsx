'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Search, User, Users, Shield, Crown, Building2 } from "lucide-react";
import { PrivacySettings } from "@/types";

interface PrivacyConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value?: PrivacySettings;
  onChange: (settings: PrivacySettings) => void;
  userRole?: 'User' | 'Ditch Rider' | 'Admin';
  title?: string;
  linkedEntity?: { id: string; name: string; type: string } | null;
}

// Mock user search function - in a real app this would call an API
const searchUsers = async (query: string): Promise<{ id: string; name: string; role: string }[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const mockUsers = [
    { id: 'user-1', name: 'John Smith', role: 'User' },
    { id: 'user-2', name: 'Jane Doe', role: 'User' },
    { id: 'user-3', name: 'Mike Johnson', role: 'Ditch Rider' },
    { id: 'user-4', name: 'Sarah Wilson', role: 'User' },
    { id: 'user-5', name: 'Tom Anderson', role: 'Ditch Rider' },
  ];
  
  return mockUsers.filter(user => 
    user.name.toLowerCase().includes(query.toLowerCase()) ||
    user.role.toLowerCase().includes(query.toLowerCase())
  );
};

export function PrivacyConfigModal({ 
  open, 
  onOpenChange, 
  value, 
  onChange, 
  userRole = 'User',
  title = "Configure Privacy Settings",
  linkedEntity = null
}: PrivacyConfigModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: string; name: string; role: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [localSettings, setLocalSettings] = useState<PrivacySettings>({
    roles: { users: true, ditchRiders: true, admins: true },
    specificUsers: [],
    linkedEntity: false
  });

  // Initialize local settings when modal opens or value changes
  useEffect(() => {
    if (value) {
      setLocalSettings(value);
    } else {
      setLocalSettings({
        roles: { users: true, ditchRiders: true, admins: true },
        specificUsers: [],
        linkedEntity: false
      });
    }
  }, [value, open]);

  // User search effect
  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchUsers(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching users:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleRoleChange = (role: keyof PrivacySettings['roles'], checked: boolean) => {
    if (role === 'admins') return; // Admins are always checked and disabled

    setLocalSettings(prev => ({
      ...prev,
      roles: {
        ...prev.roles,
        [role]: checked,
      },
    }));
  };

  const handleLinkedEntityChange = (checked: boolean) => {
    setLocalSettings(prev => ({
      ...prev,
      linkedEntity: checked,
    }));
  };

  const handleUserAdd = (user: { id: string; name: string; role: string }) => {
    if (localSettings.specificUsers?.includes(user.id)) return;

    setLocalSettings(prev => ({
      ...prev,
      specificUsers: [...(prev.specificUsers || []), user.id],
    }));
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleUserRemove = (userId: string) => {
    setLocalSettings(prev => ({
      ...prev,
      specificUsers: prev.specificUsers?.filter(id => id !== userId) || [],
    }));
  };

  const handleSave = () => {
    onChange(localSettings);
    onOpenChange(false);
  };

  const handleCancel = () => {
    // Reset to original value
    if (value) {
      setLocalSettings(value);
    }
    onOpenChange(false);
  };

  const getDisplayNames = (userIds: string[]): string[] => {
    const userMap: Record<string, string> = {
      'user-1': 'John Smith',
      'user-2': 'Jane Doe',
      'user-3': 'Mike Johnson',
      'user-4': 'Sarah Wilson',
      'user-5': 'Tom Anderson',
    };
    return userIds.map(id => userMap[id] || `User ${id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Role Selection */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Visible to:</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="privacy-users"
                  checked={localSettings.roles.users}
                  onCheckedChange={(checked) => handleRoleChange('users', checked as boolean)}
                />
                <label htmlFor="privacy-users" className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  All Users
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="privacy-ditch-riders"
                  checked={localSettings.roles.ditchRiders}
                  onCheckedChange={(checked) => handleRoleChange('ditchRiders', checked as boolean)}
                />
                <label htmlFor="privacy-ditch-riders" className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Ditch Riders
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="privacy-admins"
                  checked={localSettings.roles.admins}
                  disabled={true}
                />
                <label htmlFor="privacy-admins" className="text-sm text-muted-foreground flex items-center gap-2">
                  <Crown className="h-4 w-4" />
                  Admins (always visible)
                </label>
              </div>
              
              {/* Linked Entity (if available) */}
              {linkedEntity && (
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="privacy-linked-entity"
                    checked={localSettings.linkedEntity || false}
                    onCheckedChange={(checked) => handleLinkedEntityChange(checked as boolean)}
                  />
                  <label htmlFor="privacy-linked-entity" className="text-sm flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {linkedEntity.name} ({linkedEntity.type})
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Specific Users (Admin only) */}
          {userRole === 'Admin' && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Additional Users:</h4>
              
              {/* User Search */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users to add..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                
                {isSearching && (
                  <div className="text-sm text-muted-foreground">Searching...</div>
                )}
                
                {searchResults.length > 0 && (
                  <div className="max-h-32 overflow-y-auto space-y-1 border rounded-md p-2">
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-2 hover:bg-muted/50 rounded cursor-pointer"
                        onClick={() => handleUserAdd(user)}
                      >
                        <div>
                          <div className="text-sm font-medium">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.role}</div>
                        </div>
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Users */}
              {localSettings.specificUsers && localSettings.specificUsers.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Selected Users:</div>
                  <div className="flex flex-wrap gap-1">
                    {getDisplayNames(localSettings.specificUsers).map((name, index) => (
                      <Badge key={localSettings.specificUsers![index]} variant="secondary" className="text-xs">
                        {name}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-3 w-3 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => handleUserRemove(localSettings.specificUsers![index])}
                        >
                          <X className="h-2 w-2" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
