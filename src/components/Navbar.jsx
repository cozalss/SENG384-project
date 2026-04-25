import { Link, useLocation } from 'react-router-dom';
import { Activity, FileText, LayoutDashboard, UserCircle, Shield, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import Notifications from './Notifications';
import CommandPalette from './CommandPalette';
import UserMenu from './UserMenu';

const Navbar = ({ user, logout, notifications, dismissNotification, dismissAllNotifications, posts = [] }) => {
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!user) return null;

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { path: '/dashboard', icon: <LayoutDashboard size={15} />, label: 'Feed' },
        { path: '/my-posts', icon: <FileText size={15} />, label: 'My Posts' },
        { path: '/chat', icon: <MessageSquare size={15} />, label: 'Messages' },
        { path: '/profile', icon: <UserCircle size={15} />, label: 'Profile' },
    ];

    if (user.role === 'Admin') {
        navLinks.push({ path: '/admin', icon: <Shield size={15} />, label: 'Admin Logs' });
    }

    return (
        <div className={`px-nav-frame ${scrolled ? 'is-scrolled' : ''}`}>
            <motion.header
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className={`nav-premium px-nav-shell ${scrolled ? 'is-scrolled' : ''}`}
            >
                <div className="px-nav-inner">

                    {/* ===== LOGO LOCKUP ===== */}
                    <Link to="/dashboard" className="px-nav-brand">
                        <motion.div
                            whileHover={{ rotate: 6, scale: 1.06 }}
                            whileTap={{ scale: 0.96 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                            className="px-nav-mark"
                        >
                            <Activity size={18} color="#1a1012" strokeWidth={2.6} />
                        </motion.div>
                        <span className="px-nav-wordmark">
                            HEALTH<span className="px-nav-wordmark-accent">AI</span>
                        </span>
                    </Link>

                    {/* ===== NAV PILLS ===== */}
                    <nav className="px-nav-pills">
                        <LayoutGroup id="navbar-links">
                            <div className="px-nav-pill-group">
                                {navLinks.map(({ path, icon, label }) => {
                                    const active = isActive(path);
                                    return (
                                        <Link
                                            key={path}
                                            to={path}
                                            className={`px-nav-link ${active ? 'is-active' : ''}`}
                                        >
                                            {active && (
                                                <motion.span
                                                    layoutId="nav-indicator"
                                                    className="px-nav-indicator"
                                                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                                                />
                                            )}
                                            <span className="px-nav-link-icon">{icon}</span>
                                            <span className="px-nav-link-label hide-mobile">{label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </LayoutGroup>
                    </nav>

                    {/* ===== ACTIONS CLUSTER ===== */}
                    <div className="px-nav-actions">
                        <span className="px-nav-divider" aria-hidden="true" />
                        <CommandPalette posts={posts} user={user} />
                        <Notifications
                            notifications={notifications || []}
                            onDismiss={dismissNotification}
                            onDismissAll={dismissAllNotifications}
                        />
                        <UserMenu user={user} logout={logout} />
                    </div>
                </div>
            </motion.header>
        </div>
    );
};

export default Navbar;
