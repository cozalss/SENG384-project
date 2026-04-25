import { motion } from 'framer-motion';

/**
 * Lightweight scroll-triggered reveal wrapper.
 *
 * The original component was deleted in an earlier cleanup but two callers
 * (BentoFeatures, FinalCTA) still depend on it. Restoring as a tiny shim:
 * a single framer-motion `whileInView` that fires the entrance once when the
 * element enters the viewport. Direction tweaks the off-screen origin.
 */
const variants = {
    up:    { hidden: { opacity: 0, y: 24 },           visible: { opacity: 1, y: 0 } },
    fade:  { hidden: { opacity: 0 },                  visible: { opacity: 1 } },
    scale: { hidden: { opacity: 0, scale: 0.96 },     visible: { opacity: 1, scale: 1 } },
    left:  { hidden: { opacity: 0, x: -24 },          visible: { opacity: 1, x: 0 } },
    right: { hidden: { opacity: 0, x: 24 },           visible: { opacity: 1, x: 0 } },
};

const ScrollReveal = ({
    children,
    direction = 'up',
    delay = 0,
    duration = 0.6,
    margin = '-80px',
}) => {
    const variant = variants[direction] || variants.up;
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin }}
            variants={variant}
            transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
        >
            {children}
        </motion.div>
    );
};

export default ScrollReveal;
