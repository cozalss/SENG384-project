import { motion } from 'framer-motion';

/**
 * SectionTransition — horizontal green light-leak that sweeps across
 * the viewport when the marker enters view. Used between landing
 * sections to act as a cinematic match-cut, similar to Stripe's
 * pinned-section dividers.
 *
 * Sits inside the document flow but the leak itself is positioned
 * absolutely with full-bleed width via 100vw and a centered transform,
 * so it doesn't disturb container layout.
 */
const SectionTransition = ({ tone = 'green' }) => {
    const stroke = tone === 'cyan' ? 'rgba(34, 211, 238, 0.7)' : 'rgba(34, 211, 102, 0.7)';
    const wash = tone === 'cyan' ? 'rgba(34, 211, 238, 0.055)' : 'rgba(34, 211, 102, 0.06)';

    return (
        <motion.div
            aria-hidden="true"
            className="section-transition"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-30%' }}
        >
            <motion.div
                className="section-transition-leak"
                initial={{ x: '-110%' }}
                whileInView={{ x: '110%' }}
                viewport={{ once: true, margin: '-30%' }}
                transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
                style={{
                    background: `linear-gradient(90deg, transparent, ${stroke} 40%, ${stroke} 60%, transparent)`,
                }}
            />
            <motion.div
                className="section-transition-wash"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: [0, 0.35, 0] }}
                viewport={{ once: true, margin: '-30%' }}
                transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
                style={{
                    background: `linear-gradient(180deg, transparent, ${wash} 50%, transparent)`,
                }}
            />
        </motion.div>
    );
};

export default SectionTransition;
