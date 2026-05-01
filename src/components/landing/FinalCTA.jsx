import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Cpu, Stethoscope, Activity, Rocket, ArrowRight, CheckCircle2 } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import { useMagnetic } from '../../hooks/useInteractiveFX';

const FinalCTA = ({ isMobile }) => {
    const magnetic = useMagnetic({ strength: 0.3, max: 10 });

    return (
        <section id="final-cta" className="container px-cta-section" style={{
            maxWidth: '1000px',
            // Match the unified landing rhythm.
            marginTop: isMobile ? '40px' : '64px',
            marginBottom: isMobile ? '64px' : '88px',
            padding: isMobile ? '0 16px' : '0 24px',
            position: 'relative',
        }}>
            {/* Pulsing aura — sits behind the card and breathes. Held note. */}
            <div className="landing-final-cta-aura" aria-hidden="true" />
            <ScrollReveal direction="scale">
                <div style={{
                    position: 'relative',
                    padding: isMobile ? '60px 28px' : '100px 60px',
                    borderRadius: '32px',
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.12), rgba(34, 211, 238, 0.08), rgba(15, 23, 42, 0.7))',
                    border: '1px solid rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    boxShadow: '0 40px 80px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
                }}>
                    <div className="spotlight-bg" />

                    {/* Animated top shimmer line */}
                    <div className="shimmer-line" style={{ position: 'absolute', top: 0, left: 0, right: 0 }} />

                    {/* Decorative dot pattern */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
                        backgroundSize: '28px 28px',
                        mask: 'radial-gradient(ellipse 50% 50% at 50% 50%, black, transparent 80%)',
                        WebkitMask: 'radial-gradient(ellipse 50% 50% at 50% 50%, black, transparent 80%)',
                        pointerEvents: 'none'
                    }} />

                    {/* Floating badges — two focal points, not four */}
                    {!isMobile && (
                        <>
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                                className="floating-badge"
                                style={{ position: 'absolute', top: '16%', left: '7%', color: 'var(--primary-light)' }}
                            >
                                <Cpu size={12} /> Engineering
                            </motion.div>
                            <motion.div
                                animate={{ y: [0, 10, 0] }}
                                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
                                className="floating-badge"
                                style={{ position: 'absolute', bottom: '18%', right: '9%', color: 'var(--secondary)' }}
                            >
                                <Stethoscope size={12} /> Clinical
                            </motion.div>
                        </>
                    )}

                    <div style={{ textAlign: 'center', position: 'relative', zIndex: 3 }}>
                        <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
                            style={{
                                width: isMobile ? '64px' : '84px', height: isMobile ? '64px' : '84px',
                                borderRadius: '24px',
                                background: 'conic-gradient(from 0deg, var(--primary), var(--accent), var(--cyan), var(--secondary), var(--primary))',
                                padding: '2px',
                                margin: '0 auto 28px',
                                boxShadow: '0 20px 60px rgba(96, 165, 250, 0.5), 0 0 80px rgba(34, 211, 238, 0.3)'
                            }}
                        >
                            <div
                                style={{
                                    width: '100%', height: '100%', borderRadius: '22px',
                                    background: 'var(--background)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                <span className="spin-reverse-slow" style={{ display: 'inline-flex' }}>
                                    <Activity size={isMobile ? 28 : 36} color="var(--primary-light)" />
                                </span>
                            </div>
                        </motion.div>

                        <h2 style={{
                            fontSize: isMobile ? '32px' : '52px',
                            marginBottom: '18px', letterSpacing: '-0.04em',
                            lineHeight: '1.05', fontWeight: '800'
                        }}>
                            Ready to <span className="text-gradient-aurora">Innovate?</span>
                        </h2>
                        <p className="text-muted" style={{
                            fontSize: isMobile ? '15px' : '18px', lineHeight: '1.7',
                            maxWidth: '540px', margin: '0 auto 40px'
                        }}>
                            Create an institutional account and post your first cross-disciplinary collaboration request.
                        </p>

                        <div className="flex gap-3 justify-center" style={{ flexWrap: 'wrap' }}>
                            <Link
                                to="/login"
                                className="btn btn-accent"
                                onMouseMove={magnetic.onMouseMove}
                                onMouseLeave={magnetic.onMouseLeave}
                                style={{
                                    padding: isMobile ? '14px 30px' : '18px 48px',
                                    fontSize: isMobile ? '15px' : '17px', borderRadius: '16px',
                                    boxShadow: '0 12px 40px rgba(96, 165, 250, 0.45), 0 0 80px rgba(34, 211, 238, 0.2)',
                                    transition: 'transform 0.18s cubic-bezier(0.22, 1, 0.36, 1), filter 0.2s, box-shadow 0.25s',
                                }}
                            >
                                <Rocket size={20} /> Create Account <ArrowRight size={18} />
                            </Link>
                            <a
                                href="#how-it-works"
                                className="btn btn-secondary"
                                style={{
                                    padding: isMobile ? '14px 24px' : '18px 36px',
                                    fontSize: isMobile ? '15px' : '17px', borderRadius: '16px'
                                }}
                            >
                                Read the Flow
                            </a>
                        </div>

                        {/* Micro trust indicators */}
                        <div className="flex gap-3 justify-center items-center" style={{
                            marginTop: '32px', flexWrap: 'wrap', fontSize: '12px', color: 'var(--text-subtle)'
                        }}>
                            <span className="flex items-center gap-1"><CheckCircle2 size={12} color="var(--secondary)" /> No credit card</span>
                            <span style={{ opacity: 0.3 }}>•</span>
                            <span className="flex items-center gap-1"><CheckCircle2 size={12} color="var(--secondary)" /> .edu verified</span>
                            <span style={{ opacity: 0.3 }}>•</span>
                            <span className="flex items-center gap-1"><CheckCircle2 size={12} color="var(--secondary)" /> NDA gated</span>
                        </div>
                    </div>
                </div>
            </ScrollReveal>
        </section>
    );
};

export default FinalCTA;
