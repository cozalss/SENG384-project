import { useEffect, useRef, useState } from 'react';
import './AuthBackground.css';

/**
 * AuthBackground — pure-CSS atmospheric backdrop for authenticated routes
 * (Dashboard, Profile, Chat, etc). Replaces the legacy 26 MB DNA-loop video
 * with seven GPU-composited layers. Zero network requests, ~0% CPU at idle.
 *
 *   1. Charcoal floor (deep base)
 *   2. Top-left green bloom — drifting Lissajous
 *   3. Bottom-right teal bloom — opposing drift
 *   4. NEW: Top-right amber accent — asymmetric warm balance
 *   5. NEW: Center soft pulse — slow heartbeat, signals "platform is alive"
 *   6. NEW: Cursor-reactive ambient halo — very dim, follows mouse with ease
 *   7. NEW: Faint ECG ghost line — healthcare motif, ultra-soft
 *   8. Vignette (frames content)
 *
 * Honors prefers-reduced-motion: drops all animation, keeps the static
 * gradient composition. Honors coarse pointer (mobile/touch): kills the
 * cursor halo since there's no meaningful pointer to follow.
 */
const AuthBackground = ({ hidden = false }) => {
    const [reducedMotion, setReducedMotion] = useState(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return false;
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    });
    const [isCoarse, setIsCoarse] = useState(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return false;
        return window.matchMedia('(pointer: coarse)').matches;
    });
    const haloRef = useRef(null);

    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return;
        const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const mqCoarse = window.matchMedia('(pointer: coarse)');
        const onMotion = (e) => setReducedMotion(e.matches);
        const onCoarse = (e) => setIsCoarse(e.matches);
        mqMotion.addEventListener?.('change', onMotion);
        mqCoarse.addEventListener?.('change', onCoarse);
        return () => {
            mqMotion.removeEventListener?.('change', onMotion);
            mqCoarse.removeEventListener?.('change', onCoarse);
        };
    }, []);

    // Cursor-reactive ambient — VERY dim halo that follows the mouse with
    // strong easing. This is the dashboard, not the hero, so the effect is
    // way more restrained than landing: small radius, low alpha, soft blur.
    // Goal is "the room is gently lit by where you look", not a spotlight.
    useEffect(() => {
        if (reducedMotion || isCoarse || hidden) return;
        if (typeof window === 'undefined') return;

        let rafId = 0;
        let running = false;
        let pendingX = window.innerWidth / 2;
        let pendingY = window.innerHeight / 2;
        let lastX = pendingX;
        let lastY = pendingY;

        const tick = () => {
            // Slow easing (0.07) so the halo feels weighty, not snappy. On a
            // dashboard the user moves between widgets, not pixels — quick
            // tracking would feel anxious. The lag reads as "atmosphere".
            const dx = pendingX - lastX;
            const dy = pendingY - lastY;
            lastX += dx * 0.07;
            lastY += dy * 0.07;
            const el = haloRef.current;
            if (el) {
                el.style.transform = `translate3d(${lastX - 280}px, ${lastY - 280}px, 0)`;
            }
            if (Math.abs(dx) > 0.45 || Math.abs(dy) > 0.45) {
                rafId = requestAnimationFrame(tick);
                return;
            }
            running = false;
            rafId = 0;
        };

        const start = () => {
            if (running) return;
            running = true;
            rafId = requestAnimationFrame(tick);
        };
        start();

        const onMove = (e) => {
            pendingX = e.clientX;
            pendingY = e.clientY;
            start();
        };
        window.addEventListener('pointermove', onMove, { passive: true });

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('pointermove', onMove);
        };
    }, [reducedMotion, isCoarse, hidden]);

    return (
        <div
            aria-hidden="true"
            className={[
                'auth-bg',
                hidden ? 'auth-bg--hidden' : '',
                reducedMotion ? 'auth-bg--still' : '',
            ].filter(Boolean).join(' ')}
        >
            <div className="auth-bg-floor" />
            <div className="auth-bg-glow auth-bg-glow--green" />
            <div className="auth-bg-glow auth-bg-glow--teal" />
            <div className="auth-bg-glow auth-bg-glow--amber" />
            <div className="auth-bg-aurora" />
            <div className="auth-bg-pulse" />
            <svg
                className="auth-bg-ecg"
                viewBox="0 0 1600 120"
                preserveAspectRatio="none"
                aria-hidden="true"
            >
                <defs>
                    <linearGradient id="auth-bg-ecg-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="hsl(119 80% 70%)" stopOpacity="0" />
                        <stop offset="50%" stopColor="hsl(119 80% 70%)" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="hsl(180 75% 70%)" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path
                    d="M 0 60 L 280 60 L 320 30 L 360 90 L 400 60 L 760 60 L 800 12 L 840 110 L 880 60 L 1240 60 L 1280 38 L 1320 82 L 1360 60 L 1600 60"
                    fill="none"
                    stroke="url(#auth-bg-ecg-grad)"
                    strokeWidth="1.4"
                />
            </svg>
            {!reducedMotion && !isCoarse && !hidden && (
                <div ref={haloRef} className="auth-bg-cursor-halo" />
            )}
            <div className="auth-bg-vignette" />
        </div>
    );
};

export default AuthBackground;
