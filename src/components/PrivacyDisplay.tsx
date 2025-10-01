'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, Users, Shield, Crown, Building2 } from "lucide-react";
import { PrivacySettings } from "@/types";

interface PrivacyDisplayProps {
  value?: PrivacySettings;
  label?: string;
  onConfigure?: () => void;
  isViewMode?: boolean;
  linkedEntity?: { id: string; name: string; type: string } | null;
}

// Mock user data - in a real app this would come from an API or context
const getUserDisplayName = (userId: string): string => {
  const userMap: Record<string, string> = {
    'user-1': 'John Smith',
    'user-2': 'Jane Doe',
    'user-3': 'Mike Johnson',
    'user-4': 'Sarah Wilson',
    'user-5': 'Tom Anderson',
  };
  return userMap[userId] || `User ${userId}`;
};

export function PrivacyDisplay({ 
  value, 
  label = "Privacy", 
  onConfigure, 
  isViewMode = false,
  linkedEntity = null
}: PrivacyDisplayProps) {
  // Default privacy settings
  const defaultSettings: PrivacySettings = {
    roles: {
      users: true,
      ditchRiders: true,
      admins: true,
    },
    specificUsers: [],
    linkedEntity: false,
  };

  const settings = value || defaultSettings;

  const getRoleLabels = () => {
    const roles = [];
    if (settings.roles.users) roles.push({ label: 'Users', icon: Users });
    if (settings.roles.ditchRiders) roles.push({ label: 'Ditch Riders', icon: Shield });
    if (settings.roles.admins) roles.push({ label: 'Admins', icon: Crown });
    return roles;
  };

  const getSpecificUsers = () => {
    if (!settings.specificUsers || settings.specificUsers.length === 0) return [];
    return settings.specificUsers.map(userId => getUserDisplayName(userId));
  };

  const roleLabels = getRoleLabels();
  const specificUsers = getSpecificUsers();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        {/* Configure button (only show if not in view mode) */}
        {!isViewMode && onConfigure && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onConfigure}
            className="h-6 w-6 p-0 hover:bg-muted flex-shrink-0"
          >
            <Settings className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      {/* Privacy settings display */}
      <div className="flex flex-wrap gap-1 items-center">
        {roleLabels.length > 0 ? (
          <>
            {roleLabels.map(({ label, icon: Icon }) => (
              <Badge key={label} variant="secondary" className="text-xs px-2 py-1">
                <Icon className="h-3 w-3 mr-1" />
                {label}
              </Badge>
            ))}
          </>
        ) : (
          <Badge variant="outline" className="text-xs px-2 py-1">
            <Crown className="h-3 w-3 mr-1" />
            Admins Only
          </Badge>
        )}
        
        {specificUsers.length > 0 && (
          <Badge variant="outline" className="text-xs px-2 py-1">
            +{specificUsers.length} user{specificUsers.length !== 1 ? 's' : ''}
          </Badge>
        )}
        
        {settings.linkedEntity && linkedEntity && (
          <Badge variant="outline" className="text-xs px-2 py-1">
            <Building2 className="h-3 w-3 mr-1" />
            {linkedEntity.name}
          </Badge>
        )}
      </div>
    </div>
  );
}
