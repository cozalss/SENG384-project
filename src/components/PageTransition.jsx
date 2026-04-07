// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const pageVariants = {
    initial: {
        opacity: 0,
        y: 30,
        scale: 0.98,
    },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.55,
            ease: [0.16, 1, 0.3, 1],
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
    exit: {
        opacity: 0,
        y: -20,
        scale: 0.98,
        transition: {
            duration: 0.3,
            ease: [0.4, 0, 1, 1],
        },
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

// Reusable stagger child variant for sections
export const staggerChild = {
    initial: { opacity: 0, y: 25, scale: 0.97 },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
};

// Slide from left variant
export const slideFromLeft = {
    initial: { opacity: 0, x: -40 },
    animate: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
};

// Slide from right variant
export const slideFromRight = {
    initial: { opacity: 0, x: 40 },
    animate: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
};

// Scale up variant
export const scaleUp = {
    initial: { opacity: 0, scale: 0.85 },
    animate: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
};

export default PageTransition;
