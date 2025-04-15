import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { User } from "@shared/schema";

export default function HomePage() {
  const [_, setLocation] = useLocation();
  const { data: user } = useQuery<User | null>({
    queryKey: ["/api/user/"],
    queryFn: getQueryFn({ on401: "returnNull" })
  });

  useEffect(() => {
    // Redirect to dashboard
    setLocation("/dashboard");
  }, [setLocation]);

  return <div></div>; // Empty div as we're redirecting
}
