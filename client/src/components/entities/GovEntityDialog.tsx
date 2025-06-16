import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Trash2, AlertTriangle, RefreshCw } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FieldValues } from "react-hook-form";
import { z } from "zod";
import { insertGovEntitySchema } from "@shared/schema";
import { toast } from "@/hooks/use-toast";
import { useDialog } from "@/hooks/useDialog";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { 
  GovEntity,
  useGovEntity, 
  useCreateGovEntity, 
  useUpdateGovEntity, 
  useDeleteGovEntity 
} from "@/hooks/use-gov-entities";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Extend the insertGovEntitySchema with client-side validations
const formSchema = insertGovEntitySchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
  entityType: z.string().min(1, "Entity type is required"),
});

// Make certain fields optional for the form
const formSchemaWithOptionals = formSchema.extend({
  arabicName: z.string().optional(),
  region: z.string().optional(),
  iconUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  websiteUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  priority: z.coerce.number().int().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
});

// Define our form's type based on the schema
type FormValues = z.infer<typeof formSchemaWithOptionals>;

interface GovEntityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityId?: number;
}

export default function GovEntityDialog({ 
  open, 
  onOpenChange,
  entityId 
}: GovEntityDialogProps) {
  const isEditing = !!entityId;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hasFormError, setHasFormError] = useState(false);
  
  // Form definition - MOVED UP to avoid reference before initialization
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchemaWithOptionals),
    defaultValues: {
      name: "",
      arabicName: "",
      entityType: "",
      region: "",
      iconUrl: "",
      websiteUrl: "",
      priority: 0,
      isActive: true,
    },
    mode: "onBlur", // Validate on blur for better UX
  });
  
  // Reset form when dialog closes
  const resetForm = () => {
    form.reset({
      name: "",
      arabicName: "",
      entityType: "",
      region: "",
      iconUrl: "",
      websiteUrl: "",
      priority: 0,
      isActive: true,
    });
    setHasFormError(false);
  };
  
  // Use our enhanced dialog hook for managing form state
  const dialogProps = useDialog({
    initialOpen: open,
    onReset: resetForm,
    autoReset: true
  });
  
  // Sync the parent's open state with our internal dialog state
  useEffect(() => {
    if (dialogProps.open !== open) {
      dialogProps.setOpen(open);
    }
  }, [open, dialogProps]);
  
  // Sync our internal dialog state with the parent's open state
  useEffect(() => {
    if (open !== dialogProps.open) {
      onOpenChange(dialogProps.open);
    }
  }, [dialogProps.open, onOpenChange]);
  
  // Subscribe to form validation state changes 
  useEffect(() => {
    const subscription = form.watch(() => {
      setHasFormError(false);
    });
    
    // Clean up subscription
    return () => subscription.unsubscribe();
  }, [form]);
  
  // Fetch entity data if in edit mode
  const { 
    data: entity, 
    isLoading: isLoadingEntity,
    error: entityError
  } = useGovEntity(entityId);
  
  // Mutations with toast notifications
  const createMutation = useCreateGovEntity();
  const updateMutation = useUpdateGovEntity();
  const deleteMutation = useDeleteGovEntity();
  
  // Reset form when dialog opens/closes or entity changes
  useEffect(() => {
    if (open) {
      if (isEditing && entity) {
        // Populate form with entity data
        form.reset({
          name: entity.name,
          arabicName: entity.arabicName || "",
          entityType: entity.entityType,
          region: entity.region || "",
          iconUrl: entity.iconUrl || "",
          websiteUrl: entity.websiteUrl || "",
          priority: entity.priority !== null && entity.priority !== undefined ? entity.priority : 0,
          isActive: entity.isActive !== null && entity.isActive !== undefined ? entity.isActive : true,
        });
      } else if (!isEditing) {
        // Reset form for new entity
        resetForm();
      }
    }
  }, [open, isEditing, entity]);
  
  // Handle form submission
  const onSubmit = (values: FormValues) => {
    // Reset form error state
    setHasFormError(false);
    
    // Clean up empty strings to be null
    const formattedValues = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [
        key, 
        value === "" ? null : value
      ])
    );
    
    if (isEditing && entityId) {
      updateMutation.mutate({
        id: entityId,
        ...formattedValues as any
      }, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Government entity updated successfully",
            variant: "default",
          });
          onOpenChange(false);
        },
        onError: (error) => {
          setHasFormError(true);
          toast({
            title: "Error",
            description: `Failed to update entity: ${error.message}`,
            variant: "destructive",
          });
        }
      });
    } else {
      createMutation.mutate(formattedValues as any, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "New government entity created successfully",
            variant: "default",
          });
          onOpenChange(false);
        },
        onError: (error) => {
          setHasFormError(true);
          toast({
            title: "Error",
            description: `Failed to create entity: ${error.message}`,
            variant: "destructive",
          });
        }
      });
    }
  };
  
  // Handle form submission error
  const onError = (errors: any) => {
    setHasFormError(true);
    toast({
      title: "Validation error",
      description: "Please check the form for errors and try again",
      variant: "destructive",
    });
    console.error("Form validation errors:", errors);
  };
  
  // Handle entity deletion
  const handleDelete = () => {
    if (entityId) {
      deleteMutation.mutate(entityId, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Government entity deleted successfully",
            variant: "default",
          });
          setDeleteDialogOpen(false);
          onOpenChange(false);
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: `Failed to delete entity: ${error.message}`,
            variant: "destructive",
          });
        }
      });
    }
  };
  
  // Handle retry when entity fetch fails
  const handleRetryFetch = () => {
    // The query will be refetched automatically
    toast({
      title: "Retrying",
      description: "Attempting to fetch entity data again",
    });
  };
  
  // Available options for dropdowns
  const regions = ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah", "UAE"];
  const entityTypes = ["federal", "local", "ministry", "authority", "council"];
  
  // Loading and error states
  const isLoading = 
    isLoadingEntity || 
    createMutation.isPending || 
    updateMutation.isPending || 
    deleteMutation.isPending;
  
  const hasError = 
    !!entityError || 
    !!createMutation.error || 
    !!updateMutation.error || 
    !!deleteMutation.error;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Government Entity" : "Add Government Entity"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update the details of this government entity" 
              : "Add a new government entity to the monitoring system"
            }
          </DialogDescription>
        </DialogHeader>
        
        <ErrorBoundary
          fallback={
            <div className="py-8 text-center space-y-4">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
              <h3 className="text-lg font-medium">Something went wrong</h3>
              <p className="text-sm text-muted-foreground">
                There was an error loading the entity form
              </p>
              <Button onClick={() => window.location.reload()} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reload page
              </Button>
            </div>
          }
        >
          {/* Loading state */}
          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          
          {/* Error fetching entity */}
          {!isLoading && entityError && isEditing && (
            <div className="py-8 text-center space-y-4">
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
              <h3 className="text-lg font-medium">Failed to load entity</h3>
              <p className="text-sm text-muted-foreground">
                {entityError.message || "Could not retrieve the government entity data"}
              </p>
              <Button onClick={handleRetryFetch} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          )}
          
          {/* Create/Edit form */}
          {!isLoading && !entityError && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-6">
                {/* Form status message */}
                {hasFormError && (
                  <div className="bg-destructive/10 p-3 rounded-md border border-destructive">
                    <p className="text-sm font-medium text-destructive flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Please correct the errors in the form
                    </p>
                  </div>
                )}
                
                {/* Name fields */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name (English)*</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ministry of Finance" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="arabicName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name (Arabic)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="وزارة المالية" 
                            dir="rtl"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Entity type and region */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="entityType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entity Type*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select entity type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {entityTypes.map(type => (
                              <SelectItem key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Region</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select region" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {regions.map(region => (
                              <SelectItem key={region} value={region}>
                                {region}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* URLs */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="iconUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Icon URL</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://example.com/icon.png" />
                        </FormControl>
                        <FormDescription>
                          Link to the entity's logo or icon
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="websiteUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website URL</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://example.gov.ae" />
                        </FormControl>
                        <FormDescription>
                          Official website of the entity
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Priority and active status */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={0} 
                            max={100} 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Higher priority entities appear first (0-100)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-end space-x-3 space-y-0 pt-8">
                        <FormControl>
                          <Switch
                            checked={field.value === undefined ? true : !!field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Active</FormLabel>
                        <FormDescription className="ml-2">
                          Inactive entities will not be monitored
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Footer buttons */}
                <DialogFooter className="gap-2 sm:gap-0">
                  {isEditing && (
                    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button 
                          type="button" 
                          variant="destructive"
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Government Entity</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this entity? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={() => onOpenChange(false)} 
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  
                  <Button type="submit" disabled={isLoading}>
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isEditing ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </ErrorBoundary>
      </DialogContent>
    </Dialog>
  );
}