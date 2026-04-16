import { Link } from 'react-router-dom';
import {
    Activity, Shield, Users, Handshake, ArrowRight, Lock, Globe, Zap, Heart, Brain,
    CheckCircle2, Sparkles, MousePointer2, Stethoscope, Cpu, Rocket, ShieldCheck,
    FlaskConical, GraduationCap, Clock, Mail, Linkedin, Github, FileText,
    MessageSquare, Dna, Scan, BookOpen, Building2, X, Check, Network
} from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, useScroll, useTransform, useSpring, useInView, useMotionValue } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import AnimatedCounter from '../components/AnimatedCounter';

/* ---- Reusable Scroll-Reveal wrapper ---- */
const ScrollReveal = ({ children, direction = 'up', delay = 0, className = '', style = {} }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });

    const variants = {
        up: { hidden: { opacity: 0, y: 60 }, visible: { opacity: 1, y: 0 } },
        down: { hidden: { opacity: 0, y: -40 }, visible: { opacity: 1, y: 0 } },
        left: { hidden: { opacity: 0, x: -60 }, visible: { opacity: 1, x: 0 } },
        right: { hidden: { opacity: 0, x: 60 }, visible: { opacity: 1, x: 0 } },
        scale: { hidden: { opacity: 0, scale: 0.85 }, visible: { opacity: 1, scale: 1 } },
    };

    return (
        <motion.div
            ref={ref}
            className={className}
            style={style}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={variants[direction]}
            transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
        >
            {children}
        </motion.div>
    );
};

