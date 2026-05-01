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
    { id: 'premise', label: 'Premise' },
    { id: 'product', label: 'The Product' },
    { id: 'two-sides', label: 'Two Sides' },
    { id: 'network', label: 'Filters' },
    { id: 'trust', label: 'Trust' },
    { id: 'spotlight', label: 'Demo Flow' },
    { id: 'final-cta', label: 'Join' },
];

const getSectionElement = (id) => (
    document.getElementById(id) ||
    (id === 'hero' ? document.querySelector('.px-hero') : null)
);

const SectionNavDots = () => {
    const [active, setActive] = useState(0);
    const [visible, setVisible] = useState(false);
    const tickingRef = useRef(false);
    const activeRef = useRef(0);
    const visibleRef = useRef(false);

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
                const el = getSectionElement(s.id);
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
                const nextActive = findIndex();
                const nextVisible = window.scrollY > 80;
                if (activeRef.current !== nextActive) {
                    activeRef.current = nextActive;
                    setActive(nextActive);
                }
                if (visibleRef.current !== nextVisible) {
                    visibleRef.current = nextVisible;
                    setVisible(nextVisible);
                }
                tickingRef.current = false;
            });
        };

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const jump = (id) => {
        const el = getSectionElement(id);
        if (!el) return;
        // Smooth scroll bypasses the user's prefers-reduced-motion preference.
        // Honor it explicitly so motion-sensitive users get an instant jump.
        const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
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
