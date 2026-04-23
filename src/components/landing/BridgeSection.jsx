import { motion } from 'framer-motion';
import { Network, Cpu, Zap, FileText, Stethoscope, Lock, CheckCircle2, Handshake, Heart, BookOpen, Rocket, ShieldCheck } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const BridgeSection = ({ isMobile }) => {
    return (
        <section className="container" style={{ maxWidth: '1100px', marginBottom: isMobile ? '100px' : '140px' }}>
            <ScrollReveal>
                <div className="text-center" style={{ marginBottom: '56px', padding: '0 12px' }}>
                    <span className="eyebrow eyebrow-purple">
                        <Network size={12} /> Two Sides, One Bridge
                    </span>
                    <h2 style={{ fontSize: isMobile ? '30px' : '46px', marginBottom: '16px', letterSpacing: '-0.04em', lineHeight: '1.1' }}>
                        Whichever Side <span className="text-gradient-primary">You're On</span>
                    </h2>
                    <p className="text-muted" style={{ fontSize: isMobile ? '14px' : '17px', maxWidth: '580px', margin: '0 auto', lineHeight: '1.7' }}>
                        Built for both halves of the innovation equation — with the right tools, permissions, and safeguards for each.
                    </p>
                </div>
            </ScrollReveal>

            <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr auto 1fr',
                gap: isMobile ? '20px' : '32px',
                alignItems: 'stretch',
                position: 'relative'
            }}>
                {/* Engineer Card */}
                <ScrollReveal direction="left">
                    <motion.div
                        whileHover={{ y: -6 }}
                        className="bento-card"
                        onMouseMove={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                            e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
                        }}
                        style={{
                            padding: isMobile ? '32px 24px' : '44px',
                            position: 'relative', overflow: 'hidden', height: '100%',
                            background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.12), rgba(15, 23, 42, 0.6))'
                        }}
                    >
                        <div className="corner-accent corner-tl" />
                        <div className="corner-accent corner-br" />

                        {/* Top accent line */}
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                            background: 'linear-gradient(90deg, var(--primary), var(--accent))',
                            borderRadius: '24px 24px 0 0'
                        }} />

                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            padding: '6px 14px', borderRadius: '999px', marginBottom: '24px',
                            background: 'rgba(96, 165, 250, 0.12)', border: '1px solid rgba(96, 165, 250, 0.25)',
                            fontSize: '11px', fontWeight: '700', color: 'var(--badge-primary-text)',
                            textTransform: 'uppercase', letterSpacing: '0.12em'
                        }}>
                            <Cpu size={11} /> Engineer Persona
                        </div>

                        <div style={{
                            width: '64px', height: '64px', borderRadius: '18px',
                            background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '24px',
                            boxShadow: '0 14px 32px rgba(96, 165, 250, 0.4), inset 0 2px 0 rgba(255,255,255,0.2)'
                        }}>
                            <Zap size={30} color="white" />
                        </div>

                        <h3 style={{ fontSize: isMobile ? '24px' : '28px', marginBottom: '14px', letterSpacing: '-0.02em' }}>
                            I'm an <span className="text-gradient-primary">Engineer</span>
                        </h3>
                        <p className="text-muted" style={{ fontSize: '15px', lineHeight: '1.7', marginBottom: '28px' }}>
                            You have the technology but need clinical validation, workflow understanding, or ethical approval guidance.
                        </p>

                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { t: 'Post your project & tech stack', i: <FileText size={14} /> },
                                { t: 'Find clinical domain experts', i: <Stethoscope size={14} /> },
                                { t: 'Schedule NDA-protected meetings', i: <Lock size={14} /> },
                                { t: 'Close when partner found', i: <CheckCircle2 size={14} /> }
                            ].map((item, i) => (
                                <li key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                    padding: '10px 14px', borderRadius: '11px',
                                    background: 'rgba(96, 165, 250, 0.06)', border: '1px solid rgba(96, 165, 250, 0.12)',
                                    fontSize: '14px', color: 'var(--text-main)', fontWeight: '500'
                                }}>
                                    <span style={{ color: 'var(--primary-light)', display: 'flex' }}>{item.i}</span>
                                    {item.t}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </ScrollReveal>

                {/* Central Bridge Connector (desktop) */}
                {!isMobile && (
                    <ScrollReveal direction="scale" delay={0.2}>
                        <div style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            justifyContent: 'center', gap: '12px', height: '100%', position: 'relative',
                            padding: '0 8px', minWidth: '60px'
                        }}>
                            {/* Connecting line top */}
                            <div style={{
                                position: 'absolute', top: 0, left: '50%', width: '2px', height: '38%',
                                background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.15))',
                                transform: 'translateX(-50%)'
                            }} />
                            {/* Connecting line bottom */}
                            <div style={{
                                position: 'absolute', bottom: 0, left: '50%', width: '2px', height: '38%',
                                background: 'linear-gradient(180deg, rgba(255,255,255,0.15), transparent)',
                                transform: 'translateX(-50%)'
                            }} />

                            <motion.div
                                animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                style={{
                                    width: '64px', height: '64px', borderRadius: '20px',
                                    background: 'linear-gradient(135deg, var(--primary), var(--accent), var(--secondary))',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white',
                                    boxShadow: '0 18px 48px rgba(96, 165, 250, 0.5), 0 0 60px rgba(34, 211, 238, 0.3), inset 0 2px 0 rgba(255,255,255,0.25)',
                                    position: 'relative', zIndex: 2,
                                    border: '3px solid var(--background)'
                                }}
                            >
                                <Handshake size={28} />
                            </motion.div>

                            <div style={{
                                fontSize: '10px', fontWeight: '800', color: 'var(--text-subtle)',
                                textTransform: 'uppercase', letterSpacing: '0.15em',
                                background: 'var(--background)', padding: '0 8px', position: 'relative', zIndex: 2
                            }}>
                                Meet
                            </div>
                        </div>
                    </ScrollReveal>
                )}

                {/* Doctor Card */}
                <ScrollReveal direction="right" delay={0.15}>
                    <motion.div
                        whileHover={{ y: -6 }}
                        className="bento-card"
                        onMouseMove={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                            e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
                        }}
                        style={{
                            padding: isMobile ? '32px 24px' : '44px',
                            position: 'relative', overflow: 'hidden', height: '100%',
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(15, 23, 42, 0.6))'
                        }}
                    >
                        <div className="corner-accent corner-tr" />
                        <div className="corner-accent corner-bl" />

                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                            background: 'linear-gradient(90deg, var(--secondary), #34d399)',
                            borderRadius: '24px 24px 0 0'
                        }} />

                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            padding: '6px 14px', borderRadius: '999px', marginBottom: '24px',
                            background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)',
                            fontSize: '11px', fontWeight: '700', color: 'var(--badge-success-text)',
                            textTransform: 'uppercase', letterSpacing: '0.12em'
                        }}>
                            <Stethoscope size={11} /> Clinician Persona
                        </div>

                        <div style={{
                            width: '64px', height: '64px', borderRadius: '18px',
                            background: 'linear-gradient(135deg, var(--secondary), #34d399)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '24px',
                            boxShadow: '0 14px 32px rgba(16, 185, 129, 0.4), inset 0 2px 0 rgba(255,255,255,0.2)'
                        }}>
                            <Heart size={30} color="white" />
                        </div>

                        <h3 style={{ fontSize: isMobile ? '24px' : '28px', marginBottom: '14px', letterSpacing: '-0.02em' }}>
                            I'm a <span style={{
                                background: 'linear-gradient(135deg, #34d399, #6ee7b7)',
                                WebkitBackgroundClip: 'text', backgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>Clinician</span>
                        </h3>
                        <p className="text-muted" style={{ fontSize: '15px', lineHeight: '1.7', marginBottom: '28px' }}>
                            You have innovative clinical ideas but need engineering competence to build prototypes or validate technology.
                        </p>

                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { t: 'Describe your clinical need', i: <BookOpen size={14} /> },
                                { t: 'Find engineering partners', i: <Cpu size={14} /> },
                                { t: 'Safe first-contact workflow', i: <ShieldCheck size={14} /> },
                                { t: 'Close when collaboration starts', i: <Rocket size={14} /> }
                            ].map((item, i) => (
                                <li key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                    padding: '10px 14px', borderRadius: '11px',
                                    background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.12)',
                                    fontSize: '14px', color: 'var(--text-main)', fontWeight: '500'
                                }}>
                                    <span style={{ color: 'var(--secondary)', display: 'flex' }}>{item.i}</span>
                                    {item.t}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </ScrollReveal>
            </div>
        </section>
    );
};

export default BridgeSection;
