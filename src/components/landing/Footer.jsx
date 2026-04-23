import { Activity, Mail, Linkedin, Github, ShieldCheck, Lock, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="container" style={{ paddingTop: '32px', maxWidth: '1200px' }}>
            <div className="shimmer-line" style={{ marginBottom: '12px' }} />

            <div className="footer-grid">
                {/* Brand column */}
                <div>
                    <div className="flex items-center gap-3" style={{ marginBottom: '16px' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                            padding: '8px', borderRadius: '12px',
                            boxShadow: '0 4px 14px rgba(96, 165, 250,0.3), inset 0 2px 0 rgba(255,255,255,0.3)',
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
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(96, 165, 250,0.1)'; e.currentTarget.style.borderColor = 'rgba(96, 165, 250,0.3)'; e.currentTarget.style.color = 'var(--primary-light)'; }}
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
    );
};

export default Footer;
