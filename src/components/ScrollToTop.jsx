import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scrolls to top whenever the route pathname changes.
 * Placed inside <Router> in App.jsx. Uses 'instant' so route change feels snap,
 * not a slow scroll animation.
 */
const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [pathname]);

    return null;
};

export default ScrollToTop;
