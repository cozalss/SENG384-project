import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * StickyShowcase — pinned cinematic 3-act scrollytelling.
 *
 * 2026 Apple/Linear pattern: a single viewport stays pinned while content
 * morphs through three acts as the user scrolls. Each act fades + scales
 * over its third of the section's scroll range. The visual on the right
 * cross-fades between three scene illustrations in lockstep with the text.
 *
 * Acts (HEALTH AI narrative):
 *   1. The problem — bedside ideas don't reach engineers, and vice versa.
 *   2. The bridge — a structured first contact, NDA-gated.
 *   3. The product — the platform that turns intent into a partnership.
 */
const ACTS = [
    {
        eyebrow: 'Act I — The problem',
        heading: ['A clinician sees a problem.', 'An engineer has the tools.'],
        body: 'They never meet. The right collaboration disappears into noise — DMs, conference hallways, lucky coincidences.',
        accent: 'hsl(0 84% 65%)',
    },
    {
        eyebrow: 'Act II — The bridge',
        heading: ['Structured first contact.', 'NDA before details.'],
        body: 'A short post, an interest expressed, an NDA both sides accept. Only then do technical specifics open. No IP stored.',
        accent: 'hsl(48 96% 60%)',
    },
    {
        eyebrow: 'Act III — The product',
        heading: ['HEALTH AI', 'turns intent into partnership.'],
        body: 'Post in minutes, propose meeting slots, decide externally on Zoom or Teams, mark the post Partner Found. The platform facilitates — never records.',
        accent: 'hsl(119 99% 56%)',
    },
];

const SceneVisual = ({ progress, idx, accent }) => {
    // Each scene fades in for its third of the scroll range. Smooth crossfade.
    const start = idx / ACTS.length;
    const mid = (idx + 0.5) / ACTS.length;
    const end = (idx + 1) / ACTS.length;
    const opacity = useTransform(progress, [start, mid, end], [0, 1, idx === ACTS.length - 1 ? 1 : 0]);
    const scale = useTransform(progress, [start, mid, end], [0.92, 1, idx === ACTS.length - 1 ? 1 : 1.05]);

    return (
        <motion.div
            style={{
                position: 'absolute',
                inset: 0,
                opacity,
                scale,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {/* Concentric pulse rings — abstract scene representation */}
            <svg viewBox="0 0 400 400" style={{ width: '88%', maxWidth: 460, height: 'auto', overflow: 'visible' }}>
                <defs>
                    <radialGradient id={`ring-grad-${idx}`} cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={accent} stopOpacity="0.6" />
                        <stop offset="60%" stopColor={accent} stopOpacity="0.16" />
                        <stop offset="100%" stopColor={accent} stopOpacity="0" />
                    </radialGradient>
                </defs>

                {/* outer glow disc */}
                <circle cx="200" cy="200" r="180" fill={`url(#ring-grad-${idx})`} />

                {/* concentric rings */}
                {[80, 120, 160].map((r, i) => (
                    <motion.circle
                        key={r}
                        cx="200" cy="200" r={r}
                        fill="none"
                        stroke={accent}
                        strokeOpacity={0.4 - i * 0.1}
                        strokeWidth={1}
                        animate={{ scale: [1, 1.04, 1] }}
                        transition={{
                            duration: 4 + i * 0.6,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: i * 0.4,
                        }}
                        style={{ transformOrigin: '200px 200px' }}
                    />
                ))}

                {/* rotating hand-off paths: gives the scrollytelling visual a
                    clearer "matching system" signal than static rings alone. */}
                <motion.g
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 22 + idx * 4, repeat: Infinity, ease: 'linear' }}
                    style={{ transformOrigin: '200px 200px' }}
                >
                    {[0, 120, 240].map((deg, i) => {
                        const rad = (deg * Math.PI) / 180;
                        const x = 200 + Math.cos(rad) * 118;
                        const y = 200 + Math.sin(rad) * 118;
                        return (
                            <g key={deg}>
                                <line
                                    x1="200" y1="200" x2={x} y2={y}
                                    stroke={accent}
                                    strokeOpacity={0.18}
                                    strokeWidth="1"
                                />
                                <circle
                                    cx={x} cy={y} r={5 + i}
                                    fill="hsl(0 0% 8%)"
                                    stroke={accent}
                                    strokeOpacity="0.75"
                                    strokeWidth="1.2"
                                />
                            </g>
                        );
                    })}
                </motion.g>

                <motion.path
                    d="M 108 208 C 138 132, 248 126, 292 196 C 242 254, 158 258, 108 208 Z"
                    fill="none"
                    stroke={accent}
                    strokeWidth="1.2"
                    strokeOpacity="0.38"
                    strokeDasharray="7 10"
                    animate={{ strokeDashoffset: [0, -68] }}
                    transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
                />

                <rect
                    x="174" y="174" width="52" height="52" rx="14"
                    fill="rgba(0,0,0,0.22)"
                    stroke={accent}
                    strokeOpacity="0.28"
                />

                {/* center dot */}
                <circle cx="200" cy="200" r="6" fill={accent} />
                <motion.circle
                    cx="200" cy="200" r="6"
                    fill="none"
                    stroke={accent}
                    strokeWidth={1.5}
                    animate={{ scale: [1, 3.5], opacity: [0.7, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                    style={{ transformOrigin: '200px 200px' }}
                />
            </svg>
        </motion.div>
    );
};

const Act = ({ act, idx, progress }) => {
    const start = idx / ACTS.length;
    const mid = (idx + 0.5) / ACTS.length;
    const end = (idx + 1) / ACTS.length;
    const opacity = useTransform(progress, [start, mid, end], [0, 1, idx === ACTS.length - 1 ? 1 : 0]);
    const y = useTransform(progress, [start, mid, end], [40, 0, idx === ACTS.length - 1 ? 0 : -40]);

    return (
        <motion.div
            style={{
                position: 'absolute',
                inset: 0,
                opacity,
                y,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '0 clamp(1rem, 3vw, 2.5rem)',
            }}
        >
            <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '5px 12px',
                borderRadius: 999,
                background: `${act.accent.replace('hsl', 'hsla').replace(')', ' / 0.1)')}`,
                border: `1px solid ${act.accent.replace('hsl', 'hsla').replace(')', ' / 0.28)')}`,
                color: act.accent,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                marginBottom: 22,
                width: 'fit-content',
            }}>
                <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: act.accent,
                    boxShadow: `0 0 10px ${act.accent}`,
                }} />
                {act.eyebrow}
            </span>

            <h2 style={{
                margin: 0,
                fontSize: 'clamp(1.85rem, 4.6vw, 3.4rem)',
                fontWeight: 600,
                lineHeight: 1.05,
                letterSpacing: '-0.035em',
                color: 'hsl(0 0% 96%)',
            }}>
                {act.heading.map((line, i) => (
                    <span key={i} style={{ display: 'block' }}>{line}</span>
                ))}
            </h2>

            <p style={{
                margin: '20px 0 0',
                fontSize: 'clamp(0.95rem, 1.4vw, 1.18rem)',
                lineHeight: 1.65,
                color: 'hsl(0 0% 72%)',
                fontWeight: 300,
                maxWidth: '40ch',
            }}>
                {act.body}
            </p>
        </motion.div>
    );
};

