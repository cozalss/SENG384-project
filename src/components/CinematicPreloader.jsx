import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * CinematicPreloader — first-paint brand entrance.
 *
 * Plays a 1.6s brand intro on the very first visit of a session, then
 * fades out and is gone for the rest of the session. Skippable by click,
 * Escape, Enter, or Space — the latter three keep keyboard-only users from
 * being trapped behind the splash for the full duration (WCAG 2.1.1).
 */

const SESSION_KEY = 'healthai-preloader-played';
const DISMISS_KEYS = new Set(['Escape', 'Enter', ' ', 'Spacebar']);

const CinematicPreloader = () => {
    // Lazy initializers read window/sessionStorage once at mount time so we
    // don't trigger a second render via setState-in-effect (eslint rule
    // react-hooks/set-state-in-effect).
    const [reduced] = useState(() => {
        if (typeof window === 'undefined') return false;
        return !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    });
    const [show, setShow] = useState(() => {
        if (typeof window === 'undefined') return false;
        try {
            return sessionStorage.getItem(SESSION_KEY) !== '1';
        } catch { return true; }
    });

    useEffect(() => {
        if (!show) return;
        try { sessionStorage.setItem(SESSION_KEY, '1'); } catch { /* ignore */ }
        const dismissAt = reduced ? 300 : 950;
        const id = setTimeout(() => setShow(false), dismissAt);
        const onKeyDown = (e) => {
            if (DISMISS_KEYS.has(e.key)) {
                e.preventDefault();
                setShow(false);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => {
            clearTimeout(id);
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [show, reduced]);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="cpl-root"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.04, filter: 'blur(8px)' }}
                    transition={{ duration: 0.55, ease: [0.64, 0, 0.78, 0] }}
                    onClick={() => setShow(false)}
                    role="button"
                    tabIndex={0}
                    aria-label="HEALTH AI brand intro — press Escape, Enter, or click to skip"
                >
                    <div className="cpl-stage">
                        <svg viewBox="0 0 240 240" className="cpl-mono" aria-hidden="true">
                            <defs>
                                <radialGradient id="cpl-glow" cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" stopColor="hsl(119 99% 56%)" stopOpacity="0.55" />
                                    <stop offset="60%" stopColor="hsl(119 99% 56%)" stopOpacity="0.10" />
                                    <stop offset="100%" stopColor="hsl(119 99% 56%)" stopOpacity="0" />
                                </radialGradient>
                                <linearGradient id="cpl-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="hsl(119 99% 62%)" />
                                    <stop offset="100%" stopColor="hsl(155 80% 65%)" />
                                </linearGradient>
                            </defs>

                            <circle cx="120" cy="120" r="115" fill="url(#cpl-glow)" />

                            <motion.circle
                                cx="120" cy="120" r="92"
                                fill="none"
                                stroke="rgba(34, 211, 102, 0.28)"
                                strokeWidth="1"
                                strokeDasharray="3 5"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: reduced ? 0.01 : 0.7, ease: [0.22, 1, 0.36, 1] }}
                            />

                            <motion.circle
                                cx="120" cy="120" r="68"
                                fill="none"
                                stroke="hsl(119 99% 56%)"
                                strokeWidth="1.4"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: reduced ? 0.01 : 0.85, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                            />

                            {[0, 0.5, 1.0].map((d, i) => (
                                <motion.circle
                                    key={i}
                                    cx="120" cy="120" r="68"
                                    fill="none"
                                    stroke="hsl(119 99% 56%)"
                                    strokeWidth="1"
                                    initial={{ scale: 1, opacity: 0 }}
                                    animate={reduced ? { opacity: 0 } : { scale: [1, 1.7], opacity: [0.5, 0] }}
                                    transition={{ duration: 1.6, delay: d, ease: 'easeOut' }}
                                    style={{ transformOrigin: '120px 120px' }}
                                />
                            ))}

                            <motion.circle
                                cx="120" cy="120" r="46"
                                fill="hsl(0 0% 6%)"
                                stroke="url(#cpl-stroke)"
                                strokeWidth="1.6"
                                initial={{ scale: 0.6, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: reduced ? 0.01 : 0.55, delay: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
                                style={{ transformOrigin: '120px 120px' }}
                            />

                            <motion.path
                                d="M 86 120 L 102 120 L 108 105 L 116 140 L 124 110 L 130 120 L 154 120"
                                fill="none"
                                stroke="hsl(119 99% 60%)"
                                strokeWidth="2.4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: reduced ? 0.01 : 0.85, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                style={{ filter: 'drop-shadow(0 0 8px hsl(119 99% 56%))' }}
                            />
                        </svg>

                        <motion.div
                            className="cpl-lockup"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: reduced ? 0.01 : 0.6, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <span className="cpl-wordmark">HEALTH<span> AI</span></span>
                            <span className="cpl-tagline">Where medicine meets engineering.</span>
                        </motion.div>

                        <motion.div
                            className="cpl-bar"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: reduced ? 1 : 1 }}
                            transition={{ duration: reduced ? 0.01 : 1.4, ease: [0.22, 1, 0.36, 1] }}
                            aria-hidden="true"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CinematicPreloader;
