import { useRef, useEffect } from 'react';

const VIDEO_SRC = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_105406_16f4600d-7a92-4292-b96e-b19156c7830a.mp4";

const VideoBackground = ({ hidden = false }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        let hlsInstance = null;
        let cancelled = false;

        if (VIDEO_SRC.endsWith('.m3u8')) {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = VIDEO_SRC;
                video.play().catch(() => {});
            } else {
                import('hls.js').then(({ default: Hls }) => {
                    if (cancelled) return;
                    if (!Hls.isSupported()) return;
                    hlsInstance = new Hls({
                        enableWorker: true,
                        lowLatencyMode: false,
                        backBufferLength: 90,
                        maxBufferLength: 30,
                        maxMaxBufferLength: 60,
                        abrEwmaDefaultEstimate: 5000000,
                    });
                    hlsInstance.loadSource(VIDEO_SRC);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
                        video.play().catch(() => {});
                    });
                });
            }
        } else {
            video.src = VIDEO_SRC;
            video.play().catch(() => {});
        }

        return () => {
            cancelled = true;
            if (hlsInstance) hlsInstance.destroy();
        };
    }, []);

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
                transition: 'opacity 0.6s ease, visibility 0.6s',
            }}
        >
            <video
                ref={videoRef}
                muted
                autoPlay
                loop
                playsInline
                preload="auto"
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: 1,
                }}
            />

            {/* Glassmorphic gradient overlay */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: `
                    linear-gradient(
                        180deg,
                        rgba(0, 0, 0, 0.45) 0%,
                        rgba(0, 0, 0, 0.10) 35%,
                        rgba(0, 0, 0, 0.10) 65%,
                        rgba(0, 0, 0, 0.55) 100%
                    )
                `,
            }} />

            {/* Subtle frosted-glass vignette */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: `
                    radial-gradient(
                        ellipse at center,
                        transparent 40%,
                        rgba(0, 0, 0, 0.35) 100%
                    )
                `,
            }} />
        </div>
    );
};

export default VideoBackground;
