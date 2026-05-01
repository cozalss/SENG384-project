import { motion } from 'framer-motion';

/**
 * SectionLabel — hairline + numbered uppercase label.
 *
 * 2026 premium pattern (Linear, Vercel, Cedar, Tempus): instead of large
 * decorative gaps OR gradient fades between sections, use a 1px horizontal
 * hairline crossed by a small inline label like "02 — METHOD". This both
 * acknowledges the section break AND adds editorial structure without
 * eating vertical space.
 *
 * Apply with `n` (the step number) and `label` (the section name).
 */
const SectionLabel = ({ id, n, label, accent = 'hsl(119 99% 56%)' }) => (
    <motion.div
        id={id}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: 'clamp(1.25rem, 2.4vw, 2rem) clamp(1.5rem, 4vw, 3rem)',
            maxWidth: 1280,
            margin: '0 auto',
            fontFamily: 'Sora, sans-serif',
            scrollMarginTop: 24,
        }}
    >
        {/* Number block */}
        <span style={{
            display: 'inline-flex',
            alignItems: 'baseline',
            gap: 8,
            color: accent,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            flexShrink: 0,
        }}>
            <motion.span
                aria-hidden="true"
                animate={{
                    boxShadow: [
                        `0 0 6px ${accent}`,
                        `0 0 14px ${accent}`,
                        `0 0 6px ${accent}`,
                    ],
                }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: accent,
                    transform: 'translateY(-1px)',
                    flexShrink: 0,
                }}
            />
            {n} <span style={{ color: 'hsl(0 0% 60%)', margin: '0 4px' }}>—</span> {label}
        </span>

        {/* Hairline that grows from where the label ends to the right edge */}
        <motion.span
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.85, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden="true"
            style={{
                flex: 1,
                height: 1,
                background: 'linear-gradient(90deg, rgba(255,255,255,0.18), rgba(255,255,255,0.04) 60%, transparent)',
                transformOrigin: 'left',
            }}
        />
    </motion.div>
);

export default SectionLabel;
