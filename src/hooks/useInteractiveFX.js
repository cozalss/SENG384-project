import { useCallback, useEffect, useMemo, useRef } from 'react';

// Evaluate hover/reduced-motion media queries once per module load — the result
// is stable for the lifetime of the page, so recomputing per mousemove is waste.
let cachedHoverSupport = null;
const supportsHover = () => {
    if (cachedHoverSupport !== null) return cachedHoverSupport;
    if (typeof window === 'undefined' || !window.matchMedia) {
        cachedHoverSupport = false;
        return false;
    }
    cachedHoverSupport =
        window.matchMedia('(hover: hover)').matches &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return cachedHoverSupport;
};

/**
 * Magnetic button: slight translate toward the cursor while hovering.
 * Returns handlers to spread on the target element. Uses e.currentTarget,
 * so the caller does not need to own a ref.
 */
export const useMagnetic = ({ strength = 0.25, max = 12 } = {}) => {
    const enabled = useMemo(() => supportsHover(), []);

    const onMouseMove = useCallback((e) => {
        if (!enabled) return;
        const el = e.currentTarget;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) * strength;
        const dy = (e.clientY - cy) * strength;
        const clampedX = Math.max(-max, Math.min(max, dx));
        const clampedY = Math.max(-max, Math.min(max, dy));
        el.style.transform = `translate3d(${clampedX}px, ${clampedY}px, 0)`;
        el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        el.style.setProperty('--my', `${e.clientY - rect.top}px`);
    }, [enabled, strength, max]);

    const onMouseLeave = useCallback((e) => {
        const el = e.currentTarget;
        if (!el) return;
        el.style.transform = 'translate3d(0, 0, 0)';
    }, []);

    return enabled ? { onMouseMove, onMouseLeave } : {};
};

/**
 * 3D tilt: rotateX/rotateY based on cursor position. No external ref needed.
 * Handlers also update --mouse-x/--mouse-y for the existing radial spotlight.
 */
export const useTilt = ({ max = 8, scale = 1.01 } = {}) => {
    const enabled = useMemo(() => supportsHover(), []);
    const rafRef = useRef(0);
    const pendingRef = useRef(null);

    const onMouseMove = useCallback((e) => {
        if (!enabled) return;
        const el = e.currentTarget;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const px = x / rect.width - 0.5;
        const py = y / rect.height - 0.5;
        const rotY = px * max * 2;
        const rotX = -py * max * 2;

        pendingRef.current = { el, x, y, rotX, rotY };
        if (rafRef.current) return;
        rafRef.current = requestAnimationFrame(() => {
            rafRef.current = 0;
            const p = pendingRef.current;
            if (!p) return;
            p.el.style.setProperty('--mouse-x', `${p.x}px`);
            p.el.style.setProperty('--mouse-y', `${p.y}px`);
            p.el.style.transform = `perspective(1200px) rotateX(${p.rotX.toFixed(2)}deg) rotateY(${p.rotY.toFixed(2)}deg) scale(${scale})`;
        });
    }, [enabled, max, scale]);

    const onMouseEnter = useCallback((e) => {
        if (!enabled) return;
        e.currentTarget?.classList.add('is-tilting');
    }, [enabled]);

    const onMouseLeave = useCallback((e) => {
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = 0;
        }
        pendingRef.current = null;
        const el = e.currentTarget;
        if (!el) return;
        el.classList.remove('is-tilting');
        el.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1)';
    }, []);

    useEffect(() => () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }, []);

    return enabled ? { onMouseMove, onMouseEnter, onMouseLeave } : {};
};
