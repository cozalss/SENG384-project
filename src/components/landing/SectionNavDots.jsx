import { useEffect, useState, useRef } from 'react';

/**
 * Vertical column of section indicator dots fixed to the right edge.
 * Tracks the active section by viewport-center distance (same logic the
 * wheel-snap in LandingPage uses) and click-jumps via scrollIntoView.
 *
 * Selectors are loose so you can add or reorder sections in
 * CinematicSections without touching this file. Hidden on mobile and for
 * users who asked for reduced motion.
 */
const SECTIONS = [
    { id: 'hero', label: 'Open' },
    { id: 'premise', label: 'Start here' },
    { id: 'narrative', label: 'Why it matters' },
    { id: 'how-it-works', label: 'How it works' },
    { id: 'two-sides', label: 'Two sides' },
    { id: 'capabilities', label: 'Capabilities' },
    { id: 'final-cta', label: 'Join' },
];

const SectionNavDots = () => {
    const [active, setActive] = useState(0);
    const [visible, setVisible] = useState(false);
    const tickingRef = useRef(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        const narrow = window.matchMedia?.('(max-width: 900px)').matches;
        if (reduce || narrow) return;

        // Use getBoundingClientRect so the math is correct even when the
        // section has a negative margin-top (the staged sections do, since
        // they overlap the sticky video layer in CinematicStage).
        const findIndex = () => {
            const vhCenter = window.innerHeight / 2;
            let bestIdx = 0;
            let bestDist = Infinity;
            SECTIONS.forEach((s, i) => {
                let el;
                el = s.id === 'hero'
                    ? document.querySelector('.px-hero')
                    : document.getElementById(s.id);
                if (!el) return;
                const r = el.getBoundingClientRect();
                const center = r.top + r.height / 2;
                const dist = Math.abs(center - vhCenter);
                if (dist < bestDist) { bestDist = dist; bestIdx = i; }
            });
            return bestIdx;
        };

        const onScroll = () => {
            if (tickingRef.current) return;
            tickingRef.current = true;
            requestAnimationFrame(() => {
                setActive(findIndex());
                setVisible(window.scrollY > 80);
                tickingRef.current = false;
            });
        };

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const jump = (id) => {
        let el;
        el = id === 'hero'
            ? document.querySelector('.px-hero')
            : document.getElementById(id);
        if (!el) return;
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <nav
            className={`px-secnav${visible ? ' px-secnav--shown' : ''}`}
            aria-label="Section navigation"
        >
            <ul>
                {SECTIONS.map((s, i) => (
                    <li key={s.id}>
                        <button
                            type="button"
                            onClick={() => jump(s.id)}
                            className={`px-secnav-dot${i === active ? ' is-active' : ''}`}
                            aria-label={`Jump to ${s.label}`}
                            aria-current={i === active ? 'true' : undefined}
                        >
                            <span className="px-secnav-tick" aria-hidden="true" />
                            <span className="px-secnav-label">{s.label}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default SectionNavDots;
