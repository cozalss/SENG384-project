import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'health_ai_theme';
const VALID = new Set(['dark', 'light']);

const readInitial = () => {
    if (typeof window === 'undefined') return 'dark';
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored && VALID.has(stored)) return stored;
    } catch { /* private mode / disabled storage */ }
    if (window.matchMedia?.('(prefers-color-scheme: light)').matches) return 'light';
    return 'dark';
};

const applyTheme = (theme, animated = true) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (animated) {
        root.classList.add('theme-transitioning');
        window.setTimeout(() => root.classList.remove('theme-transitioning'), 320);
    }
    if (theme === 'light') {
        root.dataset.theme = 'light';
        root.style.colorScheme = 'light';
    } else {
        delete root.dataset.theme;
        root.style.colorScheme = 'dark';
    }
};

// Apply the persisted theme synchronously the moment the module is imported.
// This prevents a dark→light flash on first paint when the user previously
// chose light. It must run before React renders, so we do it at module scope.
applyTheme(readInitial(), false);

export const useTheme = () => {
    const [theme, setTheme] = useState(readInitial);

    useEffect(() => {
        applyTheme(theme);
        try { window.localStorage.setItem(STORAGE_KEY, theme); } catch { /* ignore */ }
    }, [theme]);

    // React to OS-level theme flips ONLY when the user hasn't picked a theme
    // explicitly yet. Once they choose, we honor that until they change it.
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const stored = (() => { try { return window.localStorage.getItem(STORAGE_KEY); } catch { return null; } })();
        if (stored) return;
        const mq = window.matchMedia('(prefers-color-scheme: light)');
        const onChange = (e) => setTheme(e.matches ? 'light' : 'dark');
        mq.addEventListener?.('change', onChange);
        return () => mq.removeEventListener?.('change', onChange);
    }, []);

    const toggle = useCallback(() => {
        setTheme(t => (t === 'light' ? 'dark' : 'light'));
    }, []);

    return { theme, setTheme, toggle, isLight: theme === 'light' };
};

export default useTheme;
