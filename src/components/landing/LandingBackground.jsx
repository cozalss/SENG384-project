import { lazy, Suspense, useEffect, useRef } from 'react';

const Spline = lazy(() => import('@splinetool/react-spline'));

const LandingBackground = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        // Spline's canvas sits at z-index: -1 behind all content, so the
        // browser never routes pointer events to it. We listen at window
        // level and synthesize PointerEvents directly on the canvas so the
        // 3D scene can drive its own mouse-reactive lighting/animations.
        const getCanvas = () => containerRef.current?.querySelector('canvas');

        const makeAndDispatch = (type, src) => {
            const canvas = getCanvas();
            if (!canvas) return;

            const pointerInit = {
                clientX: src.clientX,
                clientY: src.clientY,
                screenX: src.screenX,
                screenY: src.screenY,
                button: src.button ?? 0,
                buttons: src.buttons ?? 0,
                pointerId: src.pointerId ?? 1,
                pointerType: src.pointerType || 'mouse',
                isPrimary: true,
                bubbles: true,
                cancelable: true,
                view: window,
            };

            try {
                canvas.dispatchEvent(new PointerEvent(type, pointerInit));
            } catch {
                // no-op
            }

            // Also fire the classic mouse* counterpart
            const mouseType =
                type === 'pointermove' ? 'mousemove' :
                type === 'pointerdown' ? 'mousedown' :
                type === 'pointerup' ? 'mouseup' : null;

            if (mouseType) {
                canvas.dispatchEvent(new MouseEvent(mouseType, pointerInit));
            }
        };

        const onMove = (e) => makeAndDispatch('pointermove', e);
        const onDown = (e) => makeAndDispatch('pointerdown', e);
        const onUp = (e) => makeAndDispatch('pointerup', e);

        window.addEventListener('pointermove', onMove, { passive: true });
        window.addEventListener('pointerdown', onDown, { passive: true });
        window.addEventListener('pointerup', onUp, { passive: true });

        return () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerdown', onDown);
            window.removeEventListener('pointerup', onUp);
        };
    }, []);

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
            }}
        >
            <Suspense
                fallback={
                    <div style={{ position: 'absolute', inset: 0, background: 'hsl(0 0% 8%)' }} />
                }
            >
                <Spline
                    scene="https://prod.spline.design/Slk6b8kz3LRlKiyk/scene.splinecode"
                    style={{ width: '100%', height: '100%' }}
                />
            </Suspense>

            {/* Dark overlay */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.30)',
                    pointerEvents: 'none',
                }}
            />
        </div>
    );
};

export default LandingBackground;
