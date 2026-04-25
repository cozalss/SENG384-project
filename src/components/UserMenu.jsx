import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ChevronDown, UserCircle, Shield, LogOut, Bookmark, FileText } from 'lucide-react';
 
import { motion, AnimatePresence } from 'framer-motion';

const UserMenu = ({ user, logout }) => {
    const [open, setOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, right: 0 });
    const navigate = useNavigate();
    const location = useLocation();
    const wrapperRef = useRef(null);
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);

    // Compute dropdown position relative to viewport from button bounding rect
    const computeCoords = useCallback(() => {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        setCoords({
            top: rect.bottom + 12,
            right: window.innerWidth - rect.right
        });
    }, []);

    useEffect(() => {
        if (!open) return;
        computeCoords();
        window.addEventListener('resize', computeCoords);
        window.addEventListener('scroll', computeCoords, true);
        return () => {
            window.removeEventListener('resize', computeCoords);
            window.removeEventListener('scroll', computeCoords, true);
        };
    }, [open, computeCoords]);

    useEffect(() => {
        if (!open) return;
        const frame = requestAnimationFrame(() => setOpen(false));
        return () => cancelAnimationFrame(frame);
    }, [location.pathname, open]);

    // Close on outside click (checks BOTH the trigger wrapper and the portal dropdown)
    useEffect(() => {
        if (!open) return;
        const onClick = (e) => {
            const inTrigger = wrapperRef.current && wrapperRef.current.contains(e.target);
            const inDropdown = dropdownRef.current && dropdownRef.current.contains(e.target);
            if (!inTrigger && !inDropdown) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, [open]);

    const handleToggle = () => {
        if (!open && buttonRef.current) {
            // Compute coords BEFORE the dropdown first renders to avoid
            // an initial 0,0 flash before the useEffect catches up.
            const rect = buttonRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + 12,
                right: window.innerWidth - rect.right
            });
        }
        setOpen(o => !o);
    };

    const handleLogout = async () => {
        setOpen(false);
        await logout();
        navigate('/login');
    };

    if (!user) return null;

    const firstName = user.name?.split(' ').slice(0, 2).join(' ');
    const initial = user.name?.charAt(0) || '?';
    const roleLabel = user.role === 'Healthcare Professional' ? 'Doctor' : user.role;
    const isEngineer = user.role === 'Engineer';

    const menuItems = [
        { label: 'Profile', hint: 'Your account & data', icon: <UserCircle size={15} />, path: '/profile' },
        { label: 'My Posts', hint: 'Manage announcements', icon: <FileText size={15} />, path: '/my-posts' },
        { label: 'Saved', hint: 'Bookmarked projects', icon: <Bookmark size={15} />, path: '/dashboard', state: { feedType: 'saved' } }
    ];
    if (user.role === 'Admin') {
        menuItems.push({ label: 'Admin Logs', hint: 'System oversight', icon: <Shield size={15} />, path: '/admin' });
    }

    return (
        <div ref={wrapperRef} style={{ position: 'relative' }}>
            <motion.button
                ref={buttonRef}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleToggle}
                aria-label="Account menu"
                aria-haspopup="menu"
                aria-expanded={open}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '4px 12px 4px 4px',
                    borderRadius: '999px',
                    background: open ? 'rgba(249, 168, 96, 0.08)' : 'rgba(255, 255, 255, 0.035)',
                    border: `1px solid ${open ? 'rgba(249, 168, 96, 0.28)' : 'rgba(255, 255, 255, 0.08)'}`,
                    cursor: 'pointer',
                    color: 'var(--text-main)',
                    transition: 'background 180ms cubic-bezier(0.32, 0.72, 0, 1), border-color 180ms cubic-bezier(0.32, 0.72, 0, 1)',
                    fontFamily: 'var(--font-body)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)'
                }}
                onMouseOver={(e) => {
                    if (open) return;
                    e.currentTarget.style.background = 'rgba(249, 168, 96, 0.06)';
                    e.currentTarget.style.borderColor = 'rgba(249, 168, 96, 0.22)';
                }}
                onMouseOut={(e) => {
                    if (open) return;
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.035)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                }}
            >
                {/* Avatar — amber for engineer, emerald for clinician (mirrors Profile) */}
                <span style={{
                    position: 'relative',
                    width: '30px', height: '30px',
                    borderRadius: '999px',
                    background: isEngineer
                        ? 'linear-gradient(135deg, #f5b37a 0%, #f39a54 55%, #ec7b48 100%)'
                        : 'linear-gradient(135deg, #34d399, #6ee7b7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: 700, color: '#1a1012',
                    fontFamily: 'var(--font-heading)',
                    letterSpacing: '-0.02em',
                    boxShadow: isEngineer
                        ? '0 1px 2px rgba(0,0,0,0.22), 0 4px 12px -4px rgba(249, 168, 96, 0.32), inset 0 1px 0 rgba(255,255,255,0.22)'
                        : '0 1px 2px rgba(0,0,0,0.22), 0 4px 12px -4px rgba(52, 211, 153, 0.3), inset 0 1px 0 rgba(255,255,255,0.22)',
                    flexShrink: 0
                }}>
                    {initial}
                    {/* Online status dot — emerald for "available" semantics regardless of role */}
                    <motion.span
                        animate={{ scale: [1, 1.18, 1], opacity: [0.85, 1, 0.85] }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                        style={{
                            position: 'absolute',
                            bottom: '-1px', right: '-1px',
                            width: '10px', height: '10px',
                            borderRadius: '50%',
                            background: '#34d399',
                            border: '2px solid #14111a',
                            boxShadow: '0 0 8px rgba(52, 211, 153, 0.7)'
                        }}
                    />
                </span>

                {/* Name + role — compact on mobile */}
                <span className="hide-mobile" style={{
                    display: 'inline-flex', flexDirection: 'column',
                    alignItems: 'flex-start', lineHeight: '1.1', minWidth: 0
                }}>
                    <span style={{
                        fontSize: '12.5px', fontWeight: '600',
                        color: 'var(--text-main)', letterSpacing: '-0.005em',
                        maxWidth: '130px',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                        {firstName}
                    </span>
                    <span style={{
                        fontSize: '9.5px', fontWeight: '700',
                        letterSpacing: '0.13em', textTransform: 'uppercase',
                        color: isEngineer ? '#f5c48a' : '#6ee7b7',
                        marginTop: '2px'
                    }}>
                        {roleLabel}
                    </span>
                </span>

                <motion.span
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                    style={{ display: 'inline-flex', color: 'var(--text-subtle)' }}
                >
                    <ChevronDown size={14} />
                </motion.span>
            </motion.button>

            {createPortal(
                <AnimatePresence>
                    {open && (
                        <motion.div
                            ref={dropdownRef}
                            initial={{ opacity: 0, y: 8, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.97 }}
                            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                            role="menu"
                            className="editorial-panel"
                            style={{
                                position: 'fixed',
                                top: coords.top,
                                right: coords.right,
                                width: 'min(280px, calc(100vw - 24px))',
                                padding: 0,
                                zIndex: 10000,
                                overflow: 'hidden',
                                boxShadow: '0 30px 70px rgba(0, 0, 0, 0.6), 0 0 60px rgba(96, 165, 250, 0.1)'
                            }}
                        >
                        {/* Identity card at top */}
                        <div style={{
                            padding: '18px 20px 16px',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                            background: 'rgba(7, 11, 10, 0.4)',
                            display: 'flex', alignItems: 'center', gap: '12px'
                        }}>
                            <span style={{
                                width: '40px', height: '40px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '16px', fontWeight: '800', color: '#070b0a',
                                fontFamily: 'var(--font-heading)',
                                boxShadow: '0 8px 18px rgba(96, 165, 250, 0.32), inset 0 1px 0 rgba(255,255,255,0.2)',
                                flexShrink: 0, letterSpacing: '-0.03em'
                            }}>
                                {initial}
                            </span>
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{
                                    fontSize: '13.5px', fontWeight: '700',
                                    color: 'var(--text-main)', letterSpacing: '-0.01em',
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                }}>
                                    {user.name}
                                </div>
                                <div style={{
                                    fontSize: '11px', color: 'var(--text-subtle)',
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                    marginTop: '2px', letterSpacing: '0.02em'
                                }}>
                                    {user.email || roleLabel}
                                </div>
                            </div>
                        </div>

                        {/* Menu items */}
                        <div style={{ padding: '8px' }}>
                            {menuItems.map((item) => (
                                <Link
                                    key={item.label}
                                    to={item.path}
                                    state={item.state}
                                    role="menuitem"
                                    onClick={() => setOpen(false)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '10px 12px',
                                        borderRadius: '10px',
                                        color: 'var(--text-muted)',
                                        textDecoration: 'none',
                                        transition: 'background 0.15s, color 0.15s, transform 0.2s',
                                        fontFamily: 'var(--font-body)'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.background = 'rgba(96, 165, 250, 0.06)';
                                        e.currentTarget.style.color = '#93c5fd';
                                        e.currentTarget.style.transform = 'translateX(2px)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = 'var(--text-muted)';
                                        e.currentTarget.style.transform = 'translateX(0)';
                                    }}
                                >
                                    <span style={{
                                        width: '30px', height: '30px',
                                        borderRadius: '9px',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        {item.icon}
                                    </span>
                                    <span style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'inherit', letterSpacing: '-0.01em' }}>
                                            {item.label}
                                        </div>
                                        <div style={{
                                            fontSize: '11px', color: 'var(--text-subtle)',
                                            marginTop: '1px', letterSpacing: '0.005em'
                                        }}>
                                            {item.hint}
                                        </div>
                                    </span>
                                </Link>
                            ))}
                        </div>

                        {/* Divider + logout */}
                        <div style={{
                            padding: '6px 8px 10px',
                            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                            background: 'rgba(7, 11, 10, 0.25)'
                        }}>
                            <button
                                role="menuitem"
                                onClick={handleLogout}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: 'none',
                                    background: 'transparent',
                                    color: '#fca5a5',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    fontFamily: 'var(--font-body)',
                                    transition: 'background 0.15s, transform 0.2s'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                                    e.currentTarget.style.transform = 'translateX(2px)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.transform = 'translateX(0)';
                                }}
                            >
                                <span style={{
                                    width: '30px', height: '30px',
                                    borderRadius: '9px',
                                    background: 'rgba(239, 68, 68, 0.08)',
                                    border: '1px solid rgba(239, 68, 68, 0.18)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <LogOut size={14} />
                                </span>
                                <span style={{ flex: 1, textAlign: 'left' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '-0.01em' }}>
                                        Sign out
                                    </div>
                                    <div style={{
                                        fontSize: '11px', color: 'var(--text-subtle)',
                                        marginTop: '1px'
                                    }}>
                                        End this session
                                    </div>
                                </span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>,
            document.body
            )}
        </div>
    );
};

export default UserMenu;
