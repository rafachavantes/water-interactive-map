'use client';

import { useState, useEffect } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Search, User } from "lucide-react";
import { PrivacySettings } from "@/types";

interface PrivacySettingsControlProps {
  value?: PrivacySettings;
  onChange: (settings: PrivacySettings) => void;
  isViewMode?: boolean;
  userRole?: 'User' | 'Ditch Rider' | 'Admin';
  label?: string;
}

// Mock user search function - in a real app this would call an API
const searchUsers = async (query: string): Promise<{ id: string; name: string; role: string }[]> => {
  // Simulate API delay
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

export function PrivacySettingsControl({ 
  value, 
  onChange, 
  isViewMode = false, 
  userRole = 'User',
  label = "Visibility"
}: PrivacySettingsControlProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: string; name: string; role: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);

  // Default privacy settings
  const defaultSettings: PrivacySettings = {
    roles: {
      users: true,
      ditchRiders: true,
      admins: true,
    },
    specificUsers: [],
  };

  const currentSettings = value || defaultSettings;

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

    const newSettings: PrivacySettings = {
      ...currentSettings,
      roles: {
        ...currentSettings.roles,
        [role]: checked,
      },
    };
    onChange(newSettings);
  };

  const handleUserAdd = (user: { id: string; name: string; role: string }) => {
    if (currentSettings.specificUsers?.includes(user.id)) return;

    const newSettings: PrivacySettings = {
      ...currentSettings,
      specificUsers: [...(currentSettings.specificUsers || []), user.id],
    };
    onChange(newSettings);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleUserRemove = (userId: string) => {
    const newSettings: PrivacySettings = {
      ...currentSettings,
      specificUsers: currentSettings.specificUsers?.filter(id => id !== userId) || [],
    };
    onChange(newSettings);
  };

  const getDisplayNames = (userIds: string[]): string[] => {
    // In a real app, this would fetch user names from an API or cache
    const userMap: Record<string, string> = {
      'user-1': 'John Smith',
      'user-2': 'Jane Doe',
      'user-3': 'Mike Johnson',
      'user-4': 'Sarah Wilson',
      'user-5': 'Tom Anderson',
    };
    return userIds.map(id => userMap[id] || `User ${id}`);
  };

  if (isViewMode) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        <div className="space-y-1">
          <div className="text-sm">
            <span className="font-medium">Roles: </span>
            {currentSettings.roles.users && 'Users '}
            {currentSettings.roles.ditchRiders && 'Ditch Riders '}
            {currentSettings.roles.admins && 'Admins'}
          </div>
          {currentSettings.specificUsers && currentSettings.specificUsers.length > 0 && (
            <div className="text-sm">
              <span className="font-medium">Specific Users: </span>
              {getDisplayNames(currentSettings.specificUsers).join(', ')}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      
      {/* Role Checkboxes */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="privacy-users"
            checked={currentSettings.roles.users}
            onCheckedChange={(checked) => handleRoleChange('users', checked as boolean)}
          />
          <label htmlFor="privacy-users" className="text-sm">Users</label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="privacy-ditch-riders"
            checked={currentSettings.roles.ditchRiders}
            onCheckedChange={(checked) => handleRoleChange('ditchRiders', checked as boolean)}
          />
          <label htmlFor="privacy-ditch-riders" className="text-sm">Ditch Riders</label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="privacy-admins"
            checked={currentSettings.roles.admins}
            disabled={true}
          />
          <label htmlFor="privacy-admins" className="text-sm text-muted-foreground">Admins (always visible)</label>
        </div>
      </div>

      {/* User Search (only for admins) */}
      {userRole === 'Admin' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowUserSearch(!showUserSearch)}
              className="text-xs"
            >
              <User className="h-3 w-3 mr-1" />
              Add Specific Users
            </Button>
          </div>

          {showUserSearch && (
            <div className="space-y-2 p-3 border rounded-md bg-muted/30">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>
              
              {isSearching && (
                <div className="text-sm text-muted-foreground">Searching...</div>
              )}
              
              {searchResults.length > 0 && (
                <div className="max-h-32 overflow-y-auto space-y-1">
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
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <User className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Selected Users */}
          {currentSettings.specificUsers && currentSettings.specificUsers.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">Selected Users:</div>
              <div className="flex flex-wrap gap-1">
                {getDisplayNames(currentSettings.specificUsers).map((name, index) => (
                  <Badge key={currentSettings.specificUsers![index]} variant="secondary" className="text-xs">
                    {name}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-3 w-3 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleUserRemove(currentSettings.specificUsers![index])}
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
  );
}
