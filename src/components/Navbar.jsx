import { Link, useLocation } from 'react-router-dom';
import { Activity, FileText, LayoutDashboard, UserCircle, Shield, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, LayoutGroup } from 'framer-motion';
import Notifications from './Notifications';
import CommandPalette from './CommandPalette';
import UserMenu from './UserMenu';

const Navbar = ({ user, logout, notifications, dismissNotification, dismissAllNotifications, posts = [] }) => {
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!user) return null;

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { path: '/dashboard', icon: <LayoutDashboard size={15} />, label: 'Feed' },
        { path: '/my-posts', icon: <FileText size={15} />, label: 'My Posts' },
        { path: '/chat', icon: <MessageSquare size={15} />, label: 'Messages' },
        { path: '/profile', icon: <UserCircle size={15} />, label: 'Profile' }
    ];

    if (user.role === 'Admin') {
        navLinks.push({ path: '/admin', icon: <Shield size={15} />, label: 'Admin Logs' });
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, width: '100%',
            zIndex: 100,
            padding: scrolled ? '8px 20px' : '14px 20px',
            transition: 'padding 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
            <motion.header
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="nav-premium"
                style={{
                    maxWidth: '1320px',
                    margin: '0 auto',
                    borderRadius: scrolled ? '18px' : '24px',
                    transition: 'border-radius 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
            >
                <div className="flex justify-between items-center" style={{
                    height: scrolled ? '58px' : '66px',
                    padding: '0 22px',
                    transition: 'height 0.4s ease'
                }}>
                    {/* Logo — hoverable */}
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Link to="/dashboard" className="flex items-center gap-3" style={{ color: 'var(--text-main)', textDecoration: 'none' }}>
                            <motion.div
                                whileHover={{ rotate: 8, scale: 1.08 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                                style={{
                                    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                                    padding: '7px', borderRadius: '11px',
                                    boxShadow: '0 6px 18px rgba(96, 165, 250, 0.4), inset 0 1px 0 rgba(255,255,255,0.25)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                <Activity size={19} color="#070b0a" strokeWidth={2.5} />
                            </motion.div>
                            <span style={{
                                fontSize: '18px', fontWeight: '800', letterSpacing: '-0.04em',
                                fontFamily: 'var(--font-heading)'
                            }}>
                                HEALTH<span style={{
                                    background: 'linear-gradient(135deg, var(--primary-light), var(--accent-light))',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text'
                                }}>AI</span>
                            </span>
                        </Link>
                    </motion.div>

                    <nav className="flex items-center gap-2">
                        {/* Nav pill with animated indicator */}
                        <LayoutGroup id="navbar-links">
                            <div className="flex items-center" style={{
                                background: 'rgba(7, 11, 10, 0.5)',
                                borderRadius: '13px',
                                padding: '4px',
                                border: '1px solid rgba(255, 255, 255, 0.05)'
                            }}>
                                {navLinks.map(({ path, icon, label }) => {
                                    const active = isActive(path);
                                    return (
                                        <Link
                                            key={path}
                                            to={path}
                                            style={{
                                                position: 'relative',
                                                fontSize: '12.5px',
                                                fontWeight: active ? '700' : '500',
                                                color: active ? '#070b0a' : 'var(--text-muted)',
                                                textDecoration: 'none',
                                                transition: 'color 0.3s ease',
                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                padding: '8px 14px',
                                                borderRadius: '9px',
                                                letterSpacing: '0.01em'
                                            }}
                                        >
                                            {active && (
                                                <motion.span
                                                    layoutId="nav-indicator"
                                                    style={{
                                                        position: 'absolute', inset: 0,
                                                        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                                                        borderRadius: '9px', zIndex: -1,
                                                        boxShadow: '0 6px 18px rgba(96, 165, 250, 0.35)'
                                                    }}
                                                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                                />
                                            )}
                                            {icon} <span className="hide-mobile">{label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </LayoutGroup>

                        <div style={{ width: '1px', height: '22px', background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />

                        {/* ⌘K Command palette trigger */}
                        <CommandPalette posts={posts} user={user} />

                        {/* Notifications */}
                        <Notifications
                            notifications={notifications || []}
                            onDismiss={dismissNotification}
                            onDismissAll={dismissAllNotifications}
                        />

                        {/* User menu (avatar + dropdown with Profile / Saved / Logout) */}
                        <UserMenu user={user} logout={logout} />
                    </nav>
                </div>
            </motion.header>
        </div>
    );
};

export default Navbar;
