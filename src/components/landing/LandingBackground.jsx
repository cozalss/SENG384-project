import { lazy, Suspense, useEffect, useRef, useState } from 'react';

const Spline = lazy(() => import('@splinetool/react-spline'));

/**
 * Static aurora — also doubles as the suspense fallback while the Spline
 * chunk downloads, AND as the first paint before the idle-callback fires.
 */
const StaticFallback = () => (
    <div
        style={{
            position: 'absolute',
            inset: 0,
            background:
                'radial-gradient(ellipse 70% 60% at 18% 28%, rgba(34, 211, 102, 0.18), transparent 60%),' +
                'radial-gradient(ellipse 60% 55% at 82% 72%, rgba(34, 211, 238, 0.14), transparent 60%),' +
                'radial-gradient(ellipse 80% 70% at 50% 108%, rgba(110, 231, 183, 0.10), transparent 65%),' +
                'hsl(0 0% 8%)',
        }}
    />
);

/**
 * LandingBackground — Spline 3D scene (the cube field from the spec).
 *
 *   scene: https://prod.spline.design/Slk6b8kz3LRlKiyk/scene.splinecode
 *
 * Behavior:
 *   • `hidden` prop fades the whole layer out (used by App.jsx so the same
 *     instance stays mounted across routes — Login → Landing returns are
 *     instant because the WebGL context isn't destroyed).
 *   • Spline import is gated by `requestIdleCallback` so first paint isn't
 *     blocked by the 2MB+ chunk; fallback gradient covers the gap.
 *   • Light-mode (mobile / reduced-motion / save-data / low-memory) skips
 *     the 3D scene entirely and renders only the fallback.
 *   • When `hidden=true`, the inner Spline wrapper is `display:none` so the
 *     browser pauses the WebGL render loop — no CPU/GPU cost off-route.
 *
 * Pointer events from the page reach the canvas via window-level listeners
 * dispatched directly to the canvas, since the layer sits at z-index:-1.
 */
const LandingBackground = ({ hidden = false }) => {
    const containerRef = useRef(null);

    const [useLight, setUseLight] = useState(() => {
        if (typeof window === 'undefined') return true;
        const mobile = window.matchMedia?.('(max-width: 767px)').matches;
        const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        const conn = navigator.connection;
        const slowNet = conn && (conn.saveData || /2g/.test(conn.effectiveType || ''));
        const lowMem = typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 2;
        return Boolean(mobile || reduced || slowNet || lowMem);
    });

    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return;
        const mqMobile = window.matchMedia('(max-width: 767px)');
        const mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setUseLight(mqMobile.matches || mqReduced.matches);
        mqMobile.addEventListener?.('change', update);
        mqReduced.addEventListener?.('change', update);
        return () => {
            mqMobile.removeEventListener?.('change', update);
            mqReduced.removeEventListener?.('change', update);
        };
    }, []);

    // Defer Spline import until idle so first paint isn't blocked.
    const [initSpline, setInitSpline] = useState(false);
    useEffect(() => {
        if (useLight) return;
        if (typeof window === 'undefined') return;
        if ('requestIdleCallback' in window) {
            const id = window.requestIdleCallback(() => setInitSpline(true), { timeout: 2200 });
            return () => window.cancelIdleCallback?.(id);
        }
        const t = setTimeout(() => setInitSpline(true), 900);
        return () => clearTimeout(t);
    }, [useLight]);

    // Forward window pointer events to the Spline canvas (it sits at z:-1
    // and otherwise wouldn't receive them, breaking its mouse-reactive lighting).
    useEffect(() => {
        if (useLight || hidden) return;
        const getCanvas = () => containerRef.current?.querySelector('canvas');

        const dispatch = (type, src) => {
            const canvas = getCanvas();
            if (!canvas) return;
            const init = {
                clientX: src.clientX, clientY: src.clientY,
                screenX: src.screenX, screenY: src.screenY,
                button: src.button ?? 0, buttons: src.buttons ?? 0,
                pointerId: src.pointerId ?? 1,
                pointerType: src.pointerType || 'mouse',
                isPrimary: true, bubbles: true, cancelable: true, view: window,
            };
            try { canvas.dispatchEvent(new PointerEvent(type, init)); } catch { /* no-op */ }
            const mouseType =
                type === 'pointermove' ? 'mousemove' :
                type === 'pointerdown' ? 'mousedown' :
                type === 'pointerup' ? 'mouseup' : null;
            if (mouseType) canvas.dispatchEvent(new MouseEvent(mouseType, init));
        };

        const onMove = (e) => dispatch('pointermove', e);
        const onDown = (e) => dispatch('pointerdown', e);
        const onUp = (e) => dispatch('pointerup', e);

        window.addEventListener('pointermove', onMove, { passive: true });
        window.addEventListener('pointerdown', onDown, { passive: true });
        window.addEventListener('pointerup', onUp, { passive: true });
        return () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerdown', onDown);
            window.removeEventListener('pointerup', onUp);
        };
    }, [useLight, hidden]);

    return (
        <div
            ref={containerRef}
            aria-hidden="true"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: -1,
                background: 'hsl(0 0% 8%)',
                overflow: 'hidden',
                opacity: hidden ? 0 : 1,
                visibility: hidden ? 'hidden' : 'visible',
                transition: 'opacity 0.3s ease, visibility 0.3s',
                pointerEvents: hidden ? 'none' : undefined,
            }}
        >
            {useLight ? (
                <StaticFallback />
            ) : (
                <>
                    <StaticFallback />
                    {initSpline && (
                        <div
                            style={{
                                position: 'absolute',
                                inset: 0,
                                display: hidden ? 'none' : 'block',
                            }}
                        >
                            <Suspense
                                fallback={<div style={{ position: 'absolute', inset: 0 }} />}
                            >
                                <Spline
                                    scene="https://prod.spline.design/Slk6b8kz3LRlKiyk/scene.splinecode"
                                    style={{ width: '100%', height: '100%' }}
                                />
                            </Suspense>
                        </div>
                    )}
                </>
            )}

            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'transparent',
                    pointerEvents: 'none',
                }}
            />
        </div>
    );
};

export default LandingBackground;
