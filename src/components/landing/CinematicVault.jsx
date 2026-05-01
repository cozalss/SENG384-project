import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ShieldCheck, FileText, KeyRound, Eye, EyeOff } from 'lucide-react';
import '../../styles/cinematic-vault.css';

/**
 * CinematicVault — protected-detail moment for the landing page.
 *
 * Visualizes the app's implemented post-detail flow as a single moving image:
 *
 *   LEFT   -> overview-public text plus a protected blueprint
 *   CENTER -> the NDA gate before protected details unlock
 *   RIGHT  -> an interest/meeting/chat workflow state
 *
 * Rotates through three sample disclosure scenarios at a slow tempo so the
 * user can read each. Static frame on prefers-reduced-motion.
 */

const PAYLOADS = [
    {
        id: 'specs',
        icon: FileText,
        label: 'Protected blueprint',
        meta: 'post-detail field',
        sample: '// goal: AI support tool for clinic intake\n// stage: prototype\n// needs: React dashboard, model integration, usability testing',
    },
    {
        id: 'data',
        icon: FileText,
        label: 'Collaboration note',
        meta: 'meeting-only detail',
        sample: 'domain: AI Diagnostics\nstage: Pilot\npreferred support: frontend, model review, deployment plan\nlocation: New York',
    },
    {
        id: 'irb',
        icon: FileText,
        label: 'Access rule',
        meta: 'NDA acknowledgement',
        sample: 'overview is public on the feed\nprotected details open after interest + NDA acceptance\nmeeting request and chat continue the workflow',
    },
];

const ROTATE_MS = 4200;

