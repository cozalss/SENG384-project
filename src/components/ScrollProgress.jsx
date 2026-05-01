import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

/**
 * ScrollProgress — Linear-style hairline progress bar fixed at the top
 * of the viewport. Tracks document scroll. Spring-smoothed so quick
 * scroll wheels still read as a fluid line, not a jittery indicator.
 *
 * Hidden on the very first chunk of scroll (top of page) so the hero
 * gets a clean first-paint, then fades in as the user starts scrolling.
 */
const ScrollProgress = () => {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 280,
        damping: 32,
        mass: 0.4,
    });

    const [shown, setShown] = useState(false);
    const shownRef = useRef(false);

    useEffect(() => {
        const onScroll = () => {
            const next = window.scrollY > 80;
            if (shownRef.current === next) return;
            shownRef.current = next;
            setShown(next);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <motion.div
            aria-hidden="true"
            className={`scroll-progress${shown ? ' is-shown' : ''}`}
            style={{ scaleX }}
        />
    );
};

export default ScrollProgress;
