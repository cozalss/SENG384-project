import { Link } from 'react-router-dom';
import { Sparkles, Brain, ArrowRight, MousePointer2, Shield, Lock, Globe } from 'lucide-react';
import AnimatedCounter from '../AnimatedCounter';

const Hero = () => {
    return (
        <section
            className="sentinel-scope"
            style={{
                position: 'relative',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'flex-end',
                overflow: 'hidden',
                background: 'transparent',
            }}
        >

            {/* Content container — bottom-left */}
            <div
                style={{
                    position: 'relative',
                    zIndex: 10,
                    pointerEvents: 'none',
                    width: '100%',
                    maxWidth: 'min(92%, 54rem)',
                    padding: 'clamp(6rem, 10vw, 8rem) clamp(1.5rem, 4vw, 2.5rem) clamp(2rem, 5vw, 2.5rem)',
                }}
            >
                {/* Badge */}
                <div
                    className="animate-fade-up"
                    style={{ animationDelay: '0.1s', marginBottom: '1.25rem' }}
                >
                    <span
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            background: 'rgba(15, 23, 42, 0.6)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            color: 'hsl(119 99% 65%)',
                            backdropFilter: 'blur(8px)',
                            fontFamily: 'Sora, sans-serif',
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                        }}
                    >
                        <Sparkles size={14} />
                        European HealthTech Innovation Platform
                    </span>
                </div>

                {/* Heading */}
                <h1
                    className="animate-fade-up"
                    style={{
                        animationDelay: '0.2s',
                        fontSize: 'clamp(2.25rem, 6.5vw, 5rem)',
                        fontWeight: 700,
                        lineHeight: 1.05,
                        letterSpacing: '-0.05em',
                        color: 'hsl(0 0% 96%)',
                        marginBottom: 'clamp(0.75rem, 2vw, 1rem)',
                        textTransform: 'uppercase',
                        fontFamily: 'Sora, sans-serif',
                    }}
                >
                    Where <span style={{ color: 'hsl(119 99% 46%)' }}>Healthcare</span>
                    <br />
                    Meets <span style={{ color: 'hsl(119 99% 46%)' }}>Engineering</span>
                </h1>

                {/* Description */}
                <p
                    className="animate-fade-up"
                    style={{
                        animationDelay: '0.4s',
                        fontSize: 'clamp(0.95rem, 1.5vw, 1.25rem)',
                        fontWeight: 300,
                        color: 'hsl(0 0% 75%)',
                        marginBottom: 'clamp(1.5rem, 3vw, 2rem)',
                        fontFamily: 'Sora, sans-serif',
                        lineHeight: 1.6,
                        maxWidth: '40rem',
                    }}
                >
                    A secure, GDPR-compliant platform for structured partner discovery between healthcare professionals and engineers. No IP stored. No coincidence needed.
                </p>

                {/* CTA buttons */}
                <div
                    className="animate-fade-up"
                    style={{
                        animationDelay: '0.55s',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                    }}
                >
                    <Link
                        to="/login"
                        style={{
                            pointerEvents: 'auto',
                            background: 'hsl(119 99% 46%)',
                            color: 'hsl(0 0% 4%)',
                            padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 3vw, 2rem)',
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            borderRadius: '0.125rem',
                            cursor: 'pointer',
                            textDecoration: 'none',
                            transition: 'all 0.2s ease',
                            fontFamily: 'Sora, sans-serif',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.1)')}
                        onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(1)')}
                    >
                        <Brain size={18} /> Join the Network <ArrowRight size={16} />
                    </Link>
                    <a
                        href="#how-it-works"
                        style={{
                            pointerEvents: 'auto',
                            background: '#fff',
                            color: 'hsl(0 0% 10%)',
                            padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 3vw, 2rem)',
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            borderRadius: '0.125rem',
                            cursor: 'pointer',
                            textDecoration: 'none',
                            transition: 'all 0.2s ease',
                            fontFamily: 'Sora, sans-serif',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(0.9)')}
                        onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(1)')}
                    >
                        <MousePointer2 size={16} /> How It Works
                    </a>
                </div>

                {/* Trust pills */}
                <div
                    className="animate-fade-up"
                    style={{
                        animationDelay: '0.7s',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                        marginTop: '1.5rem',
                    }}
                >
                    {[
                        { icon: <Shield size={14} />, text: 'GDPR Compliant' },
                        { icon: <Lock size={14} />, text: 'NDA Protected' },
                        { icon: <Globe size={14} />, text: '.edu Only' },
                    ].map((item, i) => (
                        <div
                            key={i}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.75rem',
                                color: 'hsl(0 0% 75%)',
                                fontWeight: 500,
                                padding: '0.5rem 0.875rem',
                                borderRadius: '999px',
                                background: 'rgba(15, 23, 42, 0.5)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                backdropFilter: 'blur(8px)',
                                fontFamily: 'Sora, sans-serif',
                            }}
                        >
                            <span style={{ color: 'hsl(119 99% 65%)' }}>{item.icon}</span>
                            {item.text}
                        </div>
                    ))}
                </div>

                {/* Stats */}
                <div
                    className="animate-fade-up"
                    style={{
                        animationDelay: '0.85s',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                        gap: '0.75rem',
                        marginTop: '2rem',
                        maxWidth: '42rem',
                    }}
                >
                    {[
                        { value: 150, suffix: '+', label: 'Active Innovators' },
                        { value: 85, suffix: '+', label: 'Projects Posted' },
                        { value: 12, suffix: '', label: 'Countries' },
                        { value: 34, suffix: '', label: 'Partnerships' },
                    ].map((s, i) => (
                        <div
                            key={i}
                            style={{
                                padding: '0.875rem 0.75rem',
                                borderRadius: '0.5rem',
                                background: 'rgba(15, 23, 42, 0.5)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                backdropFilter: 'blur(8px)',
                                fontFamily: 'Sora, sans-serif',
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 'clamp(1.25rem, 2vw, 1.75rem)',
                                    fontWeight: 700,
                                    letterSpacing: '-0.03em',
                                    color: 'hsl(119 99% 46%)',
                                }}
                            >
                                <AnimatedCounter value={s.value} suffix={s.suffix} />
                            </div>
                            <div
                                style={{
                                    fontSize: '0.6875rem',
                                    color: 'hsl(0 0% 60%)',
                                    fontWeight: 500,
                                    marginTop: '0.25rem',
                                    letterSpacing: '0.03em',
                                    textTransform: 'uppercase',
                                }}
                            >
                                {s.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Hero;
