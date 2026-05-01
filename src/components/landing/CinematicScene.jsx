import { memo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Stethoscope, Cpu, FileText, Scan,
    HeartPulse, Bot, Activity, Lock, ShieldCheck, Video,
} from 'lucide-react';

/**
 * CinematicScene — auto-cycling 4-act narrative that runs in the Hero.
 *
 * Each act is a self-contained SVG/JSX composition that crossfades into
 * the next via framer-motion's AnimatePresence. The whole story is a
 * single 14s loop:
 *
 *   Act 1 (0–3.5s)   Tablet ECG drawing across a hospital glow
 *   Act 2 (3.5–7s)   Match cut — ECG morphs into terminal code lines
 *   Act 3 (7–10.5s)  Two cards (Clinical / Engineering) joined by an
 *                    NDA-stamped fiber-optic line
 *   Act 4 (10.5–14s) Concentric pulse rings reveal the HEALTH AI logo
 *
 * The scene is decorative, marked aria-hidden, pointer-events: none, and
 * frozen on prefers-reduced-motion (single static composition).
 */

const ACT_MS = 3500;
const TOTAL_ACTS = 4;

const fade = {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, scale: 1.02, transition: { duration: 0.5, ease: [0.64, 0, 0.78, 0] } },
};

const BACKPLATE_POINTS = Array.from({ length: 34 }, (_, i) => ({
    x: `${8 + ((i * 37) % 84)}%`,
    y: `${9 + ((i * 53) % 78)}%`,
    delay: `${(i % 9) * -0.42}s`,
    size: `${2 + (i % 4)}px`,
}));

const DUST_MOTES = Array.from({ length: 46 }, (_, i) => ({
    x: `${5 + ((i * 41) % 90)}%`,
    y: `${8 + ((i * 67) % 82)}%`,
    delay: `${(i % 13) * -0.36}s`,
    drift: `${18 + (i % 6) * 7}px`,
    size: `${1 + (i % 4) * 0.45}px`,
}));

const SceneBackplate = memo(() => (
    <div className="cs-backplate">
        <div className="cs-volumetric-stack" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={`cs-volumetric-beam cs-volumetric-beam--${i + 1}`} />
            ))}
        </div>
        <div className="cs-lens-stack" aria-hidden="true">
            <span className="cs-lens-streak cs-lens-streak--main" />
            <span className="cs-lens-streak cs-lens-streak--warm" />
            <span className="cs-lens-core" />
        </div>
        <span className="cs-radar-ring cs-radar-ring--a" />
        <span className="cs-radar-ring cs-radar-ring--b" />
        <span className="cs-radar-ring cs-radar-ring--c" />

        <svg className="cs-helix-ghost" viewBox="0 0 160 520" preserveAspectRatio="none" aria-hidden="true">
            <defs>
                <linearGradient id="cs-helix-grad" x1="0%" x2="100%">
                    <stop offset="0%" stopColor="hsl(119 99% 56%)" stopOpacity="0" />
                    <stop offset="50%" stopColor="hsl(180 75% 70%)" stopOpacity="0.78" />
                    <stop offset="100%" stopColor="hsl(245 80% 75%)" stopOpacity="0" />
                </linearGradient>
            </defs>
            <path
                d="M 78 0 C 18 82, 18 154, 78 236 S 138 394, 78 520"
                fill="none"
                stroke="url(#cs-helix-grad)"
                strokeWidth="1.6"
                strokeDasharray="8 12"
            />
            <path
                d="M 82 0 C 142 82, 142 154, 82 236 S 22 394, 82 520"
                fill="none"
                stroke="url(#cs-helix-grad)"
                strokeWidth="1.1"
                strokeDasharray="4 14"
            />
            {Array.from({ length: 22 }).map((_, i) => {
                const y = 20 + i * 23;
                const xA = 80 + Math.sin(i * 0.72) * 42;
                const xB = 80 - Math.sin(i * 0.72) * 42;
                return (
                    <g key={i} opacity={0.28 + (i % 4) * 0.08}>
                        <line x1={xA} y1={y} x2={xB} y2={y + 7} stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />
                        <circle cx={xA} cy={y} r={i % 3 === 0 ? 2.2 : 1.4} fill="hsl(119 99% 60%)" />
                        <circle cx={xB} cy={y + 7} r={i % 3 === 1 ? 2 : 1.25} fill="hsl(180 75% 70%)" />
                    </g>
                );
            })}
        </svg>

        <div className="cs-particle-field">
            {BACKPLATE_POINTS.map((point, i) => (
                <span
                    key={i}
                    style={{
                        '--x': point.x,
                        '--y': point.y,
                        '--delay': point.delay,
                        '--size': point.size,
                    }}
                />
            ))}
        </div>
        <div className="cs-dust-field" aria-hidden="true">
            {DUST_MOTES.map((mote, i) => (
                <span
                    key={i}
                    style={{
                        '--x': mote.x,
                        '--y': mote.y,
                        '--delay': mote.delay,
                        '--drift': mote.drift,
                        '--size': mote.size,
                    }}
                />
            ))}
        </div>
        <div className="cs-stage-floor" aria-hidden="true" />
        <div className="cs-foreground-glass" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => (
                <span
                    key={i}
                    style={{
                        '--x': `${4 + i * 17}%`,
                        '--h': `${66 + (i % 3) * 12}%`,
                        '--delay': `${i * -0.8}s`,
                    }}
                />
            ))}
        </div>
    </div>
));
SceneBackplate.displayName = 'SceneBackplate';

