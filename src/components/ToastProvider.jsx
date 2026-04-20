import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContext } from './ToastContext';

const iconMap = {
    success: <CheckCircle2 size={17} strokeWidth={2.4} />,
    error: <AlertTriangle size={17} strokeWidth={2.4} />,
    info: <Info size={17} strokeWidth={2.4} />
};

const colorMap = {
    success: { border: 'rgba(94, 210, 156, 0.35)', bg: 'rgba(94, 210, 156, 0.08)', accent: '#8be8bc' },
    error: { border: 'rgba(239, 68, 68, 0.32)', bg: 'rgba(239, 68, 68, 0.07)', accent: '#fca5a5' },
    info: { border: 'rgba(34, 211, 238, 0.32)', bg: 'rgba(34, 211, 238, 0.07)', accent: '#67e8f9' }
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const dismiss = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const push = useCallback((type, message, opts = {}) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const toast = {
            id, type, message,
            title: opts.title,
            duration: opts.duration ?? 3800
        };
        setToasts(prev => [...prev.slice(-4), toast]); // cap at 5
        if (toast.duration > 0) {
            setTimeout(() => dismiss(id), toast.duration);
        }
        return id;
    }, [dismiss]);

    const api = {
        success: (message, opts) => push('success', message, opts),
        error: (message, opts) => push('error', message, opts),
        info: (message, opts) => push('info', message, opts),
        dismiss
    };

    return (
        <ToastContext.Provider value={api}>
            {children}
            {createPortal(
                <div
                    aria-live="polite"
                    style={{
                        position: 'fixed',
                        top: '24px',
                        right: '24px',
                        zIndex: 99999,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        pointerEvents: 'none',
                        maxWidth: 'calc(100vw - 48px)'
                    }}
                >
                    <AnimatePresence>
                        {toasts.map((t) => {
                            const c = colorMap[t.type];
                            return (
                                <motion.div
                                    key={t.id}
                                    initial={{ opacity: 0, y: -16, scale: 0.96 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, x: 40, scale: 0.94, transition: { duration: 0.2 } }}
                                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                    role="status"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '12px',
                                        padding: '14px 16px 14px 16px',
                                        minWidth: '280px',
                                        maxWidth: '380px',
                                        borderRadius: '14px',
                                        background: `linear-gradient(135deg, ${c.bg}, rgba(7, 11, 10, 0.65))`,
                                        border: `1px solid ${c.border}`,
                                        backdropFilter: 'blur(24px) saturate(140%)',
                                        WebkitBackdropFilter: 'blur(24px) saturate(140%)',
                                        boxShadow: '0 20px 48px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
                                        color: 'var(--text-main)',
                                        pointerEvents: 'auto',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <span style={{
                                        position: 'absolute',
                                        top: 0, left: 0, bottom: 0,
                                        width: '3px',
                                        background: c.accent,
                                        opacity: 0.6
                                    }} />
                                    <span style={{ color: c.accent, display: 'flex', flexShrink: 0, marginTop: '1px' }}>
                                        {iconMap[t.type]}
                                    </span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        {t.title && (
                                            <div style={{
                                                fontSize: '13.5px', fontWeight: '700',
                                                color: c.accent, letterSpacing: '-0.01em',
                                                marginBottom: '2px'
                                            }}>
                                                {t.title}
                                            </div>
                                        )}
                                        <div style={{
                                            fontSize: '13px',
                                            lineHeight: '1.5',
                                            color: 'var(--text-main)',
                                            letterSpacing: '-0.005em'
                                        }}>
                                            {t.message}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => dismiss(t.id)}
                                        aria-label="Dismiss"
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--text-subtle)',
                                            cursor: 'pointer',
                                            padding: '2px',
                                            display: 'flex',
                                            flexShrink: 0,
                                            borderRadius: '6px',
                                            transition: 'color 0.2s'
                                        }}
                                        onMouseOver={(e) => { e.currentTarget.style.color = 'var(--text-main)'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-subtle)'; }}
                                    >
                                        <X size={14} />
                                    </button>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
};
