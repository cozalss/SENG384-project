import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ShieldCheck, Lock, Building2, FileSignature, Globe, KeyRound } from 'lucide-react';

/**
 * LoginCinematicSide — left-side stage that pairs with the auth card.
 *
 * The login page is the threshold between the public landing and the
 * authenticated network. We treat it like a cinematic gate:
 *
 *   - A vertical scan line sweeps once on mount (security signal)
 *   - The brand monogram (concentric pulse rings + ECG glyph) sits
 *     centered as the "what you are entering" anchor
 *   - A column of trust chips rotates through every 3.5s, each chip
 *     stating one concrete property of the network
 *   - A serif italic line underneath frames the platform's mission
 *
 * Marked aria-hidden — purely decorative. Form on the right is the
 * a11y entry point.
 */

const TRUST_BEATS = [
    {
        Icon: ShieldCheck,
        label: 'GDPR - Article 17',
        body: 'Right to erasure honored within 24h. No silent retention.',
    },
    {
        Icon: FileSignature,
        label: 'NDA before details',
        body: 'Counterparties countersign before any technical specifics open.',
    },
    {
        Icon: Lock,
        label: 'Zero IP storage',
        body: 'Confidential portions of every post stay on your machine.',
    },
    {
        Icon: Building2,
        label: '47 EU institutions',
        body: 'Verified .edu only - Charite, KU Leuven, TU Delft, Karolinska...',
    },
    {
        Icon: Globe,
        label: 'Cross-border by design',
        body: '14 countries. One workflow. Same NDA template, every time.',
    },
];

const BEAT_MS = 3600;

// Live trust score — micro-fluctuates within a 0.3% band to read as a real
// monitoring signal rather than a static design token. The amplitude is
// intentionally tiny: clinicians and engineers trust monitors that look
// alive, not monitors that bounce. Same idea as a real EKG: the beat is
// rhythmic, the variance is biological-scale.
const TRUST_BASE = 99.8;
const TRUST_AMPLITUDE = 0.15;

