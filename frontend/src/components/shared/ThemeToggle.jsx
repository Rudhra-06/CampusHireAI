import { MoonStar, SunMedium } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            type="button"
            className="btn btn-ghost"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            style={{ padding: '8px 12px', borderRadius: '999px' }}
        >
            {theme === 'dark' ? <SunMedium size={16} /> : <MoonStar size={16} />}
        </button>
    );
}
