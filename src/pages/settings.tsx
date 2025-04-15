import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { User as UserType } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import DashboardLayout from "@/components/layouts/dashboard-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, Settings2, UserIcon, Bell, Lock, Shield, Info } from "lucide-react";

// Profile form schema
const profileFormSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
});

// Password form schema
const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required" }),
  newPassword: z.string().min(6, { message: "New password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Please confirm your new password" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Notification settings schema
const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
  reportGenerated: z.boolean().default(true),
  dataProcessed: z.boolean().default(true),
  securityAlerts: z.boolean().default(true),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;
type NotificationSettingsValues = z.infer<typeof notificationSettingsSchema>;

export default function Settings() {
  // Get the current user directly using React Query instead of useAuth hook
  const { data: user } = useQuery<UserType | null>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" })
  });
  
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  
  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      username: user?.username || "",
    },
  });
  
  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Notification settings form
  const notificationSettingsForm = useForm<NotificationSettingsValues>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emailNotifications: true,
      marketingEmails: false,
      reportGenerated: true,
      dataProcessed: true,
      securityAlerts: true,
    },
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const res = await apiRequest("PUT", `/api/users/${user?.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: { newPassword: string, currentPassword: string }) => {
      const res = await apiRequest("PUT", `/api/users/${user?.id}/password`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully",
      });
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating password",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update notification settings mutation
  const updateNotificationSettingsMutation = useMutation({
    mutationFn: async (data: NotificationSettingsValues) => {
      const res = await apiRequest("PUT", `/api/users/${user?.id}/notifications`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Notification settings updated",
        description: "Your notification preferences have been saved",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating notification settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle profile form submission
  function onProfileSubmit(data: ProfileFormValues) {
    updateProfileMutation.mutate(data);
  }
  
  // Handle password form submission
  function onPasswordSubmit(data: PasswordFormValues) {
    updatePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  }
  
  // Handle notification settings submission
  function onNotificationSettingsSubmit(data: NotificationSettingsValues) {
    updateNotificationSettingsMutation.mutate(data);
  }
  
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/4">
          <Card className="mb-6">
            <CardContent className="p-4">
              <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} orientation="vertical">
                <TabsList className="flex flex-col items-start h-auto bg-transparent p-0 space-y-1">
                  <TabsTrigger value="profile" className="justify-start">
                    <UserIcon className="h-4 w-4 mr-2" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="security" className="justify-start">
                    <Lock className="h-4 w-4 mr-2" />
                    Security
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="justify-start">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </TabsTrigger>
                  {user?.role === 'admin' && (
                    <TabsTrigger value="account" className="justify-start">
                      <Settings2 className="h-4 w-4 mr-2" />
                      Account
                    </TabsTrigger>
                  )}
                </TabsList>
              
                <TabsContent value="profile" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>
                        Update your personal information and contact details.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={profileForm.control}
                              name="firstName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>First Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={profileForm.control}
                              name="lastName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Last Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={profileForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input {...field} type="email" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex justify-end">
                            <Button 
                              type="submit" 
                              disabled={updateProfileMutation.isPending || !profileForm.formState.isDirty}
                            >
                              {updateProfileMutation.isPending ? "Saving..." : "Save changes"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </TabsContent>
              
                <TabsContent value="security" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Change Password</CardTitle>
                      <CardDescription>
                        Update your password to keep your account secure.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                          <FormField
                            control={passwordForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Current Password</FormLabel>
                                <FormControl>
                                  <Input {...field} type="password" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={passwordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                  <Input {...field} type="password" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={passwordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Confirm New Password</FormLabel>
                                <FormControl>
                                  <Input {...field} type="password" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex justify-end">
                            <Button type="submit" disabled={updatePasswordMutation.isPending}>
                              {updatePasswordMutation.isPending ? "Updating..." : "Update password"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                  
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Two-Factor Authentication</CardTitle>
                      <CardDescription>
                        Add an extra layer of security to your account.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Two-factor authentication</Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            Secure your account with two-factor authentication.
                          </p>
                        </div>
                        <Switch disabled />
                      </div>
                      <div className="mt-4">
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertTitle>Coming Soon</AlertTitle>
                          <AlertDescription>
                            Two-factor authentication will be available in a future update.
                          </AlertDescription>
                        </Alert>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              
                <TabsContent value="notifications" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Preferences</CardTitle>
                      <CardDescription>
                        Choose how you want to be notified about activity and updates.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...notificationSettingsForm}>
                        <form onSubmit={notificationSettingsForm.handleSubmit(onNotificationSettingsSubmit)} className="space-y-4">
                          <FormField
                            control={notificationSettingsForm.control}
                            name="emailNotifications"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Email Notifications</FormLabel>
                                  <FormDescription>
                                    Receive email notifications for important updates.
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
                          
                          <FormField
                            control={notificationSettingsForm.control}
                            name="marketingEmails"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Marketing Emails</FormLabel>
                                  <FormDescription>
                                    Receive emails about new features and special offers.
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
                          
                          <Separator className="my-4" />
                          <h3 className="text-lg font-medium mb-2">Activity Notifications</h3>
                          
                          <FormField
                            control={notificationSettingsForm.control}
                            name="reportGenerated"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Report Generated</FormLabel>
                                  <FormDescription>
                                    Get notified when a report is generated.
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
                          
                          <FormField
                            control={notificationSettingsForm.control}
                            name="dataProcessed"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Data Processing Complete</FormLabel>
                                  <FormDescription>
                                    Get notified when data processing is complete.
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
                          
                          <FormField
                            control={notificationSettingsForm.control}
                            name="securityAlerts"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Security Alerts</FormLabel>
                                  <FormDescription>
                                    Get notified about important security alerts.
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
                          
                          <div className="flex justify-end">
                            <Button type="submit" disabled={updateNotificationSettingsMutation.isPending}>
                              {updateNotificationSettingsMutation.isPending ? "Saving..." : "Save preferences"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </TabsContent>
              
                <TabsContent value="account" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Management</CardTitle>
                      <CardDescription>
                        Manage account settings and advanced options (Admin only).
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-2">Application Settings</h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <Label>Dark Mode Default</Label>
                                <p className="text-sm text-muted-foreground">
                                  Set dark mode as default for all users
                                </p>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <Label>Auto-delete Inactive Users</Label>
                                <p className="text-sm text-muted-foreground">
                                  Automatically delete users who have been inactive for 1 year
                                </p>
                              </div>
                              <Switch />
                            </div>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h3 className="text-lg font-medium mb-2">Data Management</h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <Label>Data Retention Period</Label>
                                <p className="text-sm text-muted-foreground">
                                  How long to keep user data
                                </p>
                              </div>
                              <Select defaultValue="365">
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="Select period" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="30">30 days</SelectItem>
                                  <SelectItem value="90">90 days</SelectItem>
                                  <SelectItem value="180">6 months</SelectItem>
                                  <SelectItem value="365">1 year</SelectItem>
                                  <SelectItem value="0">Indefinitely</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <Label>Automatic Data Backup</Label>
                                <p className="text-sm text-muted-foreground">
                                  Automatically backup system data
                                </p>
                              </div>
                              <Switch defaultChecked />
                            </div>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h3 className="text-lg font-medium mb-2 text-destructive">Dangerous Actions</h3>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm">
                                These actions are irreversible and should be used with caution.
                              </p>
                            </div>
                            <div className="flex space-x-4">
                              <Button variant="outline" disabled>Reset Application Data</Button>
                              <Button variant="destructive" disabled>Delete Account</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Account Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Account Type</span>
                  <span className="font-medium">{user?.role === 'admin' ? 'Administrator' : 'Client'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <span className="font-medium">Active</span>
                  </div>
                </div>
                {user?.lastLogin && (
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Last Login</span>
                    <span className="font-medium">
                      {new Date(user.lastLogin).toLocaleString()}
                    </span>
                  </div>
                )}
                {user?.role === 'client' && user?.expirationDate && (
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Subscription Expires</span>
                    <span className="font-medium">
                      {new Date(user.expirationDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex-1">
          {/* This is where the content was before. We've moved it inside the Tabs component */}
        </div>
      </div>
    </DashboardLayout>
  );
}