import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Palette, Moon, Sun } from 'lucide-react';
import { Card } from '@/components/ui/card';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  const getThemeIcon = () => {
    switch (theme) {
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'dutch-masters':
        return <Palette className="h-4 w-4" />;
      case 'nordic-bright':
        return <Sun className="h-4 w-4" />;
      default:
        return <Moon className="h-4 w-4" />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'dark':
        return 'Dark Mode';
      case 'dutch-masters':
        return 'Dutch Masters';
      case 'nordic-bright':
        return 'Nordic Bright';
      default:
        return 'Dark Mode';
    }
  };

  const getThemeDescription = () => {
    switch (theme) {
      case 'dark':
        return 'Classic dark theme';
      case 'dutch-masters':
        return 'Inspired by Vermeer\'s masterpieces';
      case 'nordic-bright':
        return 'Clean minimalist design';
      default:
        return 'Classic dark theme';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <Card className="p-3 shadow-lg border-2 backdrop-blur-sm bg-card/95 hover:bg-card transition-all duration-300 hover:shadow-xl">
        <button
          onClick={() => {
            console.log(`Toggling theme from: ${theme}`);
            toggleTheme();
          }}
          className="flex items-center gap-3 text-sm font-medium hover:scale-105 transition-transform duration-200"
          aria-label={`Switch theme from ${getThemeLabel()}`}
          title={`Current: ${getThemeLabel()} - ${getThemeDescription()}`}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
            {getThemeIcon()}
          </div>
          <div className="text-left">
            <div className="font-semibold text-foreground">{getThemeLabel()}</div>
            <div className="text-xs text-muted-foreground">{getThemeDescription()}</div>
          </div>
        </button>
      </Card>
    </div>
  );
};

export default ThemeToggle;