import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import DashboardLayout from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  AlertCircle, 
  Plus, 
  Trash2, 
  Edit, 
  Key, 
  Check, 
  X, 
  Eye, 
  EyeOff,
  RefreshCw, 
  Shield
} from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// API Configuration form schema
const apiConfigSchema = z.object({
  name: z.string().min(1, { message: "API name is required" }),
  apiKey: z.string().min(1, { message: "API key is required" }),
  active: z.boolean().default(true),
});

type ApiConfigFormValues = z.infer<typeof apiConfigSchema>;

export default function ApiConfiguration() {
  // Get the current user directly using React Query instead of useAuth hook
  const { data: user } = useQuery<User | null>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" })
  });
  const { toast } = useToast();
  const [isAddApiOpen, setIsAddApiOpen] = useState(false);
  const [isEditApiOpen, setIsEditApiOpen] = useState(false);
  const [selectedApi, setSelectedApi] = useState<any>(null);
  const [showApiKey, setShowApiKey] = useState<Record<number, boolean>>({});
  
  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                You don't have permission to access this page. This section is only available to administrators.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.history.back()}>Go Back</Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }
  
  // Fetch API configurations
  const { data: apiConfigs, isLoading, refetch } = useQuery({
    queryKey: ['/api/api-configuration'],
    enabled: user?.role === 'admin',
  });
  
  // Add API form
  const addApiForm = useForm<ApiConfigFormValues>({
    resolver: zodResolver(apiConfigSchema),
    defaultValues: {
      name: "",
      apiKey: "",
      active: true,
    },
  });
  
  // Edit API form
  const editApiForm = useForm<ApiConfigFormValues>({
    resolver: zodResolver(apiConfigSchema),
    defaultValues: {
      name: "",
      apiKey: "",
      active: true,
    },
  });
  
  // Create API mutation
  const createApiMutation = useMutation({
    mutationFn: async (data: ApiConfigFormValues) => {
      const res = await apiRequest("POST", "/api/api-configuration", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "API configuration created",
        description: "The API configuration has been created successfully",
      });
      setIsAddApiOpen(false);
      addApiForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/api-configuration'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating API configuration",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update API mutation
  const updateApiMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: ApiConfigFormValues }) => {
      const res = await apiRequest("PUT", `/api/api-configuration/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "API configuration updated",
        description: "The API configuration has been updated successfully",
      });
      setIsEditApiOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/api-configuration'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating API configuration",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete API mutation
  const deleteApiMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/api-configuration/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "API configuration deleted",
        description: "The API configuration has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/api-configuration'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting API configuration",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle add API form submission
  function onAddApiSubmit(data: ApiConfigFormValues) {
    createApiMutation.mutate(data);
  }
  
  // Handle edit API form submission
  function onEditApiSubmit(data: ApiConfigFormValues) {
    if (selectedApi) {
      updateApiMutation.mutate({ id: selectedApi.id, data });
    }
  }
  
  // Open edit API dialog
  function openEditApiDialog(api: any) {
    setSelectedApi(api);
    
    // Set form values
    editApiForm.reset({
      name: api.name,
      apiKey: api.apiKey,
      active: api.active,
    });
    
    setIsEditApiOpen(true);
  }
  
  // Handle delete API
  function handleDeleteApi(id: number) {
    if (window.confirm("Are you sure you want to delete this API configuration?")) {
      deleteApiMutation.mutate(id);
    }
  }
  
  // Toggle API key visibility
  function toggleApiKeyVisibility(id: number) {
    setShowApiKey(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  }
  
  // Mask API key
  function maskApiKey(key: string) {
    if (!key) return "";
    return key.substring(0, 4) + "•".repeat(Math.max(0, key.length - 8)) + key.substring(key.length - 4);
  }
  
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">API Configuration</h1>
        <p className="text-muted-foreground">
          Manage API integrations and authentication keys for the application.
        </p>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>API Settings</CardTitle>
              <CardDescription>
                Configure external API services for text generation and other features.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              
              <Dialog open={isAddApiOpen} onOpenChange={setIsAddApiOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add API
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add API Configuration</DialogTitle>
                    <DialogDescription>
                      Add a new API integration. Enter the API details below.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...addApiForm}>
                    <form onSubmit={addApiForm.handleSubmit(onAddApiSubmit)} className="space-y-4 py-4">
                      <FormField
                        control={addApiForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>API Name</FormLabel>
                            <FormControl>
                              <Input placeholder="OpenAI" {...field} />
                            </FormControl>
                            <FormDescription>
                              A descriptive name for this API configuration.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={addApiForm.control}
                        name="apiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>API Key</FormLabel>
                            <FormControl>
                              <Input placeholder="sk-..." {...field} />
                            </FormControl>
                            <FormDescription>
                              The authentication key for accessing the API.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={addApiForm.control}
                        name="active"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel>Active</FormLabel>
                              <FormDescription>
                                Whether this API configuration is currently active.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        <Button type="submit" disabled={createApiMutation.isPending}>
                          {createApiMutation.isPending ? "Creating..." : "Add API"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent align-[-0.125em]"></div>
              <p className="mt-2 text-muted-foreground">Loading API configurations...</p>
            </div>
          ) : apiConfigs && Array.isArray(apiConfigs) && apiConfigs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>API Key</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiConfigs.map((api: any) => (
                  <TableRow key={api.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center mr-3">
                          <Key className="h-5 w-5" />
                        </div>
                        <div className="font-medium">{api.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm mr-2">
                          {showApiKey[api.id] ? api.apiKey : maskApiKey(api.apiKey)}
                        </code>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => toggleApiKeyVisibility(api.id)}
                        >
                          {showApiKey[api.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {api.active ? (
                        <div className="flex items-center text-green-600">
                          <Check className="h-4 w-4 mr-1" />
                          Active
                        </div>
                      ) : (
                        <div className="flex items-center text-gray-500">
                          <X className="h-4 w-4 mr-1" />
                          Inactive
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {api.createdAt ? new Date(api.createdAt).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditApiDialog(api)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteApi(api.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Key className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium mb-1">No API Configurations</h3>
              <p className="text-muted-foreground mb-4">
                You haven't added any API configurations yet.
              </p>
              <Button onClick={() => setIsAddApiOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First API
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>API Usage</CardTitle>
            <CardDescription>
              Monitor your API usage and quotas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <Label>OpenAI API</Label>
                  <span className="text-sm">80% used</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "80%" }}></div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  8,000 / 10,000 tokens used this month
                </p>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <Label>Other Text API</Label>
                  <span className="text-sm">45% used</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "45%" }}></div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  450 / 1,000 requests used this month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>API Status</CardTitle>
            <CardDescription>
              Check the status of connected APIs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center mr-3">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium">OpenAI API</div>
                    <div className="text-sm text-green-600">Operational</div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">Test</Button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center mr-3">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium">Other API</div>
                    <div className="text-sm text-red-600">Authentication Failed</div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">Troubleshoot</Button>
              </div>
              
              <Alert className="mt-4">
                <Shield className="h-4 w-4" />
                <AlertTitle>API Security</AlertTitle>
                <AlertDescription>
                  Always keep your API keys secure and never share them publicly.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Edit API Dialog */}
      <Dialog open={isEditApiOpen} onOpenChange={setIsEditApiOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit API Configuration</DialogTitle>
            <DialogDescription>
              Update the API configuration details.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editApiForm}>
            <form onSubmit={editApiForm.handleSubmit(onEditApiSubmit)} className="space-y-4 py-4">
              <FormField
                control={editApiForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editApiForm.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editApiForm.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        Whether this API configuration is currently active.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" disabled={updateApiMutation.isPending}>
                  {updateApiMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
