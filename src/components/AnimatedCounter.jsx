import { useEffect, useState, useRef } from 'react';

/**
 * Animates a numeric value with an ease-out curve via requestAnimationFrame.
 *
 * Improvements over the previous setInterval implementation:
 *  - Uses rAF for smooth, frame-accurate animation (no jitter, no division-by-zero
 *    when value is 0 or stepTime collapses to NaN).
 *  - Re-animates on value change (e.g. when filters update a stat tile),
 *    interpolating from the previous count to the new target.
 *  - Respects prefers-reduced-motion — instantly renders the final value.
 *  - Uses IntersectionObserver only for the FIRST render so off-screen tiles
 *    don't burn cycles, but subsequent updates animate immediately.
 */
const AnimatedCounter = ({ value, suffix = '', duration = 1200 }) => {
    const target = Number.isFinite(+value) ? +value : 0;
    const [count, setCount] = useState(target);
    const ref = useRef(null);
    const hasEntered = useRef(false);
    const rafRef = useRef(null);
    const lastTarget = useRef(target);

    useEffect(() => {
        const reduced = typeof window !== 'undefined'
            && window.matchMedia
            && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const animateTo = (from, to) => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            if (reduced || from === to) { setCount(to); return; }
            const start = performance.now();
            const delta = to - from;
            const tick = (now) => {
                const t = Math.min(1, (now - start) / duration);
                // ease-out cubic for premium settle
                const eased = 1 - Math.pow(1 - t, 3);
                setCount(Math.round(from + delta * eased));
                if (t < 1) rafRef.current = requestAnimationFrame(tick);
            };
            rafRef.current = requestAnimationFrame(tick);
        };

        if (!hasEntered.current) {
            // First mount — wait until in view, then run from 0 → target.
            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting && !hasEntered.current) {
                        hasEntered.current = true;
                        lastTarget.current = target;
                        animateTo(0, target);
                        observer.disconnect();
                    }
                },
                { threshold: 0.3 }
            );
            if (ref.current) observer.observe(ref.current);
            return () => observer.disconnect();
        }

        // Subsequent value changes — animate from previous count to new target.
        if (lastTarget.current !== target) {
            const from = lastTarget.current;
            lastTarget.current = target;
            animateTo(from, target);
        }

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [target, duration]);

    return (
        <span ref={ref} className="animated-counter-num">
            {count}{suffix}
        </span>
    );
};

export default AnimatedCounter;
