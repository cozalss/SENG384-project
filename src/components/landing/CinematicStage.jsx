import { useEffect, useRef } from 'react';

/**
 * CinematicStage — wraps the cinematic sections (Two Sides → Final CTA)
 * with a SINGLE sticky background video. Replaces the previous pattern
 * where every section instantiated its own `<video>` pair, producing
 * four unrelated atmospheres that read as four trailers stitched together.
 *
 * With this stage:
 *  - The video sits behind every cinematic section, pinned via
 *    `position: sticky` so it survives the scroll between sections.
 *  - Each child section keeps its own `.px-cap-veil` for foreground
 *    legibility, but the underlying atmosphere is continuous.
 *  - Crossfade is still used for seamless looping (no black flash on
 *    the seam between iterations).
 *
 * Default video is a slow, near-black UHD water-drop clip from Pexels —
 * royalty-free, atmospheric, and small enough (~9MB) to load fast.
 * Pass a different `videoSrc` if you want to swap.
 */

const DEFAULT_VIDEO = 'https://videos.pexels.com/video-files/16392049/16392049-uhd_2560_1440_24fps.mp4';
const CROSSFADE_MS = 900;

const CinematicStage = ({ videoSrc = DEFAULT_VIDEO, children }) => {
    const aRef = useRef(null);
    const bRef = useRef(null);

    useEffect(() => {
        const a = aRef.current;
        const b = bRef.current;
        if (!a || !b) return;

        a.src = videoSrc; b.src = videoSrc;
        a.loop = false; b.loop = false;
        b.pause();

        a.style.transition = `opacity ${CROSSFADE_MS}ms linear`;
        b.style.transition = `opacity ${CROSSFADE_MS}ms linear`;

        let active = a, standby = b;
        active.style.opacity = '1';
        standby.style.opacity = '0';

        let crossfading = false;
        let swapTimer = 0;
        let rafId = 0;

        active.play().catch(() => {});

        const tick = () => {
            rafId = requestAnimationFrame(tick);
            if (crossfading) return;
            const d = active.duration;
            if (!d || isNaN(d)) return;
            if ((d - active.currentTime) > CROSSFADE_MS / 1000) return;

            crossfading = true;
            standby.currentTime = 0;
            standby.play().catch(() => {});
            active.style.opacity = '0';
            standby.style.opacity = '1';
            swapTimer = window.setTimeout(() => {
                active.pause();
                active.currentTime = 0;
                const prev = active;
                active = standby;
                standby = prev;
                crossfading = false;
            }, CROSSFADE_MS);
        };
        rafId = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(rafId);
            clearTimeout(swapTimer);
            a.pause();
            b.pause();
        };
    }, [videoSrc]);

    return (
        <div className="px-cinematic-stage">
            <div className="px-cinematic-bg" aria-hidden="true">
                <video ref={aRef} muted playsInline preload="auto" />
                <video ref={bRef} muted playsInline preload="auto" style={{ opacity: 0 }} />
                <div className="px-cinematic-bg-tone" />
            </div>
            {children}
        </div>
    );
};

export default CinematicStage;
