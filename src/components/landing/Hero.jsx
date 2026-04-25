import { Link } from 'react-router-dom';
import { ArrowDown, ArrowRight, Brain } from 'lucide-react';

/**
 * Hero — Sentinel-template structure with HEALTH AI content.
 *
 * The reference spec calls for: bottom-left content block, single big
 * "BRAND AI" heading (AI in green), subheading, description, two CTA
 * buttons, single trust line. All elements stagger-fade-up via CSS only —
 * no per-word framer-motion (which was the source of first-paint jank).
 *
 * Pointer events on the content wrapper are off so cursor activity reaches
 * the canvas behind it; the CTA buttons opt back in via pointer-events:auto.
 */
const Hero = () => {
    return (
        <section
            className="sentinel-scope px-hero landing-hero"
            style={{
                position: 'relative',
                minHeight: '100svh',
                display: 'flex',
                alignItems: 'flex-end',
                overflow: 'hidden',
                background: 'transparent',
                isolation: 'isolate',
            }}
        >
            <div className="landing-hero-vignette" aria-hidden="true" />

            {/* Bottom-left content block */}
            <div
                className="landing-hero-content"
                style={{
                    position: 'relative',
                    zIndex: 10,
                    pointerEvents: 'none',
                    width: '100%',
                    maxWidth: 'min(92%, 54rem)',
                    padding: 'clamp(6rem, 10vw, 8rem) clamp(1.5rem, 4vw, 2.5rem) clamp(2rem, 5vw, 2.5rem)',
                    fontFamily: 'Sora, sans-serif',
                }}
            >
                {/* HEADING — single "HEALTH" + " AI" (green accent), uppercase, bold display */}
                <h1
                    className="animate-fade-up"
                    style={{
                        opacity: 0,
                        animationDelay: '0.2s',
                        fontSize: 'clamp(3rem, 8vw, 6rem)',
                        // Premium 2026: display weight 600 (was 700/bold per spec — softened
                        // from raw spec for the same visual hierarchy without the heavy feel).
                        fontWeight: 600,
                        lineHeight: 1.05,
                        letterSpacing: '-0.05em',
                        color: 'hsl(0 0% 96%)',
                        marginBottom: 'clamp(0.5rem, 1.5vw, 1rem)',
                        textTransform: 'uppercase',
                        textWrap: 'balance',
                    }}
                >
                    HEALTH<span style={{ color: 'hsl(119 99% 46%)' }}> AI</span>
                </h1>

                {/* SUBHEADING — single value statement */}
                <p
                    className="animate-fade-up"
                    style={{
                        opacity: 0,
                        animationDelay: '0.4s',
                        fontSize: 'clamp(1.125rem, 2.5vw, 1.875rem)',
                        fontWeight: 300,
                        lineHeight: 1.25,
                        color: 'hsl(0 0% 96% / 0.85)',
                        marginBottom: 'clamp(0.75rem, 2vw, 1.5rem)',
                        letterSpacing: '-0.015em',
                        textWrap: 'balance',
                    }}
                >
                    Where medicine meets engineering.
                </p>

                {/* DESCRIPTION — longer detail */}
                <p
                    className="animate-fade-up"
                    style={{
                        opacity: 0,
                        animationDelay: '0.55s',
                        fontSize: 'clamp(0.95rem, 1.5vw, 1.25rem)',
                        fontWeight: 300,
                        color: 'hsl(0 0% 75%)',
                        marginBottom: 'clamp(1.5rem, 3vw, 2rem)',
                        lineHeight: 1.6,
                        maxWidth: '40rem',
                        textWrap: 'pretty',
                    }}
                >
                    A secure, GDPR-compliant platform for structured partner discovery between healthcare professionals and engineers. NDA-gated. No IP stored. No coincidence needed.
                </p>

                {/* TWO CTA BUTTONS — pointer-events:auto re-enables clicks */}
                <div
                    className="animate-fade-up landing-hero-actions"
                    style={{
                        opacity: 0,
                        animationDelay: '0.7s',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                    }}
                >
                    <Link
                        to="/login"
                        aria-label="Join the HEALTH AI network"
                        style={{
                            pointerEvents: 'auto',
                            background: 'hsl(119 99% 46%)',
                            color: 'hsl(0 0% 4%)',
                            padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 3vw, 2rem)',
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 14px 40px rgba(34, 211, 102, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.22)',
                            transition: 'filter 0.2s, transform 0.18s',
                        }}
                    >
                        <Brain size={18} /> Join the Network <ArrowRight size={16} />
                    </Link>
                    <a
                        href="#premise"
                        aria-label="Start the landing page flow from the first section"
                        style={{
                            pointerEvents: 'auto',
                            background: '#fff',
                            color: 'hsl(0 0% 10%)',
                            padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 3vw, 2rem)',
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 14px 30px rgba(255, 255, 255, 0.1)',
                            transition: 'filter 0.2s, transform 0.18s',
                        }}
                    >
                        <ArrowDown size={16} /> Start the Flow
                    </a>
                </div>

                {/* ECG pulse + trust line: one compact proof row, no extra visual noise. */}
                <div
                    className="animate-fade-up landing-hero-trust"
                    style={{
                        opacity: 0,
                        animationDelay: '0.85s',
                        marginTop: 'clamp(1rem, 2vw, 1.5rem)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        flexWrap: 'wrap',
                        color: 'hsl(0 0% 60% / 0.88)',
                    }}
                >
                    <svg
                        aria-hidden="true"
                        viewBox="0 0 200 28"
                        style={{ width: 120, height: 24, flexShrink: 0, overflow: 'visible' }}
                    >
                        <defs>
                            <linearGradient id="ecg-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="hsl(119 99% 56%)" stopOpacity="0" />
                                <stop offset="50%" stopColor="hsl(119 99% 56%)" stopOpacity="1" />
                                <stop offset="100%" stopColor="hsl(119 99% 56%)" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        {/* Faint baseline */}
                        <line x1="0" y1="14" x2="200" y2="14" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                        {/* ECG waveform — looping pulse drawn endlessly across the line */}
                        <path
                            d="M 0 14 L 60 14 L 70 6 L 80 22 L 88 14 L 200 14"
                            fill="none"
                            stroke="url(#ecg-grad)"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeDasharray="220"
                            style={{ animation: 'ecg-sweep 2.4s linear infinite' }}
                        />
                    </svg>
                    <style>{`
                        @keyframes ecg-sweep {
                            0%   { stroke-dashoffset: 220; }
                            100% { stroke-dashoffset: -220; }
                        }
                        @media (prefers-reduced-motion: reduce) {
                            svg path[stroke="url(#ecg-grad)"] { animation: none; stroke-dashoffset: 0; }
                        }
                    `}</style>
                    <p
                        style={{
                            margin: 0,
                            fontSize: '0.75rem',
                            fontWeight: 400,
                            letterSpacing: '0.04em',
                        }}
                    >
                        GDPR compliant · NDA gated · Verified .edu institutions only
                    </p>
                </div>
            </div>
        </section>
    );
};

export default Hero;
