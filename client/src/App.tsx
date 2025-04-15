import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import HomePage from "@/pages/home-page";
import Reports from "@/pages/reports";
import UserManagement from "@/pages/user-management";
import Settings from "@/pages/settings";
import ApiConfiguration from "@/pages/api-configuration";
import { ProtectedRoute } from "./components/protected-route";

function App() {
  // Add console log for debugging
  console.log("App rendering");

  return (
    <>
      <Switch>
        {/* Make sure auth route comes first and is accessible */}
        <Route path="/auth">
          {() => {
            console.log("Auth route rendered");
            return <AuthPage />;
          }}
        </Route>
        <ProtectedRoute path="/" component={HomePage} />
        <ProtectedRoute path="/dashboard" component={Dashboard} />
        <ProtectedRoute path="/reports" component={Reports} />
        <ProtectedRoute path="/users" component={UserManagement} />
        <ProtectedRoute path="/settings" component={Settings} />
        <ProtectedRoute path="/api-config" component={ApiConfiguration} />
        <Route>
          {() => {
            console.log("Not found route rendered");
            return <NotFound />;
          }}
        </Route>
      </Switch>
      <Toaster />
    </>
  );
}

export default App;
