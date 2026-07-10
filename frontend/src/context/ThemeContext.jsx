import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext();

const getPreferredTheme = () => {
    if (typeof window === 'undefined') return 'light';
    const stored = window.localStorage.getItem('campushire-theme');
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        setTheme(getPreferredTheme());
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.style.colorScheme = theme;
        window.localStorage.setItem('campushire-theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

    const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    return useContext(ThemeContext);
}