/* ---------- ACT 1 — TABLET ECG ---------- */

const ActTabletECG = () => (
    <motion.div className="cs-act" {...fade}>
        {/* Soft hospital corridor light */}
        <div className="cs-light cs-light--clinic" />

        <motion.div
            className="cs-tablet"
            initial={{ y: 12, rotate: -1.5 }}
            animate={{ y: [12, 4, 12], rotate: [-1.5, -0.5, -1.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
            <div className="cs-tablet-bezel">
                <div className="cs-tablet-screen">
                    <div className="cs-tablet-statusbar">
                        <span className="cs-status-dot" />
                        <span className="cs-status-label">ECG · LEAD II</span>
                        <span className="cs-status-bpm">72 bpm</span>
                    </div>
                    <svg viewBox="0 0 320 120" className="cs-tablet-ecg" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="cs-ecg-grad" x1="0%" x2="100%">
                                <stop offset="0%" stopColor="hsl(119 99% 56%)" stopOpacity="0" />
                                <stop offset="50%" stopColor="hsl(119 99% 56%)" stopOpacity="1" />
                                <stop offset="100%" stopColor="hsl(119 99% 56%)" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        {/* baseline grid */}
                        <g stroke="rgba(34, 211, 102, 0.08)" strokeWidth="0.5">
                            {[20, 40, 60, 80, 100].map((y) => <line key={y} x1="0" y1={y} x2="320" y2={y} />)}
                            {Array.from({ length: 16 }).map((_, i) => (
                                <line key={i} x1={i * 20} y1="0" x2={i * 20} y2="120" />
                            ))}
                        </g>
                        <line x1="0" y1="60" x2="320" y2="60" stroke="rgba(34,211,102,0.2)" strokeWidth="0.6" />
                        {/* live ECG pulse */}
                        <path
                            d="M 0 60 L 50 60 L 60 50 L 70 70 L 80 60 L 130 60 L 140 50 L 150 70 L 160 60 L 210 60 L 220 30 L 232 90 L 244 60 L 320 60"
                            fill="none"
                            stroke="url(#cs-ecg-grad)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeDasharray="600"
                            style={{ animation: 'cs-ecg-sweep 2.4s linear infinite' }}
                        />
                    </svg>
                </div>
            </div>
            <div className="cs-tablet-glow" aria-hidden="true" />
        </motion.div>

        {/* Floating clinician chip */}
        <motion.div
            className="cs-chip cs-chip--tl"
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
            <Stethoscope size={12} /> Clinician · Bedside
        </motion.div>
    </motion.div>
);

/* ---------- ACT 2 — MATCH CUT TO CODE ---------- */

const CODE_LINES = [
    { c: 'cs-c-key', t: 'function ' }, { c: 'cs-c-fn', t: 'detectArrhythmia' }, { c: '', t: '(ecg) {' },
];
const CODE_LINES_2 = [
    { c: 'cs-c-key', t: '  const ' }, { c: 'cs-c-var', t: 'pulse' }, { c: '', t: ' = ecg.' }, { c: 'cs-c-fn', t: 'normalize' }, { c: '', t: '();' },
];
const CODE_LINES_3 = [
    { c: 'cs-c-key', t: '  return ' }, { c: 'cs-c-fn', t: 'model' }, { c: '', t: '.' }, { c: 'cs-c-fn', t: 'predict' }, { c: '', t: '(pulse);' },
];
const CODE_LINES_4 = [
    { c: '', t: '}' },
];

const TypedLine = ({ tokens, delay }) => (
    <motion.div
        className="cs-code-line"
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
        {tokens.map((t, i) => (
            <span key={i} className={t.c}>{t.t}</span>
        ))}
    </motion.div>
);

const ActCodeMorph = () => (
    <motion.div className="cs-act" {...fade}>
        <div className="cs-light cs-light--engineer" />

        {/* Match-cut burst particles */}
        <div className="cs-burst" aria-hidden="true">
            {Array.from({ length: 14 }).map((_, i) => (
                <span key={i} style={{ '--i': i }} />
            ))}
        </div>

        <motion.div
            className="cs-editor"
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
            <div className="cs-editor-titlebar">
                <span className="cs-editor-dot cs-editor-dot--r" />
                <span className="cs-editor-dot cs-editor-dot--y" />
                <span className="cs-editor-dot cs-editor-dot--g" />
                <span className="cs-editor-filename">arrhythmia.ts</span>
            </div>
            <div className="cs-editor-body">
                <div className="cs-gutter">
                    {[1, 2, 3, 4].map(n => <span key={n}>{n}</span>)}
                </div>
                <div className="cs-code">
                    <TypedLine tokens={CODE_LINES} delay={0.15} />
                    <TypedLine tokens={CODE_LINES_2} delay={0.45} />
                    <TypedLine tokens={CODE_LINES_3} delay={0.95} />
                    <TypedLine tokens={CODE_LINES_4} delay={1.4} />
                    <span className="cs-cursor" />
                </div>
            </div>
        </motion.div>

        <motion.div
            className="cs-chip cs-chip--tr"
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
        >
            <Cpu size={12} /> Engineer · VS Code
        </motion.div>
    </motion.div>
);

/* ---------- ACT 3 — NDA BRIDGE ---------- */

const ActBridge = () => (
    <motion.div className="cs-act" {...fade}>
        <div className="cs-light cs-light--neutral" />

        <div className="cs-bridge">
            {/* LEFT — Clinical Post */}
            <motion.div
                className="cs-mini cs-mini--clinical"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
                <div className="cs-mini-head">
                    <FileText size={11} />
                    <span>Clinical Post</span>
                </div>
                <div className="cs-mini-title">Bedside ECG anomaly detection</div>
                <div className="cs-mini-tags">
                    <span>Cardiology</span>
                    <span>New York</span>
                </div>
                <div className="cs-mini-locked">
                    <Lock size={9} /> NDA-gated
                </div>
            </motion.div>

            {/* CENTER — fiber line */}
            <div className="cs-fiber">
                <svg viewBox="0 0 200 80" preserveAspectRatio="none" className="cs-fiber-svg">
                    <defs>
                        <linearGradient id="cs-fiber-grad" x1="0%" x2="100%">
                            <stop offset="0%" stopColor="hsl(119 99% 56%)" stopOpacity="0" />
                            <stop offset="50%" stopColor="hsl(119 99% 56%)" stopOpacity="1" />
                            <stop offset="100%" stopColor="hsl(119 99% 56%)" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path
                        d="M 0 40 Q 50 10 100 40 T 200 40"
                        fill="none"
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth="1"
                        strokeDasharray="2 4"
                    />
                    <path
                        d="M 0 40 Q 50 10 100 40 T 200 40"
                        fill="none"
                        stroke="url(#cs-fiber-grad)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray="220"
                        style={{ animation: 'cs-fiber-flow 2.6s linear infinite' }}
                    />
                </svg>

                {/* NDA stamp at midpoint */}
                <motion.div
                    className="cs-stamp"
                    initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
                    animate={{ scale: 1, opacity: 1, rotate: -6 }}
                    transition={{ delay: 0.7, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                >
                    <ShieldCheck size={11} /> NDA ACCEPTED
                </motion.div>
            </div>

            {/* RIGHT — Engineering Feed */}
            <motion.div
                className="cs-mini cs-mini--engineer"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
                <div className="cs-mini-head">
                    <Cpu size={11} />
                    <span>Engineer · Feed</span>
                </div>
                <div className="cs-mini-title">Relevant post · Express interest</div>
                <div className="cs-mini-tags">
                    <span>ML / Signal</span>
                    <span>Available</span>
                </div>
                <div className="cs-mini-cta">
                    Express Interest
                </div>
            </motion.div>
        </div>
    </motion.div>
);

/* ---------- ACT 4 — LOGO REVEAL ---------- */

const ActLogoReveal = () => (
    <motion.div className="cs-act" {...fade}>
        <div className="cs-light cs-light--reveal" />

        <div className="cs-logo-stage">
            {/* Concentric pulse rings */}
            <svg viewBox="0 0 360 360" className="cs-logo-rings" aria-hidden="true">
                <defs>
                    <radialGradient id="cs-reveal-glow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="hsl(119 99% 56%)" stopOpacity="0.45" />
                        <stop offset="60%" stopColor="hsl(119 99% 56%)" stopOpacity="0.10" />
                        <stop offset="100%" stopColor="hsl(119 99% 56%)" stopOpacity="0" />
                    </radialGradient>
                </defs>
                <circle cx="180" cy="180" r="170" fill="url(#cs-reveal-glow)" />
                {[0, 0.6, 1.2].map((delay, i) => (
                    <motion.circle
                        key={i}
                        cx="180" cy="180" r="80"
                        fill="none"
                        stroke="hsl(119 99% 56%)"
                        strokeWidth="1"
                        animate={{ scale: [1, 1.8], opacity: [0.55, 0] }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut', delay }}
                        style={{ transformOrigin: '180px 180px' }}
                    />
                ))}
                <circle cx="180" cy="180" r="100" fill="none" stroke="rgba(34,211,102,0.18)" strokeWidth="1" strokeDasharray="3 5" />
                <circle cx="180" cy="180" r="80" fill="none" stroke="rgba(34,211,102,0.3)" strokeWidth="1" />
                {/* central monogram disc */}
                <circle cx="180" cy="180" r="52" fill="hsl(0 0% 6%)" stroke="hsl(119 99% 56%)" strokeWidth="1.4" />
                <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                    d="M 145 180 L 162 180 L 168 165 L 178 200 L 188 170 L 195 180 L 215 180"
                    fill="none"
                    stroke="hsl(119 99% 60%)"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ filter: 'drop-shadow(0 0 8px hsl(119 99% 56%))' }}
                />
            </svg>

            <motion.div
                className="cs-logo-lockup"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
                HEALTH<span> AI</span>
            </motion.div>
        </div>

        <motion.div
            className="cs-chip cs-chip--bottom"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.5 }}
        >
            <Video size={11} /> Partner Found
        </motion.div>
    </motion.div>
);

/* ---------- DISCIPLINE TICKER (always-on bottom rail) ---------- */

const DISCIPLINES = [
    { Icon: Scan, label: 'Radiology' },
    { Icon: HeartPulse, label: 'Cardiology' },
    { Icon: Activity, label: 'Biomedical' },
    { Icon: Cpu, label: 'ML / Signal' },
    { Icon: Bot, label: 'Robotic Surgery' },
    { Icon: Stethoscope, label: 'Internal Med' },
];

const DisciplineTicker = () => (
    <div className="cs-ticker" aria-hidden="true">
        <div className="cs-ticker-track">
            {[...DISCIPLINES, ...DISCIPLINES].map(({ Icon, label }, i) => (
                <span key={i} className="cs-ticker-item">
                    <Icon size={11} /> {label}
                </span>
            ))}
        </div>
    </div>
);

/* ---------- ACT INDEX BAR ---------- */

const ActIndex = ({ act }) => (
    <div className="cs-actbar" aria-hidden="true">
        {Array.from({ length: TOTAL_ACTS }).map((_, i) => (
            <span
                key={i}
                className={`cs-actbar-cell${i === act ? ' is-active' : ''}${i < act ? ' is-done' : ''}`}
            />
        ))}
        <span className="cs-actbar-label">
            {['ACT I · CLINIC', 'ACT II · ENGINEER', 'ACT III · NDA BRIDGE', 'ACT IV · PARTNER FOUND'][act]}
        </span>
    </div>
);

/* ---------- ROOT ---------- */

const CinematicScene = () => {
    const [act, setAct] = useState(0);
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
        const id = setInterval(() => setAct((a) => (a + 1) % TOTAL_ACTS), ACT_MS);
        return () => clearInterval(id);
    }, [reduced]);

    return (
        <div className="cs-root" aria-hidden="true">
            <SceneBackplate />
            <AnimatePresence mode="wait">
                {act === 0 && <ActTabletECG key="act-0" />}
                {act === 1 && <ActCodeMorph key="act-1" />}
                {act === 2 && <ActBridge key="act-2" />}
                {act === 3 && <ActLogoReveal key="act-3" />}
            </AnimatePresence>
            <ActIndex act={act} />
            <DisciplineTicker />
        </div>
    );
};

export default CinematicScene;
