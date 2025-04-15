import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type ThemeToggleProps = {
  variant?: "switch" | "button" | "icon";
  showLabel?: boolean;
};

export function ThemeToggle({ variant = "switch", showLabel = true }: ThemeToggleProps) {
  const [isDark, setIsDark] = useState(false);

  // On mount, check for saved theme preference or use device preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  if (variant === "button") {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={toggleTheme}
        className="px-2"
      >
        {isDark ? (
          <>
            <Sun className="h-4 w-4 mr-1" />
            {showLabel && "Light"}
          </>
        ) : (
          <>
            <Moon className="h-4 w-4 mr-1" />
            {showLabel && "Dark"}
          </>
        )}
      </Button>
    );
  }

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="rounded-full h-8 w-8"
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
    );
  }

  // Default switch variant
  return (
    <div className="flex items-center space-x-2">
      {showLabel && <Label className="text-sm mr-1">{isDark ? "Dark" : "Light"}</Label>}
      <Switch
        checked={isDark}
        onCheckedChange={toggleTheme}
        aria-label="Toggle theme"
      />
    </div>
  );
}
