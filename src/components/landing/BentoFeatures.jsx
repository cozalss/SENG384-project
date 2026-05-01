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
            className="bento-card premium-card premium-card--halo"
            onMouseMove={tilt.onMouseMove}
            onMouseEnter={tilt.onMouseEnter}
            onMouseLeave={tilt.onMouseLeave}
            style={style}
            {...rest}
        >
            <span className="premium-card-halo" aria-hidden="true" />
            {children}
        </motion.div>
    );
};

const BentoFeatures = ({ isMobile }) => {
    return (
        <section className="container px-capabilities-section landing-cinema-section" style={{
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
                    <h2 style={{ fontSize: isMobile ? '32px' : '52px', marginBottom: '20px', letterSpacing: 0, lineHeight: '1.05' }}>
                        Built around the <span className="text-gradient-aurora">implemented workflow</span>
                    </h2>
                    <p className="text-muted" style={{ fontSize: isMobile ? '15px' : '18px', maxWidth: '620px', margin: '0 auto', lineHeight: '1.7' }}>
                        These are the main modules visible in the demo: post creation, protected details, meeting coordination, chat, profile data controls, and admin oversight.
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
                        background: 'linear-gradient(135deg, rgba(34, 211, 102, 0.13), rgba(16, 185, 129, 0.05), rgba(15, 23, 22, 0.62))',
                        position: 'relative', overflow: 'hidden',
                        '--pc-glow': 'rgba(34, 211, 102, 0.55)',
                        '--pc-glow-soft': 'rgba(34, 211, 102, 0.18)',
                    }}
                >
                    <div className="corner-accent corner-tl" />
                    <div className="corner-accent corner-tr" />
                    <div className="corner-accent corner-bl" />
                    <div className="corner-accent corner-br" />

                    {/* Decorative dot grid */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: 'radial-gradient(rgba(34, 211, 102, 0.14) 1px, transparent 1px)',
                        backgroundSize: '28px 28px',
                        mask: 'radial-gradient(ellipse 70% 60% at 80% 20%, black, transparent)',
                        WebkitMask: 'radial-gradient(ellipse 70% 60% at 80% 20%, black, transparent)',
                        opacity: 0.55, pointerEvents: 'none'
                    }} />

                    <div style={{ position: 'relative', zIndex: 2, maxWidth: '540px' }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            padding: '6px 14px', borderRadius: '999px',
                            background: 'rgba(34, 211, 102, 0.10)', border: '1px solid rgba(34, 211, 102, 0.28)',
                            fontSize: '11px', fontWeight: '700', color: 'hsl(119 80% 70%)',
                            textTransform: 'uppercase', letterSpacing: 0, marginBottom: '24px'
                        }}>
                            <Sparkles size={11} /> Flagship Feature
                        </div>
                        <div style={{
                            width: '64px', height: '64px', borderRadius: '18px',
                            background: 'linear-gradient(135deg, hsl(119 99% 56%), hsl(155 80% 65%))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'hsl(0 0% 6%)', marginBottom: '24px',
                            boxShadow: '0 12px 32px rgba(34, 211, 102, 0.4), inset 0 1px 0 rgba(255,255,255,0.32)'
                        }}>
                            <Users size={30} />
                        </div>
                        <h3 style={{ fontSize: isMobile ? '24px' : '30px', marginBottom: '14px', letterSpacing: 0 }}>
                            Structured announcement wizard
                        </h3>
                        <p className="text-muted" style={{ fontSize: isMobile ? '14px' : '16px', lineHeight: '1.75', marginBottom: '28px' }}>
                            Users create announcements with title, domain, project stage, description, required expertise, location, collaboration type, expiry, and confidentiality settings.
                        </p>

                        {/* Mini bridge illustration */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '14px 18px', borderRadius: '14px',
                            background: 'rgba(0,0,0,0.28)', border: '1px solid rgba(255,255,255,0.06)',
                            maxWidth: '400px'
                        }}>
                            <div style={{
                                width: '34px', height: '34px', borderRadius: '10px',
                                background: 'linear-gradient(135deg, rgba(34, 211, 102, 0.22), rgba(34, 211, 102, 0.08))',
                                border: '1px solid rgba(34, 211, 102, 0.32)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'hsl(119 99% 60%)', flexShrink: 0
                            }}>
                                <Cpu size={16} />
                            </div>
                            <div style={{ flex: 1, position: 'relative', height: '2px', background: 'rgba(255,255,255,0.08)', borderRadius: '1px' }}>
                                <motion.div
                                    animate={{ x: ['0%', '100%', '0%'] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                    style={{
                                        position: 'absolute', top: '-2px', width: '6px', height: '6px',
                                        borderRadius: '50%', background: 'hsl(119 99% 60%)',
                                        boxShadow: '0 0 12px hsl(119 99% 60%)'
                                    }}
                                />
                            </div>
                            <Network size={14} color="rgba(255,255,255,0.4)" />
                            <div style={{ flex: 1, position: 'relative', height: '2px', background: 'rgba(255,255,255,0.08)', borderRadius: '1px' }}>
                                <motion.div
                                    animate={{ x: ['100%', '0%', '100%'] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                    style={{
                                        position: 'absolute', top: '-2px', width: '6px', height: '6px',
                                        borderRadius: '50%', background: 'hsl(180 75% 65%)',
                                        boxShadow: '0 0 12px hsl(180 75% 65%)'
                                    }}
                                />
                            </div>
                            <div style={{
                                width: '34px', height: '34px', borderRadius: '10px',
                                background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.22), rgba(34, 211, 238, 0.08))',
                                border: '1px solid rgba(34, 211, 238, 0.32)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'hsl(180 75% 65%)', flexShrink: 0
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
                    <h3 style={{ fontSize: isMobile ? '19px' : '22px', marginBottom: '12px', letterSpacing: 0 }}>
                        NDA-protected technical details
                    </h3>
                    <p className="text-muted" style={{ fontSize: '14px', lineHeight: '1.7', marginBottom: '20px' }}>
                        If a post is marked NDA Protected, the technical blueprint stays hidden until the viewer expresses interest and accepts the non-disclosure terms.
                    </p>

                    {/* Decorative lock badges */}
                    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {['Interest record stored', 'Blueprint gate enforced', 'Author notified'].map((t, i) => (
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
                        background: 'linear-gradient(135deg, rgba(34, 211, 102, 0.08), rgba(34, 211, 238, 0.07), rgba(15, 23, 42, 0.58))',
                        borderColor: 'rgba(34, 211, 238, 0.14)',
                        '--pc-glow': 'rgba(34, 211, 238, 0.5)',
                        '--pc-glow-soft': 'rgba(34, 211, 102, 0.16)',
                    }}
                >
                    <div className="corner-accent corner-tr" />
                    <div className="corner-accent corner-bl" />

                    <div style={{
                        width: '56px', height: '56px', borderRadius: '16px',
                        background: 'linear-gradient(135deg, hsl(119 99% 56%), hsl(180 75% 62%))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'hsl(0 0% 6%)', marginBottom: '20px',
                        boxShadow: '0 12px 28px rgba(34, 211, 238, 0.26), 0 0 28px rgba(34, 211, 102, 0.12)'
                    }}>
                        <Shield size={26} />
                    </div>
                    <h3 style={{ fontSize: isMobile ? '19px' : '22px', marginBottom: '12px', letterSpacing: 0 }}>
                        Profile export and deletion controls
                    </h3>
                    <p className="text-muted" style={{ fontSize: '14px', lineHeight: '1.7' }}>
                        The Profile page includes a JSON data export and account deletion action, so the demo can show user-facing data rights controls.
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
                    <h3 style={{ fontSize: isMobile ? '19px' : '22px', marginBottom: '12px', letterSpacing: 0 }}>
                        Meeting requests and chat
                    </h3>
                    <p className="text-muted" style={{ fontSize: '14px', lineHeight: '1.7' }}>
                        After interest is accepted, users propose external Zoom or Teams meeting slots, receive notifications, and continue the collaboration in real-time chat.
                    </p>
                </TiltCard>

                {/* A previous metrics card was removed because the project has
                    not collected production usage statistics yet. */}
            </motion.div>
        </section>
    );
};

export default BentoFeatures;
