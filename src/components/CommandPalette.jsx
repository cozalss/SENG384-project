import { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
    Search, LayoutDashboard, FileText, MessageSquare, UserCircle, Shield,
    Plus, ArrowRight, Command as CmdIcon, CornerDownLeft, Sparkles
} from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform);

const CommandPalette = ({ posts = [], user }) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const [prevOpen, setPrevOpen] = useState(false);
    const navigate = useNavigate();
    const inputRef = useRef(null);

    // Reset query/activeIndex when the palette closes — synchronous
    if (open !== prevOpen) {
        setPrevOpen(open);
        if (!open) {
            if (query !== '') setQuery('');
            if (activeIndex !== 0) setActiveIndex(0);
        }
    }

    // Global shortcut
    useEffect(() => {
        const onKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setOpen(o => !o);
            } else if (e.key === 'Escape' && open) {
                setOpen(false);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [open]);

    // Focus input on open
    useEffect(() => {
        if (!open) return;
        const t = setTimeout(() => inputRef.current?.focus(), 60);
        return () => clearTimeout(t);
    }, [open]);

    const actions = useMemo(() => [
        { id: 'new-post', label: 'New Announcement', hint: 'Publish a collaboration request', icon: <Plus size={16} />, path: '/create-post', group: 'Quick Actions', accent: true }
    ], []);

    const pages = useMemo(() => {
        const p = [
            { id: 'feed', label: 'Feed', hint: 'Browse announcements', icon: <LayoutDashboard size={16} />, path: '/dashboard', group: 'Pages' },
            { id: 'my-posts', label: 'My Posts', hint: 'Manage your announcements', icon: <FileText size={16} />, path: '/my-posts', group: 'Pages' },
            { id: 'messages', label: 'Messages', hint: 'Direct conversations', icon: <MessageSquare size={16} />, path: '/chat', group: 'Pages' },
            { id: 'profile', label: 'Profile', hint: 'Your account & data rights', icon: <UserCircle size={16} />, path: '/profile', group: 'Pages' }
        ];
        if (user?.role === 'Admin') {
            p.push({ id: 'admin', label: 'Admin Logs', hint: 'System oversight', icon: <Shield size={16} />, path: '/admin', group: 'Pages' });
        }
        return p;
    }, [user?.role]);

    const filteredItems = useMemo(() => {
        const q = query.trim().toLowerCase();
        const matchesQ = (text) => !q || text.toLowerCase().includes(q);

        const a = actions.filter(x => matchesQ(x.label) || matchesQ(x.hint));
        const pg = pages.filter(x => matchesQ(x.label) || matchesQ(x.hint));

        // Posts — max 6, filtered
        const pst = (posts || [])
            .filter(p => p.status !== 'DELETED')
            .filter(p => !q ||
                p.title?.toLowerCase().includes(q) ||
                p.domain?.toLowerCase().includes(q) ||
                p.explanation?.toLowerCase().includes(q))
            .slice(0, 6)
            .map(p => ({
                id: `post-${p.id}`,
                label: p.title,
                hint: p.domain,
                icon: <Sparkles size={16} />,
                path: `/post/${p.id}`,
                group: 'Announcements'
            }));

        return [...a, ...pg, ...pst];
    }, [query, actions, pages, posts]);

    // Group for rendering
    const grouped = useMemo(() => {
        const g = {};
        filteredItems.forEach(item => {
            if (!g[item.group]) g[item.group] = [];
            g[item.group].push(item);
        });
        return g;
    }, [filteredItems]);

    // Reset active index when query changes — synchronous in-render
    const [prevQuery, setPrevQuery] = useState(query);
    if (query !== prevQuery) {
        setPrevQuery(query);
        if (activeIndex !== 0) setActiveIndex(0);
    }

    const onItemNav = (item) => {
        navigate(item.path);
        setOpen(false);
    };

    const handleInputKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(i => Math.min(i + 1, filteredItems.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const item = filteredItems[activeIndex];
            if (item) onItemNav(item);
        }
    };

    return (
        <>
            {/* Trigger button */}
            <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setOpen(true)}
                aria-label="Open command palette"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 8px 8px 14px',
                    borderRadius: '12px',
                    background: 'rgba(7, 11, 10, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    fontSize: '12.5px',
                    fontFamily: 'var(--font-body)',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    letterSpacing: '0.01em'
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(94, 210, 156, 0.06)';
                    e.currentTarget.style.borderColor = 'rgba(94, 210, 156, 0.25)';
                    e.currentTarget.style.color = '#8be8bc';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(7, 11, 10, 0.5)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.color = 'var(--text-muted)';
                }}
            >
                <Search size={14} />
                <span className="hide-mobile">Search</span>
                <span
                    className="hide-mobile"
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '2px',
                        padding: '2px 7px',
                        borderRadius: '6px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        fontSize: '10px',
                        fontWeight: '700',
                        letterSpacing: '0.05em',
                        color: 'var(--text-subtle)'
                    }}
                >
                    {isMac ? '⌘' : <CmdIcon size={10} />} K
                </span>
            </motion.button>

            {createPortal(
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
                                    background: 'rgba(3, 7, 10, 0.75)',
                                    backdropFilter: 'blur(14px)',
                                    WebkitBackdropFilter: 'blur(14px)'
                                }}
                            />

                            <motion.div
                                initial={{ opacity: 0, y: -20, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 0.96 }}
                                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                                role="dialog"
                                aria-modal="true"
                                className="editorial-panel"
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    position: 'fixed',
                                    top: '14vh',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: 'min(640px, calc(100vw - 32px))',
                                    maxHeight: '70vh',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    zIndex: 9999,
                                    padding: 0,
                                    overflow: 'hidden',
                                    boxShadow: '0 50px 120px rgba(0, 0, 0, 0.6), 0 0 100px rgba(94, 210, 156, 0.14)'
                                }}
                            >
                            {/* Search input header */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '14px',
                                padding: '18px 22px',
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                position: 'relative'
                            }}>
                                <Search size={18} color="#8be8bc" strokeWidth={2.2} />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Search pages, posts, actions…"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={handleInputKeyDown}
                                    style={{
                                        flex: 1,
                                        background: 'transparent',
                                        border: 'none',
                                        outline: 'none',
                                        color: 'var(--text-main)',
                                        fontFamily: 'var(--font-body)',
                                        fontSize: '16px',
                                        letterSpacing: '-0.01em'
                                    }}
                                />
                                <kbd style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                    padding: '4px 8px', borderRadius: '7px',
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    fontSize: '10px', fontWeight: '700',
                                    color: 'var(--text-subtle)',
                                    fontFamily: 'var(--font-body)'
                                }}>
                                    ESC
                                </kbd>
                            </div>

                            {/* Results */}
                            <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
                                {filteredItems.length === 0 ? (
                                    <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        <Search size={30} style={{ opacity: 0.2, margin: '0 auto 14px' }} />
                                        <div style={{ fontSize: '14px', fontWeight: '600' }}>No matches</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-subtle)', marginTop: '4px' }}>
                                            Try different keywords
                                        </div>
                                    </div>
                                ) : (
                                    Object.entries(grouped).map(([group, items]) => (
                                        <div key={group} style={{ padding: '8px 12px 10px' }}>
                                            <div style={{
                                                fontSize: '10px',
                                                fontWeight: '700',
                                                letterSpacing: '0.14em',
                                                textTransform: 'uppercase',
                                                color: 'var(--text-subtle)',
                                                padding: '4px 12px 8px'
                                            }}>
                                                {group}
                                            </div>
                                            {items.map((item) => {
                                                const flatIdx = filteredItems.indexOf(item);
                                                const active = flatIdx === activeIndex;
                                                return (
                                                    <motion.button
                                                        key={item.id}
                                                        onClick={() => onItemNav(item)}
                                                        onMouseEnter={() => setActiveIndex(flatIdx)}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '14px',
                                                            width: '100%',
                                                            padding: '11px 14px',
                                                            borderRadius: '11px',
                                                            background: active ? 'rgba(94, 210, 156, 0.08)' : 'transparent',
                                                            border: `1px solid ${active ? 'rgba(94, 210, 156, 0.2)' : 'transparent'}`,
                                                            color: active ? 'var(--text-main)' : 'var(--text-muted)',
                                                            cursor: 'pointer',
                                                            fontFamily: 'var(--font-body)',
                                                            textAlign: 'left',
                                                            transition: 'background 0.15s, color 0.15s, border-color 0.15s'
                                                        }}
                                                    >
                                                        <span style={{
                                                            width: '32px', height: '32px',
                                                            borderRadius: '10px',
                                                            background: item.accent ? 'linear-gradient(135deg, var(--primary), var(--accent))' : 'rgba(255,255,255,0.04)',
                                                            border: `1px solid ${item.accent ? 'transparent' : 'rgba(255,255,255,0.05)'}`,
                                                            color: item.accent ? '#070b0a' : (active ? '#8be8bc' : 'var(--text-muted)'),
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            flexShrink: 0,
                                                            transition: 'color 0.15s'
                                                        }}>
                                                            {item.icon}
                                                        </span>
                                                        <span style={{ flex: 1, minWidth: 0 }}>
                                                            <div style={{
                                                                fontSize: '13.5px',
                                                                fontWeight: '600',
                                                                letterSpacing: '-0.01em',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap',
                                                                color: active ? 'var(--text-main)' : 'var(--text-main)'
                                                            }}>
                                                                {item.label}
                                                            </div>
                                                            <div style={{
                                                                fontSize: '11.5px',
                                                                color: 'var(--text-subtle)',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap',
                                                                marginTop: '2px'
                                                            }}>
                                                                {item.hint}
                                                            </div>
                                                        </span>
                                                        {active && (
                                                            <span style={{ color: '#8be8bc', display: 'flex', flexShrink: 0 }}>
                                                                <ArrowRight size={14} />
                                                            </span>
                                                        )}
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Footer hints */}
                            <div style={{
                                padding: '10px 22px',
                                borderTop: '1px solid rgba(255,255,255,0.05)',
                                background: 'rgba(7, 11, 10, 0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '18px',
                                fontSize: '10.5px',
                                color: 'var(--text-subtle)',
                                letterSpacing: '0.04em',
                                fontWeight: '500'
                            }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                    <kbd style={{
                                        padding: '2px 6px', borderRadius: '5px',
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)'
                                    }}>↑</kbd>
                                    <kbd style={{
                                        padding: '2px 6px', borderRadius: '5px',
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)'
                                    }}>↓</kbd>
                                    Navigate
                                </span>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                    <kbd style={{
                                        padding: '2px 6px', borderRadius: '5px',
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)',
                                        display: 'inline-flex', alignItems: 'center'
                                    }}>
                                        <CornerDownLeft size={9} />
                                    </kbd>
                                    Open
                                </span>
                                <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                    Powered by
                                    <span style={{ color: '#8be8bc', fontWeight: '700', letterSpacing: '0.08em' }}>HEALTHAI</span>
                                </span>
                            </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
};

export default CommandPalette;
