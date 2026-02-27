
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppConfig, FontConfig } from '../types';

// Typography Options
export const FONT_OPTIONS: FontConfig[] = [
    { id: 1, name: 'Personalidad y Calidez', heading: 'Inter', body: 'Inter', accent: 'JetBrains Mono', description: 'Moderno y limpio' },
    { id: 2, name: 'Clásico y Legible', heading: 'Nunito', body: 'Open Sans', accent: 'Roboto Mono', description: 'Suave y familiar' },
    { id: 3, name: 'Corporativo Moderno', heading: 'Plus Jakarta Sans', body: 'Inter', accent: 'Fira Code', description: 'Geométrico y profesional' },
    { id: 4, name: 'Elegancia Humanista', heading: 'Poppins', body: 'Lato', accent: 'Roboto Mono', description: 'Equilibrado y estilizado' },
    { id: 5, name: 'Divertido y Amigable', heading: 'Fredoka', body: 'Nunito', accent: 'Space Mono', description: 'Ideal para ambiente lúdico' },
];

interface ThemeContextType {
    config: AppConfig;
    updateConfig: (newConfig: Partial<AppConfig>) => void;
    currentFont: FontConfig;
}

const DEFAULT_CONFIG: AppConfig = {
    appName: 'Dr. Payaso',
    logoUrl: '', // Default empty (uses icon)
    primaryColor: '#EF4444', // Default Red
    secondaryColor: '#3B82F6', // Default Blue
    fontConfigId: 1
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Initialize state from LocalStorage if available
    const [config, setConfig] = useState<AppConfig>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('app_theme_config');
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch (e) {
                    console.error("Error parsing saved theme config", e);
                }
            }
        }
        return DEFAULT_CONFIG;
    });

    const currentFont = FONT_OPTIONS.find(f => f.id === config.fontConfigId) || FONT_OPTIONS[0];

    useEffect(() => {
        // Apply CSS Variables dynamically
        const root = document.documentElement;
        
        root.style.setProperty('--color-primary', config.primaryColor);
        root.style.setProperty('--color-secondary', config.secondaryColor);
        
        root.style.setProperty('--font-heading', currentFont.heading);
        root.style.setProperty('--font-body', currentFont.body);
        root.style.setProperty('--font-accent', currentFont.accent);
        
        // Update Title dynamically
        document.title = config.appName + " Manager";
        
        // Persist to LocalStorage
        localStorage.setItem('app_theme_config', JSON.stringify(config));

    }, [config, currentFont]);

    const updateConfig = (newConfig: Partial<AppConfig>) => {
        setConfig(prev => ({ ...prev, ...newConfig }));
    };

    return (
        <ThemeContext.Provider value={{ config, updateConfig, currentFont }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
