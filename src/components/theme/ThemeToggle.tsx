
import React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

interface ThemeToggleProps {
  variant?: "icon" | "default";
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  variant = "icon",
  className = ""
}) => {
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  
  if (variant === "icon") {
    return (
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={toggleTheme}
        className={`rounded-full ${className}`}
        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        {theme === "dark" ? (
          <Sun className="h-5 w-5 text-yellow-400" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </Button>
    );
  }
  
  return (
    <Button 
      variant="outline" 
      className={className}
      onClick={toggleTheme}
    >
      {theme === "dark" ? (
        <>
          <Sun className="mr-2 h-4 w-4 text-yellow-400" />
          Light Mode
        </>
      ) : (
        <>
          <Moon className="mr-2 h-4 w-4" />
          Dark Mode
        </>
      )}
    </Button>
  );
};

export default ThemeToggle;
