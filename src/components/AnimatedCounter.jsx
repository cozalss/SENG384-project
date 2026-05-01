import { useEffect, useState, useRef } from 'react';

const AnimatedCounter = ({ value, suffix = '', duration = 2000 }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const hasAnimated = useRef(false);
    const timerRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated.current) {
                    hasAnimated.current = true;
                    const end = Number.parseInt(value, 10);
                    if (!Number.isFinite(end) || end <= 0) {
                        // Guard against value=0 / NaN / negative — division below would
                        // explode to Infinity / NaN and starve the event loop.
                        setCount(Number.isFinite(end) ? end : 0);
                        return;
                    }
                    let start = 0;
                    const stepTime = Math.max(16, Math.floor(duration / end));
                    timerRef.current = setInterval(() => {
                        start += 1;
                        setCount(start);
                        if (start >= end) {
                            clearInterval(timerRef.current);
                            timerRef.current = null;
                        }
                    }, stepTime);
                }
            },
            { threshold: 0.3 }
        );

        const node = ref.current;
        if (node) observer.observe(node);
        return () => {
            observer.disconnect();
            // Clear any in-flight counter so the interval doesn't continue to
            // setState on an unmounted component.
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [value, duration]);

    return (
        <span ref={ref}>
            {count}{suffix}
        </span>
    );
};

export default AnimatedCounter;
