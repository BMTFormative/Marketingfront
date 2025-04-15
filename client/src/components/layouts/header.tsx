import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  Menu,
  Search,
  Settings,
  User,
  LogOut,
  HelpCircle,
} from "lucide-react";
import { User as SelectUser } from "@shared/schema";

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function Header({ toggleSidebar, isSidebarOpen }: HeaderProps) {
  const [location, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Get the current user using React Query
  const { data: user } = useQuery<SelectUser | null>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" })
  });
  
  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        console.log("Attempting logout");
        await apiRequest("POST", "/api/logout");
        console.log("Logout API call successful");
        return true;
      } catch (error) {
        console.error("Logout error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log("Logout successful, clearing user data");
      // Clear user data from cache
      queryClient.setQueryData(["/api/user"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      // Use direct navigation for more reliable redirect
      setTimeout(() => {
        console.log("Redirecting to auth page");
        window.location.href = "/auth";
      }, 300);
    },
    onError: (error) => {
      console.error("Logout failed:", error);
      // Even if the server logout fails, we'll still clear the user data from the client
      queryClient.setQueryData(["/api/user"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      // Use direct navigation for more reliable redirect
      setTimeout(() => {
        console.log("Redirecting to auth page after error");
        window.location.href = "/auth";
      }, 300);
    }
  });
  
  // Get page title based on current location
  const getPageTitle = () => {
    switch (location) {
      case "/":
      case "/dashboard":
        return "Dashboard";
      case "/upload":
        return "Upload CSV";
      case "/reports":
        return "Reports & Analytics";
      case "/users":
        return "User Management";
      case "/settings":
        return "Settings";
      case "/api-config":
        return "API Configuration";
      default:
        return "Dashboard";
    }
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchTerm);
    // Implement search functionality
  };

  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Handle navigation
  const handleNavigation = (path: string) => {
    setLocation(path);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm z-10 h-16">
      <div className="h-full flex items-center justify-between px-4">
        {/* Left: Mobile menu toggle and page title */}
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar} 
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <h2 className="text-lg font-semibold">{getPageTitle()}</h2>
        </div>
        
        {/* Right: Search, theme toggle, notifications */}
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative hidden md:block">
            <form onSubmit={handleSearch}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 w-[200px] lg:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </form>
          </div>
          
          {/* Theme Toggle */}
          <ThemeToggle variant="icon" showLabel={false} />
          
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  3
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[300px]">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[300px] overflow-y-auto">
                <DropdownMenuItem className="py-2 cursor-pointer">
                  <div>
                    <p className="font-medium text-sm">New Upload Completed</p>
                    <p className="text-xs text-muted-foreground">Your CSV file has been processed successfully.</p>
                    <p className="text-xs text-muted-foreground mt-1">5 minutes ago</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="py-2 cursor-pointer">
                  <div>
                    <p className="font-medium text-sm">Report Generated</p>
                    <p className="text-xs text-muted-foreground">Your monthly report is now available.</p>
                    <p className="text-xs text-muted-foreground mt-1">1 hour ago</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="py-2 cursor-pointer">
                  <div>
                    <p className="font-medium text-sm">Campaign Performance Alert</p>
                    <p className="text-xs text-muted-foreground">Your Summer Promotion campaign has exceeded targets.</p>
                    <p className="text-xs text-muted-foreground mt-1">2 days ago</p>
                  </div>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center cursor-pointer">
                <Button variant="ghost" size="sm" className="w-full">
                  View all notifications
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleNavigation("/settings")} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleNavigation("/settings")} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Help & Support</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
