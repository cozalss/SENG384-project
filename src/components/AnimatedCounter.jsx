import { useEffect, useState, useRef } from 'react';

const AnimatedCounter = ({ value, suffix = '', duration = 2000 }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated.current) {
                    hasAnimated.current = true;
                    let start = 0;
                    const end = parseInt(value);
                    const stepTime = Math.abs(Math.floor(duration / end));
                    const timer = setInterval(() => {
                        start += 1;
                        setCount(start);
                        if (start >= end) clearInterval(timer);
                    }, stepTime);
                }
            },
            { threshold: 0.3 }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [value, duration]);

    return (
        <span ref={ref}>
            {count}{suffix}
        </span>
    );
};

export default AnimatedCounter;