const LandingPage = () => {
    const heroRef = useRef(null);
    const [isMobile, setIsMobile] = useState(false);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
    const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });

    const handleMouseMove = (e) => {
        if (!heroRef.current) return;
        const rect = heroRef.current.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    }, []);



    const workflow = [
        { step: '01', title: 'Register', desc: 'Sign up with your institutional .edu email and select your role — engineer or healthcare professional.', icon: <GraduationCap size={22} />, accent: 'var(--primary)' },
        { step: '02', title: 'Post or Browse', desc: 'Create a structured announcement describing your project, or browse opportunities from the other side.', icon: <FileText size={22} />, accent: 'var(--accent)' },
        { step: '03', title: 'Express Interest', desc: 'Accept NDA terms and send a short, focused message to the post author — no IP disclosure required.', icon: <MessageSquare size={22} />, accent: 'var(--cyan)' },
        { step: '04', title: 'Schedule Meeting', desc: 'Propose time slots, agree on a date, and meet externally over Zoom or Teams.', icon: <Clock size={22} />, accent: '#ec4899' },
        { step: '05', title: 'Collaborate', desc: 'If the match works, mark "Partner Found" and close the announcement — then build the future together.', icon: <Rocket size={22} />, accent: 'var(--secondary)' }
    ];

    const domains = [
        { name: 'Cardiology', icon: <Heart size={16} />, color: '#f43f5e' },
        { name: 'Medical Imaging', icon: <Scan size={16} />, color: '#06b6d4' },
        { name: 'AI Diagnostics', icon: <Brain size={16} />, color: '#22d3ee' },
        { name: 'Biotechnology', icon: <Dna size={16} />, color: '#10b981' },
        { name: 'Clinical Research', icon: <FlaskConical size={16} />, color: '#f59e0b' },
        { name: 'Medical Devices', icon: <Cpu size={16} />, color: '#5ed29c' },
        { name: 'Digital Health', icon: <Activity size={16} />, color: '#8be8bc' },
        { name: 'Telemedicine', icon: <MessageSquare size={16} />, color: '#14b8a6' },
        { name: 'Genomics', icon: <Dna size={16} />, color: '#ec4899' },
        { name: 'HealthTech R&D', icon: <FlaskConical size={16} />, color: '#67e8f9' }
    ];

    const compareItems = [
        { old: 'LinkedIn cold outreach with no context', icon: <Users size={16} />, now: 'Structured posts with domain, stage, and expertise needed' },
        { old: 'Email chains leaking early-stage IP', icon: <Shield size={16} />, now: 'NDA-gated first contact — no technical docs stored' },
        { old: 'Conference networking once a year', icon: <Globe size={16} />, now: 'Continuous discovery across 12+ European countries' },
        { old: 'Weeks of back-and-forth scheduling', icon: <Clock size={16} />, now: 'Propose 3 slots — confirmed in under 24 hours' }
    ];

    // Timeline scroll progress
    const timelineRef = useRef(null);
    const { scrollYProgress: timelineProgress } = useScroll({
        target: timelineRef,
        offset: ['start 75%', 'end 40%']
    });
    const timelineHeight = useTransform(timelineProgress, [0, 1], ['0%', '100%']);

    return (
        <div style={{ paddingBottom: '80px' }}>

            {/* ====== FLOATING NAVBAR ====== */}
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 100, padding: isMobile ? '10px 12px' : '16px 24px' }}>
                <header style={{
                    maxWidth: '1280px', margin: '0 auto', borderRadius: 'var(--border-radius-xl)',
                    background: 'var(--panel-base)', backdropFilter: 'blur(24px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                    boxShadow: 'var(--glass-shadow), inset 0 1px 0 0 rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border)'
                }}>
                    <div className="flex justify-between items-center" style={{ height: isMobile ? '56px' : '64px', padding: isMobile ? '0 16px' : '0 28px' }}>
                        <div className="flex items-center gap-3" style={{ color: 'var(--text-main)' }}>
                            <div style={{
                                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                                padding: isMobile ? '6px' : '8px', borderRadius: '12px',
                                boxShadow: '0 4px 14px rgba(94, 210, 156,0.3), inset 0 2px 0 rgba(255,255,255,0.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Activity size={isMobile ? 18 : 22} color="white" />
                            </div>
                            <span style={{ fontSize: isMobile ? '16px' : '20px', fontWeight: '800', letterSpacing: '-0.04em', fontFamily: 'var(--font-heading)' }}>
                                HEALTH<span style={{ color: 'var(--primary-light)' }}>AI</span>
                            </span>
                        </div>
                        <Link to="/login" className="btn btn-primary" style={{ padding: isMobile ? '8px 16px' : '10px 24px', fontSize: '13px', borderRadius: '12px' }}>
                            Access Platform <ArrowRight size={14} />
                        </Link>
                    </div>
                </header>
            </div>

            {/* ====== HERO SECTION ====== */}
            <motion.section
                ref={heroRef}
                onMouseMove={!isMobile ? handleMouseMove : undefined}
                style={{
                    paddingTop: isMobile ? '110px' : '140px', paddingBottom: '40px',
                    textAlign: 'center', position: 'relative', 
                    minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center'
                }}
            >

                {/* Dot grid backdrop */}
                <div style={{
                    position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
                    backgroundImage: 'radial-gradient(rgba(94, 210, 156, 0.12) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    mask: 'radial-gradient(ellipse 60% 50% at 50% 50%, black, transparent)',
                    WebkitMask: 'radial-gradient(ellipse 60% 50% at 50% 50%, black, transparent)',
                    opacity: 0.4
                }} />

                {/* Mouse follow glow */}
                {!isMobile && (
                    <motion.div
                        style={{
                            position: 'absolute', pointerEvents: 'none', zIndex: 1,
                            width: '500px', height: '500px', borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(94, 210, 156, 0.15) 0%, rgba(103, 232, 249, 0.05) 40%, transparent 70%)',
                            filter: 'blur(40px)', mixBlendMode: 'screen',
                            x: smoothMouseX, y: smoothMouseY,
                            translateX: '-50%', translateY: '-50%',
                            top: 0, left: 0
                        }}
                    />
                )}

                <div className="container" style={{ maxWidth: '900px', position: 'relative', zIndex: 2 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        style={{ marginBottom: '28px' }}
                    >
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            padding: '8px 20px', borderRadius: '999px', fontSize: '12px', fontWeight: '600',
                            background: 'var(--panel-base)', border: '1px solid var(--border)',
                            color: 'var(--primary-light)', backdropFilter: 'blur(8px)'
                        }}>
                            <Sparkles size={14} style={{ color: 'var(--primary-light)' }} />
                            European HealthTech Innovation Platform
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                            fontSize: isMobile ? 'clamp(32px, 8vw, 48px)' : 'clamp(48px, 6.5vw, 80px)',
                            lineHeight: '1.05', marginBottom: '32px', letterSpacing: '-0.04em', fontWeight: '800'
                        }}
                    >
                        Where{' '}
                        <span className="hero-gradient-text">Healthcare</span>
                        <br />
                        Meets{' '}
                        <span className="hero-gradient-text">Engineering</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        style={{
                            fontSize: isMobile ? '15px' : '19px', lineHeight: '1.75',
                            maxWidth: '620px', margin: '0 auto 52px', color: 'var(--text-muted)',
                            padding: isMobile ? '0 8px' : '0'
                        }}
                    >
                        A secure, GDPR-compliant platform for structured partner discovery between healthcare professionals and engineers. No IP stored. No coincidence needed.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.45 }}
                        className="flex gap-4 justify-center"
                        style={{ flexWrap: 'wrap', padding: isMobile ? '0 12px' : '0' }}
                    >
                        <Link to="/login" className="btn btn-accent" style={{
                            padding: isMobile ? '14px 28px' : '16px 40px',
                            fontSize: isMobile ? '14px' : '16px', borderRadius: '14px',
                            boxShadow: '0 8px 30px rgba(94, 210, 156, 0.3), 0 0 60px rgba(34, 211, 238, 0.1)'
                        }}>
                            <Brain size={20} /> Join the Network <ArrowRight size={18} />
                        </Link>
                        <a href="#how-it-works" className="btn btn-secondary" style={{
                            padding: isMobile ? '14px 24px' : '16px 36px',
                            fontSize: isMobile ? '14px' : '16px', borderRadius: '14px'
                        }}>
                            <MousePointer2 size={18} /> How It Works
                        </a>
                    </motion.div>

                    {/* Trust indicators */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: { staggerChildren: 0.15, delayChildren: 0.6 }
                            }
                        }}
                        className="flex gap-4 justify-center items-center"
                        style={{ marginTop: '48px', flexWrap: 'wrap', padding: isMobile ? '0 8px' : '0' }}
                    >
                        {[
                            { icon: <Shield size={16} />, text: 'GDPR Compliant' },
                            { icon: <Lock size={16} />, text: 'NDA Protected' },
                            { icon: <Globe size={16} />, text: '.edu Only' }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                variants={{
                                    hidden: { opacity: 0, y: 15 },
                                    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
                                }}
                                whileHover={{ scale: 1.05, y: -2, transition: { duration: 0.2 } }}
                                className="flex items-center gap-2"
                                style={{
                                    fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500',
                                    padding: '8px 16px', borderRadius: '999px',
                                    background: 'var(--panel-light)', border: '1px solid var(--border)'
                                }}
                            >
                                <div style={{ color: 'var(--badge-success-text)' }}>{item.icon}</div>
                                {item.text}
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* ★ Animated Stats — RESPONSIVE 2x2 on mobile, 4x1 on desktop ★ */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        style={{
                            marginTop: '80px',
                            display: 'grid',
                            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                            gap: isMobile ? '12px' : '24px',
                            maxWidth: '700px', margin: '80px auto 0',
                            padding: isMobile ? '0 8px' : '0'
                        }}
                    >
                        {[
                            { value: 150, suffix: '+', label: 'Active Innovators', color: 'var(--primary-light)' },
                            { value: 85, suffix: '+', label: 'Projects Posted', color: 'var(--accent-light)' },
                            { value: 12, suffix: '', label: 'Countries', color: 'var(--cyan)' },
                            { value: 34, suffix: '', label: 'Partnerships', color: 'var(--badge-success-text)' }
                        ].map((s, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.9 + i * 0.12 }}
                                whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(0,0,0,0.3)', transition: { duration: 0.2 } }}
                                style={{
                                    textAlign: 'center', padding: isMobile ? '16px 8px' : '20px 12px',
                                    borderRadius: '16px',
                                    background: 'var(--panel-light)', border: '1px solid var(--border)',
                                    cursor: 'default'
                                }}
                            >
                                <div style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '800', letterSpacing: '-0.03em', color: s.color, fontFamily: 'var(--font-heading)' }}>
                                    <AnimatedCounter value={s.value} suffix={s.suffix} />
                                </div>
                                <div style={{ fontSize: isMobile ? '10px' : '12px', color: 'var(--text-muted)', fontWeight: '500', marginTop: '6px', letterSpacing: '0.03em', textTransform: 'uppercase' }}>{s.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                {/* Scroll indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)' }}
                >
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        style={{
                            width: '24px', height: '40px', borderRadius: '12px',
                            border: '2px solid rgba(255,255,255,0.15)', display: 'flex', justifyContent: 'center', paddingTop: '8px'
                        }}
                    >
                        <div style={{ width: '3px', height: '8px', borderRadius: '2px', background: 'rgba(255,255,255,0.3)' }} />
                    </motion.div>
                </motion.div>
            </motion.section>

            {/* ====== DOMAINS OF EXPERTISE — MARQUEE ====== */}
            <section style={{
                position: 'relative', padding: isMobile ? '40px 0' : '56px 0',
                marginBottom: isMobile ? '80px' : '120px',
                borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
                background: 'linear-gradient(180deg, transparent, rgba(15, 23, 42, 0.3), transparent)'
            }}>
                <ScrollReveal>
                    <div className="text-center" style={{ marginBottom: '28px', padding: '0 20px' }}>
                        <p style={{
                            fontSize: '11px', color: 'var(--text-subtle)',
                            textTransform: 'uppercase', letterSpacing: '0.22em', fontWeight: '700',
                            display: 'inline-flex', alignItems: 'center', gap: '10px'
                        }}>
                            <span style={{ width: '24px', height: '1px', background: 'var(--text-subtle)' }} />
                            Cross-Disciplinary Domains
                            <span style={{ width: '24px', height: '1px', background: 'var(--text-subtle)' }} />
                        </p>
                    </div>
                </ScrollReveal>

                <div className="marquee-container">
                    <div className="marquee-track">
                        {[...domains, ...domains].map((d, i) => (
                            <div key={i} style={{
                                display: 'inline-flex', alignItems: 'center', gap: '12px',
                                fontSize: isMobile ? '14px' : '16px', fontWeight: '600',
                                color: 'var(--text-muted)', letterSpacing: '-0.01em', flexShrink: 0
                            }}>
                                <div style={{
                                    width: isMobile ? '32px' : '38px', height: isMobile ? '32px' : '38px',
                                    borderRadius: '11px',
                                    background: `linear-gradient(135deg, ${d.color}18, ${d.color}08)`,
                                    border: `1px solid ${d.color}22`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: d.color, boxShadow: `0 4px 14px ${d.color}12`
                                }}>
                                    {d.icon}
                                </div>
                                {d.name}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ====== FEATURES — BENTO GRID ====== */}
            <section className="container" style={{ maxWidth: '1200px', marginBottom: isMobile ? '100px' : '140px' }}>
                <ScrollReveal>
                    <div className="text-center" style={{ marginBottom: '56px', padding: '0 12px' }}>
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

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(6, 1fr)',
                    gap: '20px'
                }}>
                    {/* BIG FEATURE 1 — Partner Discovery (spans 4) */}
                    <ScrollReveal direction="scale" style={{ gridColumn: isMobile ? 'span 1' : 'span 4' }}>
                        <motion.div
                            whileHover={{ y: -6 }}
                            className="bento-card"
                            onMouseMove={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                                e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
                            }}
                            style={{
                                padding: isMobile ? '28px' : '44px', minHeight: isMobile ? '320px' : '380px',
                                background: 'linear-gradient(135deg, rgba(94, 210, 156, 0.12), rgba(34, 211, 238, 0.05), rgba(15, 23, 42, 0.6))',
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
                                backgroundImage: 'radial-gradient(rgba(94, 210, 156,0.12) 1px, transparent 1px)',
                                backgroundSize: '28px 28px',
                                mask: 'radial-gradient(ellipse 70% 60% at 80% 20%, black, transparent)',
                                WebkitMask: 'radial-gradient(ellipse 70% 60% at 80% 20%, black, transparent)',
                                opacity: 0.6, pointerEvents: 'none'
                            }} />

                            <div style={{ position: 'relative', zIndex: 2, maxWidth: '540px' }}>
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                                    padding: '6px 14px', borderRadius: '999px',
                                    background: 'rgba(94, 210, 156, 0.12)', border: '1px solid rgba(94, 210, 156, 0.25)',
                                    fontSize: '11px', fontWeight: '700', color: 'var(--badge-primary-text)',
                                    textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '24px'
                                }}>
                                    <Sparkles size={11} /> Flagship Feature
                                </div>
                                <div style={{
                                    width: '64px', height: '64px', borderRadius: '18px',
                                    background: 'linear-gradient(135deg, #5ed29c, #8be8bc)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white', marginBottom: '24px',
                                    boxShadow: '0 12px 32px rgba(94, 210, 156, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)'
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
                                        background: 'linear-gradient(135deg, rgba(94, 210, 156,0.2), rgba(94, 210, 156,0.08))',
                                        border: '1px solid rgba(94, 210, 156,0.3)',
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
                        </motion.div>
                    </ScrollReveal>

                    {/* Medium — NDA / Trust (spans 2) */}
                    <ScrollReveal direction="up" delay={0.1} style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                        <motion.div
                            whileHover={{ y: -6 }}
                            className="bento-card"
                            onMouseMove={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                                e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
                            }}
                            style={{
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
                        </motion.div>
                    </ScrollReveal>

                    {/* Medium — GDPR (spans 2) */}
                    <ScrollReveal direction="up" delay={0.15} style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                        <motion.div
                            whileHover={{ y: -6 }}
                            className="bento-card"
                            onMouseMove={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                                e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
                            }}
                            style={{
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
                                Minimal data collection. Right to delete. Right to export. Full privacy policy enforcement across 27 EU member states.
                            </p>
                        </motion.div>
                    </ScrollReveal>

                    {/* Medium — Meeting (spans 2) */}
                    <ScrollReveal direction="up" delay={0.2} style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                        <motion.div
                            whileHover={{ y: -6 }}
                            className="bento-card"
                            onMouseMove={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                                e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
                            }}
                            style={{
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
                        </motion.div>
                    </ScrollReveal>

                    {/* BIG — Pan-European + Speed (spans 4) */}
                    <ScrollReveal direction="scale" delay={0.25} style={{ gridColumn: isMobile ? 'span 1' : 'span 4' }}>
                        <motion.div
                            whileHover={{ y: -6 }}
                            className="bento-card"
                            onMouseMove={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                                e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
                            }}
                            style={{
                                padding: isMobile ? '28px' : '40px', minHeight: isMobile ? '280px' : '320px',
                                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(236, 72, 153, 0.06), rgba(15, 23, 42, 0.6))',
                                position: 'relative', overflow: 'hidden',
                                display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: isMobile ? '24px' : '40px'
                            }}
                        >
                            <div className="corner-accent corner-tl" />
                            <div className="corner-accent corner-tr" />
                            <div className="corner-accent corner-bl" />
                            <div className="corner-accent corner-br" />

                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                                    <div style={{
                                        width: '52px', height: '52px', borderRadius: '15px',
                                        background: 'linear-gradient(135deg, #06b6d4, #22d3ee)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', boxShadow: '0 10px 24px rgba(6, 182, 212, 0.35)'
                                    }}>
                                        <Globe size={24} />
                                    </div>
                                    <div style={{
                                        width: '52px', height: '52px', borderRadius: '15px',
                                        background: 'linear-gradient(135deg, #ec4899, #f472b6)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', boxShadow: '0 10px 24px rgba(236, 72, 153, 0.35)'
                                    }}>
                                        <Zap size={24} />
                                    </div>
                                </div>
                                <h3 style={{ fontSize: isMobile ? '22px' : '28px', marginBottom: '12px', letterSpacing: '-0.02em' }}>
                                    Pan-European Reach, <span className="text-gradient-primary">Under 3 Minutes</span>
                                </h3>
                                <p className="text-muted" style={{ fontSize: isMobile ? '14px' : '15.5px', lineHeight: '1.75' }}>
                                    City-based matching across 12+ countries. Post in under 3 minutes. Send a meeting request in under 30 seconds. Simplicity is the whole point.
                                </p>
                            </div>

                            {/* Stat cluster */}
                            <div style={{
                                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px',
                                minWidth: isMobile ? '100%' : '260px'
                            }}>
                                {[
                                    { n: '3m', l: 'Post time', c: 'var(--cyan)' },
                                    { n: '30s', l: 'Meet request', c: '#ec4899' },
                                    { n: '12+', l: 'Countries', c: 'var(--primary-light)' },
                                    { n: '24h', l: 'Avg. response', c: 'var(--secondary)' }
                                ].map((s, i) => (
                                    <div key={i} style={{
                                        padding: '14px 12px', borderRadius: '12px',
                                        background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ fontSize: '22px', fontWeight: '800', color: s.c, fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
                                            {s.n}
                                        </div>
                                        <div style={{ fontSize: '10px', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '2px', fontWeight: '600' }}>
                                            {s.l}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </ScrollReveal>
                </div>
            </section>

            {/* ====== PROBLEM / SOLUTION COMPARE ====== */}
            <section className="container" style={{ maxWidth: '1000px', marginBottom: isMobile ? '100px' : '140px' }}>
                <ScrollReveal>
                    <div className="text-center" style={{ marginBottom: '48px', padding: '0 12px' }}>
                        <span className="eyebrow eyebrow-amber">
                            <X size={12} /> Old way vs. HEALTH AI
                        </span>
                        <h2 style={{ fontSize: isMobile ? '30px' : '46px', marginBottom: '16px', letterSpacing: '-0.04em', lineHeight: '1.1' }}>
                            Stop Playing <span className="text-gradient-primary">Partner Roulette</span>
                        </h2>
                        <p className="text-muted" style={{ fontSize: isMobile ? '14px' : '17px', maxWidth: '600px', margin: '0 auto', lineHeight: '1.7' }}>
                            Traditional cross-disciplinary matching is slow, leaky, and coincidence-driven. Here's what changes.
                        </p>
                    </div>
                </ScrollReveal>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {compareItems.map((c, i) => (
                        <ScrollReveal key={i} direction={i % 2 === 0 ? 'left' : 'right'} delay={i * 0.05}>
                            <div className="compare-row">
                                <div className="flex items-center gap-3" style={{ color: 'var(--text-subtle)' }}>
                                    <div style={{
                                        width: '34px', height: '34px', borderRadius: '10px',
                                        background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#f87171', flexShrink: 0
                                    }}>
                                        <X size={14} />
                                    </div>
                                    <span style={{ fontSize: isMobile ? '13px' : '14px', textDecoration: 'line-through', textDecorationColor: 'rgba(239,68,68,0.4)' }}>
                                        {c.old}
                                    </span>
                                </div>
                                {!isMobile && (
                                    <div style={{ color: 'var(--text-subtle)', display: 'flex', alignItems: 'center' }}>
                                        <ArrowRight size={16} />
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    <div style={{
                                        width: '34px', height: '34px', borderRadius: '10px',
                                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.08))',
                                        border: '1px solid rgba(16, 185, 129, 0.3)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'var(--secondary)', flexShrink: 0,
                                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
                                    }}>
                                        <Check size={14} />
                                    </div>
                                    <span style={{ fontSize: isMobile ? '13.5px' : '14.5px', color: 'var(--text-main)', fontWeight: '500' }}>
                                        {c.now}
                                    </span>
                                </div>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </section>

            {/* ====== HOW IT WORKS — VERTICAL SCROLL-ANIMATED TIMELINE ====== */}
            <section id="how-it-works" className="container" style={{ maxWidth: '1000px', marginBottom: isMobile ? '100px' : '160px' }}>
                <ScrollReveal>
                    <div className="text-center" style={{ marginBottom: '72px', padding: '0 12px' }}>
                        <span className="eyebrow eyebrow-green">
                            <Rocket size={12} /> Workflow
                        </span>
                        <h2 style={{ fontSize: isMobile ? '32px' : '52px', marginBottom: '20px', letterSpacing: '-0.04em', lineHeight: '1.05' }}>
                            5 Steps to <span className="text-gradient-aurora">Collaboration</span>
                        </h2>
                        <p className="text-muted" style={{ fontSize: isMobile ? '15px' : '18px', maxWidth: '580px', margin: '0 auto', lineHeight: '1.7' }}>
                            From registration to partnership — simple, structured, and designed around your time.
                        </p>
                    </div>
                </ScrollReveal>

                <div ref={timelineRef} style={{ position: 'relative', paddingLeft: isMobile ? '80px' : '0' }}>
                    {/* Animated rail */}
                    <div className="timeline-rail">
                        <motion.div className="timeline-rail-fill" style={{ height: timelineHeight }} />
                    </div>

                    {workflow.map((w, i) => {
                        const isLeft = i % 2 === 0;
                        return (
                            <ScrollReveal key={i} direction={isMobile ? 'left' : (isLeft ? 'left' : 'right')} delay={i * 0.05}>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: isMobile ? '1fr' : '1fr 80px 1fr',
                                    alignItems: 'center',
                                    marginBottom: i === workflow.length - 1 ? '0' : (isMobile ? '28px' : '40px'),
                                    position: 'relative'
                                }}>
                                    {/* Left side */}
                                    <div style={{
                                        gridColumn: isMobile ? '1' : (isLeft ? '1' : '3'),
                                        gridRow: '1',
                                        textAlign: isMobile ? 'left' : (isLeft ? 'right' : 'left'),
                                        paddingRight: !isMobile && isLeft ? '28px' : '0',
                                        paddingLeft: !isMobile && !isLeft ? '28px' : '0'
                                    }}>
                                        <motion.div
                                            whileHover={{ y: -4, borderColor: 'rgba(255,255,255,0.16)' }}
                                            style={{
                                                padding: isMobile ? '20px' : '26px',
                                                borderRadius: '18px',
                                                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.4))',
                                                border: '1px solid rgba(255,255,255,0.06)',
                                                backdropFilter: 'blur(16px)',
                                                WebkitBackdropFilter: 'blur(16px)',
                                                position: 'relative', overflow: 'hidden',
                                                transition: 'all 0.3s'
                                            }}
                                        >
                                            {/* Accent line */}
                                            <div style={{
                                                position: 'absolute', top: 0,
                                                left: isMobile || isLeft ? 'auto' : 0,
                                                right: isMobile || !isLeft ? 0 : 'auto',
                                                width: '3px', height: '100%',
                                                background: `linear-gradient(180deg, ${w.accent}, transparent)`
                                            }} />

                                            <div style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                                marginBottom: '12px',
                                                justifyContent: isMobile || isLeft ? 'flex-start' : 'flex-end',
                                                width: '100%', flexDirection: !isMobile && isLeft ? 'row-reverse' : 'row'
                                            }}>
                                                <div style={{
                                                    padding: '4px 10px', borderRadius: '7px',
                                                    background: `${w.accent}18`, border: `1px solid ${w.accent}33`,
                                                    fontSize: '10.5px', fontWeight: '800', color: w.accent,
                                                    letterSpacing: '0.15em', fontFamily: 'var(--font-heading)'
                                                }}>
                                                    STEP {w.step}
                                                </div>
                                                <div style={{
                                                    width: '32px', height: '32px', borderRadius: '10px',
                                                    background: `linear-gradient(135deg, ${w.accent}25, ${w.accent}08)`,
                                                    border: `1px solid ${w.accent}30`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: w.accent
                                                }}>
                                                    {w.icon}
                                                </div>
                                            </div>
                                            <h3 style={{ fontSize: isMobile ? '18px' : '20px', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                                                {w.title}
                                            </h3>
                                            <p className="text-muted" style={{ fontSize: '13.5px', lineHeight: '1.7' }}>
                                                {w.desc}
                                            </p>
                                        </motion.div>
                                    </div>

                                    {/* Center node (desktop) */}
                                    {!isMobile && (
                                        <div style={{ gridColumn: '2', gridRow: '1', display: 'flex', justifyContent: 'center' }}>
                                            <motion.div
                                                whileHover={{ scale: 1.1, rotate: 5 }}
                                                style={{
                                                    width: '58px', height: '58px', borderRadius: '18px',
                                                    background: `linear-gradient(135deg, ${w.accent}, var(--accent))`,
                                                    border: '3px solid var(--background)',
                                                    boxShadow: `0 10px 28px ${w.accent}55, inset 0 2px 0 rgba(255,255,255,0.2)`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: 'white', fontWeight: '800', fontSize: '18px',
                                                    fontFamily: 'var(--font-heading)', zIndex: 3, position: 'relative'
                                                }}
                                            >
                                                {w.step}
                                            </motion.div>
                                        </div>
                                    )}

                                    {/* Mobile node */}
                                    {isMobile && (
                                        <div style={{
                                            position: 'absolute', left: '-76px', top: '20px',
                                            width: '44px', height: '44px', borderRadius: '14px',
                                            background: `linear-gradient(135deg, ${w.accent}, var(--accent))`,
                                            border: '3px solid var(--background)',
                                            boxShadow: `0 8px 22px ${w.accent}55`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'white', fontWeight: '800', fontSize: '14px',
                                            fontFamily: 'var(--font-heading)', zIndex: 3
                                        }}>
                                            {w.step}
                                        </div>
                                    )}

                                    {/* Empty other side (desktop) */}
                                    {!isMobile && (
                                        <div style={{ gridColumn: isLeft ? '3' : '1', gridRow: '1' }} />
                                    )}
                                </div>
                            </ScrollReveal>
                        );
                    })}
                </div>
            </section>

            {/* ====== DUAL PERSONA — WITH CENTRAL BRIDGE ====== */}
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
                                background: 'linear-gradient(135deg, rgba(94, 210, 156, 0.12), rgba(15, 23, 42, 0.6))'
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
                                background: 'rgba(94, 210, 156, 0.12)', border: '1px solid rgba(94, 210, 156, 0.25)',
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
                                boxShadow: '0 14px 32px rgba(94, 210, 156, 0.4), inset 0 2px 0 rgba(255,255,255,0.2)'
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
                                        background: 'rgba(94, 210, 156, 0.06)', border: '1px solid rgba(94, 210, 156, 0.12)',
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
                                        boxShadow: '0 18px 48px rgba(94, 210, 156, 0.5), 0 0 60px rgba(34, 211, 238, 0.3), inset 0 2px 0 rgba(255,255,255,0.25)',
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

            {/* ====== CTA — WITH FLOATING ORBITING BADGES ====== */}
            <section className="container" style={{ maxWidth: '1000px', marginBottom: isMobile ? '80px' : '120px', padding: isMobile ? '0 16px' : '0 24px' }}>
                <ScrollReveal direction="scale">
                    <div style={{
                        position: 'relative',
                        padding: isMobile ? '60px 28px' : '100px 60px',
                        borderRadius: '32px',
                        overflow: 'hidden',
                        background: 'linear-gradient(135deg, rgba(94, 210, 156, 0.12), rgba(34, 211, 238, 0.08), rgba(15, 23, 42, 0.7))',
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

                        {/* Floating orbit badges (desktop) */}
                        {!isMobile && (
                            <>
                                <motion.div
                                    animate={{ y: [0, -14, 0] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                                    className="floating-badge"
                                    style={{ position: 'absolute', top: '14%', left: '6%', color: 'var(--primary-light)' }}
                                >
                                    <Cpu size={12} /> Engineering
                                </motion.div>
                                <motion.div
                                    animate={{ y: [0, 14, 0] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                                    className="floating-badge"
                                    style={{ position: 'absolute', top: '22%', right: '8%', color: 'var(--secondary)' }}
                                >
                                    <Stethoscope size={12} /> Clinical
                                </motion.div>
                                <motion.div
                                    animate={{ y: [0, -12, 0] }}
                                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                                    className="floating-badge"
                                    style={{ position: 'absolute', bottom: '18%', left: '10%', color: 'var(--cyan)' }}
                                >
                                    <Globe size={12} /> Pan-European
                                </motion.div>
                                <motion.div
                                    animate={{ y: [0, 12, 0] }}
                                    transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                                    className="floating-badge"
                                    style={{ position: 'absolute', bottom: '20%', right: '10%', color: 'var(--badge-warning-text)' }}
                                >
                                    <ShieldCheck size={12} /> GDPR
                                </motion.div>
                            </>
                        )}

                        <div style={{ textAlign: 'center', position: 'relative', zIndex: 3 }}>
                            <motion.div
                                animate={{ rotate: [0, 360] }}
                                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                style={{
                                    width: isMobile ? '64px' : '84px', height: isMobile ? '64px' : '84px',
                                    borderRadius: '24px',
                                    background: 'conic-gradient(from 0deg, var(--primary), var(--accent), var(--cyan), var(--secondary), var(--primary))',
                                    padding: '2px',
                                    margin: '0 auto 28px',
                                    boxShadow: '0 20px 60px rgba(94, 210, 156, 0.5), 0 0 80px rgba(34, 211, 238, 0.3)'
                                }}
                            >
                                <motion.div
                                    animate={{ rotate: [0, -360] }}
                                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                    style={{
                                        width: '100%', height: '100%', borderRadius: '22px',
                                        background: 'var(--background)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                >
                                    <Activity size={isMobile ? 28 : 36} color="var(--primary-light)" />
                                </motion.div>
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
                                Join the HEALTH AI network and discover your cross-disciplinary partner today. Registration takes under 60 seconds.
                            </p>

                            <div className="flex gap-3 justify-center" style={{ flexWrap: 'wrap' }}>
                                <Link to="/login" className="btn btn-accent" style={{
                                    padding: isMobile ? '14px 30px' : '18px 48px',
                                    fontSize: isMobile ? '15px' : '17px', borderRadius: '16px',
                                    boxShadow: '0 12px 40px rgba(94, 210, 156, 0.45), 0 0 80px rgba(34, 211, 238, 0.2)'
                                }}>
                                    <Rocket size={20} /> Create Account <ArrowRight size={18} />
                                </Link>
                                <a href="#how-it-works" className="btn btn-secondary" style={{
                                    padding: isMobile ? '14px 24px' : '18px 36px',
                                    fontSize: isMobile ? '15px' : '17px', borderRadius: '16px'
                                }}>
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
                                <span className="flex items-center gap-1"><CheckCircle2 size={12} color="var(--secondary)" /> Under 60s</span>
                            </div>
                        </div>
                    </div>
                </ScrollReveal>
            </section>

            {/* ====== PREMIUM FOOTER ====== */}
            <footer className="container" style={{ paddingTop: '32px', maxWidth: '1200px' }}>
                <div className="shimmer-line" style={{ marginBottom: '12px' }} />

                <div className="footer-grid">
                    {/* Brand column */}
                    <div>
                        <div className="flex items-center gap-3" style={{ marginBottom: '16px' }}>
                            <div style={{
                                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                                padding: '8px', borderRadius: '12px',
                                boxShadow: '0 4px 14px rgba(94, 210, 156,0.3), inset 0 2px 0 rgba(255,255,255,0.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Activity size={20} color="white" />
                            </div>
                            <span style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.04em', fontFamily: 'var(--font-heading)' }}>
                                HEALTH<span style={{ color: 'var(--primary-light)' }}>AI</span>
                            </span>
                        </div>
                        <p className="text-muted" style={{ fontSize: '13.5px', lineHeight: '1.7', maxWidth: '340px', marginBottom: '20px' }}>
                            The structured, GDPR-compliant partner-discovery layer for European healthcare innovation.
                        </p>
                        <div className="flex gap-2">
                            {[
                                { i: <Mail size={14} />, href: 'mailto:info@healthai.eu' },
                                { i: <Linkedin size={14} />, href: '#' },
                                { i: <Github size={14} />, href: '#' }
                            ].map((s, i) => (
                                <a key={i} href={s.href} style={{
                                    width: '36px', height: '36px', borderRadius: '10px',
                                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'var(--text-muted)', transition: 'all 0.25s'
                                }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(94, 210, 156,0.1)'; e.currentTarget.style.borderColor = 'rgba(94, 210, 156,0.3)'; e.currentTarget.style.color = 'var(--primary-light)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                                >
                                    {s.i}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Platform */}
                    <div>
                        <h4 style={{
                            fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.14em',
                            color: 'var(--text-subtle)', marginBottom: '16px', fontWeight: '700'
                        }}>
                            Platform
                        </h4>
                        <a href="#how-it-works" className="footer-link">How it works</a>
                        <Link to="/login" className="footer-link">Sign in</Link>
                        <Link to="/login" className="footer-link">Create account</Link>
                        <a href="#" className="footer-link">Pricing</a>
                    </div>

                    {/* For Users */}
                    <div>
                        <h4 style={{
                            fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.14em',
                            color: 'var(--text-subtle)', marginBottom: '16px', fontWeight: '700'
                        }}>
                            For Users
                        </h4>
                        <a href="#" className="footer-link">For Engineers</a>
                        <a href="#" className="footer-link">For Clinicians</a>
                        <a href="#" className="footer-link">Help center</a>
                        <a href="#" className="footer-link">Contact us</a>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 style={{
                            fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.14em',
                            color: 'var(--text-subtle)', marginBottom: '16px', fontWeight: '700'
                        }}>
                            Legal
                        </h4>
                        <a href="#" className="footer-link">Privacy Policy</a>
                        <a href="#" className="footer-link">Terms of Service</a>
                        <a href="#" className="footer-link">NDA Template</a>
                        <a href="#" className="footer-link">GDPR</a>
                    </div>
                </div>

                <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)', margin: '24px 0' }} />

                <div className="flex justify-between items-center" style={{
                    flexWrap: 'wrap', gap: '16px', paddingBottom: '24px'
                }}>
                    <p className="text-muted text-xs">
                        © 2026 HEALTH AI — European HealthTech Co-Creation Platform. All rights reserved.
                    </p>
                    <div className="flex gap-4 items-center" style={{ flexWrap: 'wrap' }}>
                        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--badge-success-text)' }}>
                            <ShieldCheck size={12} /> GDPR Compliant
                        </span>
                        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--badge-primary-text)' }}>
                            <Lock size={12} /> Zero IP stored
                        </span>
                        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--badge-accent-text)' }}>
                            <Building2 size={12} /> .edu only
                        </span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
