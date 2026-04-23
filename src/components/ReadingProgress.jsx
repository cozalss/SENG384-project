// eslint-disable-next-line no-unused-vars
import { useScroll, motion, useSpring } from 'framer-motion';

const ReadingProgress = () => {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 120,
        damping: 26,
        restDelta: 0.001
    });

    return (
        <motion.div
            aria-hidden="true"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: '2.5px',
                background: 'linear-gradient(90deg, var(--primary), var(--accent))',
                boxShadow: '0 0 12px rgba(96, 165, 250, 0.45)',
                transformOrigin: '0% 50%',
                scaleX,
                zIndex: 200,
                pointerEvents: 'none'
            }}
        />
    );
};

export default ReadingProgress;
