import { Link } from 'react-router-dom';
import { ArrowDown, ArrowRight, Brain } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import CinematicScene from './CinematicScene';
import '../../styles/cinematic-scene.css';

/**
 * Hero — cinematic landing entrance.
 *
 *   Scroll-out: as the user scrolls past the hero, the entire section
 *   scales down to 0.94 + fades + blurs slightly, so it feels like the
 *   gate is closing behind them rather than just falling off-screen.
 *
 *   Mouse-tracking effects (parallax, magnetic CTAs, custom cursor) were
 *   dropped — they distracted more than they delighted on this layout.
 *
 *   Page-load entrance is a directed framer-motion timeline (replacing the
 *   previous opaque animationDelay cascade): two letterbox bars retract,
 *   then headline → " AI" green glow-in → subhead → description → proof
 *   deck → CTAs → trust line, all from a single staggerChildren container
 *   so the choreography is editable in one place.
 */

// Choreography constants — keep here so the visual rhythm reads at a glance.
const HERO_SHIFT = [0.05, 1, 0.5, 1]; // ease-out-quint-ish, premium snap
const HERO_HEAD_DURATION = 0.85;
const HERO_BODY_DURATION = 0.62;

const heroContainer = {
    hidden: {},
    visible: {
        transition: {
            // Wait for letterbox to retract before any text plays.
            delayChildren: 0.42,
            staggerChildren: 0.11,
        },
    },
};

const heroHeadingVariant = {
    hidden: { opacity: 0, y: 28, clipPath: 'inset(0 0 100% 0)' },
    visible: {
        opacity: 1,
        y: 0,
        clipPath: 'inset(0 0 0% 0)',
        transition: { duration: HERO_HEAD_DURATION, ease: HERO_SHIFT },
    },
};

const heroBodyVariant = {
    hidden: { opacity: 0, y: 18 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: HERO_BODY_DURATION, ease: HERO_SHIFT },
    },
};

const heroCtaVariant = {
    hidden: { opacity: 0, y: 12, scale: 0.96 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
    },
};

// Letterbox bars — two fixed-position rectangles that "open" on page load.
// scaleY: 1 → 0 over 360 ms with a slight delay, then unmount via opacity
// once retracted so they don't intercept paint after the intro.
const letterboxVariant = {
    hidden: { scaleY: 1 },
    visible: {
        scaleY: 0,
        transition: { duration: 0.36, delay: 0.06, ease: [0.83, 0, 0.17, 1] },
    },
};

