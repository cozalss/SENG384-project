import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

/**
 * Compact icon-only theme toggle. Drop into the navbar / user menu.
 * Variant "pill" gives the round-button treatment (default), "menu" gives a
 * full-width row that matches UserMenu menu items.
 */
const ThemeToggle = ({ variant = 'pill', className = '', onSelect }) => {
    const { theme, toggle, isLight } = useTheme();

    const handleClick = () => {
        toggle();
        onSelect?.();
    };

    if (variant === 'menu') {
        return (
            <button
                type="button"
                role="menuitem"
                onClick={handleClick}
                className={className}
                aria-label={`Switch to ${isLight ? 'dark' : 'light'} mode`}
                style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    width: '100%',
                    padding: '10px 12px',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    borderRadius: 10,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                    transition: 'background 0.15s, color 0.15s, transform 0.2s',
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.background = 'var(--interactive-row-hover-bg)';
                    e.currentTarget.style.color = 'var(--brand-soft-text)';
                    e.currentTarget.style.transform = 'translateX(2px)';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-muted)';
                    e.currentTarget.style.transform = 'translateX(0)';
                }}
            >
                <span style={{
                    width: 30, height: 30,
                    borderRadius: 9,
                    background: 'var(--hl-faint)',
                    border: '1px solid var(--line-subtle)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    color: 'currentColor',
                }}>
                    <ThemeIcon isLight={isLight} size={15} />
                </span>
                <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'inherit', letterSpacing: '-0.01em' }}>
                        {isLight ? 'Dark mode' : 'Light mode'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 1, letterSpacing: '0.005em' }}>
                        Currently {theme}
                    </div>
                </span>
            </button>
        );
    }

    return (
        <motion.button
            type="button"
            onClick={handleClick}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.94 }}
            aria-label={`Switch to ${isLight ? 'dark' : 'light'} mode`}
            title={`Switch to ${isLight ? 'dark' : 'light'} mode`}
            className={className}
            style={{
                width: 38, height: 38,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--hl-faint)',
                border: '1px solid var(--line-subtle)',
                borderRadius: 999,
                color: 'var(--text-main)',
                cursor: 'pointer',
                transition: 'background 180ms cubic-bezier(0.32, 0.72, 0, 1), border-color 180ms cubic-bezier(0.32, 0.72, 0, 1), color 180ms cubic-bezier(0.32, 0.72, 0, 1)',
            }}
        >
            <ThemeIcon isLight={isLight} size={16} />
        </motion.button>
    );
};

/** Animated swap between sun/moon glyphs. */
const ThemeIcon = ({ isLight, size }) => (
    <motion.span
        key={isLight ? 'sun' : 'moon'}
        initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
        transition={{ type: 'spring', stiffness: 360, damping: 22 }}
        style={{ display: 'inline-flex' }}
    >
        {isLight ? <Sun size={size} strokeWidth={1.8} /> : <Moon size={size} strokeWidth={1.8} />}
    </motion.span>
);

export default ThemeToggle;
