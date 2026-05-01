import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FileText, Search, Lock, Handshake } from 'lucide-react';
import { useTilt } from '../../hooks/useInteractiveFX';

const FlowCard = ({ step, index }) => {
    const Icon = step.icon;
    const tilt = useTilt({ max: 8, scale: 1.025 });
    return (
        <motion.div
            {...tilt}
            className="px-flow-card premium-card premium-card--halo"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{
                duration: 0.55,
                delay: 0.08 * index,
                ease: [0.22, 1, 0.36, 1],
            }}
            style={{
                position: 'relative',
                padding: 'clamp(1.5rem, 2.5vw, 2rem)',
                borderRadius: 18,
                background: 'rgba(15, 15, 18, 0.55)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                backdropFilter: 'blur(18px) saturate(120%)',
                WebkitBackdropFilter: 'blur(18px) saturate(120%)',
                boxShadow:
                    '0 1px 2px rgba(0, 0, 0, 0.2), 0 18px 36px -18px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
                overflow: 'hidden',
                '--pc-glow': 'rgba(34, 211, 102, 0.45)',
                '--pc-glow-soft': 'rgba(34, 211, 102, 0.18)',
            }}
        >
            <span className="premium-card-halo" aria-hidden="true" />
            <span style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                background: 'linear-gradient(90deg, transparent, rgba(34, 211, 102, 0.45), transparent)',
                zIndex: 4,
            }} />

            <span style={{
                position: 'absolute',
                right: 'clamp(0.75rem, 1.5vw, 1.25rem)',
                top: 'clamp(0.5rem, 1vw, 0.75rem)',
                fontFamily: 'Sora, sans-serif',
                fontSize: 'clamp(2.6rem, 5.2vw, 4rem)',
                fontWeight: 700,
                color: 'rgba(255, 255, 255, 0.045)',
                letterSpacing: '-0.05em',
                pointerEvents: 'none',
                userSelect: 'none',
                zIndex: 4,
            }}>
                {step.n}
            </span>

            <div style={{
                width: 40,
                height: 40,
                borderRadius: 11,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(34, 211, 102, 0.1)',
                border: '1px solid rgba(34, 211, 102, 0.28)',
                color: 'hsl(119 99% 56%)',
                marginBottom: 18,
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
                position: 'relative',
                zIndex: 4,
            }}>
                <Icon size={18} strokeWidth={2} />
            </div>

            <h3 style={{
                margin: 0,
                fontSize: 'clamp(1.05rem, 1.5vw, 1.2rem)',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                lineHeight: 1.25,
                color: 'hsl(0 0% 96%)',
                marginBottom: 8,
                position: 'relative',
                zIndex: 4,
            }}>
                {step.title}
            </h3>
            <p style={{
                margin: 0,
                fontSize: '13.5px',
                fontWeight: 300,
                lineHeight: 1.6,
                color: 'hsl(0 0% 68%)',
                position: 'relative',
                zIndex: 4,
            }}>
                {step.body}
            </p>
        </motion.div>
    );
};

/**
 * HowItWorks — 4-step workflow with sequential entrance.
 *
 * Steps describe the actual user flow this senior project implements:
 *   1. Post a structured announcement (no IP leak).
 *   2. Counterparty browses and expresses interest.
 *   3. NDA gate before any private detail.
 *   4. Schedule a meeting via Zoom/Teams — platform never stores it.
 */
const STEPS = [
    {
        n: '01',
        icon: FileText,
        title: 'Write a structured brief',
        body: 'Describe the problem, the stage, and the expertise you need — in five fields, not five paragraphs. Anything confidential stays locked until step three.',
    },
    {
        n: '02',
        icon: Search,
        title: 'Filter by domain & city',
        body: 'Engineers browse clinical posts; clinicians browse engineering posts. City and domain filters surface the half-dozen people who actually fit — usually within the first scroll.',
    },
    {
        n: '03',
        icon: Lock,
        title: 'Sign the NDA, unlock the specs',
        body: 'Express interest, both parties countersign the platform NDA in one click, and the protected fields open. We never see what is shared past the gate.',
    },
    {
        n: '04',
        icon: Handshake,
        title: 'Pick a slot, start the partnership',
        body: 'Propose three Zoom or Teams slots, accept one, meet. Mark the post Partner Found and the listing closes — leaving a clean audit trail and nothing else.',
    },
];

