import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Stethoscope, Cpu, ShieldCheck } from 'lucide-react';
import '../../styles/cinematic-network.css';

/**
 * CinematicNetwork — second major cinematic moment of the landing page.
 *
 * Conveys the platform's browsing premise: role, domain, stage, country,
 * and city filters. We render a stylized sample location graph in pure SVG,
 * with fiber-style arcs lighting up between demo pairs in a slow rotation.
 * A side feed shows what each pulse means so the visual stays anchored to
 * product behavior.
 *
 * Numbers are deliberately absent — past versions of the page were rolled
 * back for fabricated metrics. The eyebrow labels this section as a
 * sample-data network so a careful reader can still trust us.
 */

const VIEW_W = 800;
const VIEW_H = 500;

const CITIES = [
    { n: 'New York',      x: 560, y: 245, size: 'lg' },
    { n: 'London',        x: 470, y: 260, size: 'md' },
    { n: 'San Francisco', x: 310, y: 315, size: 'md' },
    { n: 'Toronto',       x: 395, y: 250, size: 'md' },
    { n: 'Berlin',        x: 420, y: 390, size: 'md' },
    { n: 'Paris',         x: 455, y: 335, size: 'sm' },
    { n: 'Tokyo',         x: 545, y: 325, size: 'sm' },
    { n: 'Singapore',     x: 675, y: 210, size: 'sm' },
    { n: 'Sydney',        x: 645, y: 385, size: 'md' },
    { n: 'Austin',        x: 390, y: 280, size: 'sm' },
    { n: 'Seattle',       x: 510, y: 230, size: 'sm' },
    { n: 'Amsterdam',     x: 565, y: 185, size: 'sm' },
    { n: 'Dubai',         x: 560, y: 405, size: 'md' },
    { n: 'Tel Aviv',      x: 520, y: 420, size: 'sm' },
    { n: 'Boston',        x: 330, y: 205, size: 'sm' },
    { n: 'Seoul',         x: 705, y: 350, size: 'sm' },
];

const cityByName = Object.fromEntries(CITIES.map(c => [c.n, c]));

// Pairs are (clinic, engineer). Each pair carries the demo activity it
// represents — feed entries derive from this so the viz + feed stay in sync.
const PAIRS = [
    { a: 'New York',      b: 'London',    role: 'Cardiology → ML/Signal',     tag: 'NDA ACCEPTED' },
    { a: 'San Francisco', b: 'Austin',    role: 'Radiology → Frontend',       tag: 'INTEREST' },
    { a: 'Berlin',        b: 'Seattle',   role: 'Telemedicine → Full-stack',  tag: 'MEETING REQUEST' },
    { a: 'Toronto',       b: 'Tokyo',     role: 'Clinical workflow → UI/UX',  tag: 'NDA ACCEPTED' },
    { a: 'Paris',         b: 'Singapore', role: 'Remote monitoring → Backend', tag: 'INTEREST' },
    { a: 'Amsterdam',     b: 'New York',  role: 'Health data → Dashboard',    tag: 'PARTNER FOUND' },
    { a: 'Sydney',        b: 'London',    role: 'Patient follow-up → Chat',   tag: 'NDA ACCEPTED' },
    { a: 'Dubai',         b: 'Tel Aviv',  role: 'Wearables → Mobile',         tag: 'INTEREST' },
];

// Fixed pseudo-random "noise" particles so the field has motion even between
// pair changes. Memoized so they don't recompute every render.
const PARTICLE_SEEDS = Array.from({ length: 26 }, (_, i) => ({
    x: 60 + ((i * 53) % (VIEW_W - 120)),
    y: 80 + ((i * 37) % (VIEW_H - 160)),
    delay: (i % 8) * -0.55,
    size: 1 + (i % 3) * 0.4,
}));

const ROTATE_MS = 2400;

