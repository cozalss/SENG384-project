import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

const HLS_SRC = 'https://stream.mux.com/tLkHO1qZoaaQOUeVWo8hEBeGQfySP02EPS02BmnNFyXys.m3u8';

const VideoBackground = ({ hidden = false }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        let hls;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = HLS_SRC;
        } else if (Hls.isSupported()) {
            hls = new Hls({ enableWorker: false });
            hls.loadSource(HLS_SRC);
            hls.attachMedia(video);
        }

        const tryPlay = () => { video.play().catch(() => {}); };
        video.addEventListener('loadedmetadata', tryPlay);
        tryPlay();

        return () => {
            video.removeEventListener('loadedmetadata', tryPlay);
            if (hls) hls.destroy();
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
                background: '#070b0a',
                opacity: hidden ? 0 : 1,
                visibility: hidden ? 'hidden' : 'visible',
                transition: 'opacity 0.5s ease, visibility 0.5s'
            }}
        >
            {/* Video layer — 60% opacity */}
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
                    opacity: 0.6
                }}
            />

            {/* Left-to-right dark gradient (#070b0a → transparent) */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(90deg, #070b0a 0%, rgba(7, 11, 10, 0.6) 30%, rgba(7, 11, 10, 0.2) 60%, transparent 100%)'
            }} />

            {/* Bottom-up readability gradient */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(0deg, rgba(7, 11, 10, 0.92) 0%, rgba(7, 11, 10, 0.55) 30%, rgba(7, 11, 10, 0.15) 65%, transparent 100%)'
            }} />

            {/* Top-down slight darkening for navbar area */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(7, 11, 10, 0.75) 0%, rgba(7, 11, 10, 0.25) 20%, transparent 40%)'
            }} />

            {/* Central horizontal SVG ellipse glow — cyan / dark green */}
            <svg
                style={{
                    position: 'absolute',
                    top: '18%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 'min(1400px, 120%)',
                    height: '520px',
                    opacity: 0.75,
                    mixBlendMode: 'screen',
                    pointerEvents: 'none'
                }}
                viewBox="0 0 1400 520"
                preserveAspectRatio="xMidYMid meet"
            >
                <defs>
                    <filter id="centralGlowBlur" x="-20%" y="-50%" width="140%" height="200%">
                        <feGaussianBlur stdDeviation="25" />
                    </filter>
                    <radialGradient id="centralGlowFill" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#5ed29c" stopOpacity="0.55" />
                        <stop offset="45%" stopColor="#22d3ee" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="#0f3a2d" stopOpacity="0" />
                    </radialGradient>
                </defs>
                <ellipse
                    cx="700"
                    cy="260"
                    rx="580"
                    ry="130"
                    fill="url(#centralGlowFill)"
                    filter="url(#centralGlowBlur)"
                />
            </svg>

            {/* Faint vignette for edges */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(ellipse 100% 80% at 50% 50%, transparent 40%, rgba(7, 11, 10, 0.45) 100%)'
            }} />
        </div>
    );
};

export default VideoBackground;