const HowItWorks = () => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start 0.7', 'end 0.4'],
    });
    // SVG path draw — pathLength tween from 0 → 1 as user scrolls through
    // the workflow. A traveling gradient stop ("light running the wire")
    // creates a Linear/Stripe Checkout-style journey signal.
    const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);
    const dotProgress = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

    return (
        <section
            ref={ref}
            style={{
                position: 'relative',
                /* Standard breathing — symmetric top/bottom. The asymmetric
                   tight-top experiment cropped the section heading. */
                padding: 'clamp(3.5rem, 7vw, 5.5rem) clamp(1.5rem, 4vw, 3rem)',
                fontFamily: 'Sora, sans-serif',
            }}
        >
            <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
                {/* Eyebrow + heading + intro */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-120px' }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    style={{ textAlign: 'center', marginBottom: 'clamp(2rem, 4vw, 3rem)' }}
                >
                    {/* eyebrow removed — SectionLabel handles it now */}
                    <h2 style={{
                        margin: 0,
                        fontSize: 'clamp(1.85rem, 4.2vw, 3.2rem)',
                        fontWeight: 600,
                        lineHeight: 1.05,
                        letterSpacing: '-0.035em',
                        color: 'hsl(0 0% 96%)',
                    }}>
                        Four steps from <em style={{
                            fontFamily: "'Instrument Serif', Georgia, serif",
                            fontStyle: 'italic',
                            fontWeight: 400,
                            color: 'hsl(119 99% 56%)',
                        }}>idea</em> to <em style={{
                            fontFamily: "'Instrument Serif', Georgia, serif",
                            fontStyle: 'italic',
                            fontWeight: 400,
                            color: 'hsl(119 99% 56%)',
                        }}>partnership</em>.
                    </h2>
                    <p style={{
                        marginTop: '14px',
                        fontSize: 'clamp(0.95rem, 1.3vw, 1.1rem)',
                        color: 'hsl(0 0% 76%)',
                        fontWeight: 300,
                        lineHeight: 1.6,
                        maxWidth: '52ch',
                        marginInline: 'auto',
                    }}>
                        Every step has a clear next move. No DMs into a void, no scattered email threads, no "let&rsquo;s circle back" — just a checklist that ships.
                    </p>
                </motion.div>

                {/* 4-step grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: 'clamp(1rem, 2vw, 1.5rem)',
                    position: 'relative',
                }}>
                    {/* SVG path connector — draws as user scrolls through the
                        section. Hidden on narrow viewports where the cards stack
                        vertically (a horizontal connector line wouldn't make sense). */}
                    <svg
                        aria-hidden="true"
                        viewBox="0 0 1100 80"
                        preserveAspectRatio="none"
                        style={{
                            position: 'absolute',
                            top: '32px', left: '0', right: '0',
                            width: '100%', height: 80,
                            pointerEvents: 'none',
                            zIndex: 0,
                            display: 'block',
                        }}
                        className="px-howit-connector"
                    >
                        <defs>
                            <linearGradient id="howit-line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="hsl(119 99% 56%)" stopOpacity="0" />
                                <stop offset="50%" stopColor="hsl(119 99% 56%)" stopOpacity="0.6" />
                                <stop offset="100%" stopColor="hsl(119 99% 56%)" stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {/* Faint static rail under the animated path so the
                            geometry is always perceptible, not just during scroll. */}
                        <path
                            d="M 110 40 Q 320 0, 460 40 T 820 40 Q 920 60, 1000 40"
                            fill="none"
                            stroke="rgba(255,255,255,0.06)"
                            strokeWidth="1"
                            strokeDasharray="3 6"
                        />

                        {/* Animated draw — pathLength tweens 0 → 1 with scroll. */}
                        <motion.path
                            d="M 110 40 Q 320 0, 460 40 T 820 40 Q 920 60, 1000 40"
                            fill="none"
                            stroke="url(#howit-line-grad)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            style={{ pathLength }}
                        />

                        {/* Traveling glow dot — follows the line as it draws. */}
                        <motion.circle
                            r="5"
                            fill="hsl(119 99% 56%)"
                            style={{
                                offsetPath: 'path("M 110 40 Q 320 0, 460 40 T 820 40 Q 920 60, 1000 40")',
                                offsetDistance: dotProgress,
                                filter: 'drop-shadow(0 0 8px hsl(119 99% 56%))',
                            }}
                        />
                    </svg>

                    {STEPS.map((s, i) => (
                        <FlowCard key={s.n} step={s} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
