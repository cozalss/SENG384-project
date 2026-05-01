import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Cpu, Stethoscope, Rocket, ArrowRight, CheckCircle2 } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import { useTilt } from '../../hooks/useInteractiveFX';

const FinalCTA = ({ isMobile }) => {
    const tilt = useTilt({ max: 4, scale: 1.008 });
    return (
        <section className="container px-cta-section landing-cinema-section" style={{
            maxWidth: '1000px',
            // Match the unified landing rhythm.
            marginTop: isMobile ? '40px' : '64px',
            marginBottom: isMobile ? '64px' : '88px',
            padding: isMobile ? '0 16px' : '0 24px',
        }}>
            <ScrollReveal direction="scale">
                <div
                    {...tilt}
                    className="premium-card premium-card--strong premium-card--halo"
                    style={{
                    position: 'relative',
                    padding: isMobile ? '60px 28px' : '100px 60px',
                    borderRadius: '32px',
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, rgba(34, 211, 102, 0.12), rgba(16, 185, 129, 0.06), rgba(10, 18, 16, 0.72))',
                    border: '1px solid rgba(34, 211, 102, 0.10)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    boxShadow: '0 40px 80px rgba(0, 0, 0, 0.42), 0 0 90px -20px rgba(34, 211, 102, 0.18), inset 0 1px 0 rgba(255,255,255,0.05)',
                    '--pc-glow': 'rgba(34, 211, 102, 0.55)',
                    '--pc-glow-soft': 'rgba(34, 211, 102, 0.18)',
                }}>
                    <span className="premium-card-halo" aria-hidden="true" />
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
                                style={{ position: 'absolute', top: '16%', left: '7%', color: 'hsl(119 99% 60%)' }}
                            >
                                <Cpu size={12} /> Engineering
                            </motion.div>
                            <motion.div
                                animate={{ y: [0, 10, 0] }}
                                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
                                className="floating-badge"
                                style={{ position: 'absolute', bottom: '18%', right: '9%', color: 'hsl(180 75% 65%)' }}
                            >
                                <Stethoscope size={12} /> Clinical
                            </motion.div>
                        </>
                    )}

                    <div style={{ textAlign: 'center', position: 'relative', zIndex: 3 }}>
                        {/* Refined brand monogram — concentric green pulse rings.
                            Replaces the prior conic-gradient orb that read as
                            generic 2022-SaaS. Pure SVG, GPU-cheap, brand-locked. */}
                        <div style={{
                            width: isMobile ? 88 : 120,
                            height: isMobile ? 88 : 120,
                            margin: '0 auto 28px',
                            position: 'relative',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%', overflow: 'visible' }} aria-hidden="true">
                                <defs>
                                    <radialGradient id="cta-mono-glow" cx="50%" cy="50%" r="50%">
                                        <stop offset="0%" stopColor="hsl(119 99% 56%)" stopOpacity="0.55" />
                                        <stop offset="60%" stopColor="hsl(119 99% 56%)" stopOpacity="0.12" />
                                        <stop offset="100%" stopColor="hsl(119 99% 56%)" stopOpacity="0" />
                                    </radialGradient>
                                    <linearGradient id="cta-mono-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="hsl(119 99% 62%)" />
                                        <stop offset="100%" stopColor="hsl(155 80% 65%)" />
                                    </linearGradient>
                                </defs>
                                {/* outer glow disc */}
                                <circle cx="60" cy="60" r="58" fill="url(#cta-mono-glow)" />
                                {/* expanding pulse ring */}
                                <motion.circle
                                    cx="60" cy="60" r="32"
                                    fill="none"
                                    stroke="hsl(119 99% 56%)"
                                    strokeWidth="1"
                                    animate={{ scale: [1, 1.6], opacity: [0.55, 0] }}
                                    transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
                                    style={{ transformOrigin: '60px 60px' }}
                                />
                                <motion.circle
                                    cx="60" cy="60" r="32"
                                    fill="none"
                                    stroke="hsl(119 99% 56%)"
                                    strokeWidth="1"
                                    animate={{ scale: [1, 1.6], opacity: [0.55, 0] }}
                                    transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut', delay: 1.2 }}
                                    style={{ transformOrigin: '60px 60px' }}
                                />
                                {/* static rings */}
                                <circle cx="60" cy="60" r="42" fill="none" stroke="rgba(34, 211, 102, 0.15)" strokeWidth="1" strokeDasharray="2 4" />
                                <circle cx="60" cy="60" r="32" fill="none" stroke="rgba(34, 211, 102, 0.32)" strokeWidth="1" />
                                {/* inner monogram disc */}
                                <circle cx="60" cy="60" r="22" fill="hsl(0 0% 8%)" stroke="url(#cta-mono-stroke)" strokeWidth="1.5" />
                                {/* ECG glyph centered inside */}
                                <path
                                    d="M 44 60 L 53 60 L 56 52 L 60 70 L 64 56 L 67 60 L 76 60"
                                    fill="none"
                                    stroke="hsl(119 99% 56%)"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{ filter: 'drop-shadow(0 0 6px hsl(119 99% 56%))' }}
                                />
                            </svg>
                        </div>

                        <h2 style={{
                            fontSize: isMobile ? '34px' : '54px',
                            marginBottom: '18px', letterSpacing: 0,
                            lineHeight: '1.05', fontWeight: 700,
                            color: 'hsl(0 0% 96%)',
                        }}>
                            Ready to show the <span className="text-gradient-aurora">full demo flow.</span>
                        </h2>
                        <p style={{
                            fontSize: isMobile ? '15px' : '18px', lineHeight: '1.7',
                            maxWidth: '540px', margin: '0 auto 40px',
                            color: 'hsl(0 0% 78%)', fontWeight: 300,
                        }}>
                            Start from registration, then demonstrate the dashboard, post creation, NDA-protected details, meeting requests, real-time chat, profile controls, and admin oversight.
                        </p>

                        <div className="flex gap-3 justify-center items-center" style={{ flexWrap: 'wrap' }}>
                            <Link
                                to="/login"
                                style={{
                                    pointerEvents: 'auto',
                                    background: 'hsl(119 99% 46%)',
                                    color: 'hsl(0 0% 4%)',
                                    padding: isMobile ? '16px 30px' : '20px 48px',
                                    fontSize: isMobile ? '16px' : '18px',
                                    fontWeight: 700,
                                    borderRadius: '14px',
                                    cursor: 'pointer',
                                    textDecoration: 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.55rem',
                                    boxShadow: '0 14px 40px rgba(34, 211, 102, 0.32), inset 0 1px 0 rgba(255, 255, 255, 0.22)',
                                    transition: 'filter 0.2s, transform 0.18s',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.06)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                                <Rocket size={18} /> Open Login / Register <ArrowRight size={16} />
                            </Link>
                            <a
                                href="#product"
                                style={{
                                    background: 'transparent',
                                    color: 'hsl(0 0% 86%)',
                                    padding: isMobile ? '12px 18px' : '14px 22px',
                                    fontSize: isMobile ? '14px' : '15px',
                                    fontWeight: 500,
                                    borderRadius: '10px',
                                    textDecoration: 'underline',
                                    textDecorationColor: 'rgba(255,255,255,0.18)',
                                    textUnderlineOffset: '4px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    transition: 'color 0.2s, text-decoration-color 0.2s',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = 'hsl(119 99% 70%)'; e.currentTarget.style.textDecorationColor = 'hsl(119 99% 56%)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = 'hsl(0 0% 86%)'; e.currentTarget.style.textDecorationColor = 'rgba(255,255,255,0.18)'; }}
                            >
                                review the product flow
                            </a>
                        </div>

                        {/* Micro trust indicators — kept tight, kept truthful. */}
                        <div className="flex gap-3 justify-center items-center" style={{
                            marginTop: '32px', flexWrap: 'wrap', fontSize: '12px', color: 'hsl(0 0% 65%)'
                        }}>
                            <span className="flex items-center gap-1"><CheckCircle2 size={12} color="hsl(119 99% 56%)" /> .edu + OTP registration</span>
                            <span style={{ opacity: 0.3 }}>•</span>
                            <span className="flex items-center gap-1"><CheckCircle2 size={12} color="hsl(119 99% 56%)" /> Post, NDA, meeting workflow</span>
                            <span style={{ opacity: 0.3 }}>•</span>
                            <span className="flex items-center gap-1"><CheckCircle2 size={12} color="hsl(119 99% 56%)" /> Chat, profile, admin modules</span>
                        </div>
                    </div>
                </div>
            </ScrollReveal>
        </section>
    );
};

export default FinalCTA;
