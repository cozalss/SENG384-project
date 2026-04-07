import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, LogOut, Zap, FileText, LayoutDashboard, UserCircle, Shield, MessageSquare, Bookmark } from 'lucide-react';
import { useState, useEffect } from 'react';
import Notifications from './Notifications';
import ThemeToggle from './ThemeToggle';

const Navbar = ({ user, logout, notifications, dismissNotification, dismissAllNotifications }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (!user) return null;

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { path: '/dashboard', icon: <LayoutDashboard size={16} />, label: 'Feed' },
        { path: '/my-posts', icon: <FileText size={16} />, label: 'My Posts' },
        { path: '/chat', icon: <MessageSquare size={16} />, label: 'Messages' },
        { path: '/profile', icon: <UserCircle size={16} />, label: 'Profile' }
    ];

    if (user.role === 'Admin') {
        navLinks.push({ path: '/admin', icon: <Shield size={16} />, label: 'Admin Logs' });
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            zIndex: 100,
            padding: scrolled ? '8px 24px' : '16px 24px',
            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
            <header
                style={{
                    maxWidth: '1280px',
                    margin: '0 auto',
                    borderRadius: scrolled ? '20px' : 'var(--border-radius-xl)',
                    background: scrolled ? 'var(--surface)' : 'rgba(var(--background), 0.5)',
                    backgroundColor: scrolled ? 'var(--surface)' : 'var(--glass-bg)',
                    backdropFilter: 'blur(24px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                    boxShadow: scrolled
                        ? 'var(--glass-shadow)'
                        : '0 4px 24px rgba(0,0,0,0.1), inset 0 1px 0 0 rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border)',
                    transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
            >
                <div className="flex justify-between items-center" style={{ height: scrolled ? '60px' : '66px', padding: '0 24px', transition: 'height 0.4s ease' }}>

                    <Link to="/dashboard" className="flex items-center gap-3" style={{ color: 'var(--text-main)', textDecoration: 'none' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                            padding: '7px',
                            borderRadius: '10px',
                            boxShadow: '0 4px 14px rgba(99,102,241,0.3), inset 0 2px 0 rgba(255,255,255,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Activity size={20} color="white" />
                        </div>
                        <span style={{ fontSize: '19px', fontWeight: '800', letterSpacing: '-0.04em', fontFamily: 'var(--font-heading)' }}>
                            HEALTH<span style={{ color: 'var(--primary-light)' }}>AI</span>
                        </span>
                    </Link>

                    <nav className="flex items-center gap-2">

                        {/* Navigation Links with Pill Indicator */}
                        <div className="flex items-center" style={{
                            background: 'var(--panel-base)',
                            borderRadius: '12px',
                            padding: '4px',
                            border: '1px solid var(--border)'
                        }}>
                            {navLinks.map(({ path, icon, label }) => (
                                <Link
                                    key={path}
                                    to={path}
                                    style={{
                                        fontSize: '13px',
                                        fontWeight: isActive(path) ? '600' : '500',
                                        color: isActive(path) ? 'var(--text-main)' : 'var(--text-muted)',
                                        textDecoration: 'none',
                                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '8px 14px',
                                        borderRadius: '8px',
                                        background: isActive(path) ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.1))' : 'transparent',
                                        boxShadow: isActive(path) ? 'inset 0 1px 0 rgba(255,255,255,0.05)' : 'none'
                                    }}
                                >
                                    {icon} <span className="hide-mobile">{label}</span>
                                </Link>
                            ))}
                        </div>

                        <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 4px' }}></div>

                        {/* Theme Toggle */}
                        <ThemeToggle />

                        {/* Notifications */}
                        <Notifications
                            notifications={notifications || []}
                            onDismiss={dismissNotification}
                            onDismissAll={dismissAllNotifications}
                        />

                        {/* User Badge */}
                        <div className="flex items-center" style={{
                            background: 'var(--panel-base)',
                            padding: '5px 5px 5px 14px',
                            borderRadius: '999px',
                            border: '1px solid var(--border)'
                        }}>
                            <div className="flex items-center gap-2" style={{ marginRight: '8px' }}>
                                <div style={{
                                    width: '6px', height: '6px', borderRadius: '50%',
                                    background: user.role === 'Engineer' ? 'var(--primary-light)' : 'var(--secondary)',
                                    boxShadow: `0 0 8px ${user.role === 'Engineer' ? 'rgba(99,102,241,0.5)' : 'rgba(16,185,129,0.5)'}`
                                }} />
                                <span className="text-sm font-medium hide-mobile" style={{ fontSize: '13px' }}>{user.name.split(' ').slice(0, 2).join(' ')}</span>
                            </div>

                            <span className={`badge ${user.role === 'Engineer' ? 'badge-primary' : 'badge-success'}`} style={{ fontSize: '10px', boxShadow: 'none', padding: '4px 10px' }}>
                                {user.role === 'Healthcare Professional' ? 'Doctor' : user.role}
                            </span>
                        </div>

                        <button onClick={handleLogout} id="logout-btn" className="flex items-center" style={{
                            background: 'rgba(239, 68, 68, 0.06)',
                            border: '1px solid rgba(239, 68, 68, 0.1)',
                            cursor: 'pointer',
                            color: 'var(--badge-error-text)',
                            fontSize: '14px',
                            transition: 'all 0.25s',
                            padding: '8px',
                            borderRadius: '10px'
                        }}
                            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.06)'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.1)'; }}
                        >
                            <LogOut size={15} />
                        </button>
                    </nav>

                </div>
            </header>
        </div>
    );
};

export default Navbar;
