import { motion, useReducedMotion } from 'framer-motion';

/**
 * BigTextReveal — premium per-line clip-path mask reveal (Awwwards 2026).
 *
 * Each line of the headline is wrapped in an overflow-hidden clip and the
 * inner span animates `clipPath: inset(0 0 100% 0) → inset(0)` on enter,
 * with a slight `y` translate for the "rising into view" feel. Lines stagger
 * by 80ms. Pair with a variable-font weight tween on enter (500 → 600).
 */
const HEADLINE_LINES = [
    { text: 'From project idea', emphasis: false },
    { text: 'to published announcement', emphasis: false },
    { text: 'to interest, meeting, and chat.', emphasis: true },
    { text: 'That is the actual HEALTH AI flow.', emphasis: false },
];

const SUBLINE = 'Users register with institutional accounts, publish health-tech collaboration requests, browse by role and domain, unlock protected details through an NDA acknowledgement, propose meeting slots, and continue the conversation in real-time chat.';

const lineVariant = {
    hidden: { clipPath: 'inset(0 0 100% 0)', y: 24 },
    visible: {
        clipPath: 'inset(0 0 0% 0)',
        y: 0,
        transition: { duration: 0.85, ease: [0.25, 1, 0.5, 1] },
    },
};

const containerVariant = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.08 },
    },
};

// Per-word stagger inside the emphasized italic line. Splits by space, wraps
// each token in inline-block + whiteSpace pre so spaces stay between words.
// Reuses the same easing as the line clip-mask so the transition reads as one
// continuous motion. Applied only to the `emphasis` line because broadcasting
// this on every line would dilute the moment.
const wordContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.045, delayChildren: 0.08 } },
};

const wordVariant = {
    hidden: { opacity: 0, y: '0.4em', filter: 'blur(6px)' },
    visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
};

const RevealLine = ({ children, emphasis, reduced }) => {
    const text = typeof children === 'string' ? children : '';
    const innerStyle = {
        display: 'inline-block',
        color: emphasis ? 'hsl(119 99% 56%)' : 'hsl(0 0% 96%)',
        fontFamily: emphasis
            ? "'Instrument Serif', Georgia, serif"
            : 'Sora, sans-serif',
        fontStyle: emphasis ? 'italic' : 'normal',
        fontWeight: emphasis ? 400 : 600,
        fontVariationSettings: emphasis ? undefined : '"wght" 600',
        letterSpacing: 0,
    };

    return (
        <span
            style={{
                display: 'block',
                overflow: 'hidden',
                paddingBottom: '0.06em', // descenders
                paddingTop: '0.02em',
                lineHeight: 1.1,
            }}
        >
            <motion.span variants={lineVariant} style={innerStyle}>
                {emphasis && !reduced && text ? (
                    <motion.span variants={wordContainer} style={{ display: 'inline' }}>
                        {text.split(' ').map((word, i, arr) => (
                            <motion.span
                                key={i}
                                variants={wordVariant}
                                style={{
                                    display: 'inline-block',
                                    whiteSpace: 'pre',
                                    willChange: 'transform, filter, opacity',
                                }}
                            >
                                {word}{i < arr.length - 1 ? ' ' : ''}
                            </motion.span>
                        ))}
                    </motion.span>
                ) : (
                    children
                )}
            </motion.span>
        </span>
    );
};

const SHIFTS = [
    { from: 'Unstructured idea notes', to: 'Create Post wizard' },
    { from: 'Manual partner search', to: 'Filtered dashboard feed' },
    { from: 'Private technical text', to: 'NDA-protected blueprint' },
    { from: 'Scattered follow-up', to: 'Meeting request + chat' },
];

