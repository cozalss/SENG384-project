import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, X, MessageSquare, Calendar, CheckCircle2, UserPlus, Clock, ShieldAlert } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';

const Notifications = ({ notifications = [], onDismiss, onDismissAll }) => {
    const [isOpen, setIsOpen] = useState(false);

    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 60000);
        return () => clearInterval(interval);
    }, []);

    const unread = notifications.filter(n => !n.read).length;

    const getIcon = (type) => {
        switch (type) {
            case 'interest': return <UserPlus size={16} color="#6ee7b7" />;
            case 'meeting-request': return <Calendar size={16} color="#93c5fd" />;
            case 'meeting-accepted': return <CheckCircle2 size={16} color="#34d399" />;
            case 'meeting-declined': return <X size={16} color="#fca5a5" />;
            case 'post-closed': return <CheckCircle2 size={16} color="#c4b5fd" />;
            case 'error': return <ShieldAlert size={16} color="#fca5a5" />;
            default: return <MessageSquare size={16} color="var(--text-muted)" />;
        }
    };

    const getIconBg = (type) => {
        switch (type) {
            case 'interest': return 'rgba(16, 185, 129, 0.08)';
            case 'meeting-request': return 'rgba(96, 165, 250, 0.08)';
            case 'meeting-accepted': return 'rgba(52, 211, 153, 0.08)';
            case 'meeting-declined': return 'rgba(239, 68, 68, 0.08)';
            case 'post-closed': return 'rgba(34, 211, 238, 0.08)';
            case 'error': return 'rgba(239, 68, 68, 0.08)';
            default: return 'var(--surface)';
        }
    };

    const getTimeAgo = (timestamp) => {
        const diff = now - new Date(timestamp).getTime();
        const mins = Math.max(0, Math.floor(diff / 60000));
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    return (
        <div style={{ position: 'relative' }}>
            <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.96 }}
                id="notifications-bell"
                aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
                aria-expanded={isOpen}
                aria-haspopup="menu"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: isOpen ? 'rgba(249, 168, 96, 0.1)' : 'rgba(255, 255, 255, 0.035)',
                    border: `1px solid ${isOpen ? 'rgba(249, 168, 96, 0.32)' : 'rgba(255,255,255,0.08)'}`,
                    cursor: 'pointer',
                    color: isOpen ? '#f5c48a' : 'var(--text-muted)',
                    padding: '9px',
                    borderRadius: '11px',
                    transition: 'background 160ms var(--ease-smooth), border-color 160ms var(--ease-smooth), color 160ms var(--ease-smooth), box-shadow 160ms var(--ease-smooth)',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
                }}
                onMouseOver={(e) => {
                    if (!isOpen) {
                        e.currentTarget.style.color = '#f5c48a';
                        e.currentTarget.style.background = 'rgba(249, 168, 96, 0.08)';
                        e.currentTarget.style.borderColor = 'rgba(249, 168, 96, 0.26)';
                    }
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.color = isOpen ? '#f5c48a' : 'var(--text-muted)';
                    e.currentTarget.style.background = isOpen ? 'rgba(249, 168, 96, 0.1)' : 'rgba(255, 255, 255, 0.035)';
                    e.currentTarget.style.borderColor = isOpen ? 'rgba(249, 168, 96, 0.32)' : 'rgba(255,255,255,0.08)';
                }}
            >
                <Bell size={17} />
                {unread > 0 && <span className="notification-badge">{unread}</span>}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            onClick={() => setIsOpen(false)}
                            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 998 }}
                        />

                        {/* Dropdown */}
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.96 }}
                            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                            className="editorial-panel"
                            style={{
                                position: 'absolute', top: 'calc(100% + 14px)', right: 0,
                                width: 'min(420px, calc(100vw - 24px))',
                                maxHeight: 'min(520px, calc(100vh - 120px))',
                                overflowY: 'auto',
                                zIndex: 999, padding: 0,
                                boxShadow: '0 30px 70px rgba(0,0,0,0.6), 0 0 60px rgba(96, 165, 250, 0.08)'
                            }}
                        >
                            {/* Header */}
                            <div className="flex justify-between items-center" style={{
                                padding: '20px 22px 16px',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                background: 'rgba(7, 11, 10, 0.5)'
                            }}>
                                <div className="flex items-center gap-3">
                                    <h3 style={{ fontSize: '15px', fontWeight: '700', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>Notifications</h3>
                                    {unread > 0 && (
                                        <span className="pill pill-neon" style={{ fontSize: '9.5px', padding: '3px 9px' }}>
                                            {unread} new
                                        </span>
                                    )}
                                </div>
                                {notifications.length > 0 && (
                                    <motion.button
                                        whileHover={{ y: -1 }}
                                        whileTap={{ scale: 0.96 }}
                                        onClick={() => { onDismissAll?.(); }}
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.04)',
                                            border: '1px solid rgba(255, 255, 255, 0.08)',
                                            cursor: 'pointer',
                                            color: '#f5c48a', fontSize: '11.5px', fontWeight: '600',
                                            fontFamily: 'var(--font-body)',
                                            letterSpacing: '0.01em',
                                            transition: 'background 160ms var(--ease-smooth), border-color 160ms var(--ease-smooth)',
                                            padding: '5px 10px',
                                            borderRadius: '8px'
                                        }}
                                    >
                                        Clear all
                                    </motion.button>
                                )}
                            </div>

                            {notifications.length === 0 ? (
                                <div style={{ position: 'relative', padding: '60px 24px 54px', textAlign: 'center', overflow: 'hidden' }}>
                                    {/* Subtle aurora glow behind the empty bell — echoes the site's
                                        amber + teal accent palette so the empty state feels intentional
                                        instead of "the dropdown loaded but has nothing". */}
                                    <div aria-hidden="true" style={{
                                        position: 'absolute', inset: 0, pointerEvents: 'none',
                                        background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(249, 168, 96, 0.08), transparent 65%), radial-gradient(ellipse 55% 45% at 50% 85%, rgba(34, 211, 238, 0.06), transparent 70%)',
                                    }} />
                                    <div style={{
                                        position: 'relative',
                                        width: 48, height: 48,
                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                        borderRadius: 14,
                                        background: 'rgba(255, 255, 255, 0.04)',
                                        border: '1px solid rgba(255, 255, 255, 0.07)',
                                        marginBottom: 14,
                                        color: 'var(--text-muted)',
                                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)'
                                    }}>
                                        <Bell size={20} strokeWidth={1.6} />
                                    </div>
                                    <p style={{
                                        position: 'relative',
                                        fontSize: 14, fontWeight: 600,
                                        fontFamily: 'var(--font-heading)',
                                        letterSpacing: '-0.015em',
                                        color: 'var(--text-main)',
                                        marginBottom: 6
                                    }}>You're all caught up</p>
                                    <p style={{ position: 'relative', fontSize: 12.5, color: 'var(--text-subtle)', maxWidth: 280, margin: '0 auto 14px', lineHeight: 1.55 }}>
                                        Updates on interests, meetings, and post activity will land here.
                                    </p>
                                    {/* Empty-state CTA — premium pattern (Linear, Arc): every empty
                                        view should nudge the user toward one obvious next action. */}
                                    <Link
                                        to="/dashboard"
                                        onClick={() => setIsOpen(false)}
                                        className="px-btn sm"
                                        style={{ position: 'relative' }}
                                    >
                                        Explore the feed
                                    </Link>
                                </div>
                            ) : (
                                <div>
                                    {notifications.map((n, i) => (
                                        <motion.div
                                            key={n.id || i}
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                            style={{
                                                padding: '16px 20px',
                                                borderBottom: '1px solid rgba(255,255,255,0.03)',
                                                display: 'flex', gap: '14px', alignItems: 'flex-start',
                                                background: n.read ? 'transparent' : 'rgba(96, 165, 250, 0.02)',
                                                transition: 'background 0.2s',
                                                cursor: 'pointer'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.background = 'var(--background-alt)'}
                                            onMouseOut={(e) => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(96, 165, 250, 0.02)'}
                                        >
                                            <div style={{
                                                width: '38px', height: '38px', borderRadius: '12px',
                                                background: getIconBg(n.type),
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                flexShrink: 0,
                                                border: '1px solid var(--border)'
                                            }}>
                                                {getIcon(n.type)}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px', lineHeight: '1.4', color: 'var(--text-main)' }}>{n.title}</p>
                                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{n.message}</p>
                                                <div className="flex items-center gap-1 mt-2" style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                                                    <Clock size={10} /> {getTimeAgo(n.timestamp)}
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onDismiss?.(n.id); }}
                                                style={{
                                                    background: 'none', border: 'none', cursor: 'pointer',
                                                    color: 'var(--text-subtle)', padding: '4px', flexShrink: 0,
                                                    borderRadius: '6px', transition: 'all 0.2s',
                                                    display: 'flex'
                                                }}
                                                onMouseOver={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'var(--surface)'; }}
                                                onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-subtle)'; e.currentTarget.style.background = 'none'; }}
                                            >
                                                <X size={14} />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Notifications;
