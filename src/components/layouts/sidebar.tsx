import { useLocation } from "wouter";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  BarChart3,
  Upload,
  PieChart,
  Users,
  Settings,
  KeyRound,
  LogOut,
  Menu,
  ChevronLeft,
  Home,
  LayoutDashboard
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  user: User | null;
}

export default function Sidebar({ isOpen, setIsOpen, user }: SidebarProps) {
  const [location, setLocation] = useLocation();
  
  // Create our own logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        console.log("Sidebar: Attempting logout");
        await apiRequest("POST", "/api/logout");
        console.log("Sidebar: Logout API call successful");
        return true;
      } catch (error) {
        console.error("Sidebar: Logout error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log("Sidebar: Logout successful, clearing user data");
      // Clear user data from cache
      queryClient.setQueryData(["/api/user"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      // Use direct navigation for more reliable redirect
      setTimeout(() => {
        console.log("Sidebar: Redirecting to auth page");
        window.location.href = "/auth";
      }, 300);
    },
    onError: (error) => {
      console.error("Sidebar: Logout failed:", error);
      // Even if the server logout fails, we'll still clear the user data from the client
      queryClient.setQueryData(["/api/user"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      // Use direct navigation for more reliable redirect
      setTimeout(() => {
        console.log("Sidebar: Redirecting to auth page after error");
        window.location.href = "/auth";
      }, 300);
    }
  });
  
  const menuItems = [
    {
      title: "Main",
      items: [
        {
          label: "Home",
          icon: <Home className="h-5 w-5" />,
          href: "/",
          active: location === "/"
        },
        {
          label: "Dashboard",
          icon: <LayoutDashboard className="h-5 w-5" />,
          href: "/dashboard",
          active: location === "/dashboard"
        },
        {
          label: "Reports",
          icon: <BarChart3 className="h-5 w-5" />,
          href: "/reports",
          active: location === "/reports"
        }
      ]
    }
  ];
  
  // Admin-only menu items
  const adminMenuItems = [
    {
      title: "Admin",
      items: [
        {
          label: "User Management",
          icon: <Users className="h-5 w-5" />,
          href: "/users",
          active: location === "/users"
        },
        {
          label: "Settings",
          icon: <Settings className="h-5 w-5" />,
          href: "/settings",
          active: location === "/settings"
        },
        {
          label: "API Configuration",
          icon: <KeyRound className="h-5 w-5" />,
          href: "/api-config",
          active: location === "/api-config"
        }
      ]
    }
  ];
  
  // If user is admin, add admin menu items
  if (user?.role === "admin") {
    menuItems.push(...adminMenuItems);
  } else {
    // Add settings to the main menu for non-admins
    menuItems[0].items.push({
      label: "Settings",
      icon: <Settings className="h-5 w-5" />,
      href: "/settings",
      active: location === "/settings"
    });
  }
  
  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <aside 
      className={`bg-white dark:bg-gray-800 shadow-lg h-full transition-all duration-300 ease-in-out fixed lg:relative z-50 ${
        isOpen ? 'w-64' : 'w-0 lg:w-20'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Sidebar Header */}
        <div className="p-4 h-16 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
          <div className={`flex items-center space-x-2 ${!isOpen && 'lg:justify-center lg:w-full'}`}>
            <BarChart3 className="h-6 w-6 text-primary" />
            {isOpen && <h1 className="text-xl font-semibold">MarketDash</h1>}
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsOpen(!isOpen)}
            className={`${!isOpen && 'lg:hidden'}`}
          >
            {isOpen ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
        
        {/* Navigation */}
        <ScrollArea className="flex-grow">
          <nav className="p-2">
            {menuItems.map((group, groupIndex) => (
              <div key={groupIndex} className="mb-6">
                {/* Group Title */}
                {isOpen && (
                  <div className="px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {group.title}
                  </div>
                )}
                
                {/* Group Items */}
                <div className="space-y-1">
                  {group.items.map((item, itemIndex) => (
                    <div 
                      key={itemIndex}
                      onClick={() => setLocation(item.href)}
                      className={`flex items-center px-3 py-2 rounded-md transition-colors cursor-pointer ${
                        item.active 
                          ? 'bg-primary-100 dark:bg-primary-900/20 text-primary dark:text-primary-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        } ${!isOpen && 'lg:justify-center'}`}
                    >
                      <div className="mr-3">{item.icon}</div>
                      {isOpen && <span>{item.label}</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>
        
        {/* User Profile & Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {isOpen ? (
            <div className="flex flex-col">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </div>
                <div className="ml-3">
                  <div className="font-medium">{user?.firstName} {user?.lastName}</div>
                  <div className="text-sm text-muted-foreground capitalize">{user?.role}</div>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-medium mb-2">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