const Hero = () => {
    const reduce = useReducedMotion();
    const initialState = reduce ? 'visible' : 'hidden';

    return (
        <motion.section
            id="hero"
            data-snap-section="true"
            className="sentinel-scope px-hero landing-hero landing-snap-panel landing-snap-panel--hero"
            initial={initialState}
            animate="visible"
            variants={heroContainer}
            style={{
                position: 'relative',
                minHeight: '100svh',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-end',
                justifyContent: 'flex-start',
                overflow: 'hidden',
                background: 'transparent',
                isolation: 'isolate',
            }}
        >
            {/* Cinematic letterbox — two retracting bars over the hero only.
                Position absolute (not fixed) so they live inside the hero's
                stacking context and never bleed onto the next snap section.
                Pointer-events:none + aria-hidden because they're pure VFX. */}
            {!reduce && (
                <>
                    <motion.div
                        aria-hidden="true"
                        variants={letterboxVariant}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '14vh',
                            background: 'hsl(0 0% 4%)',
                            zIndex: 12,
                            pointerEvents: 'none',
                            transformOrigin: 'top center',
                            willChange: 'transform',
                        }}
                    />
                    <motion.div
                        aria-hidden="true"
                        variants={letterboxVariant}
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '14vh',
                            background: 'hsl(0 0% 4%)',
                            zIndex: 12,
                            pointerEvents: 'none',
                            transformOrigin: 'bottom center',
                            willChange: 'transform',
                        }}
                    />
                </>
            )}

            <div className="landing-hero-cinema-chrome" aria-hidden="true">
                <span className="landing-hero-lightleak landing-hero-lightleak--a" />
                <span className="landing-hero-lightleak landing-hero-lightleak--b" />
                <span className="landing-hero-lightleak landing-hero-lightleak--c" />
                <span className="landing-hero-sweep" />
                <div className="landing-hero-volumetrics">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <span
                            key={i}
                            className={`landing-hero-beam landing-hero-beam--${i + 1}`}
                        />
                    ))}
                </div>
                <div className="landing-hero-depth-grid" />
                <div className="landing-hero-foreground-fins">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <span
                            key={i}
                            style={{
                                '--x': `${8 + i * 13}%`,
                                '--w': `${22 + (i % 3) * 9}px`,
                                '--delay': `${i * -0.72}s`,
                            }}
                        />
                    ))}
                </div>
                <div className="landing-hero-scan-stack">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <span
                            key={i}
                            style={{
                                '--top': `${12 + i * 11}%`,
                                '--delay': `${i * 380}ms`,
                            }}
                        />
                    ))}
                </div>
            </div>

            <CinematicScene />

            {/* Bottom-left content block. All children use the orchestrated
                variants instead of the previous animation-delay cascade so
                the timing is editable in one place at the top of the file. */}
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
                {/* HEADING — clip-mask reveal + " AI" green glow-in pulse */}
                <motion.h1
                    variants={heroHeadingVariant}
                    className="landing-pulse-alive"
                    style={{
                        fontSize: 'clamp(3rem, 8vw, 6rem)',
                        fontWeight: 600,
                        lineHeight: 1.05,
                        letterSpacing: 0,
                        color: 'hsl(0 0% 96%)',
                        marginBottom: 'clamp(0.5rem, 1.5vw, 1rem)',
                        textTransform: 'uppercase',
                        textWrap: 'balance',
                    }}
                >
                    HEALTH<span style={{ color: 'hsl(119 99% 46%)' }}> AI</span>
                </motion.h1>

                {/* SUBHEADING — single value statement */}
                <motion.p
                    variants={heroBodyVariant}
                    style={{
                        fontSize: 'clamp(1.125rem, 2.5vw, 1.875rem)',
                        fontWeight: 300,
                        lineHeight: 1.25,
                        color: 'hsl(0 0% 96% / 0.85)',
                        marginBottom: 'clamp(0.75rem, 2vw, 1.5rem)',
                        letterSpacing: 0,
                        textWrap: 'balance',
                    }}
                >
                    A project workflow for health-tech collaboration.
                </motion.p>

                {/* DESCRIPTION — longer detail */}
                <motion.p
                    variants={heroBodyVariant}
                    style={{
                        fontSize: 'clamp(0.95rem, 1.5vw, 1.25rem)',
                        fontWeight: 300,
                        color: 'hsl(0 0% 80%)',
                        marginBottom: 'clamp(1.5rem, 3vw, 2rem)',
                        lineHeight: 1.6,
                        maxWidth: '40rem',
                        textWrap: 'pretty',
                    }}
                >
                    HEALTH AI is a SENG 384 web platform where healthcare professionals and engineers create collaboration announcements, browse compatible posts, accept NDA terms for protected details, propose external meeting slots, and continue in real-time chat.
                </motion.p>

                <motion.div
                    variants={heroBodyVariant}
                    className="landing-hero-proofdeck"
                    aria-label="Platform safeguards"
                >
                    {[
                        ['Post Wizard', 'Domain, stage, expertise, location, and confidentiality'],
                        ['NDA Gate', 'Protected blueprint opens after interest + NDA acceptance'],
                        ['Workflow Tools', 'Meeting requests, notifications, chat, and admin logs'],
                    ].map(([label, value]) => (
                        <span className="landing-hero-proof" key={label}>
                            <strong>{label}</strong>
                            <small>{value}</small>
                        </span>
                    ))}
                </motion.div>

                {/* TWO CTA BUTTONS — pointer-events:auto re-enables clicks */}
                <motion.div
                    variants={heroCtaVariant}
                    className="landing-hero-actions"
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                    }}
                >
                    <Link
                        to="/login"
                        aria-label="Create a HEALTH AI account"
                        className="hero-cta-primary landing-pulse-alive"
                        style={{
                            pointerEvents: 'auto',
                            background: 'linear-gradient(135deg, hsl(119 99% 50%) 0%, hsl(119 99% 44%) 100%)',
                            color: 'hsl(0 0% 4%)',
                            padding: 'clamp(0.85rem, 2vw, 1.05rem) clamp(1.5rem, 3vw, 2rem)',
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            borderRadius: '0.6rem',
                            cursor: 'pointer',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            border: '1px solid rgba(255, 255, 255, 0.18)',
                            boxShadow: '0 16px 44px rgba(34, 211, 102, 0.34), 0 0 0 1px rgba(34, 211, 102, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.28)',
                            letterSpacing: 0,
                        }}
                    >
                        <Brain size={18} /> Create Account <ArrowRight size={16} />
                    </Link>
                    <a
                        href="#premise"
                        aria-label="Start the landing page flow from the first section"
                        className="hero-cta-secondary"
                        style={{
                            pointerEvents: 'auto',
                            background: 'rgba(255, 255, 255, 0.06)',
                            color: 'hsl(0 0% 96%)',
                            padding: 'clamp(0.85rem, 2vw, 1.05rem) clamp(1.5rem, 3vw, 2rem)',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            borderRadius: '0.6rem',
                            cursor: 'pointer',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            backdropFilter: 'blur(14px)',
                            WebkitBackdropFilter: 'blur(14px)',
                            border: '1px solid rgba(255, 255, 255, 0.14)',
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
                            letterSpacing: 0,
                        }}
                    >
                        <ArrowDown size={16} /> Start the Flow
                    </a>
                </motion.div>

                {/* ECG pulse + trust line: one compact proof row, no extra visual noise. */}
                <motion.div
                    variants={heroBodyVariant}
                    className="landing-hero-trust"
                    style={{
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
                        className="landing-pulse-alive"
                        style={{ width: 120, height: 24, flexShrink: 0, overflow: 'visible' }}
                    >
                        <defs>
                            <linearGradient id="ecg-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="hsl(119 99% 56%)" stopOpacity="0" />
                                <stop offset="50%" stopColor="hsl(119 99% 56%)" stopOpacity="1" />
                                <stop offset="100%" stopColor="hsl(119 99% 56%)" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <line x1="0" y1="14" x2="200" y2="14" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
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
                        .edu OTP registration · NDA-protected posts · Meetings, chat, profile, and admin tools
                    </p>
                </motion.div>
            </div>
        </motion.section>
    );
};

export default Hero;
