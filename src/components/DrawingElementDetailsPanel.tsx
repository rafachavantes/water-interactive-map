'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { X, Trash2, ExternalLink, FileText, Link, XCircle, Navigation, AlertTriangle } from "lucide-react";
import { CheckCircle as CheckCircleFilled, XCircle as XCircleFilled, Warning as WarningFilled } from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import { toast } from 'sonner';
import { DrawingElement, MapElement, EntityType, FileAttachment, PrivacySettings, Issue } from "@/types";
// Local color and farm options (previously imported from deleted mapData.ts)
const colorOptions = [
  { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
  { value: 'red', label: 'Red', color: 'bg-red-500' },
  { value: 'green', label: 'Green', color: 'bg-green-500' },
  { value: 'yellow', label: 'Yellow', color: 'bg-yellow-500' },
  { value: 'purple', label: 'Purple', color: 'bg-purple-500' },
  { value: 'orange', label: 'Orange', color: 'bg-orange-500' },
];

import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { PrivacyDisplay } from "./PrivacyDisplay";
import { PrivacyConfigModal } from "./PrivacyConfigModal";
import { getDefaultMarkerColor } from '@/lib/utils';

interface DrawingElementDetailsPanelProps {
  element: DrawingElement | null;
  onClose: () => void;
  onSave: (element: DrawingElement) => void;
  onDelete?: (elementId: string) => void;
  userRole?: 'User' | 'Ditch Rider' | 'Admin';
  onApprove?: (elementId: string, reviewNotes?: string) => void;
  onReject?: (elementId: string, reviewNotes?: string) => void;
  isViewMode?: boolean;
}


const elementTypes: { value: MapElement['type']; label: string }[] = [
  { value: 'ride', label: 'Ride' },
  { value: 'canal', label: 'Canal' },
  { value: 'headgate', label: 'Headgate' },
  { value: 'meter', label: 'Meter' },
  { value: 'pump', label: 'Pump' },
  { value: 'pivot', label: 'Pivot' },
  { value: 'land', label: 'Land' },
  { value: 'hazard', label: 'Hazard' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'custom', label: 'Custom' },
];


export function DrawingElementDetailsPanel({ element, onClose, onSave, onDelete, userRole = 'User', onApprove, onReject, isViewMode = false }: DrawingElementDetailsPanelProps) {
  const [editedElement, setEditedElement] = useState(element);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [availableEntities, setAvailableEntities] = useState<EntityType[]>([]);
  const [showAddLinkInput, setShowAddLinkInput] = useState(false);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkName, setNewLinkName] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showPrivacyConfig, setShowPrivacyConfig] = useState(false);
  const [showContactPrivacyConfig, setShowContactPrivacyConfig] = useState(false);
  const [showAddIssue, setShowAddIssue] = useState(false);
  const [issueDescription, setIssueDescription] = useState('');

  // Update editedElement when element prop changes
  useEffect(() => {
    if (element) {
        // Ensure all required fields have default values
        const elementWithDefaults = {
          ...element,
          color: element.color || getDefaultMarkerColor(userRole),
          elementType: element.elementType || 'custom',
          privacy: element.privacy || {
            roles: { users: true, ditchRiders: true, admins: true },
            specificUsers: [],
            linkedEntity: false
          },
          contactPrivacy: element.contactPrivacy || {
            roles: { users: true, ditchRiders: true, admins: true },
            specificUsers: [],
            linkedEntity: false
          }
        };
      setEditedElement(elementWithDefaults);
      setIsEditingTitle(false); // Reset editing state when switching elements
    }
  }, [element, userRole]);

  // Load available entities when elementType changes
  useEffect(() => {
    if (editedElement?.elementType && !['hazard', 'maintenance', 'custom'].includes(editedElement.elementType)) {
      fetch(`/api/entities/${editedElement.elementType}`)
        .then(response => response.json())
        .then(entities => setAvailableEntities(entities))
        .catch(error => {
          console.error('Error fetching entities:', error);
          setAvailableEntities([]);
        });
    } else {
      setAvailableEntities([]);
    }
  }, [editedElement?.elementType]);

  if (!element || !editedElement) return null;

  const handleSave = () => {
    if (editedElement) {
      onSave(editedElement);
    }
  };

  const handleFieldChange = (field: string, value: string | number | boolean | Date | FileAttachment[] | PrivacySettings | Issue | undefined) => {
    const updates: Partial<DrawingElement> = {
      [field]: value,
      updatedAt: new Date()
    };

    // Automatically set category based on element type
    if (field === 'elementType') {
      const getCategoryForElementType = (elementType: string) => {
        switch (elementType) {
          case 'ride':
          case 'canal':
          case 'headgate':
            return 'infrastructure';
          case 'meter':
          case 'pump':
          case 'pivot':
            return 'monitoring';
          case 'land':
          case 'hazard':
          case 'maintenance':
          case 'custom':
          default:
            return 'other';
        }
      };
      
      updates.category = getCategoryForElementType(value as string);
      // Clear linked entity when element type changes
      updates.linkedEntityId = undefined;
    }

    const updatedElement = {
      ...editedElement,
      ...updates
    };
    
    setEditedElement(updatedElement);
    return updatedElement; // Return the updated element for immediate use
  };

  const handleAddLink = () => {
    if (!newLinkUrl.trim() || !newLinkName.trim() || !editedElement) return;

    const newLink: FileAttachment = {
      id: `link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newLinkName.trim(),
      type: 'link',
      url: newLinkUrl.trim(),
      createdAt: new Date()
    };

    const currentFiles = editedElement.files || [];
    const updatedElement = handleFieldChange('files', [...currentFiles, newLink]);
    if (updatedElement) {
      onSave(updatedElement);
    }

    // Reset form
    setNewLinkUrl('');
    setNewLinkName('');
    setShowAddLinkInput(false);
  };

  const handleCancelAddLink = () => {
    setNewLinkUrl('');
    setNewLinkName('');
    setShowAddLinkInput(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editedElement) return;

    // For now, we'll create a placeholder URL - in a real app you'd upload to a server
    // and get back the actual URL
    const fileUrl = URL.createObjectURL(file);
    
    const newFile: FileAttachment = {
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      type: 'file',
      url: fileUrl,
      size: file.size,
      mimeType: file.type,
      createdAt: new Date()
    };

    const currentFiles = editedElement.files || [];
    const updatedElement = handleFieldChange('files', [...currentFiles, newFile]);
    if (updatedElement) {
      onSave(updatedElement);
    }

    // Reset the file input
    event.target.value = '';
  };

  const handleRemoveFile = (fileId: string) => {
    if (!editedElement) return;

    const currentFiles = editedElement.files || [];
    const updatedFiles = currentFiles.filter(file => file.id !== fileId);
    const updatedElement = handleFieldChange('files', updatedFiles.length > 0 ? updatedFiles : undefined);
    if (updatedElement) {
      onSave(updatedElement);
    }
  };

  const handleAddIssue = () => {
    if (!issueDescription.trim() || !editedElement) return;

    const newIssue: Issue = {
      id: `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      description: issueDescription.trim(),
      createdBy: 'current-user', // In a real app, this would be the actual user ID
      createdByRole: userRole,
      createdAt: new Date()
    };

    const updatedElement = handleFieldChange('issue', newIssue);
    if (updatedElement) {
      onSave(updatedElement);
      toast.success('Issue added successfully');
    }

    // Reset form
    setIssueDescription('');
    setShowAddIssue(false);
  };

  const handleResolveIssue = () => {
    if (!editedElement || !editedElement.issue) return;

    const updatedElement = handleFieldChange('issue', undefined);
    if (updatedElement) {
      onSave(updatedElement);
      toast.success('Issue resolved');
    }
  };



  return (
    <Card className="fixed top-4 right-4 w-80 max-h-[calc(100vh-2rem)] overflow-y-auto shadow-lg z-20 p-0 gap-0">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-6 pt-6">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isViewMode ? (
            <div className={`w-5 h-5 rounded-full flex-shrink-0 ${colorOptions.find(c => c.value === (editedElement.color || 'blue'))?.color || 'bg-blue-500'}`}></div>
          ) : (
            <Select
              value={editedElement.color || 'blue'}
              onValueChange={(value) => {
                const updatedElement = handleFieldChange('color', value);
                if (updatedElement) {
                  onSave(updatedElement);
                }
              }}
            >
              <SelectTrigger className="h-8 w-8 border-none bg-transparent shadow-none hover:bg-muted hover:border-input hover:shadow-sm transition-all p-1 flex-shrink-0 [&>svg]:hidden">
                <SelectValue>
                  {(editedElement.color || 'blue') && (
                    <div className={`w-5 h-5 rounded-full ${colorOptions.find(c => c.value === (editedElement.color || 'blue'))?.color || 'bg-blue-500'}`}></div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {colorOptions.map((color) => (
                  <SelectItem key={color.value} value={color.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full ${color.color}`}></div>
                      <span className="capitalize">{color.value}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {isEditingTitle && !isViewMode ? (
            <Input
              value={editedElement.name || ''}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              onBlur={() => {
                handleSave();
                setIsEditingTitle(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave();
                  setIsEditingTitle(false);
                }
              }}
              className="text-lg font-semibold bg-transparent border-none p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Enter name"
              autoFocus
            />
          ) : (
            <CardTitle 
              className={`text-lg truncate ${!isViewMode ? 'cursor-pointer hover:text-muted-foreground' : ''} transition-colors`}
              onClick={() => !isViewMode && setIsEditingTitle(true)}
            >
              {editedElement.name || 'Untitled'}
            </CardTitle>
          )}
        </div>
        <div className="flex items-center gap-1">
          {onDelete && !isViewMode && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              className="text-gray-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          {isViewMode && (editedElement.markerPosition || editedElement.coordinates) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Use markerPosition if available, otherwise use first coordinate
                const position = editedElement.markerPosition || 
                  (Array.isArray(editedElement.coordinates[0]) ? editedElement.coordinates[0] : editedElement.coordinates);
                const [lat, lng] = position as [number, number];
                const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
                window.open(googleMapsUrl, '_blank');
              }}
              className="text-gray-500 hover:text-blue-600 hover:bg-blue-50"
              title="Get directions"
            >
              <Navigation className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {/* Approval Status Banner */}
      {editedElement.approvalStatus === 'pending' && (
        <div className="px-6 py-3 bg-white border-y border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <WarningFilled size={16} weight="fill" className="text-red-500" />
            <span className="text-sm font-medium text-gray-900">Pending Review</span>
          </div>
          
          {/* Submission details */}
          <div className="space-y-1">
            {editedElement.createdByRole && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Submitted by:</span>
                <span className="text-gray-800">{editedElement.createdByRole}</span>
              </div>
            )}
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Submitted on:</span>
              <span className="text-gray-800">{new Date(editedElement.createdAt).toLocaleDateString()} {new Date(editedElement.createdAt).toLocaleTimeString()}</span>
            </div>
          </div>
          
          {/* Admin Approval Controls */}
          {userRole === 'Admin' && (onApprove || onReject) && !isViewMode && (
            <div className="flex gap-2 w-full mt-3">
              <Button
                onClick={() => {
                  onApprove?.(editedElement.id);
                  toast.success(`"${editedElement.name || 'Untitled'}" has been approved`);
                }}
                variant="outline"
                size="sm"
                className="bg-white border-gray-200 text-black hover:bg-gray-50 flex-1"
              >
                <CheckCircleFilled size={16} weight="fill" className="mr-2 text-green-500" />
                Approve
              </Button>
              <Button
                onClick={() => setShowRejectDialog(true)}
                variant="outline"
                size="sm"
                className="bg-white border-gray-200 text-black hover:bg-gray-50 flex-1"
              >
                <XCircleFilled size={16} weight="fill" className="mr-2 text-red-500" />
                Reject
              </Button>
            </div>
          )}
        </div>
      )}


      {editedElement.approvalStatus === 'rejected' && (
        <div className="px-6 py-2 bg-red-50 border-y border-red-200">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">Rejected</span>
            {editedElement.reviewedBy && (
              <span className="text-xs text-red-600">• by {editedElement.reviewedBy}</span>
            )}
            {editedElement.reviewedAt && (
              <span className="text-xs text-red-600">
                • {new Date(editedElement.reviewedAt).toLocaleDateString()}
              </span>
            )}
          </div>
          {editedElement.reviewNotes && (
            <p className="text-xs text-red-700 mt-1">{editedElement.reviewNotes}</p>
          )}
        </div>
      )}

      {/* Issues Section - Only show for element types other than maintenance and hazard */}
      {editedElement.elementType && !['maintenance', 'hazard'].includes(editedElement.elementType) && 
       (!isViewMode || editedElement.issue) && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Issues</h3>
            {!editedElement.issue && !showAddIssue && !isViewMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddIssue(true)}
                className="text-xs"
              >
                Add Issue
              </Button>
            )}
          </div>

          {editedElement.issue ? (
            <div className="space-y-3">
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-amber-800">{editedElement.issue.description}</p>
                  <div className="text-xs text-amber-600 mt-1">
                    Reported by {editedElement.issue.createdByRole} on {new Date(editedElement.issue.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              {userRole === 'Admin' && !isViewMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResolveIssue}
                  className="w-full"
                >
                  <CheckCircleFilled size={16} weight="fill" className="mr-2 text-green-600" />
                  Resolve Issue
                </Button>
              )}
            </div>
          ) : showAddIssue ? (
            <div className="space-y-3">
              <Textarea
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                placeholder="Describe the issue..."
                className="min-h-[80px] text-sm"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleAddIssue}
                  disabled={!issueDescription.trim()}
                  className="flex-1"
                >
                  Save Issue
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowAddIssue(false);
                    setIssueDescription('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No issues reported</p>
          )}
        </div>
      )}
      
      <CardContent className="space-y-0 pt-0 px-6 pb-6 gap-0">
        <Accordion type="multiple" defaultValue={["basic", "contact", "water-data"]} className="w-full">
          <AccordionItem value="basic">
            <AccordionTrigger className="text-sm font-semibold">
              Details
            </AccordionTrigger>
            <AccordionContent className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-muted-foreground">Type</label>
                {isViewMode ? (
                  <span className="text-sm">
                    {elementTypes.find(type => type.value === (editedElement.elementType || 'custom'))?.label || 'Custom'}
                  </span>
                ) : (
                  <Select
                    value={editedElement.elementType || 'custom'}
                    onValueChange={(value) => {
                      const updatedElement = handleFieldChange('elementType', value);
                      if (updatedElement) {
                        onSave(updatedElement);
                      }
                    }}
                  >
                    <SelectTrigger className="h-8 w-40 border-none bg-transparent shadow-none hover:bg-muted hover:border-input hover:shadow-sm transition-all">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {elementTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              
              {/* Secondary dropdown for entity linking */}
              {editedElement.elementType && !['hazard', 'maintenance', 'custom'].includes(editedElement.elementType) && (
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-muted-foreground">Link to</label>
                  {isViewMode ? (
                    <span className="text-sm">
                      {editedElement.linkedEntityId 
                        ? availableEntities.find(entity => entity.id === editedElement.linkedEntityId)?.name || 'Unknown Entity'
                        : 'None'
                      }
                    </span>
                  ) : (
                    <Select
                      value={editedElement.linkedEntityId || 'none'}
                      onValueChange={(value) => {
                        const linkedEntityId = value === 'none' ? undefined : value;
                        let updatedElement = handleFieldChange('linkedEntityId', linkedEntityId);
                        
                        // Populate contact information from linked entity
                        if (linkedEntityId && updatedElement) {
                          const linkedEntity = availableEntities.find(entity => entity.id === linkedEntityId);
                          console.log('Found linked entity:', linkedEntity);
                          if (linkedEntity) {
                            console.log('Contact fields:', {
                              contactName: linkedEntity.contactName,
                              contactPhone: linkedEntity.contactPhone,
                              contactEmail: linkedEntity.contactEmail,
                              contactRole: linkedEntity.contactRole
                            });
                            updatedElement = {
                              ...updatedElement,
                              contactName: linkedEntity.contactName,
                              contactPhone: linkedEntity.contactPhone,
                              contactEmail: linkedEntity.contactEmail,
                              contactRole: linkedEntity.contactRole,
                              updatedAt: new Date()
                            };
                            setEditedElement(updatedElement);
                          } else {
                            console.log('No linked entity found for ID:', linkedEntityId);
                          }
                        } else if (!linkedEntityId && updatedElement) {
                          // Clear contact information when unlinking
                          updatedElement = {
                            ...updatedElement,
                            contactName: undefined,
                            contactPhone: undefined,
                            contactEmail: undefined,
                            contactRole: undefined,
                            updatedAt: new Date()
                          };
                          setEditedElement(updatedElement);
                        }
                        
                        if (updatedElement) {
                          onSave(updatedElement);
                        }
                      }}
                    >
                      <SelectTrigger className="h-8 w-40 border-none bg-transparent shadow-none hover:bg-muted hover:border-input hover:shadow-sm transition-all">
                        <SelectValue placeholder={`Select ${editedElement.elementType}`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {availableEntities.map((entity) => (
                          <SelectItem key={entity.id} value={entity.id}>
                            {entity.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}
              
              
              
              {/* Max Flow display for linked canals and headgates */}
              {editedElement.linkedEntityId && availableEntities.length > 0 && 
               editedElement.elementType && ['canal', 'headgate'].includes(editedElement.elementType) && (
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-muted-foreground">Max Flow</label>
                  {isViewMode ? (
                    <span className="text-sm h-8 w-40 text-right break-words bg-transparent">
                      {(() => {
                        const linkedEntity = availableEntities.find(entity => entity.id === editedElement.linkedEntityId);
                        if (linkedEntity && 'maxFlow' in linkedEntity && linkedEntity.maxFlow) {
                          return `${linkedEntity.maxFlow} CFS`;
                        }
                        return 'N/A';
                      })()}
                    </span>
                  ) : (
                    <span className="text-sm h-8 w-40 text-left break-words bg-transparent px-3">
                      {(() => {
                        const linkedEntity = availableEntities.find(entity => entity.id === editedElement.linkedEntityId);
                        if (linkedEntity && 'maxFlow' in linkedEntity && linkedEntity.maxFlow) {
                          return `${linkedEntity.maxFlow} CFS`;
                        }
                        return 'N/A';
                      })()}
                    </span>
                  )}
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                {isViewMode ? (
                  <span className="text-sm max-w-40 text-right break-words">
                    {editedElement.description || 'No description'}
                  </span>
                ) : (
                  <Input
                    value={editedElement.description || ''}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    onBlur={handleSave}
                    placeholder="Some short description"
                    className="h-8 w-40 border-none bg-transparent shadow-none hover:bg-muted hover:border-input hover:shadow-sm transition-all"
                  />
                )}
              </div>
              
              <PrivacyDisplay
                label="Privacy"
                value={editedElement.privacy}
                onConfigure={() => setShowPrivacyConfig(true)}
                isViewMode={isViewMode}
                linkedEntity={editedElement.linkedEntityId && availableEntities.length > 0 
                  ? {
                      id: editedElement.linkedEntityId,
                      name: availableEntities.find(entity => entity.id === editedElement.linkedEntityId)?.name || 'Unknown Entity',
                      type: editedElement.elementType || 'unknown'
                    }
                  : null
                }
              />

            </AccordionContent>
          </AccordionItem>
          
          {/* Contact section for infrastructure elements */}
          {editedElement.elementType && ['canal', 'ride', 'headgate', 'land'].includes(editedElement.elementType) && (
            <AccordionItem value="contact">
              <AccordionTrigger className="text-sm font-semibold">
                Contact Information
              </AccordionTrigger>
              <AccordionContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  {isViewMode ? (
                    <span className="text-sm max-w-40 text-right break-words">
                      {editedElement.contactName || 'No contact name'}
                    </span>
                  ) : (
                    <Input
                      value={editedElement.contactName || ''}
                      onChange={(e) => handleFieldChange('contactName', e.target.value)}
                      onBlur={handleSave}
                      placeholder="Contact person name"
                      className="h-8 w-40 border-none bg-transparent shadow-none hover:bg-muted hover:border-input hover:shadow-sm transition-all"
                    />
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-muted-foreground">Role</label>
                  {isViewMode ? (
                    <span className="text-sm max-w-40 text-right break-words">
                      {editedElement.contactRole || 'No role specified'}
                    </span>
                  ) : (
                    <Input
                      value={editedElement.contactRole || ''}
                      onChange={(e) => handleFieldChange('contactRole', e.target.value)}
                      onBlur={handleSave}
                      placeholder="e.g., Canal Owner, Ditch Rider"
                      className="h-8 w-40 border-none bg-transparent shadow-none hover:bg-muted hover:border-input hover:shadow-sm transition-all"
                    />
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  {isViewMode ? (
                    <span className="text-sm max-w-40 text-right break-words">
                      {editedElement.contactPhone || 'No phone number'}
                    </span>
                  ) : (
                    <Input
                      value={editedElement.contactPhone || ''}
                      onChange={(e) => handleFieldChange('contactPhone', e.target.value)}
                      onBlur={handleSave}
                      placeholder="(555) 123-4567"
                      type="tel"
                      className="h-8 w-40 border-none bg-transparent shadow-none hover:bg-muted hover:border-input hover:shadow-sm transition-all"
                    />
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  {isViewMode ? (
                    <span className="text-sm max-w-40 text-right break-words">
                      {editedElement.contactEmail || 'No email address'}
                    </span>
                  ) : (
                    <Input
                      value={editedElement.contactEmail || ''}
                      onChange={(e) => handleFieldChange('contactEmail', e.target.value)}
                      onBlur={handleSave}
                      placeholder="contact@example.com"
                      type="email"
                      className="h-8 w-40 border-none bg-transparent shadow-none hover:bg-muted hover:border-input hover:shadow-sm transition-all"
                    />
                  )}
                </div>
                
                <PrivacyDisplay
                  label="Contact Privacy"
                  value={editedElement.contactPrivacy}
                  onConfigure={() => setShowContactPrivacyConfig(true)}
                  isViewMode={isViewMode}
                  linkedEntity={editedElement.linkedEntityId && availableEntities.length > 0 
                    ? {
                        id: editedElement.linkedEntityId,
                        name: availableEntities.find(entity => entity.id === editedElement.linkedEntityId)?.name || 'Unknown Entity',
                        type: editedElement.elementType || 'unknown'
                      }
                    : null
                  }
                />
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Show water data only for water-related element types */}
          {editedElement.elementType && !['maintenance', 'land', 'custom', 'hazard'].includes(editedElement.elementType) && (
            <AccordionItem value="water-data">
              <AccordionTrigger className="text-sm font-semibold">
                Water data
              </AccordionTrigger>
              <AccordionContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-muted-foreground">Order</label>
                  {isViewMode ? (
                    <span className="text-sm">
                      {editedElement.order || '0.0'}
                    </span>
                  ) : (
                    <Input
                      type="number"
                      value={editedElement.order || ''}
                      onChange={(e) => handleFieldChange('order', e.target.value ? parseFloat(e.target.value) : undefined)}
                      onBlur={handleSave}
                      placeholder="0.0"
                      step="0.1"
                      min="0"
                      className="h-8 w-40 border-none bg-transparent shadow-none hover:bg-muted hover:border-input hover:shadow-sm transition-all"
                    />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-muted-foreground">Live</label>
                  {isViewMode ? (
                    <span className="text-sm">
                      {editedElement.cfs || '0.0'}
                    </span>
                  ) : (
                    <Input
                      type="number"
                      value={editedElement.cfs || ''}
                      onChange={(e) => handleFieldChange('cfs', e.target.value ? parseFloat(e.target.value) : undefined)}
                      onBlur={handleSave}
                      placeholder="0.0"
                      step="0.1"
                      min="0"
                      className="h-8 w-40 border-none bg-transparent shadow-none hover:bg-muted hover:border-input hover:shadow-sm transition-all"
                    />
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
          
          <AccordionItem value="files-links">
            <AccordionTrigger className="text-sm font-semibold">
              Files & Links ({(editedElement.files || []).length})
            </AccordionTrigger>
            <AccordionContent className="space-y-2">
              {editedElement.files && editedElement.files.length > 0 ? (
                <div className="space-y-2">
                  {editedElement.files.map((file) => (
                    <div key={file.id} className="group flex items-center justify-between p-2 rounded border bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {file.type === 'link' ? (
                          <Link className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{file.name}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {file.type === 'file' && file.size ? (
                              `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                            ) : (
                              file.url
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-muted"
                          onClick={() => window.open(file.url, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                        {!isViewMode && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-muted"
                            onClick={() => handleRemoveFile(file.id)}
                          >
                            <Trash2 className="h-3 w-3 text-muted-foreground" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No files or links attached.
                </div>
              )}
              {showAddLinkInput ? (
                <div className="space-y-2 p-3 border rounded-md bg-muted/30">
                  <div className="space-y-2">
                    <Input
                      value={newLinkName}
                      onChange={(e) => setNewLinkName(e.target.value)}
                      placeholder="Link name"
                      className="h-8"
                    />
                    <Input
                      value={newLinkUrl}
                      onChange={(e) => setNewLinkUrl(e.target.value)}
                      placeholder="https://example.com"
                      type="url"
                      className="h-8"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleAddLink}
                      disabled={!newLinkUrl.trim() || !newLinkName.trim()}
                      className="flex-1"
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelAddLink}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : !isViewMode ? (
                <div className="flex gap-2">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    id="file-upload"
                    accept="*/*"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Add File
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setShowAddLinkInput(true)}
                  >
                    <Link className="h-4 w-4 mr-2" />
                    Add Link
                  </Button>
                </div>
              ) : null}
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="notes">
            <AccordionTrigger className="text-sm font-semibold">
              Notes
            </AccordionTrigger>
            <AccordionContent className="space-y-2">
              {isViewMode ? (
                <div className="min-h-[100px] text-sm text-muted-foreground whitespace-pre-wrap p-2 rounded border bg-muted/30">
                  {editedElement.notes || 'No notes available'}
                </div>
              ) : (
                <Textarea
                  value={editedElement.notes || ''}
                  onChange={(e) => handleFieldChange('notes', e.target.value)}
                  onBlur={handleSave}
                  placeholder="Add notes about this element..."
                  className="min-h-[100px] resize-y border-none bg-transparent shadow-none hover:bg-muted hover:border-input hover:shadow-sm transition-all"
                />
              )}
            </AccordionContent>
          </AccordionItem>
          

          <AccordionItem value="metadata">
            <AccordionTrigger className="text-sm font-semibold">
              Metadata
            </AccordionTrigger>
            <AccordionContent className="space-y-2">
              <div className="text-sm">
                {editedElement.createdByRole && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created by:</span>
                    <span>{editedElement.createdByRole}</span>
                  </div>
                )}
                <div className="flex justify-between mt-1">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{new Date(editedElement.createdAt).toLocaleDateString()} {new Date(editedElement.createdAt).toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-muted-foreground">Modified:</span>
                  <span>{new Date(editedElement.updatedAt).toLocaleDateString()} {new Date(editedElement.updatedAt).toLocaleTimeString()}</span>
                </div>
                {editedElement.approvalStatus === 'approved' && editedElement.reviewedBy && (
                  <div className="flex justify-between mt-1">
                    <span className="text-muted-foreground">Approved by:</span>
                    <span>{editedElement.reviewedBy}</span>
                  </div>
                )}
                {editedElement.approvalStatus === 'approved' && editedElement.reviewedAt && (
                  <div className="flex justify-between mt-1">
                    <span className="text-muted-foreground">Approved:</span>
                    <span>{new Date(editedElement.reviewedAt).toLocaleDateString()} {new Date(editedElement.reviewedAt).toLocaleTimeString()}</span>
                  </div>
                )}
                <div className="flex justify-between mt-1">
                  <span className="text-muted-foreground">Drawing ID:</span>
                  <span className="font-mono text-xs">{editedElement.id.split('_').pop()}</span>
                </div>
                {editedElement.lastUpdated && (
                  <div className="flex justify-between mt-1">
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span>{new Date(editedElement.lastUpdated).toLocaleDateString()} {new Date(editedElement.lastUpdated).toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={() => onDelete && onDelete(editedElement.id)}
        element={editedElement}
        elementType="drawing"
      />

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Drawing Element</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject &quot;{editedElement.name || 'Untitled'}&quot;? 
              Please provide a reason for the rejection to help the creator understand what needs to be improved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Reason for rejection (required)..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowRejectDialog(false);
              setRejectReason('');
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onReject?.(editedElement.id, rejectReason);
                setShowRejectDialog(false);
                setRejectReason('');
              }}
              disabled={!rejectReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              Reject Element
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Privacy Configuration Modals */}
      <PrivacyConfigModal
        open={showPrivacyConfig}
        onOpenChange={setShowPrivacyConfig}
        value={editedElement.privacy}
        onChange={(settings) => {
          const updatedElement = handleFieldChange('privacy', settings);
          if (updatedElement) {
            onSave(updatedElement);
          }
        }}
        userRole={userRole}
        title="Configure Element Privacy"
        linkedEntity={editedElement.linkedEntityId && availableEntities.length > 0 
          ? {
              id: editedElement.linkedEntityId,
              name: availableEntities.find(entity => entity.id === editedElement.linkedEntityId)?.name || 'Unknown Entity',
              type: editedElement.elementType || 'unknown'
            }
          : null
        }
      />

      <PrivacyConfigModal
        open={showContactPrivacyConfig}
        onOpenChange={setShowContactPrivacyConfig}
        value={editedElement.contactPrivacy}
        onChange={(settings) => {
          const updatedElement = handleFieldChange('contactPrivacy', settings);
          if (updatedElement) {
            onSave(updatedElement);
          }
        }}
        userRole={userRole}
        title="Configure Contact Privacy"
        linkedEntity={editedElement.linkedEntityId && availableEntities.length > 0 
          ? {
              id: editedElement.linkedEntityId,
              name: availableEntities.find(entity => entity.id === editedElement.linkedEntityId)?.name || 'Unknown Entity',
              type: editedElement.elementType || 'unknown'
            }
          : null
        }
      />
      
    </Card>
  );
}
