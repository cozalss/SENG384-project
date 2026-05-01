import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

// Bare-minimum Spline embed — mirrors the SENTINEL AI prompt exactly:
//   <Suspense fallback={<div className="absolute inset-0 bg-hero-bg" />}>
//     <Spline scene="..." className="w-full h-full" />
//   </Suspense>
//
// All earlier orchestration (useLight, idle gating, mouse-event forwarding,
// gradient fallbacks) was stripped because none of it is required for the
// scene to render and any one of them could have been intercepting it.
const Spline = lazy(() => import('@splinetool/react-spline'));

const StaticSplineFallback = () => (
    <div
        aria-hidden="true"
        style={{
            position: 'absolute',
            inset: 0,
            background:
                'radial-gradient(ellipse 72% 58% at 24% 16%, rgba(34, 211, 102, 0.14), transparent 58%), ' +
                'radial-gradient(ellipse 68% 54% at 82% 18%, rgba(34, 211, 238, 0.08), transparent 62%), ' +
                'linear-gradient(135deg, rgba(12, 21, 18, 0.92), rgba(5, 7, 7, 0.96))',
        }}
    />
);

const LandingBackground = ({ hidden = false }) => {
    const reduce = useReducedMotion();
    const containerRef = useRef(null);
    const glowRef = useRef(null);
    // Scroll-driven parallax — translate the Spline wrapper a hair as the user
    // scrolls down, so the cube wall feels like a real depth layer instead of
    // a static backdrop. Wrapper translate only — never touch the Spline scene
    // itself. Range: 0 → -36 px over the first viewport of scroll. GPU-cheap
    // (single transform on a position:fixed element). Coarse-pointer / reduced-
    // motion users get identity transform.
    const { scrollY } = useScroll();
    const parallaxY = useTransform(scrollY, [0, 1200], [0, -36], { clamp: true });
    const parallaxScale = useTransform(scrollY, [0, 1200], [1, 1.04], { clamp: true });

    const [isCoarse, setIsCoarse] = useState(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return false;
        return window.matchMedia('(pointer: coarse)').matches;
    });
    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return;
        const mq = window.matchMedia('(pointer: coarse)');
        const handler = () => setIsCoarse(mq.matches);
        mq.addEventListener?.('change', handler);
        return () => mq.removeEventListener?.('change', handler);
    }, []);

    const useStaticTransform = reduce || isCoarse;
    const saveData = typeof navigator !== 'undefined' && navigator.connection?.saveData;
    const canUseSpline = !reduce && !isCoarse && !saveData;
    const renderSpline = canUseSpline && !hidden;

    // Cursor-tracking green glow — a fixed radial gradient that follows the
    // mouse and uses `mix-blend-mode: screen` so it only brightens the dark
    // gaps between cubes (and the deep faces of the cube wall), never the
    // already-bright highlights. The visual reads as if a green source were
    // bleeding through *from behind* the cube field, even though the layer
    // is technically in front of the Spline canvas.
    //
    // We update transform via a single rAF tick — never on every mousemove —
    // so on a 144 Hz mouse the layer still only paints once per frame.
    // pointerEvents: 'none' so it never intercepts clicks meant for content.
    useEffect(() => {
        if (reduce || isCoarse || hidden) return;
        if (typeof window === 'undefined') return;

        let rafId = 0;
        let running = false;
        let pendingX = window.innerWidth / 2;
        let pendingY = window.innerHeight / 2;
        let lastX = pendingX;
        let lastY = pendingY;

        const tick = () => {
            // Subtle easing toward the latest pointer — gives the halo a hint
            // of weight rather than snapping rigidly to the cursor.
            const dx = pendingX - lastX;
            const dy = pendingY - lastY;
            lastX += dx * 0.18;
            lastY += dy * 0.18;
            const el = glowRef.current;
            if (el) {
                el.style.transform = `translate3d(${lastX - 320}px, ${lastY - 320}px, 0)`;
            }
            if (Math.abs(dx) > 0.6 || Math.abs(dy) > 0.6) {
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
    }, [reduce, isCoarse, hidden]);

    // Restore Spline pointer event forwarding — Spline's canvas sits at
    // z-index: -1 inside this container, so the browser never routes pointer
    // events to it. We synthesize them at window level so the 3D scene's
    // mouse-reactive lighting/orientation behaves naturally on the cube wall.
    useEffect(() => {
        if (reduce || isCoarse || hidden || !renderSpline) return;
        if (typeof window === 'undefined') return;
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
    }, [reduce, isCoarse, hidden, renderSpline]);

    return (
        <div
            ref={containerRef}
            aria-hidden="true"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: -1,
                background:
                    'radial-gradient(ellipse 80% 70% at 20% 10%, rgba(34, 211, 102, 0.10), transparent 58%), ' +
                    'radial-gradient(ellipse 75% 60% at 78% 16%, rgba(34, 211, 238, 0.06), transparent 62%), ' +
                    'linear-gradient(180deg, hsl(0 0% 8%), hsl(154 24% 5%))',
                overflow: 'hidden',
                opacity: hidden ? 0 : 1,
                visibility: hidden ? 'hidden' : 'visible',
                transition: 'opacity 0.3s ease, visibility 0.3s',
            }}
        >
            <motion.div
                style={{
                    position: 'absolute',
                    inset: 0,
                    y: useStaticTransform ? 0 : parallaxY,
                    scale: useStaticTransform ? 1 : parallaxScale,
                    willChange: 'transform',
                }}
            >
                {renderSpline ? (
                    <Suspense fallback={<StaticSplineFallback />}>
                        <Spline
                            scene="https://prod.spline.design/Slk6b8kz3LRlKiyk/scene.splinecode"
                            style={{ width: '100%', height: '100%' }}
                        />
                    </Suspense>
                ) : (
                    <StaticSplineFallback />
                )}
            </motion.div>

            {/* Cursor-tracking green halo — only the dark gaps between cubes
                glow, the cube faces themselves stay unchanged.
                  • `mix-blend-mode: lighten` takes the per-channel max of the
                    Spline pixel and the halo color. Bright cube faces (already
                    light gray) win against the dark green and don't tint;
                    near-black gaps lose to green and pick it up.
                  • The halo color is a DARK saturated green, not the brand
                    bright green — under `lighten`, bright halo colors would
                    win on the green channel even against light cubes and
                    visibly tint them. Dark halo means only true blacks get
                    overwritten.
                  • Heavy blur (28px) softens any hard edges so the effect
                    reads as ambient light, not a painted disc. */}
            {!useStaticTransform && (
                <div
                    ref={glowRef}
                    aria-hidden="true"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: 640,
                        height: 640,
                        pointerEvents: 'none',
                        background:
                            // Green channel capped at 58 so any cube pixel with
                            // green > 58 (i.e. the visible cube faces, which are
                            // mid-gray ~60-180 in this scene) stays UNCHANGED
                            // under the `lighten` blend mode. Only the deep
                            // black gaps between cubes — green channel near 0 —
                            // pick up the halo color. R/B kept very low so the
                            // tint is unmistakably green when it does appear.
                            'radial-gradient(circle at center, ' +
                                'rgba(6, 58, 26, 0.95) 0%, ' +
                                'rgba(4, 44, 20, 0.60) 22%, ' +
                                'rgba(3, 28, 13, 0.28) 48%, ' +
                                'transparent 78%' +
                            ')',
                        mixBlendMode: 'lighten',
                        filter: 'blur(36px)',
                        willChange: 'transform',
                        zIndex: 1,
                        transform: 'translate3d(-9999px, -9999px, 0)',
                    }}
                />
            )}
        </div>
    );
};

export default LandingBackground;
