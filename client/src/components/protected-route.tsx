import { Route } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { User } from "@shared/schema";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType<any>;
}

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  console.log(`ProtectedRoute: Checking auth for path ${path}`);
  
  // Get the current user directly using React Query instead of useAuth
  const { data: user, isLoading, error, isError } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: 1,
    staleTime: 10000, // 10 seconds
  });
  
  // Log current state
  console.log(`ProtectedRoute state for ${path}:`, { 
    isLoading, 
    user: user ? `User: ${user.firstName} ${user.lastName}` : 'No user',
    error: isError ? error : 'No error'
  });

  return (
    <Route path={path}>
      {() => {
        if (isLoading) {
          console.log(`ProtectedRoute: Still loading for ${path}`);
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }

        if (!user) {
          console.log(`ProtectedRoute: No user found, redirecting to auth`);
          // Force a clean slate when redirecting to auth
          sessionStorage.setItem('lastAuthRedirect', new Date().toISOString());
          
          // Use window.location for a full page refresh to clear any stale state
          setTimeout(() => {
            console.log('Redirecting to /auth via window.location');
            window.location.href = '/auth';
          }, 100);
          
          // Return loading state while redirect is happening
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }

        console.log(`ProtectedRoute: User authenticated, rendering ${path}`);
        return <Component />;
      }}
    </Route>
  );
}