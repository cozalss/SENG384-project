import { motion } from 'framer-motion';
import { Sparkles, Users, Cpu, Network, Stethoscope, ShieldCheck, Lock, Shield, Handshake } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import { useTilt } from '../../hooks/useInteractiveFX';

const gridVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const TiltCard = ({ children, tiltMax = 7, style, ...rest }) => {
    const tilt = useTilt({ max: tiltMax, scale: 1.015 });
    return (
        <motion.div
            variants={cardVariants}
            className="bento-card"
            onMouseMove={tilt.onMouseMove}
            onMouseEnter={tilt.onMouseEnter}
            onMouseLeave={tilt.onMouseLeave}
            style={style}
            {...rest}
        >
            {children}
        </motion.div>
    );
};

const BentoFeatures = ({ isMobile }) => {
    return (
        <section className="container px-capabilities-section" style={{
            maxWidth: '1200px',
            // Unified to landing standard rhythm — was 100/140px which broke
            // the SectionLabel cadence. Now matches other section bottom margins.
            marginBottom: isMobile ? '64px' : '88px',
            paddingTop: 'clamp(2rem, 4vw, 3rem)',
        }}>
            <ScrollReveal>
                <div className="text-center" style={{ marginBottom: '40px', padding: '0 12px' }}>
                    <span className="eyebrow">
                        <Sparkles size={12} /> Platform Capabilities
                    </span>
                    <h2 style={{ fontSize: isMobile ? '32px' : '52px', marginBottom: '20px', letterSpacing: '-0.04em', lineHeight: '1.05' }}>
                        Built for <span className="text-gradient-aurora">Trust & Speed</span>
                    </h2>
                    <p className="text-muted" style={{ fontSize: isMobile ? '15px' : '18px', maxWidth: '620px', margin: '0 auto', lineHeight: '1.7' }}>
                        Everything a health-tech innovator needs to discover the right cross-disciplinary partner — without compromising early-stage IP.
                    </p>
                </div>
            </ScrollReveal>

            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
                variants={gridVariants}
                style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(6, 1fr)',
                    gap: '20px'
                }}
            >
                {/* BIG FEATURE 1 — Partner Discovery (spans 4) */}
                <TiltCard
                    tiltMax={6}
                    style={{
                        gridColumn: isMobile ? 'span 1' : 'span 4',
                        padding: isMobile ? '28px' : '44px', minHeight: isMobile ? '320px' : '380px',
                        background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.12), rgba(34, 211, 238, 0.05), rgba(15, 23, 42, 0.6))',
                        position: 'relative', overflow: 'hidden'
                    }}
                >
                    <div className="corner-accent corner-tl" />
                    <div className="corner-accent corner-tr" />
                    <div className="corner-accent corner-bl" />
                    <div className="corner-accent corner-br" />

                    {/* Decorative dot grid */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: 'radial-gradient(rgba(96, 165, 250,0.12) 1px, transparent 1px)',
                        backgroundSize: '28px 28px',
                        mask: 'radial-gradient(ellipse 70% 60% at 80% 20%, black, transparent)',
                        WebkitMask: 'radial-gradient(ellipse 70% 60% at 80% 20%, black, transparent)',
                        opacity: 0.6, pointerEvents: 'none'
                    }} />

                    <div style={{ position: 'relative', zIndex: 2, maxWidth: '540px' }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            padding: '6px 14px', borderRadius: '999px',
                            background: 'rgba(96, 165, 250, 0.12)', border: '1px solid rgba(96, 165, 250, 0.25)',
                            fontSize: '11px', fontWeight: '700', color: 'var(--badge-primary-text)',
                            textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '24px'
                        }}>
                            <Sparkles size={11} /> Flagship Feature
                        </div>
                        <div style={{
                            width: '64px', height: '64px', borderRadius: '18px',
                            background: 'linear-gradient(135deg, #60a5fa, #93c5fd)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', marginBottom: '24px',
                            boxShadow: '0 12px 32px rgba(96, 165, 250, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)'
                        }}>
                            <Users size={30} />
                        </div>
                        <h3 style={{ fontSize: isMobile ? '24px' : '30px', marginBottom: '14px', letterSpacing: '-0.02em' }}>
                            Structured Partner Discovery
                        </h3>
                        <p className="text-muted" style={{ fontSize: isMobile ? '14px' : '16px', lineHeight: '1.75', marginBottom: '28px' }}>
                            Post announcements describing your project and the expertise you need. Browse posts from the other side of the bridge — engineers meet clinicians, clinicians meet engineers.
                        </p>

                        {/* Mini bridge illustration */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '14px 18px', borderRadius: '14px',
                            background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)',
                            maxWidth: '400px'
                        }}>
                            <div style={{
                                width: '34px', height: '34px', borderRadius: '10px',
                                background: 'linear-gradient(135deg, rgba(96, 165, 250,0.2), rgba(96, 165, 250,0.08))',
                                border: '1px solid rgba(96, 165, 250,0.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--primary-light)', flexShrink: 0
                            }}>
                                <Cpu size={16} />
                            </div>
                            <div style={{ flex: 1, position: 'relative', height: '2px', background: 'rgba(255,255,255,0.08)', borderRadius: '1px' }}>
                                <motion.div
                                    animate={{ x: ['0%', '100%', '0%'] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                    style={{
                                        position: 'absolute', top: '-2px', width: '6px', height: '6px',
                                        borderRadius: '50%', background: 'var(--primary-light)',
                                        boxShadow: '0 0 12px var(--primary-light)'
                                    }}
                                />
                            </div>
                            <Network size={14} color="var(--text-subtle)" />
                            <div style={{ flex: 1, position: 'relative', height: '2px', background: 'rgba(255,255,255,0.08)', borderRadius: '1px' }}>
                                <motion.div
                                    animate={{ x: ['100%', '0%', '100%'] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                    style={{
                                        position: 'absolute', top: '-2px', width: '6px', height: '6px',
                                        borderRadius: '50%', background: 'var(--secondary)',
                                        boxShadow: '0 0 12px var(--secondary)'
                                    }}
                                />
                            </div>
                            <div style={{
                                width: '34px', height: '34px', borderRadius: '10px',
                                background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.08))',
                                border: '1px solid rgba(16,185,129,0.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--secondary)', flexShrink: 0
                            }}>
                                <Stethoscope size={16} />
                            </div>
                        </div>
                    </div>
                </TiltCard>

                {/* Medium — NDA / Trust (spans 2) */}
                <TiltCard
                    style={{
                        gridColumn: isMobile ? 'span 1' : 'span 2',
                        padding: isMobile ? '28px' : '32px', height: '100%', minHeight: isMobile ? 'auto' : '380px',
                        background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.1), rgba(15, 23, 42, 0.6))',
                        display: 'flex', flexDirection: 'column'
                    }}
                >
                    <div className="corner-accent corner-tl" />
                    <div className="corner-accent corner-br" />

                    <div style={{
                        width: '56px', height: '56px', borderRadius: '16px',
                        background: 'linear-gradient(135deg, #22d3ee, #67e8f9)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', marginBottom: '20px',
                        boxShadow: '0 12px 28px rgba(34, 211, 238, 0.35)'
                    }}>
                        <ShieldCheck size={26} />
                    </div>
                    <h3 style={{ fontSize: isMobile ? '19px' : '22px', marginBottom: '12px', letterSpacing: '-0.02em' }}>
                        Controlled IP Disclosure
                    </h3>
                    <p className="text-muted" style={{ fontSize: '14px', lineHeight: '1.7', marginBottom: '20px' }}>
                        NDA-gated meetings. No technical docs. No patient data. Ever.
                    </p>

                    {/* Decorative lock badges */}
                    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {['NDA acceptance required', 'Zero IP storage', 'Full audit trail'].map((t, i) => (
                            <div key={i} className="flex items-center gap-2" style={{
                                fontSize: '12px', color: 'var(--badge-accent-text)',
                                padding: '7px 12px', borderRadius: '10px',
                                background: 'rgba(34, 211, 238, 0.08)', border: '1px solid rgba(34, 211, 238, 0.18)'
                            }}>
                                <Lock size={11} /> {t}
                            </div>
                        ))}
                    </div>
                </TiltCard>

                {/* Medium — GDPR (spans 2) */}
                <TiltCard
                    style={{
                        gridColumn: isMobile ? 'span 1' : 'span 2',
                        padding: isMobile ? '28px' : '32px', height: '100%',
                        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(15, 23, 42, 0.6))'
                    }}
                >
                    <div className="corner-accent corner-tr" />
                    <div className="corner-accent corner-bl" />

                    <div style={{
                        width: '56px', height: '56px', borderRadius: '16px',
                        background: 'linear-gradient(135deg, #f59e0b, #fcd34d)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', marginBottom: '20px',
                        boxShadow: '0 12px 28px rgba(245, 158, 11, 0.35)'
                    }}>
                        <Shield size={26} />
                    </div>
                    <h3 style={{ fontSize: isMobile ? '19px' : '22px', marginBottom: '12px', letterSpacing: '-0.02em' }}>
                        GDPR Compliant
                    </h3>
                    <p className="text-muted" style={{ fontSize: '14px', lineHeight: '1.7' }}>
                        Minimal data collection. Right to delete. Right to export. Built around GDPR Articles 15, 17, and 20.
                    </p>
                </TiltCard>

                {/* Medium — Meeting (spans 2) */}
                <TiltCard
                    style={{
                        gridColumn: isMobile ? 'span 1' : 'span 2',
                        padding: isMobile ? '28px' : '32px', height: '100%',
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(15, 23, 42, 0.6))'
                    }}
                >
                    <div className="corner-accent corner-tl" />
                    <div className="corner-accent corner-br" />

                    <div style={{
                        width: '56px', height: '56px', borderRadius: '16px',
                        background: 'linear-gradient(135deg, #10b981, #34d399)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', marginBottom: '20px',
                        boxShadow: '0 12px 28px rgba(16, 185, 129, 0.35)'
                    }}>
                        <Handshake size={26} />
                    </div>
                    <h3 style={{ fontSize: isMobile ? '19px' : '22px', marginBottom: '12px', letterSpacing: '-0.02em' }}>
                        Meeting Workflow
                    </h3>
                    <p className="text-muted" style={{ fontSize: '14px', lineHeight: '1.7' }}>
                        Express interest, propose slots, schedule over Zoom or Teams. The platform facilitates — never stores.
                    </p>
                </TiltCard>

                {/* The "Pan-European Reach, Under 3 Minutes" bento card with the
                    "3m post time / 30s meet request / 12+ countries / 24h avg
                    response" stat cluster was removed. Those numbers were
                    fabricated marketing claims, inappropriate for a senior
                    project that hasn't actually run on those volumes. */}
            </motion.div>
        </section>
    );
};

export default BentoFeatures;
