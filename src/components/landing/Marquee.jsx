import { motion } from 'framer-motion';

/**
 * Marquee — dual-row infinite ticker with reverse directions.
 *
 * 2026 premium pattern (Vercel AI page, Apple WWDC pages, Stripe Atlas).
 * Two rows scroll opposite directions to break visual monotony. Edge
 * mask-image fades the strip into the page so it doesn't read as a hard
 * stripe.
 *
 * Pure CSS animation — no JS, no scroll listener. Stays smooth even at
 * 144fps and respects `prefers-reduced-motion`.
 */
const ROW_A = [
    'Telemedicine', 'AI Diagnostics', 'Wearables', 'Clinical Genomics',
    'Mental Health Tech', 'Surgical Robotics', 'Drug Discovery',
    'Health Data', 'Imaging AI', 'Remote Monitoring', 'Bioinformatics',
    'Care Coordination',
];

const ROW_B = [
    'Cross-disciplinary', 'NDA-gated', 'GDPR-compliant', '.edu institutions',
    'Pan-EU collaboration', 'Bedside problems', 'Working prototypes',
    'Pilot partnerships', 'Co-development', 'Joint research',
    'IP-safe discovery', 'Structured first contact',
];

const Pill = ({ children, accent }) => (
    <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 16px',
        marginRight: 14,
        borderRadius: 999,
        whiteSpace: 'nowrap',
        fontFamily: 'Sora, sans-serif',
        fontSize: 13,
        fontWeight: 500,
        letterSpacing: '-0.005em',
        color: 'hsl(0 0% 86%)',
        background: 'rgba(15, 15, 18, 0.55)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
    }}>
        <span style={{
            width: 5, height: 5, borderRadius: '50%',
            background: accent ? 'hsl(119 99% 56%)' : 'hsl(0 0% 50%)',
            boxShadow: accent ? '0 0 8px hsl(119 99% 56%)' : 'none',
            flexShrink: 0,
        }} />
        {children}
    </span>
);

const Row = ({ items, reverse = false, accentEvery = 3 }) => (
    <div
        style={{
            display: 'flex',
            overflow: 'hidden',
            // Edge mask — fades in/out on left & right so the marquee doesn't
            // read as an abrupt strip. Premium "endless" feel.
            WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%)',
            maskImage: 'linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%)',
            padding: '6px 0',
        }}
    >
        <motion.div
            style={{
                display: 'flex',
                flexShrink: 0,
                paddingRight: 14,
            }}
            animate={{ x: reverse ? ['-50%', '0%'] : ['0%', '-50%'] }}
            transition={{
                duration: 38,
                ease: 'linear',
                repeat: Infinity,
            }}
        >
            {/* Render the list TWICE so when the first copy slides off-screen
                the second copy is already filling — no gap, no jump. */}
            {[...items, ...items].map((label, i) => (
                <Pill key={i} accent={i % accentEvery === 0}>{label}</Pill>
            ))}
        </motion.div>
    </div>
);

const Marquee = () => (
    <section
        aria-hidden="true"
        style={{
            position: 'relative',
            /* Tightened from clamp(2.5rem, 5vw, 4rem) — marquee is decorative,
               doesn't need huge breathing room. */
            padding: 'clamp(1.5rem, 3vw, 2.5rem) 0',
            borderTop: '1px solid rgba(255, 255, 255, 0.04)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
            background:
                'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(34, 211, 102, 0.04), transparent 70%),' +
                'rgba(0, 0, 0, 0.18)',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
        }}
    >
        <Row items={ROW_A} accentEvery={3} />
        <Row items={ROW_B} reverse accentEvery={4} />
    </section>
);

export default Marquee;
