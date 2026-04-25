import { motion } from 'framer-motion';

/**
 * BigTextReveal — premium per-line clip-path mask reveal (Awwwards 2026).
 *
 * Each line of the headline is wrapped in an overflow-hidden clip and the
 * inner span animates `clipPath: inset(0 0 100% 0) → inset(0)` on enter,
 * with a slight `y` translate for the "rising into view" feel. Lines stagger
 * by 80ms. Pair with a variable-font weight tween on enter (500 → 600).
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

const RevealLine = ({ children, emphasis }) => (
    <span
        style={{
            display: 'block',
            overflow: 'hidden',
            paddingBottom: '0.06em', // descenders
            paddingTop: '0.02em',
            lineHeight: 1.1,
        }}
    >
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
    </span>
);

const BigTextReveal = () => {
    return (
        <section
            style={{
                position: 'relative',
                padding: 'clamp(2rem, 4vw, 3.25rem) clamp(1.5rem, 4vw, 3rem)',
                fontFamily: 'Sora, sans-serif',
            }}
        >
            <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
                {/* Eyebrow chip removed — SectionLabel ("01 — The Premise") now
                    handles the section identifier with much less vertical cost. */}
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
                        <RevealLine key={i} emphasis={line.emphasis}>
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
