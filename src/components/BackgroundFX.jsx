import { useMemo } from 'react';

const seededRandom = (i) => {
    const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
};

const BackgroundFX = () => {
    const { nodes, links, hubs } = useMemo(() => {
        const W = 1000;
        const H = 600;
        const NODE_COUNT = 42;

        const palette = ['#22d3ee', '#f472b6', '#a78bfa', '#8be8bc', '#2dd4bf'];

        const nodes = Array.from({ length: NODE_COUNT }, (_, i) => ({
            id: i,
            x: 20 + seededRandom(i * 2 + 1) * (W - 40),
            y: 20 + seededRandom(i * 2 + 2) * (H - 40),
            color: palette[Math.floor(seededRandom(i + 17) * palette.length)],
            dur: 2.4 + seededRandom(i + 37) * 3,
            delay: seededRandom(i + 71) * 4,
            size: 2.2 + seededRandom(i + 97) * 1.4
        }));

        const hubIndices = [3, 11, 19, 27, 34];
        const hubs = hubIndices.map(i => nodes[i]);

        const links = [];
        for (let i = 0; i < nodes.length; i++) {
            const sorted = nodes
                .map((n, j) => ({ j, d: i === j ? Infinity : Math.hypot(nodes[i].x - n.x, nodes[i].y - n.y) }))
                .sort((a, b) => a.d - b.d);
            const connectCount = hubIndices.includes(i) ? 5 : 2;
            for (let k = 0; k < connectCount; k++) {
                const { j, d } = sorted[k];
                if (j > i && d < 260) {
                    links.push({
                        a: nodes[i],
                        b: nodes[j],
                        color: nodes[i].color,
                        dur: 3 + seededRandom(i * 100 + j) * 3,
                        delay: seededRandom(i + j * 7) * 3
                    });
                }
            }
        }

        return { nodes, links, hubs };
    }, []);

    return (
        <div className="bg-fx" aria-hidden="true">
            {/* Biomorphic blurred blobs — organic depth layer */}
            <svg
                className="bg-fx-biomorphic"
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMid slice"
            >
                <defs>
                    <filter id="biomorph-blur" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="3.5" />
                    </filter>
                    <radialGradient id="blob-indigo" cx="50%" cy="50%">
                        <stop offset="0%" stopColor="rgba(139, 232, 188, 0.55)" />
                        <stop offset="60%" stopColor="rgba(139, 232, 188, 0.15)" />
                        <stop offset="100%" stopColor="rgba(139, 232, 188, 0)" />
                    </radialGradient>
                    <radialGradient id="blob-magenta" cx="50%" cy="50%">
                        <stop offset="0%" stopColor="rgba(244, 114, 182, 0.5)" />
                        <stop offset="60%" stopColor="rgba(244, 114, 182, 0.12)" />
                        <stop offset="100%" stopColor="rgba(244, 114, 182, 0)" />
                    </radialGradient>
                    <radialGradient id="blob-cyan" cx="50%" cy="50%">
                        <stop offset="0%" stopColor="rgba(34, 211, 238, 0.42)" />
                        <stop offset="60%" stopColor="rgba(34, 211, 238, 0.1)" />
                        <stop offset="100%" stopColor="rgba(34, 211, 238, 0)" />
                    </radialGradient>
                    <radialGradient id="blob-emerald" cx="50%" cy="50%">
                        <stop offset="0%" stopColor="rgba(45, 212, 191, 0.4)" />
                        <stop offset="60%" stopColor="rgba(45, 212, 191, 0.08)" />
                        <stop offset="100%" stopColor="rgba(45, 212, 191, 0)" />
                    </radialGradient>
                    <radialGradient id="blob-violet" cx="50%" cy="50%">
                        <stop offset="0%" stopColor="rgba(34, 211, 238, 0.5)" />
                        <stop offset="60%" stopColor="rgba(34, 211, 238, 0.12)" />
                        <stop offset="100%" stopColor="rgba(34, 211, 238, 0)" />
                    </radialGradient>
                </defs>
                <g filter="url(#biomorph-blur)">
                    <ellipse cx="16" cy="28" rx="26" ry="22" fill="url(#blob-indigo)" />
                    <ellipse cx="84" cy="20" rx="22" ry="20" fill="url(#blob-magenta)" />
                    <ellipse cx="72" cy="78" rx="28" ry="24" fill="url(#blob-cyan)" />
                    <ellipse cx="24" cy="82" rx="24" ry="20" fill="url(#blob-violet)" />
                    <ellipse cx="50" cy="50" rx="20" ry="16" fill="url(#blob-emerald)" />
                </g>
            </svg>

            {/* Neural network — crisp interconnected layer */}
            <svg
                className="bg-fx-network"
                viewBox="0 0 1000 600"
                preserveAspectRatio="xMidYMid slice"
            >
                <defs>
                    <filter id="node-glow" x="-200%" y="-200%" width="500%" height="500%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <filter id="hub-glow" x="-200%" y="-200%" width="500%" height="500%">
                        <feGaussianBlur stdDeviation="6" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Connection lines */}
                <g className="bg-fx-links">
                    {links.map((l, i) => (
                        <line
                            key={`l-${i}`}
                            x1={l.a.x}
                            y1={l.a.y}
                            x2={l.b.x}
                            y2={l.b.y}
                            stroke={l.color}
                            strokeWidth="0.9"
                            strokeOpacity="0.22"
                        >
                            <animate
                                attributeName="stroke-opacity"
                                values="0.08;0.32;0.08"
                                dur={`${l.dur}s`}
                                begin={`-${l.delay}s`}
                                repeatCount="indefinite"
                            />
                        </line>
                    ))}
                </g>

                {/* Regular nodes */}
                <g>
                    {nodes.map((n) => (
                        <circle
                            key={`n-${n.id}`}
                            cx={n.x}
                            cy={n.y}
                            r={n.size}
                            fill={n.color}
                            filter="url(#node-glow)"
                            opacity="0.85"
                        >
                            <animate
                                attributeName="opacity"
                                values="0.3;0.95;0.3"
                                dur={`${n.dur}s`}
                                begin={`-${n.delay}s`}
                                repeatCount="indefinite"
                            />
                            <animate
                                attributeName="r"
                                values={`${n.size * 0.7};${n.size * 1.3};${n.size * 0.7}`}
                                dur={`${n.dur}s`}
                                begin={`-${n.delay}s`}
                                repeatCount="indefinite"
                            />
                        </circle>
                    ))}
                </g>

                {/* Hub nodes — brighter, larger */}
                <g>
                    {hubs.map((h) => (
                        <g key={`h-${h.id}`}>
                            <circle
                                cx={h.x}
                                cy={h.y}
                                r="14"
                                fill={h.color}
                                filter="url(#hub-glow)"
                                opacity="0.25"
                            >
                                <animate
                                    attributeName="r"
                                    values="10;20;10"
                                    dur={`${h.dur * 1.2}s`}
                                    begin={`-${h.delay}s`}
                                    repeatCount="indefinite"
                                />
                                <animate
                                    attributeName="opacity"
                                    values="0.1;0.35;0.1"
                                    dur={`${h.dur * 1.2}s`}
                                    begin={`-${h.delay}s`}
                                    repeatCount="indefinite"
                                />
                            </circle>
                            <circle
                                cx={h.x}
                                cy={h.y}
                                r="4"
                                fill="#fff"
                                filter="url(#hub-glow)"
                                opacity="0.9"
                            />
                        </g>
                    ))}
                </g>
            </svg>
        </div>
    );
};

export default BackgroundFX;