const CinematicNetwork = () => {
    const [active, setActive] = useState(0);
    const [reduced, setReduced] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
        const update = () => setReduced(!!mq?.matches);
        update();
        mq?.addEventListener?.('change', update);
        return () => mq?.removeEventListener?.('change', update);
    }, []);

    useEffect(() => {
        if (reduced) return;
        const id = setInterval(() => setActive(i => (i + 1) % PAIRS.length), ROTATE_MS);
        return () => clearInterval(id);
    }, [reduced]);

    // Pre-compute every arc path once. The active arc is highlighted via CSS.
    const arcs = useMemo(() => PAIRS.map((p, i) => {
        const a = cityByName[p.a];
        const b = cityByName[p.b];
        const mx = (a.x + b.x) / 2;
        const my = Math.min(a.y, b.y) - 50 - (i % 3) * 10;
        return { i, d: `M ${a.x} ${a.y} Q ${mx} ${my}, ${b.x} ${b.y}`, a, b };
    }), []);

    return (
        <section className="cnet-section landing-cinema-section" aria-labelledby="cnet-heading">
            <div className="cnet-inner">
                <motion.div
                    className="cnet-eyebrow-row"
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                >
                    <span className="cnet-eyebrow">
                        <MapPin size={11} /> Location & Role Filters
                        <span className="cnet-eyebrow-flag" aria-label="sample data">sample data</span>
                    </span>
                </motion.div>

                <motion.h2
                    id="cnet-heading"
                    className="cnet-heading"
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                    Find relevant posts by <em>role, domain,</em><br />stage, city, and country.
                </motion.h2>

                <motion.p
                    className="cnet-sub"
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                >
                    The dashboard supports filtered discovery. This visual uses sample locations to explain how a user narrows the feed before opening a post detail page.
                </motion.p>

                <motion.div
                    className="cnet-stage"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.85, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                    {/* MAP */}
                    <div className="cnet-map-wrap" aria-hidden="true">
                        <span className="cnet-map-corner cnet-map-corner--tl" />
                        <span className="cnet-map-corner cnet-map-corner--tr" />
                        <span className="cnet-map-corner cnet-map-corner--bl" />
                        <span className="cnet-map-corner cnet-map-corner--br" />
                        <span className="cnet-map-readout">SAMPLE LOCATIONS</span>

                        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="cnet-map-svg" preserveAspectRatio="xMidYMid meet">
                            <defs>
                                <radialGradient id="cnet-glow" cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" stopColor="hsl(119 99% 56%)" stopOpacity="0.55" />
                                    <stop offset="80%" stopColor="hsl(119 99% 56%)" stopOpacity="0" />
                                </radialGradient>
                                <linearGradient id="cnet-fiber" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="hsl(119 99% 56%)" stopOpacity="0" />
                                    <stop offset="50%" stopColor="hsl(119 99% 56%)" stopOpacity="1" />
                                    <stop offset="100%" stopColor="hsl(180 75% 65%)" stopOpacity="0.2" />
                                </linearGradient>
                                <linearGradient id="cnet-continent" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="hsl(119 99% 56%)" stopOpacity="0.06" />
                                    <stop offset="100%" stopColor="hsl(180 75% 65%)" stopOpacity="0.02" />
                                </linearGradient>
                            </defs>

                            {/* Stylized sample geography, not a literal production network map. */}
                            <path
                                d="M 90 200 Q 130 80, 280 100 T 600 90 Q 720 100, 760 180 Q 770 280, 760 360 Q 720 460, 600 470 T 280 480 Q 130 470, 100 380 Q 80 280, 90 200 Z"
                                fill="url(#cnet-continent)"
                                stroke="rgba(34, 211, 102, 0.16)"
                                strokeWidth="1"
                                strokeDasharray="2 5"
                            />

                            {/* Latitude/longitude faint grid */}
                            <g stroke="rgba(255,255,255,0.04)" strokeWidth="0.5">
                                {[120, 200, 280, 360, 440].map(y => (
                                    <line key={`h-${y}`} x1="60" y1={y} x2="780" y2={y} />
                                ))}
                                {[120, 220, 320, 420, 520, 620, 720].map(x => (
                                    <line key={`v-${x}`} x1={x} y1="80" x2={x} y2="470" />
                                ))}
                            </g>

                            {/* Idle drifting particles — keeps the field alive between pulses. */}
                            <g className="cnet-particles">
                                {PARTICLE_SEEDS.map((p, i) => (
                                    <circle
                                        key={i}
                                        cx={p.x}
                                        cy={p.y}
                                        r={p.size}
                                        fill="hsl(119 99% 56%)"
                                        style={{ animationDelay: `${p.delay}s` }}
                                    />
                                ))}
                            </g>

                            {/* Connection arcs — all painted, only the active one is highlighted.
                                Active arc gets a stroke-dashoffset draw animation each rotation
                                (keyed on `active`) so it broadcasts the new pair instead of just
                                snapping in. A blurred duplicate path under it carries the fiber
                                glow — pure SVG filter, GPU-composited. */}
                            {arcs.map(arc => {
                                const isActive = arc.i === active;
                                return (
                                    <g key={arc.i} className={`cnet-arc${isActive ? ' is-active' : ''}`}>
                                        {isActive && !reduced && (
                                            <motion.path
                                                key={`glow-${active}`}
                                                d={arc.d}
                                                fill="none"
                                                stroke="hsl(119 99% 56%)"
                                                strokeWidth={6}
                                                strokeLinecap="round"
                                                opacity={0.32}
                                                style={{ filter: 'blur(6px)' }}
                                                initial={{ pathLength: 0 }}
                                                animate={{ pathLength: 1 }}
                                                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                                            />
                                        )}
                                        {isActive ? (
                                            <motion.path
                                                key={`active-${active}`}
                                                d={arc.d}
                                                fill="none"
                                                stroke="url(#cnet-fiber)"
                                                strokeWidth={1.8}
                                                strokeLinecap="round"
                                                initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
                                                animate={{ pathLength: 1 }}
                                                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                                            />
                                        ) : (
                                            <path
                                                d={arc.d}
                                                fill="none"
                                                stroke="rgba(34, 211, 102, 0.10)"
                                                strokeWidth={0.7}
                                                strokeDasharray="2 5"
                                                strokeLinecap="round"
                                            />
                                        )}
                                        {isActive && !reduced && (
                                            <circle r="2.5" fill="hsl(119 99% 65%)">
                                                <animateMotion dur="2.2s" repeatCount="indefinite" path={arc.d} />
                                            </circle>
                                        )}
                                    </g>
                                );
                            })}

                            {/* Cities */}
                            {CITIES.map(city => {
                                const r = city.size === 'lg' ? 4.5 : city.size === 'md' ? 3 : 2;
                                const isEndpoint =
                                    PAIRS[active].a === city.n || PAIRS[active].b === city.n;
                                return (
                                    <g
                                        key={city.n}
                                        className={`cnet-city${isEndpoint ? ' is-endpoint' : ''}`}
                                    >
                                        {isEndpoint && (
                                            <circle
                                                cx={city.x}
                                                cy={city.y}
                                                r={r * 4}
                                                fill="url(#cnet-glow)"
                                                className="cnet-city-glow"
                                            />
                                        )}
                                        <circle
                                            cx={city.x}
                                            cy={city.y}
                                            r={r}
                                            fill={isEndpoint ? 'hsl(119 99% 65%)' : 'hsl(119 99% 50%)'}
                                            stroke="hsl(0 0% 100% / 0.9)"
                                            strokeWidth={isEndpoint ? 1 : 0.4}
                                        />
                                        <text
                                            x={city.x + r + 5}
                                            y={city.y + 3.5}
                                            fontSize={isEndpoint ? '10' : '8.5'}
                                            fontFamily="Sora, sans-serif"
                                            fontWeight={isEndpoint ? 700 : 500}
                                            fill={isEndpoint ? 'hsl(0 0% 96%)' : 'rgba(255,255,255,0.42)'}
                                        >
                                            {city.n}
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>
                    </div>

                    {/* SIDE FEED */}
                    <aside className="cnet-feed" aria-label="Sample activity feed">
                        <div className="cnet-feed-head">
                            <span className="cnet-feed-pulse" aria-hidden="true" />
                            <span>Sample dashboard activity</span>
                        </div>
                        <ul className="cnet-feed-list">
                            {PAIRS.map((p, i) => {
                                const offset = (i - active + PAIRS.length) % PAIRS.length;
                                const isPrimary = offset === 0;
                                if (offset > 4) return null;
                                return (
                                    <li
                                        key={i}
                                        className={`cnet-feed-item${isPrimary ? ' is-primary' : ''}`}
                                        style={{ '--feed-rank': offset }}
                                    >
                                        <div className="cnet-feed-route">
                                            <Stethoscope size={11} />
                                            <span>{p.a} · <em>{p.role.split(' → ')[0]}</em></span>
                                        </div>
                                        <div className="cnet-feed-arrow" aria-hidden="true">
                                            <span />
                                        </div>
                                        <div className="cnet-feed-route cnet-feed-route--engineer">
                                            <Cpu size={11} />
                                            <span>{p.b} · <em>{p.role.split(' → ')[1]}</em></span>
                                        </div>
                                        <div className={`cnet-feed-tag cnet-feed-tag--${p.tag.toLowerCase().replace(/\s+/g, '-')}`}>
                                            <ShieldCheck size={10} /> {p.tag}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                        <p className="cnet-feed-foot">
                            Sample data for presentation. Real posts come from the Firestore posts collection.
                        </p>
                    </aside>
                </motion.div>
            </div>
        </section>
    );
};

export default CinematicNetwork;
