import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const LandingNavbar = () => {
    const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' && window.innerWidth >= 768);

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <nav
            className="sentinel-scope"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: `1.25rem ${isDesktop ? '4rem' : '1.5rem'}`,
                fontFamily: 'Sora, sans-serif',
                pointerEvents: 'none',
            }}
        >
            {/* Logo */}
            <Link
                to="/"
                style={{
                    pointerEvents: 'auto',
                    color: 'hsl(0 0% 96%)',
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    letterSpacing: '-0.02em',
                    textDecoration: 'none',
                    fontFamily: 'Sora, sans-serif',
                }}
            >
                HEALTH AI
            </Link>

            {/* Sign In CTA */}
            <Link
                to="/login"
                style={{
                    pointerEvents: 'auto',
                    display: 'inline-flex',
                    alignItems: 'center',
                    color: 'hsl(0 0% 96%)',
                    background: 'hsl(0 0% 18%)',
                    padding: '0.625rem 1.5rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    fontFamily: 'Sora, sans-serif',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'hsl(0 0% 25%)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'hsl(0 0% 18%)')}
            >
                Sign In
            </Link>
        </nav>
    );
};

export default LandingNavbar;
