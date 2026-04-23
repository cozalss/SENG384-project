import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const ScrollReveal = ({ children, direction = 'up', delay = 0, className = '', style = {} }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });

    const variants = {
        up: { hidden: { opacity: 0, y: 60 }, visible: { opacity: 1, y: 0 } },
        down: { hidden: { opacity: 0, y: -40 }, visible: { opacity: 1, y: 0 } },
        left: { hidden: { opacity: 0, x: -60 }, visible: { opacity: 1, x: 0 } },
        right: { hidden: { opacity: 0, x: 60 }, visible: { opacity: 1, x: 0 } },
        scale: { hidden: { opacity: 0, scale: 0.85 }, visible: { opacity: 1, scale: 1 } },
    };

    return (
        <motion.div
            ref={ref}
            className={className}
            style={style}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={variants[direction]}
            transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
        >
            {children}
        </motion.div>
    );
};

export default ScrollReveal;