const BigTextReveal = () => {
    const reduced = useReducedMotion();
    return (
        <section
            className="btr-section landing-cinema-section"
            style={{
                position: 'relative',
                padding: 'clamp(2rem, 4vw, 3.25rem) clamp(1.5rem, 4vw, 3rem)',
                fontFamily: 'Sora, sans-serif',
            }}
        >
            <div className="btr-signal-field" aria-hidden="true">
                <svg className="btr-signal-grid" viewBox="0 0 760 360" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="btr-ecg-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="hsl(119 99% 56%)" stopOpacity="0" />
                            <stop offset="18%" stopColor="hsl(119 99% 56%)" stopOpacity="0.62" />
                            <stop offset="55%" stopColor="hsl(119 99% 56%)" stopOpacity="0.95" />
                            <stop offset="100%" stopColor="hsl(180 75% 65%)" stopOpacity="0.68" />
                        </linearGradient>
                    </defs>
                    <g className="btr-grid-lines">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <line key={`h-${i}`} x1="0" x2="760" y1={36 + i * 32} y2={36 + i * 32} />
                        ))}
                        {Array.from({ length: 13 }).map((_, i) => (
                            <line key={`v-${i}`} y1="0" y2="360" x1={24 + i * 60} x2={24 + i * 60} />
                        ))}
                    </g>
                    <path
                        className="btr-ecg-ghost"
                        d="M 20 184 L 110 184 L 128 142 L 154 224 L 182 184 L 288 184 L 310 114 L 352 270 L 390 184 L 516 184 L 540 158 L 568 212 L 598 184 L 740 184"
                    />
                    <path
                        className="btr-ecg-main"
                        d="M 20 184 L 110 184 L 128 142 L 154 224 L 182 184 L 288 184 L 310 114 L 352 270 L 390 184 L 516 184 L 540 158 L 568 212 L 598 184 L 740 184"
                    />
                </svg>
                <span className="btr-signal-readout">72 BPM</span>
            </div>
            <div style={{
                maxWidth: '1180px',
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
                gap: 'clamp(2rem, 5vw, 4rem)',
                alignItems: 'start',
            }} className="btr-grid">
                <div>
                    <motion.h2
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-150px' }}
                        variants={containerVariant}
                        style={{
                            margin: 0,
                            fontSize: 'clamp(1.85rem, 4.6vw, 3.6rem)',
                            lineHeight: 1.08,
                            letterSpacing: 0,
                        }}
                    >
                        {HEADLINE_LINES.map((line, i) => (
                            <RevealLine key={i} emphasis={line.emphasis} reduced={reduced}>
                                {line.text}
                            </RevealLine>
                        ))}
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-100px' }}
                        transition={{ duration: 0.65, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
                        style={{
                            marginTop: 'clamp(1.1rem, 2.2vw, 1.75rem)',
                            maxWidth: '40rem',
                            fontSize: 'clamp(1rem, 1.4vw, 1.18rem)',
                            lineHeight: 1.7,
                            color: 'hsl(0 0% 75%)',
                            fontWeight: 300,
                        }}
                    >
                        {SUBLINE}
                    </motion.p>
                </div>

                {/* RIGHT — "what changes" shift list. Reads as a delta column,
                    reinforcing the headline by showing the concrete swap users
                    are making instead of relying on copy alone. */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-120px' }}
                    transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="btr-shifts"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        padding: 'clamp(1rem, 2vw, 1.4rem)',
                        borderRadius: 18,
                        background: 'linear-gradient(180deg, rgba(20, 22, 28, 0.6), rgba(10, 14, 12, 0.78))',
                        border: '1px solid rgba(34, 211, 102, 0.10)',
                        backdropFilter: 'blur(18px) saturate(120%)',
                        WebkitBackdropFilter: 'blur(18px) saturate(120%)',
                        boxShadow: '0 28px 60px -22px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255,255,255,0.04)',
                    }}
                >
                    <span style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: 0,
                        textTransform: 'uppercase',
                        color: 'hsl(119 80% 70%)',
                        marginBottom: 4,
                    }}>
                        What Changes
                    </span>
                    {SHIFTS.map((s, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 12 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: '-80px' }}
                            transition={{ duration: 0.45, delay: 0.6 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr auto 1fr',
                                alignItems: 'center',
                                gap: 10,
                                padding: '10px 12px',
                                borderRadius: 11,
                                background: 'rgba(255, 255, 255, 0.025)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                fontSize: 12.5,
                            }}
                        >
                            <span style={{
                                color: 'rgba(255, 255, 255, 0.45)',
                                textDecoration: 'line-through',
                                textDecorationColor: 'rgba(255, 99, 110, 0.45)',
                                textDecorationThickness: '1.5px',
                            }}>
                                {s.from}
                            </span>
                            <span style={{
                                color: 'hsl(119 99% 56%)',
                                fontSize: 12,
                            }}>→</span>
                            <span style={{
                                color: 'hsl(0 0% 96%)',
                                fontWeight: 600,
                                letterSpacing: 0,
                            }}>
                                {s.to}
                            </span>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default BigTextReveal;
