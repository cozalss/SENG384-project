import { useRef, useEffect } from 'react';

const VIDEO_SRC = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260306_074215_04640ca7-042c-45d6-bb56-58b1e8a42489.mp4";

// Crossfade the last CROSSFADE_MS of one loop with the first CROSSFADE_MS of
// the next so the seam where the video would normally jump back to t=0 is
// invisible. Tuned to be long enough to hide frame content mismatch but short
// enough that the video's overall rhythm still feels continuous.
const CROSSFADE_MS = 900;

const VideoBackground = ({ hidden = false }) => {
    const aRef = useRef(null);
    const bRef = useRef(null);

    useEffect(() => {
        const a = aRef.current;
        const b = bRef.current;
        if (!a || !b) return;

        // Same URL on both — browser dedupes the network request, so this is
        // effectively one download feeding two <video> elements.
        a.src = VIDEO_SRC;
        b.src = VIDEO_SRC;

        // Manual looping via crossfade, so the native `loop` attribute is off.
        a.loop = false;
        b.loop = false;
        // Ensure standby doesn't auto-start — we trigger it during crossfade.
        b.pause();

        a.style.transition = `opacity ${CROSSFADE_MS}ms linear`;
        b.style.transition = `opacity ${CROSSFADE_MS}ms linear`;

        let active = a;
        let standby = b;
        active.style.opacity = '1';
        standby.style.opacity = '0';

        let crossfading = false;
        let swapTimer = 0;
        let rafId = 0;

        const startActive = () => {
            active.play().catch(() => {});
        };
        startActive();

        // Poll currentTime every frame — timeupdate fires too coarsely (~4Hz
        // in some browsers) and can miss the crossfade window on shorter clips.
        const tick = () => {
            rafId = requestAnimationFrame(tick);
            if (crossfading) return;
            const d = active.duration;
            if (!d || isNaN(d)) return;
            const remaining = d - active.currentTime;
            if (remaining > CROSSFADE_MS / 1000) return;

            crossfading = true;
            standby.currentTime = 0;
            standby.play().catch(() => {});
            // Flip opacities — CSS transition animates the fade.
            active.style.opacity = '0';
            standby.style.opacity = '1';

            swapTimer = window.setTimeout(() => {
                // The old active finished its natural duration; rewind silently.
                active.pause();
                active.currentTime = 0;
                // Swap roles for next cycle.
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
    }, []);

    const videoStyle = {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        // transform: translateZ(0) promotes each video to its own compositor
        // layer so the crossfade is a pure GPU composite with no paint cost.
        transform: 'translateZ(0)',
        willChange: 'opacity',
    };

    return (
        <div
            aria-hidden="true"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: -3,
                pointerEvents: 'none',
                overflow: 'hidden',
                background: '#000',
                opacity: hidden ? 0 : 1,
                visibility: hidden ? 'hidden' : 'visible',
                transition: 'opacity 0.3s ease, visibility 0.3s',
            }}
        >
            {/* autoPlay is intentionally absent: the effect above drives play/pause
                manually so the two videos never fight over the "first play" slot. */}
            <video ref={aRef} muted playsInline preload="auto" style={videoStyle} />
            <video ref={bRef} muted playsInline preload="auto" style={videoStyle} />
        </div>
    );
};

export default VideoBackground;
