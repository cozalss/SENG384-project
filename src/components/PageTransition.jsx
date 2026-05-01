 
import { motion } from 'framer-motion';

// Tight, near-instant transitions — keep the gap between routes short so
// the app shell backdrop doesn't read as a flash. Previous version had a
// noticeable opacity gap during which the shell's backdrop was visible.
const pageVariants = {
    initial: { opacity: 0, y: 4 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] },
    },
    exit: {
        // Snap exit — fading the outgoing page out slowly is what made the
        // backdrop visible during navigations. Cut to ~one frame.
        opacity: 0,
        transition: { duration: 0.04, ease: [0.22, 1, 0.36, 1] },
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