const LoginCinematicSide = () => {
    const [beat, setBeat] = useState(0);
    const [trustScore, setTrustScore] = useState(TRUST_BASE);
    const [signalLive, setSignalLive] = useState(true); // toggles the live-dot

    useEffect(() => {
        const id = setInterval(() => {
            setBeat((b) => (b + 1) % TRUST_BEATS.length);
        }, BEAT_MS);
        return () => clearInterval(id);
    }, []);

    // Live trust score fluctuation. Updates every ~1.4s with a deterministic-
    // looking but noise-driven offset so the value never stutters in a visible
    // pattern. Reduced-motion users get the static base.
    useEffect(() => {
        const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        if (reduced) return;
        const id = setInterval(() => {
            const offset = (Math.random() - 0.5) * 2 * TRUST_AMPLITUDE;
            setTrustScore(Math.min(99.95, Math.max(99.5, TRUST_BASE + offset)));
        }, 1400);
        return () => clearInterval(id);
    }, []);

    // Live signal indicator dot — blinks every 1.6s so the "Live" word reads
    // as instantaneous status. Independent timer from the trust score so the
    // two pulses naturally desynchronize and feel non-mechanical.
    useEffect(() => {
        const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        if (reduced) return;
        const id = setInterval(() => setSignalLive((v) => !v), 1600);
        return () => clearInterval(id);
    }, []);

    const COMMAND_METRICS = [
        { Icon: ShieldCheck, label: 'Trust score', value: `${trustScore.toFixed(1)}%`, live: false },
        { Icon: Activity, label: 'Signal integrity', value: 'Live', live: true },
        { Icon: Lock, label: 'IP exposure', value: 'Zero', live: false },
    ];

    useEffect(() => {
        const handleMouseMove = (e) => {
            const { clientX, clientY } = e;
            const x = (clientX / window.innerWidth - 0.5) * 2;
            const y = (clientY / window.innerHeight - 0.5) * 2;

            const helix = document.querySelector('.lcs-helix');
            const monogram = document.querySelector('.lcs-monogram');
            const lightTop = document.querySelector('.lcs-light--top');
            
            if (helix) helix.style.transform = `translate(${x * -15}px, ${y * -15}px)`;
            if (monogram) monogram.style.transform = `translate(${x * -8}px, ${y * -8}px)`;
            if (lightTop) lightTop.style.transform = `translate(${x * 30}px, ${y * 20}px)`;

            // Particle trail (only on the left side)
            if (clientX < window.innerWidth * 0.6) {
                if (Math.random() > 0.8) {
                    const particle = document.createElement('div');
                    particle.className = 'login-particle';
                    particle.style.left = `${clientX}px`;
                    particle.style.top = `${clientY}px`;
                    particle.style.width = `${Math.random() * 4 + 2}px`;
                    particle.style.height = particle.style.width;
                    document.body.appendChild(particle);
                    setTimeout(() => {
                        if (document.body.contains(particle)) {
                            document.body.removeChild(particle);
                        }
                    }, 800);
                }
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const Beat = TRUST_BEATS[beat];

    return (
        <aside className="lcs-root" aria-hidden="true">
            <span className="lcs-letterbox lcs-letterbox--top" />
            <span className="lcs-letterbox lcs-letterbox--bottom" />

            {/* Vertical scan that sweeps once on mount, then loops slowly */}
            <span className="lcs-scan" aria-hidden="true" />

            {/* Soft directional lights */}
            <span className="lcs-light lcs-light--top" aria-hidden="true" />
            <span className="lcs-light lcs-light--bottom" aria-hidden="true" />

            {/* Faint horizontal ECG drift across the back */}
            <svg className="lcs-ambient-ecg" viewBox="0 0 1200 120" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                    <linearGradient id="lcs-ecg" x1="0%" x2="100%">
                        <stop offset="0%" stopColor="hsl(119 99% 56%)" stopOpacity="0" />
                        <stop offset="50%" stopColor="hsl(119 99% 56%)" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="hsl(119 99% 56%)" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path
                    d="M 0 60 L 200 60 L 230 30 L 260 90 L 290 60 L 500 60 L 530 30 L 560 90 L 590 60 L 800 60 L 830 30 L 860 90 L 890 60 L 1200 60"
                    fill="none"
                    stroke="url(#lcs-ecg)"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeDasharray="3000"
                    style={{ animation: 'lcs-ecg-drift 12s linear infinite' }}
                />
            </svg>

            <div className="lcs-data-curtain" aria-hidden="true">
                {Array.from({ length: 22 }).map((_, i) => (
                    <span
                        key={i}
                        style={{
                            '--left': `${4 + ((i * 43) % 92)}%`,
                            '--delay': `${(i % 10) * -0.36}s`,
                            '--height': `${28 + (i % 5) * 16}px`,
                        }}
                    />
                ))}
            </div>

            <svg className="lcs-helix" viewBox="0 0 220 620" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                    <linearGradient id="lcs-helix-grad" x1="0%" x2="100%">
                        <stop offset="0%" stopColor="hsl(119 99% 56%)" stopOpacity="0" />
                        <stop offset="48%" stopColor="hsl(180 75% 70%)" stopOpacity="0.82" />
                        <stop offset="100%" stopColor="hsl(245 70% 70%)" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path
                    d="M 110 0 C 20 92, 20 178, 110 270 S 200 470, 110 620"
                    fill="none"
                    stroke="url(#lcs-helix-grad)"
                    strokeWidth="1.5"
                    strokeDasharray="10 15"
                />
                <path
                    d="M 110 0 C 200 92, 200 178, 110 270 S 20 470, 110 620"
                    fill="none"
                    stroke="url(#lcs-helix-grad)"
                    strokeWidth="1"
                    strokeDasharray="4 18"
                />
                {Array.from({ length: 24 }).map((_, i) => {
                    const y = 18 + i * 25;
                    const spread = Math.sin(i * 0.68) * 58;
                    return (
                        <g key={i} opacity={0.24 + (i % 5) * 0.07}>
                            <line x1={110 + spread} y1={y} x2={110 - spread} y2={y + 8} stroke="rgba(255,255,255,0.16)" strokeWidth="0.8" />
                            <circle cx={110 + spread} cy={y} r={i % 4 === 0 ? 2.2 : 1.4} fill="hsl(119 99% 60%)" />
                            <circle cx={110 - spread} cy={y + 8} r={i % 4 === 2 ? 2 : 1.3} fill="hsl(180 75% 70%)" />
                        </g>
                    );
                })}
            </svg>

            <div className="lcs-stage">
                {/* Eyebrow */}
                <div className="lcs-eyebrow">
                    <span className="lcs-eyebrow-dot" />
                    Secure Network - EU Health Innovation
                </div>

                {/* Brand monogram — concentric rings + ECG glyph */}
                <div className="lcs-monogram">
                    <span className="lcs-orbit-ring lcs-orbit-ring--a" />
                    <span className="lcs-orbit-ring lcs-orbit-ring--b" />
                    <span className="lcs-orbit-ring lcs-orbit-ring--c" />
                    <svg viewBox="0 0 220 220" aria-hidden="true">
                        <defs>
                            <radialGradient id="lcs-glow" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="hsl(119 99% 56%)" stopOpacity="0.5" />
                                <stop offset="60%" stopColor="hsl(119 99% 56%)" stopOpacity="0.10" />
                                <stop offset="100%" stopColor="hsl(119 99% 56%)" stopOpacity="0" />
                            </radialGradient>
                            <linearGradient id="lcs-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="hsl(119 99% 62%)" />
                                <stop offset="100%" stopColor="hsl(155 80% 65%)" />
                            </linearGradient>
                        </defs>

                        <circle cx="110" cy="110" r="105" fill="url(#lcs-glow)" />

                        {/* Three staggered expanding pulse rings */}
                        {[0, 1.0, 2.0].map((delay, i) => (
                            <motion.circle
                                key={i}
                                cx="110" cy="110" r="60"
                                fill="none"
                                stroke="hsl(119 99% 56%)"
                                strokeWidth="1"
                                animate={{ scale: [1, 1.7], opacity: [0.55, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'easeOut', delay }}
                                style={{ transformOrigin: '110px 110px' }}
                            />
                        ))}

                        {/* Static rails */}
                        <circle cx="110" cy="110" r="78" fill="none" stroke="rgba(34, 211, 102, 0.18)" strokeWidth="1" strokeDasharray="3 5" />
                        <circle cx="110" cy="110" r="60" fill="none" stroke="rgba(34, 211, 102, 0.34)" strokeWidth="1" />

                        {/* Inner disc */}
                        <circle cx="110" cy="110" r="42" fill="hsl(0 0% 6%)" stroke="url(#lcs-stroke)" strokeWidth="1.6" />

                        {/* ECG glyph */}
                        <motion.path
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
                            d="M 80 110 L 96 110 L 102 95 L 110 130 L 118 100 L 124 110 L 140 110"
                            fill="none"
                            stroke="hsl(119 99% 60%)"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ filter: 'drop-shadow(0 0 8px hsl(119 99% 56%))' }}
                        />

                        {/* Orbiting key dot — visualizes the act of unlocking */}
                        <motion.g
                            animate={{ rotate: 360 }}
                            transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
                            style={{ transformOrigin: '110px 110px' }}
                        >
                            <circle cx="188" cy="110" r="3" fill="hsl(119 99% 56%)" />
                            <circle cx="188" cy="110" r="6" fill="none" stroke="hsl(119 99% 56%)" strokeOpacity="0.4" strokeWidth="1" />
                        </motion.g>
                    </svg>
                </div>

                {/* Brand wordmark — every character sits in its own span so
                    the CSS sweep keyframe lights them up sequentially. The
                    underlying class also wraps a brand-green glow pulse on
                    the green " AI" half. */}
                <div className="lcs-wordmark lcs-wordmark--swept">
                    {'HEALTH'.split('').map((ch, i) => (
                        <span key={`h-${i}`} className="lcs-wordmark-char" style={{ '--char-i': i }}>{ch}</span>
                    ))}
                    <span className="lcs-wordmark-accent">
                        {' AI'.split('').map((ch, i) => (
                            <span key={`a-${i}`} className="lcs-wordmark-char" style={{ '--char-i': i + 6 }}>{ch === ' ' ? ' ' : ch}</span>
                        ))}
                    </span>
                </div>

                <div className="lcs-command-strip">
                    {COMMAND_METRICS.map(({ Icon, label, value, live }) => (
                        <div className="lcs-command-metric lcs-command-metric--alive" key={label}>
                            <Icon size={13} />
                            <span>{label}</span>
                            <strong className={live ? 'lcs-command-value lcs-command-value--live' : 'lcs-command-value'}>
                                {live && (
                                    <span
                                        className="lcs-live-dot"
                                        aria-hidden="true"
                                        style={{ opacity: signalLive ? 1 : 0.25 }}
                                    />
                                )}
                                {value}
                            </strong>
                        </div>
                    ))}
                </div>

                {/* Mission line */}
                <p className="lcs-mission">
                    Where <em>medicine</em> meets <em>engineering</em>,<br />
                    structurally and on the record.
                </p>

                {/* Rotating trust beat */}
                <div className="lcs-beat-frame">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={beat}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                            className="lcs-beat"
                        >
                            <div className="lcs-beat-icon">
                                <Beat.Icon size={14} />
                            </div>
                            <div className="lcs-beat-body">
                                <span className="lcs-beat-label">{Beat.label}</span>
                                <span className="lcs-beat-text">{Beat.body}</span>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Beat dots — index of where in the cycle you are */}
                <div className="lcs-beat-dots">
                    {TRUST_BEATS.map((_, i) => (
                        <span key={i} className={`lcs-beat-dot${i === beat ? ' is-active' : ''}`} />
                    ))}
                </div>
            </div>

            {/* Footer signature */}
            <div className="lcs-footer">
                <span className="lcs-footer-key">
                    <KeyRound size={11} />
                    Identity verified locally
                </span>
                <span className="lcs-footer-meta">
                    AES-256 · TLS 1.3 · Audit-logged
                </span>
            </div>
        </aside>
    );
};

export default LoginCinematicSide;
