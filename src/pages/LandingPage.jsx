import { Link } from 'react-router-dom';
import { Activity, Shield, Users, Handshake, ArrowRight, Lock, Globe, Zap, Heart, Brain, CheckCircle2, Sparkles, MousePointer2 } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, useScroll, useTransform, useSpring, useInView, useMotionValue } from 'framer-motion';
import { useRef, useEffect, useState, Suspense } from 'react';
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

/* ---- Stagger Container ---- */
const StaggerContainer = ({ children, className = '', style = {} }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-60px' });

    return (
        <motion.div
            ref={ref}
            className={className}
            style={style}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
            }}
        >
            {children}
        </motion.div>
    );
};

const StaggerItem = ({ children, style = {} }) => (
    <motion.div
        style={style}
        variants={{
            hidden: { opacity: 0, y: 40, scale: 0.95 },
            visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
        }}
    >
        {children}
    </motion.div>
);

const LandingPage = () => {
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll();
    const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
    const heroOpacity = useTransform(smoothProgress, [0, 0.18], [1, 0]);
    const heroScale = useTransform(smoothProgress, [0, 0.18], [1, 0.92]);
    const heroY = useTransform(smoothProgress, [0, 0.18], [0, -60]);
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



    const features = [
        { icon: <Users size={28} />, title: 'Structured Partner Discovery', description: 'Post announcements describing your project and the expertise you need. Browse posts from the other side of the bridge.', color: 'var(--primary)', gradient: 'linear-gradient(135deg, #6366f1, #818cf8)' },
        { icon: <Shield size={28} />, title: 'Controlled IP Disclosure', description: 'NDA-gated meetings ensure your ideas stay protected. No technical docs or patient data ever stored on the platform.', color: 'var(--accent)', gradient: 'linear-gradient(135deg, #a855f7, #c084fc)' },
        { icon: <Handshake size={28} />, title: 'Meeting Workflow', description: 'Express interest, propose time slots, and schedule external meetings (Zoom/Teams). Platform facilitates — never stores.', color: 'var(--secondary-hover)', gradient: 'linear-gradient(135deg, #10b981, #34d399)' },
        { icon: <Lock size={28} />, title: 'GDPR Compliant', description: 'Minimal data collection. Right to delete. Right to export. No patient data. Full privacy policy enforcement.', color: 'var(--amber)', gradient: 'linear-gradient(135deg, #f59e0b, #fcd34d)' },
        { icon: <Globe size={28} />, title: 'Pan-European Reach', description: 'City-based matching highlights local collaborators. Filter by country, domain, and project stage.', color: '#ec4899', gradient: 'linear-gradient(135deg, #ec4899, #f472b6)' },
        { icon: <Zap size={28} />, title: 'Under 3 Minutes', description: 'Post an announcement in under 3 minutes. Send a meeting request in under 30 seconds. Simplicity is our priority.', color: '#06b6d4', gradient: 'linear-gradient(135deg, #06b6d4, #22d3ee)' }
    ];

    const workflow = [
        { step: '01', title: 'Register', desc: 'Sign up with your institutional .edu email and select your role.', icon: '🔐' },
        { step: '02', title: 'Post or Browse', desc: 'Create a structured announcement or browse existing ones.', icon: '📋' },
        { step: '03', title: 'Express Interest', desc: 'Accept NDA terms and send a short message to the post author.', icon: '🤝' },
        { step: '04', title: 'Schedule Meeting', desc: 'Propose time slots, agree on a date, and meet externally.', icon: '📅' },
        { step: '05', title: 'Collaborate', desc: 'If it works, mark "Partner Found" and close the announcement.', icon: '🚀' }
    ];

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
                        <div className="flex items-center gap-3" style={{ color: 'white' }}>
                            <div style={{
                                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                                padding: isMobile ? '6px' : '8px', borderRadius: '12px',
                                boxShadow: '0 4px 14px rgba(99,102,241,0.3), inset 0 2px 0 rgba(255,255,255,0.3)',
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
                    backgroundImage: 'radial-gradient(rgba(99, 102, 241, 0.12) 1px, transparent 1px)',
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
                            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(192, 132, 252, 0.05) 40%, transparent 70%)',
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
                            boxShadow: '0 8px 30px rgba(99, 102, 241, 0.3), 0 0 60px rgba(168, 85, 247, 0.1)'
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

            {/* ====== FEATURES GRID — STAGGERED SCROLL REVEAL ====== */}
            <section className="container" style={{ maxWidth: '1100px', marginBottom: '120px' }}>
                <ScrollReveal>
                    <div className="text-center mb-8">
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '6px 16px', borderRadius: '999px', fontSize: '11px', fontWeight: '700',
                            background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)',
                            color: 'var(--badge-primary-text)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '20px'
                        }}>
                            <Sparkles size={12} /> Features
                        </span>
                        <h2 style={{ fontSize: isMobile ? '28px' : '40px', marginBottom: '16px', letterSpacing: '-0.03em' }}>
                            Built for <span className="text-gradient-primary">Trust & Speed</span>
                        </h2>
                        <p className="text-muted" style={{ fontSize: isMobile ? '14px' : '17px', maxWidth: '550px', margin: '0 auto' }}>
                            Everything a health-tech innovator needs to find the right cross-disciplinary partner.
                        </p>
                    </div>
                </ScrollReveal>

                <StaggerContainer style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(330px, 1fr))',
                    gap: '20px', marginTop: '56px'
                }}>
                    {features.map((f, i) => (
                        <StaggerItem key={i}>
                            <motion.div
                                whileHover={{ y: -8, transition: { duration: 0.25 } }}
                                className="landing-feature-card"
                                onMouseMove={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                                    e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
                                    e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
                                }}
                            >
                                <div style={{
                                    width: '52px', height: '52px', borderRadius: '14px',
                                    background: f.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white', marginBottom: '20px',
                                    boxShadow: `0 8px 20px ${f.color}25`
                                }}>
                                    {f.icon}
                                </div>
                                <h3 style={{ fontSize: '18px', marginBottom: '10px', letterSpacing: '-0.01em' }}>{f.title}</h3>
                                <p className="text-muted" style={{ fontSize: '14px', lineHeight: '1.75' }}>{f.description}</p>
                            </motion.div>
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </section>

            {/* ====== HOW IT WORKS — PROGRESSIVE REVEAL ====== */}
            <section id="how-it-works" className="container" style={{ maxWidth: '900px', marginBottom: '140px' }}>
                <ScrollReveal>
                    <div className="text-center mb-8">
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '6px 16px', borderRadius: '999px', fontSize: '11px', fontWeight: '700',
                            background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)',
                            color: 'var(--badge-success-text)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '20px'
                        }}>
                            Workflow
                        </span>
                        <h2 style={{ fontSize: isMobile ? '28px' : '40px', marginBottom: '16px', letterSpacing: '-0.03em' }}>
                            5 Steps to <span className="text-gradient-primary">Collaboration</span>
                        </h2>
                        <p className="text-muted" style={{ fontSize: isMobile ? '14px' : '17px' }}>From registration to partnership — simple and structured.</p>
                    </div>
                </ScrollReveal>

                <div className="flex-col gap-4" style={{ marginTop: '56px' }}>
                    {workflow.map((w, i) => (
                        <ScrollReveal key={i} direction={i % 2 === 0 ? 'left' : 'right'} delay={i * 0.08}>
                            <motion.div
                                whileHover={{ x: 8, borderColor: 'rgba(255,255,255,0.12)', transition: { duration: 0.25 } }}
                                className="glass-panel"
                                style={{
                                    padding: isMobile ? '20px 16px' : '24px 28px',
                                    display: 'flex', alignItems: 'center', gap: isMobile ? '14px' : '20px',
                                    cursor: 'default', border: '1px solid var(--border)'
                                }}
                            >
                                <div style={{
                                    width: isMobile ? '44px' : '52px', height: isMobile ? '44px' : '52px',
                                    borderRadius: '16px', flexShrink: 0,
                                    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '14px', fontWeight: '800', color: 'white',
                                    boxShadow: '0 6px 20px rgba(99,102,241,0.3)'
                                }}>
                                    {w.step}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: isMobile ? '15px' : '17px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span>{w.icon}</span> {w.title}
                                    </h3>
                                    <p className="text-muted text-sm" style={{ lineHeight: '1.6' }}>{w.desc}</p>
                                </div>
                                {!isMobile && i < workflow.length - 1 && (
                                    <div style={{ marginLeft: 'auto', color: 'var(--text-muted)', opacity: 0.2 }}><ArrowRight size={18} /></div>
                                )}
                                {i === workflow.length - 1 && (
                                    <div style={{ marginLeft: 'auto', color: 'var(--secondary)' }}><CheckCircle2 size={22} /></div>
                                )}
                            </motion.div>
                        </ScrollReveal>
                    ))}
                </div>
            </section>

            {/* ====== DUAL PERSONA — SLIDE IN FROM SIDES ====== */}
            <section className="container" style={{ maxWidth: '1000px', marginBottom: '100px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                    gap: '24px'
                }}>
                    {/* Engineer Card */}
                    <ScrollReveal direction="left">
                        <motion.div
                            whileHover={{ y: -6 }}
                            className="glass-panel"
                            style={{ padding: isMobile ? '28px 20px' : '40px', position: 'relative', overflow: 'hidden', cursor: 'default', height: '100%' }}
                        >
                            <div style={{ position: 'absolute', top: 0, left: 0, height: '3px', width: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent))' }} />
                            <div style={{
                                width: '52px', height: '52px', borderRadius: '16px',
                                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.05))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px',
                                border: '1px solid rgba(99, 102, 241, 0.2)'
                            }}>
                                <Zap size={24} color="var(--primary-light)" />
                            </div>
                            <h3 style={{ fontSize: '24px', marginBottom: '12px' }}>I'm an Engineer</h3>
                            <p className="text-muted" style={{ fontSize: '15px', lineHeight: '1.7', marginBottom: '24px' }}>
                                You have the technology but need clinical validation, workflow understanding, or ethical approval guidance.
                            </p>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {['Post your project & tech stack', 'Find clinical domain experts', 'Schedule NDA-protected meetings', 'Close when partner found'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-main)' }}>
                                        <CheckCircle2 size={14} color="var(--primary-light)" /> {item}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </ScrollReveal>

                    {/* Doctor Card */}
                    <ScrollReveal direction="right" delay={0.15}>
                        <motion.div
                            whileHover={{ y: -6 }}
                            className="glass-panel"
                            style={{ padding: isMobile ? '28px 20px' : '40px', position: 'relative', overflow: 'hidden', cursor: 'default', height: '100%' }}
                        >
                            <div style={{ position: 'absolute', top: 0, left: 0, height: '3px', width: '100%', background: 'linear-gradient(90deg, var(--secondary), #34d399)' }} />
                            <div style={{
                                width: '52px', height: '52px', borderRadius: '16px',
                                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px',
                                border: '1px solid rgba(16, 185, 129, 0.2)'
                            }}>
                                <Heart size={24} color="var(--secondary)" />
                            </div>
                            <h3 style={{ fontSize: '24px', marginBottom: '12px' }}>I'm a Healthcare Professional</h3>
                            <p className="text-muted" style={{ fontSize: '15px', lineHeight: '1.7', marginBottom: '24px' }}>
                                You have innovative clinical ideas but need engineering competence to build prototypes or validate technology.
                            </p>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {['Describe your clinical need', 'Find engineering partners', 'Safe first-contact workflow', 'Close when collaboration starts'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-main)' }}>
                                        <CheckCircle2 size={14} color="var(--secondary)" /> {item}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </ScrollReveal>
                </div>
            </section>

            {/* ====== CTA —  SCALE REVEAL ====== */}
            <section className="container text-center" style={{ maxWidth: '700px', marginBottom: '100px', padding: isMobile ? '0 12px' : '0 24px' }}>
                <ScrollReveal direction="scale">
                    <div className="glass-panel" style={{
                        padding: isMobile ? '48px 28px' : '72px 48px',
                        position: 'relative', overflow: 'hidden',
                        background: 'var(--panel-base)'
                    }}>
                        <div style={{
                            position: 'absolute', top: 0, left: 0, width: '100%', height: '2px',
                            background: 'linear-gradient(90deg, transparent, var(--primary), var(--accent), transparent)'
                        }} />
                        <div style={{
                            position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)',
                            width: '400px', height: '200px', borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08), transparent)',
                            filter: 'blur(40px)', pointerEvents: 'none'
                        }} />

                        <h2 style={{ fontSize: isMobile ? '28px' : '36px', marginBottom: '16px', letterSpacing: '-0.03em', position: 'relative' }}>
                            Ready to Innovate?
                        </h2>
                        <p className="text-muted mb-8" style={{ fontSize: isMobile ? '14px' : '16px', lineHeight: '1.7', position: 'relative' }}>
                            Join the HEALTH AI network and discover your cross-disciplinary partner today. Registration takes under 60 seconds.
                        </p>
                        <Link to="/login" className="btn btn-accent" style={{
                            padding: isMobile ? '14px 32px' : '16px 44px',
                            fontSize: isMobile ? '14px' : '16px', borderRadius: '14px',
                            position: 'relative',
                            boxShadow: '0 8px 30px rgba(99, 102, 241, 0.3), 0 0 60px rgba(168, 85, 247, 0.1)'
                        }}>
                            <Activity size={20} /> Create Your Account <ArrowRight size={18} />
                        </Link>
                    </div>
                </ScrollReveal>
            </section>

            {/* ====== FOOTER ====== */}
            <footer className="container text-center" style={{ paddingTop: '32px' }}>
                <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)', marginBottom: '32px' }} />
                <p className="text-muted text-xs">
                    © 2026 HEALTH AI — European HealthTech Co-Creation & Innovation Platform. GDPR-compliant. No patient data stored.
                </p>
            </footer>
        </div>
    );
};

export default LandingPage;
