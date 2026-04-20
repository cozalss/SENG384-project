import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Keyboard, X } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform);
const meta = isMac ? '⌘' : 'Ctrl';

const shortcuts = [
    {
        group: 'Navigation',
        items: [
            { keys: [meta, 'K'], desc: 'Open command palette' },
            { keys: ['?'], desc: 'Show keyboard shortcuts' },
            { keys: ['Esc'], desc: 'Close dialogs' }
        ]
    },
    {
        group: 'Command palette',
        items: [
            { keys: ['↑', '↓'], desc: 'Navigate results' },
            { keys: ['↵'], desc: 'Open selected item' },
            { keys: ['Esc'], desc: 'Dismiss palette' }
        ]
    },
    {
        group: 'Account',
        items: [
            { keys: ['Tab'], desc: 'Move focus (editorial neon ring)' }
        ]
    }
];

const Kbd = ({ children }) => (
    <kbd style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '26px',
        height: '26px',
        padding: '0 8px',
        borderRadius: '7px',
        background: 'rgba(7, 11, 10, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        color: 'var(--text-main)',
        fontSize: '11.5px',
        fontWeight: '700',
        fontFamily: 'var(--font-body)',
        letterSpacing: '0.02em',
        boxShadow: 'inset 0 -1px 0 rgba(0, 0, 0, 0.3)'
    }}>
        {children}
    </kbd>
);

const ShortcutsModal = () => {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const onKey = (e) => {
            // Skip if user is typing in an input or if modifiers are held
            const tag = e.target?.tagName;
            const typing = tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable;
            if (typing) return;

            if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
                e.preventDefault();
                setOpen(o => !o);
            } else if (e.key === 'Escape' && open) {
                setOpen(false);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open]);

    return createPortal(
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => setOpen(false)}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 9998,
                            background: 'rgba(3, 7, 10, 0.72)',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)'
                        }}
                    />
                    <motion.div
                        initial={{ opacity: 0, y: -12, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -12, scale: 0.96 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Keyboard shortcuts"
                        className="editorial-panel"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 'min(520px, calc(100vw - 32px))',
                            maxHeight: '80vh',
                            zIndex: 9999,
                            overflow: 'hidden',
                            padding: 0,
                            boxShadow: '0 50px 120px rgba(0, 0, 0, 0.6), 0 0 100px rgba(94, 210, 156, 0.14)'
                        }}
                    >
                        <div style={{
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '18px 22px',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            background: 'rgba(7, 11, 10, 0.4)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Keyboard size={17} color="#8be8bc" />
                                <h3 style={{
                                    fontSize: '15px', fontWeight: '700',
                                    letterSpacing: '-0.01em', fontFamily: 'var(--font-heading)'
                                }}>Keyboard Shortcuts</h3>
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                aria-label="Close"
                                style={{
                                    background: 'none', border: 'none',
                                    color: 'var(--text-subtle)', cursor: 'pointer',
                                    padding: '4px', borderRadius: '6px', display: 'flex'
                                }}
                            >
                                <X size={15} />
                            </button>
                        </div>

                        <div style={{ padding: '16px 22px 18px', maxHeight: '60vh', overflowY: 'auto' }}>
                            {shortcuts.map((group) => (
                                <div key={group.group} style={{ marginBottom: '20px' }}>
                                    <div style={{
                                        fontSize: '10px',
                                        fontWeight: '700',
                                        letterSpacing: '0.14em',
                                        textTransform: 'uppercase',
                                        color: 'var(--text-subtle)',
                                        marginBottom: '10px'
                                    }}>
                                        {group.group}
                                    </div>
                                    {group.items.map((item, i) => (
                                        <div key={i} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '8px 0',
                                            borderBottom: i < group.items.length - 1
                                                ? '1px solid rgba(255, 255, 255, 0.03)'
                                                : 'none'
                                        }}>
                                            <span style={{
                                                fontSize: '13px',
                                                color: 'var(--text-main)',
                                                letterSpacing: '-0.005em'
                                            }}>
                                                {item.desc}
                                            </span>
                                            <span style={{ display: 'flex', gap: '4px' }}>
                                                {item.keys.map((k, ki) => (
                                                    <Kbd key={ki}>{k}</Kbd>
                                                ))}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        <div style={{
                            padding: '11px 22px',
                            borderTop: '1px solid rgba(255,255,255,0.05)',
                            background: 'rgba(7, 11, 10, 0.4)',
                            textAlign: 'center',
                            fontSize: '11px',
                            color: 'var(--text-subtle)',
                            letterSpacing: '0.04em'
                        }}>
                            Press <Kbd>?</Kbd> anywhere to open this
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default ShortcutsModal;