const CinematicVault = () => {
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
        const id = setInterval(() => setAct((i) => (i + 1) % PAYLOADS.length), ROTATE_MS);
        return () => clearInterval(id);
    }, [reduced]);

    const current = PAYLOADS[act];
    const Icon = current.icon;

    return (
        <section
            className="cvault-section landing-cinema-section"
            aria-labelledby="cvault-heading"
        >
            <div className="cvault-inner">
                <motion.div
                    className="cvault-eyebrow-row"
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                >
                    <span className="cvault-eyebrow">
                        <Lock size={11} /> NDA Gate
                    </span>
                </motion.div>

                <motion.h2
                    id="cvault-heading"
                    className="cvault-heading"
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                    Public overview first.<br />
                    Protected <em>details</em> after NDA.
                </motion.h2>

                <motion.p
                    className="cvault-sub"
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                >
                    The post can keep a short overview visible on the dashboard while sensitive blueprint text stays behind the NDA acknowledgement used in the project flow.
                </motion.p>

                <motion.div
                    className="cvault-stage"
                    initial={{ opacity: 0, y: 32 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.85, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                    {/* LEFT — confidential input panel */}
                    <div className="cvault-pane cvault-pane--input">
                        <div className="cvault-pane-head">
                            <span className="cvault-pane-tag">
                                <EyeOff size={10} /> Protected detail
                            </span>
                            <span className="cvault-pane-label">post detail</span>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={current.id}
                                className="cvault-doc"
                                initial={{ opacity: 0, y: 14, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 28, scale: 0.94 }}
                                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <div className="cvault-doc-head">
                                    <Icon size={14} />
                                    <div className="cvault-doc-title">
                                        <span>{current.label}</span>
                                        <small dangerouslySetInnerHTML={{ __html: current.meta }} />
                                    </div>
                                </div>
                                <pre className="cvault-doc-sample">{current.sample}</pre>
                                <div className="cvault-doc-watermark">
                                    <Lock size={10} /> NDA gated
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        <div className="cvault-input-stream" aria-hidden="true">
                            {[0, 1, 2, 3].map((i) => (
                                <span key={i} style={{ animationDelay: `${i * -0.6}s` }} />
                            ))}
                        </div>
                    </div>

                    {/* CENTER — the vault */}
                    <div className="cvault-door" aria-hidden="true">
                        <svg viewBox="0 0 320 320" className="cvault-door-svg">
                            <defs>
                                <radialGradient id="cvault-glow" cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" stopColor="hsl(119 99% 56%)" stopOpacity="0.45" />
                                    <stop offset="60%" stopColor="hsl(119 99% 56%)" stopOpacity="0.10" />
                                    <stop offset="100%" stopColor="hsl(119 99% 56%)" stopOpacity="0" />
                                </radialGradient>
                                <linearGradient id="cvault-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="hsl(119 99% 62%)" />
                                    <stop offset="100%" stopColor="hsl(155 80% 65%)" />
                                </linearGradient>
                                <linearGradient id="cvault-tick" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="hsl(119 99% 56%)" stopOpacity="0" />
                                    <stop offset="50%" stopColor="hsl(119 99% 56%)" stopOpacity="1" />
                                    <stop offset="100%" stopColor="hsl(119 99% 56%)" stopOpacity="0" />
                                </linearGradient>
                            </defs>

                            {/* Outer glow disc */}
                            <circle cx="160" cy="160" r="150" fill="url(#cvault-glow)" />

                            {/* Outer rotating tick ring */}
                            <g className="cvault-ring cvault-ring--outer">
                                {Array.from({ length: 36 }).map((_, i) => (
                                    <line
                                        key={i}
                                        x1="160"
                                        y1="22"
                                        x2="160"
                                        y2={i % 3 === 0 ? '34' : '28'}
                                        stroke={i % 3 === 0 ? 'hsl(119 99% 56%)' : 'rgba(34,211,102,0.32)'}
                                        strokeWidth={i % 3 === 0 ? 1.4 : 0.8}
                                        transform={`rotate(${i * 10} 160 160)`}
                                    />
                                ))}
                            </g>

                            {/* Spinning dashed ring */}
                            <circle
                                className="cvault-ring cvault-ring--mid"
                                cx="160"
                                cy="160"
                                r="118"
                                fill="none"
                                stroke="rgba(34, 211, 102, 0.32)"
                                strokeWidth="1"
                                strokeDasharray="4 6"
                            />

                            {/* Spoke marks */}
                            <g className="cvault-spokes">
                                {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                                    <line
                                        key={i}
                                        x1="160"
                                        y1="60"
                                        x2="160"
                                        y2="78"
                                        stroke="hsl(119 99% 56%)"
                                        strokeWidth="1.2"
                                        strokeLinecap="round"
                                        transform={`rotate(${deg} 160 160)`}
                                        opacity="0.55"
                                    />
                                ))}
                            </g>

                            {/* Pulse rings */}
                            {[0, 0.9, 1.8].map((delay, i) => (
                                <motion.circle
                                    key={i}
                                    cx="160"
                                    cy="160"
                                    r="86"
                                    fill="none"
                                    stroke="hsl(119 99% 56%)"
                                    strokeWidth="1"
                                    initial={{ scale: 1, opacity: 0 }}
                                    animate={
                                        reduced
                                            ? { opacity: 0 }
                                            : { scale: [1, 1.55], opacity: [0.5, 0] }
                                    }
                                    transition={{
                                        duration: 2.6,
                                        repeat: Infinity,
                                        ease: 'easeOut',
                                        delay,
                                    }}
                                    style={{ transformOrigin: '160px 160px' }}
                                />
                            ))}

                            {/* Inner static ring */}
                            <circle
                                cx="160"
                                cy="160"
                                r="86"
                                fill="none"
                                stroke="rgba(34, 211, 102, 0.45)"
                                strokeWidth="1"
                            />

                            {/* Vault face */}
                            <circle
                                cx="160"
                                cy="160"
                                r="68"
                                fill="hsl(0 0% 6%)"
                                stroke="url(#cvault-stroke)"
                                strokeWidth="1.6"
                            />

                            {/* Dial scratches */}
                            <g opacity="0.4">
                                {Array.from({ length: 24 }).map((_, i) => (
                                    <line
                                        key={i}
                                        x1="160"
                                        y1="98"
                                        x2="160"
                                        y2="106"
                                        stroke="hsl(119 99% 56%)"
                                        strokeWidth="0.6"
                                        transform={`rotate(${i * 15} 160 160)`}
                                    />
                                ))}
                            </g>

                            {/* Center key glyph + NDA stamp */}
                            <motion.g
                                animate={
                                    reduced
                                        ? {}
                                        : { rotate: [0, 360] }
                                }
                                transition={{
                                    duration: 24,
                                    repeat: Infinity,
                                    ease: 'linear',
                                }}
                                style={{ transformOrigin: '160px 160px' }}
                            >
                                <line
                                    x1="160"
                                    y1="118"
                                    x2="160"
                                    y2="146"
                                    stroke="hsl(119 99% 56%)"
                                    strokeWidth="1.4"
                                    strokeLinecap="round"
                                    opacity="0.5"
                                />
                            </motion.g>

                            {/* Center monogram disc */}
                            <circle
                                cx="160"
                                cy="160"
                                r="32"
                                fill="hsl(0 0% 8%)"
                                stroke="hsl(119 99% 56%)"
                                strokeWidth="1.2"
                            />
                            <foreignObject x="138" y="138" width="44" height="44">
                                <div className="cvault-stamp">
                                    <ShieldCheck size={20} />
                                </div>
                            </foreignObject>

                            {/* Bottom readout strip */}
                            <line
                                x1="40"
                                y1="298"
                                x2="280"
                                y2="298"
                                stroke="rgba(255,255,255,0.06)"
                                strokeWidth="1"
                            />
                            <path
                                d="M 40 298 L 100 298 L 110 290 L 120 306 L 128 298 L 280 298"
                                fill="none"
                                stroke="url(#cvault-tick)"
                                strokeWidth="1.4"
                                strokeLinecap="round"
                                strokeDasharray="260"
                                className="cvault-trace"
                            />
                        </svg>

                        {/* Action ticker beneath the vault */}
                        <div className="cvault-actions">
                            <div className={`cvault-action cvault-action--in${act % 2 === 0 ? ' is-on' : ''}`}>
                                <KeyRound size={11} /> NDA accepted
                            </div>
                            <div className={`cvault-action cvault-action--out${act % 2 === 1 ? ' is-on' : ''}`}>
                                <Eye size={11} /> Meeting request opened
                            </div>
                        </div>
                    </div>

                    {/* RIGHT — the public artifact panel */}
                    <div className="cvault-pane cvault-pane--output">
                        <div className="cvault-pane-head">
                            <span className="cvault-pane-tag cvault-pane-tag--public">
                                <Eye size={10} /> Workflow state
                            </span>
                            <span className="cvault-pane-label">on the platform</span>
                        </div>

                        <div className="cvault-handshake">
                            <div className="cvault-handshake-stamp">
                                <ShieldCheck size={18} />
                            </div>
                            <div className="cvault-handshake-body">
                                <div className="cvault-handshake-title">Sample post interest</div>
                                <ul className="cvault-handshake-meta">
                                    <li>Interest status <span>accepted</span></li>
                                    <li>NDA terms acknowledged</li>
                                    <li>Meeting slot proposed</li>
                                </ul>
                                <div className="cvault-handshake-foot">
                                    Chat opens after the workflow advances.
                                </div>
                            </div>
                        </div>

                        <div className="cvault-output-stream" aria-hidden="true">
                            {[0, 1, 2, 3].map((i) => (
                                <span key={i} style={{ animationDelay: `${i * -0.5}s` }} />
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default CinematicVault;
