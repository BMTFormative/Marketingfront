import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { User } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  // Get the current user directly using React Query instead of useAuth hook
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" })
  });
  
  // Add detailed logging for debugging authentication issues
  console.log("ProtectedRoute: Checking auth for path", path);
  console.log("ProtectedRoute state for " + path + ":", {
    isLoading,
    user: user ? `User: ${user.firstName} ${user.lastName}` : "No user",
    error: error ? error.message : "No error"
  });

  if (isLoading) {
    console.log("ProtectedRoute: Still loading for", path);
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    console.log("ProtectedRoute: No user, redirecting to /auth from", path);
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  console.log("ProtectedRoute: User authenticated, rendering", path);
  return <Route path={path} component={Component} />;
}