const StickyShowcase = () => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start start', 'end end'],
    });

    return (
        <section
            ref={ref}
            style={{
                position: 'relative',
                // Enough runway for the three-act story, but shorter than the
                // original 220vh so the page does not feel like it is holding
                // the user in one scene for too long.
                height: '190vh',
                fontFamily: 'Sora, sans-serif',
            }}
        >
            <div style={{
                position: 'sticky',
                top: 0,
                height: '100vh',
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
                gap: 'clamp(1rem, 4vw, 4rem)',
                alignItems: 'stretch',
                padding: 'clamp(1.5rem, 4vw, 2.5rem) clamp(1.5rem, 4vw, 3rem)',
                maxWidth: 1280,
                margin: '0 auto',
            }} className="px-sticky-grid">
                {/* LEFT — text acts (absolutely stacked) */}
                <div style={{ position: 'relative', minHeight: 0 }}>
                    {ACTS.map((act, i) => (
                        <Act key={i} idx={i} act={act} progress={scrollYProgress} />
                    ))}
                </div>

                {/* RIGHT — scene visuals (absolutely stacked) */}
                <div style={{
                    position: 'relative',
                    minHeight: 'clamp(280px, 50vh, 520px)',
                    alignSelf: 'center',
                }} className="px-sticky-visual">
                    {ACTS.map((act, i) => (
                        <SceneVisual
                            key={i}
                            idx={i}
                            progress={scrollYProgress}
                            accent={act.accent}
                        />
                    ))}
                </div>

                {/* Progress dots stay aligned with the pinned narrative frame. */}
                <div className="px-sticky-dots" style={{
                    position: 'absolute',
                    top: '50%',
                    left: 'clamp(0.75rem, 2vw, 2rem)',
                    width: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    pointerEvents: 'none',
                    zIndex: 2,
                    transform: 'translateY(-50%)',
                }}>
                    {ACTS.map((_, i) => {
                        const start = i / ACTS.length;
                        const end = (i + 1) / ACTS.length;
                        return (
                            <ProgressDot
                                key={i}
                                progress={scrollYProgress}
                                start={start}
                                end={end}
                            />
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

const ProgressDot = ({ progress, start, end }) => {
    const opacity = useTransform(progress, [start, (start + end) / 2, end], [0.3, 1, 0.3]);
    const scale = useTransform(progress, [start, (start + end) / 2, end], [0.7, 1.4, 0.7]);
    return (
        <motion.span style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'hsl(119 99% 56%)',
            opacity,
            scale,
            boxShadow: '0 0 10px hsl(119 99% 56%)',
        }} />
    );
};

export default StickyShowcase;
