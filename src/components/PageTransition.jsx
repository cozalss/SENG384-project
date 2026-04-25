 
import { motion } from 'framer-motion';

// Kept intentionally light: no scale (forces compositing on the whole subtree),
// no staggerChildren (spawns many concurrent animations mid-route change).
// Short durations — the previous 0.46s total felt like dead time on fast
// machines; keep the fade below the user's "this is a wait" threshold.
const pageVariants = {
    initial: { opacity: 0, y: 6 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
    },
    exit: {
        // Match the enter easing token (0.22, 1, 0.36, 1) — pages feel "soft
        // both ways" instead of snappy-out / soft-in. The Material-style
        // ease-in (0.4, 0, 1, 1) clashed with the premium enter curve.
        opacity: 0,
        transition: { duration: 0.1, ease: [0.22, 1, 0.36, 1] },
    },
};

const PageTransition = ({ children }) => {
    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ willChange: 'transform, opacity' }}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
