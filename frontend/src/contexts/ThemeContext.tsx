'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ThemeType, UserTheme, themeConfigurations, awsConfig } from '@/config/aws-config';
import { useAuth } from './AuthContext';

interface ThemeContextType {
  currentTheme: ThemeType;
  themeConfig: UserTheme;
  availableThemes: UserTheme[];
  setTheme: (theme: ThemeType) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isThemeLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Type guard function
function isValidTheme(theme: string): theme is ThemeType {
  return awsConfig.themes.available.includes(theme as ThemeType);
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { userProfile, isAuthenticated } = useAuth();
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(awsConfig.themes.default);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isThemeLoading, setIsThemeLoading] = useState(false);

  // Get current theme configuration
  const themeConfig = themeConfigurations[currentTheme];
  const availableThemes = Object.values(themeConfigurations);

  // Initialize theme from user profile or localStorage
  useEffect(() => {
    if (isAuthenticated && userProfile?.theme) {
      setCurrentTheme(userProfile.theme);
    } else {
      // Try to get theme from localStorage for non-authenticated users
      const savedTheme = localStorage.getItem('junokit-theme');
      if (savedTheme && isValidTheme(savedTheme)) {
        setCurrentTheme(savedTheme as ThemeType);
      }
    }

    // Initialize dark mode preference
    const savedDarkMode = localStorage.getItem('junokit-dark-mode');
    if (savedDarkMode !== null) {
      setIsDarkMode(JSON.parse(savedDarkMode));
    } else {
      // Check system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(systemPrefersDark);
    }
  }, [isAuthenticated, userProfile]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    const theme = themeConfigurations[currentTheme];
    
    // Set CSS custom properties for theme colors
    root.style.setProperty('--theme-primary', getPrimaryColorValue(theme.primaryColor));
    root.style.setProperty('--theme-secondary', getSecondaryColorValue(theme.secondaryColor));
    
    // Apply dark mode class
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Update theme color meta tag for mobile browsers
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', isDarkMode ? '#1f2937' : '#ffffff');
    }
  }, [currentTheme, isDarkMode]);

  // Set theme function
  const setTheme = async (theme: ThemeType) => {
    setIsThemeLoading(true);
    
    try {
      setCurrentTheme(theme);
      
      // Save to localStorage for non-authenticated users
      if (!isAuthenticated) {
        localStorage.setItem('junokit-theme', theme);
      } else {
        // For authenticated users, update profile via API
        // This will be implemented when we have the backend API ready
        console.log('TODO: Update user theme preference via API');
      }
    } catch (error) {
      console.error('Error updating theme:', error);
    } finally {
      setIsThemeLoading(false);
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('junokit-dark-mode', JSON.stringify(newDarkMode));
  };

  const value: ThemeContextType = {
    currentTheme,
    themeConfig,
    availableThemes,
    setTheme,
    isDarkMode,
    toggleDarkMode,
    isThemeLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook to use theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Utility functions for theme colors
function getPrimaryColorValue(color: string): string {
  const colorMap: Record<string, string> = {
    blue: '#3b82f6',
    green: '#10b981',
    purple: '#8b5cf6',
    orange: '#f97316',
    pink: '#ec4899',
  };
  return colorMap[color] || colorMap.blue;
}

function getSecondaryColorValue(color: string): string {
  const colorMap: Record<string, string> = {
    cyan: '#06b6d4',
    emerald: '#059669',
    violet: '#7c3aed',
    amber: '#d97706',
    rose: '#e11d48',
  };
  return colorMap[color] || colorMap.cyan;
}

// Theme class generator for Tailwind CSS
export function getThemeClasses(theme: ThemeType, isDark: boolean = false) {
  const config = themeConfigurations[theme];
  const baseClasses = {
    primary: `bg-${config.primaryColor}-500 text-white`,
    secondary: `bg-${config.secondaryColor}-500 text-white`,
    primaryHover: `hover:bg-${config.primaryColor}-600`,
    secondaryHover: `hover:bg-${config.secondaryColor}-600`,
    primaryText: `text-${config.primaryColor}-600`,
    secondaryText: `text-${config.secondaryColor}-600`,
    primaryBorder: `border-${config.primaryColor}-500`,
    secondaryBorder: `border-${config.secondaryColor}-500`,
  };

  if (isDark) {
    return {
      ...baseClasses,
      primaryText: `text-${config.primaryColor}-400`,
      secondaryText: `text-${config.secondaryColor}-400`,
      primaryBorder: `border-${config.primaryColor}-400`,
      secondaryBorder: `border-${config.secondaryColor}-400`,
    };
  }

  return baseClasses;
}

// Component for rendering themed elements
interface ThemedElementProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export function ThemedElement({ children, variant = 'primary', className = '' }: ThemedElementProps) {
  const { currentTheme, isDarkMode } = useTheme();
  const themeClasses = getThemeClasses(currentTheme, isDarkMode);
  
  const variantClass = variant === 'primary' ? themeClasses.primary : themeClasses.secondary;
  
  return (
    <div className={`${variantClass} ${className}`}>
      {children}
    </div>
  );
} 