import { motion, useReducedMotion } from 'framer-motion';

/**
 * BigTextReveal — premium per-line clip-path mask reveal (Awwwards 2026).
 *
 * Each line of the headline is wrapped in an overflow-hidden clip and the
 * inner span animates `clipPath: inset(0 0 100% 0) → inset(0)` on enter,
 * with a slight `y` translate for the "rising into view" feel. Lines stagger
 * by 80ms.
 *
 * The emphasis line ("isn't luck —", italic serif green) gets glyph-level
 * stagger so it lands like punctuation — each letter rises a beat after the
 * one before. Higher-class than mass-line reveal, and it directs the eye to
 * the green peak of the section.
 */
const HEADLINE_LINES = [
    { text: 'Health-tech innovation', emphasis: false },
    { text: "isn't luck —", emphasis: true },
    { text: "it's the right connection.", emphasis: false },
];

const SUBLINE = 'A clinician with a real bedside problem. An engineer with the right tooling. We make that match deliberate, fast, and IP-safe.';

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

const glyphContainerVariant = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.022,
            delayChildren: 0.05,
        },
    },
};

const glyphVariant = {
    hidden: { y: '110%', opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
    },
};

const RevealLine = ({ children, emphasis, glyphStagger }) => {
    // For glyph-stagger, the inner is a row of per-character motion spans.
    // For plain line reveal, the inner is a single block whose clip-path animates.
    const inner = glyphStagger ? (
        <motion.span
            variants={glyphContainerVariant}
            style={{
                display: 'inline-flex',
                color: 'hsl(119 99% 56%)',
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontStyle: 'italic',
                fontWeight: 400,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
            }}
        >
            {[...children].map((ch, i) => (
                <span
                    key={i}
                    style={{
                        display: 'inline-block',
                        overflow: 'hidden',
                        // Preserve spaces — without this, leading/trailing
                        // spaces collapse and "isn't luck —" loses its breath.
                        whiteSpace: 'pre',
                        paddingBottom: '0.06em',
                        paddingTop: '0.04em',
                    }}
                >
                    <motion.span
                        variants={glyphVariant}
                        style={{ display: 'inline-block' }}
                    >
                        {ch}
                    </motion.span>
                </span>
            ))}
        </motion.span>
    ) : (
        <motion.span
            variants={lineVariant}
            style={{
                display: 'inline-block',
                color: emphasis ? 'hsl(119 99% 56%)' : 'hsl(0 0% 96%)',
                fontFamily: emphasis
                    ? "'Instrument Serif', Georgia, serif"
                    : 'Sora, sans-serif',
                fontStyle: emphasis ? 'italic' : 'normal',
                fontWeight: emphasis ? 400 : 600,
                fontVariationSettings: emphasis ? undefined : '"wght" 600',
                letterSpacing: emphasis ? '-0.02em' : '-0.035em',
            }}
        >
            {children}
        </motion.span>
    );

    return (
        <span
            style={{
                display: 'block',
                overflow: 'hidden',
                paddingBottom: '0.06em',
                paddingTop: '0.02em',
                lineHeight: 1.1,
            }}
        >
            {inner}
        </span>
    );
};

const BigTextReveal = () => {
    const prefersReduced = useReducedMotion();

    return (
        <section
            style={{
                position: 'relative',
                padding: 'clamp(2rem, 4vw, 3.25rem) clamp(1.5rem, 4vw, 3rem)',
                fontFamily: 'Sora, sans-serif',
            }}
        >
            <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
                <motion.h2
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-150px' }}
                    variants={containerVariant}
                    style={{
                        margin: 0,
                        fontSize: 'clamp(1.85rem, 4.8vw, 3.8rem)',
                        lineHeight: 1.1,
                        letterSpacing: '-0.035em',
                    }}
                >
                    {HEADLINE_LINES.map((line, i) => (
                        <RevealLine
                            key={i}
                            emphasis={line.emphasis}
                            // Glyph-stagger only on the emphasis line, and only
                            // when motion is allowed. Reduced-motion users get
                            // the static line variant.
                            glyphStagger={line.emphasis && !prefersReduced}
                        >
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
        </section>
    );
};

export default BigTextReveal;
