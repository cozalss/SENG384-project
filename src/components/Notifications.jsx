import { useState, useEffect } from 'react';
import { Bell, X, MessageSquare, Calendar, CheckCircle2, UserPlus, Clock, ShieldAlert } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
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
            case 'meeting-request': return 'rgba(99, 102, 241, 0.08)';
            case 'meeting-accepted': return 'rgba(52, 211, 153, 0.08)';
            case 'meeting-declined': return 'rgba(239, 68, 68, 0.08)';
            case 'post-closed': return 'rgba(168, 85, 247, 0.08)';
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
            <button
                id="notifications-bell"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: isOpen ? 'rgba(99, 102, 241, 0.08)' : 'var(--background-alt)',
                    border: `1px solid ${isOpen ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.06)'}`,
                    cursor: 'pointer',
                    color: isOpen ? 'var(--primary-light)' : 'var(--text-muted)',
                    padding: '8px',
                    borderRadius: '10px',
                    transition: 'all 0.25s',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                onMouseOver={(e) => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                onMouseOut={(e) => {
                    e.currentTarget.style.color = isOpen ? 'var(--primary-light)' : 'var(--text-muted)';
                    e.currentTarget.style.background = isOpen ? 'rgba(99, 102, 241, 0.08)' : 'var(--background-alt)';
                }}
            >
                <Bell size={18} />
                {unread > 0 && <span className="notification-badge">{unread}</span>}
            </button>

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
                            initial={{ opacity: 0, y: 8, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.96 }}
                            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            className="glass-panel"
                            style={{
                                position: 'absolute', top: 'calc(100% + 12px)', right: 0,
                                width: '400px', maxHeight: '500px', overflowY: 'auto',
                                zIndex: 999, padding: 0,
                                boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(99,102,241,0.04)',
                                border: '1px solid var(--border)',
                                borderRadius: '16px'
                            }}
                        >
                            {/* Header */}
                            <div className="flex justify-between items-center" style={{
                                padding: '20px 20px 16px',
                                borderBottom: '1px solid var(--border)',
                                background: 'var(--panel-light)'
                            }}>
                                <div className="flex items-center gap-3">
                                    <h3 style={{ fontSize: '16px', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>Notifications</h3>
                                    {unread > 0 && (
                                        <span style={{
                                            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                                            color: 'white', fontSize: '10px', fontWeight: '700',
                                            padding: '2px 8px', borderRadius: '999px'
                                        }}>
                                            {unread} new
                                        </span>
                                    )}
                                </div>
                                {notifications.length > 0 && (
                                    <button
                                        onClick={() => { onDismissAll?.(); }}
                                        style={{
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            color: 'var(--primary-light)', fontSize: '12px', fontWeight: '600',
                                            fontFamily: 'var(--font-body)', transition: 'opacity 0.2s'
                                        }}
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>

                            {notifications.length === 0 ? (
                                <div style={{ padding: '56px 20px', textAlign: 'center' }}>
                                    <Bell size={36} style={{ margin: '0 auto 14px', opacity: 0.1 }} />
                                    <p className="text-sm text-muted">No notifications yet</p>
                                    <p className="text-xs" style={{ color: 'var(--text-subtle)', marginTop: '4px' }}>You'll see updates here when someone interacts with your posts.</p>
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
                                                background: n.read ? 'transparent' : 'rgba(99, 102, 241, 0.02)',
                                                transition: 'background 0.2s',
                                                cursor: 'pointer'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.background = 'var(--background-alt)'}
                                            onMouseOut={(e) => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(99, 102, 241, 0.02)'}
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
