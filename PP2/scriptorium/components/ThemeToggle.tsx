import { useEffect, useState } from 'react';

export default function ThemeToggle() {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const root = window.document.documentElement;
        const storedTheme = localStorage.getItem('theme');

        if (storedTheme === 'dark') {
            root.classList.add('dark');
            setIsDarkMode(true);
        } else {
            root.classList.remove('dark');
        }
    }, []);

    const toggleTheme = () => {
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
        setIsDarkMode(!isDarkMode);
    };

    return (
        <button
            onClick={toggleTheme}
            className="bg-gold text-navy dark:bg-navy dark:text-gold px-4 py-2 rounded"
        >
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
    );
}
