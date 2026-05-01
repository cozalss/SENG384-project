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
                            background: 'linear-gradient(135deg, hsl(119 99% 50%), hsl(155 80% 60%))',
                            padding: '8px', borderRadius: '12px',
                            boxShadow: '0 4px 14px rgba(34, 211, 102, 0.32), inset 0 2px 0 rgba(255,255,255,0.32)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Activity size={20} color="hsl(0 0% 6%)" strokeWidth={2.4} />
                        </div>
                        <span style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.04em', fontFamily: 'Sora, var(--font-heading)' }}>
                            HEALTH<span style={{ color: 'hsl(119 99% 56%)' }}> AI</span>
                        </span>
                    </div>
                    <p className="text-muted" style={{ fontSize: '13.5px', lineHeight: '1.7', maxWidth: '340px', marginBottom: '20px' }}>
                        SENG 384 health-tech collaboration platform: posts, NDA workflow, meetings, chat, profile controls, and admin oversight.
                    </p>
                    <div className="flex gap-2">
                        {[
                            { icon: <Mail size={14} />, href: 'mailto:info@healthai.eu', label: 'Email HEALTH AI' },
                            { icon: <Linkedin size={14} />, href: 'mailto:info@healthai.eu?subject=LinkedIn%20follow', label: 'LinkedIn — request follow link' },
                            { icon: <Github size={14} />, href: 'mailto:info@healthai.eu?subject=Source%20repo%20access', label: 'GitHub — request repo access' },
                        ].map((s, i) => (
                            <a key={i}
                                href={s.href}
                                aria-label={s.label}
                                style={{
                                    width: '36px', height: '36px', borderRadius: '10px',
                                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'var(--text-muted)', transition: 'all 0.25s'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(34, 211, 102, 0.10)'; e.currentTarget.style.borderColor = 'rgba(34, 211, 102, 0.32)'; e.currentTarget.style.color = 'hsl(119 99% 60%)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                            >
                                {s.icon}
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
                    <a href="#premise" className="footer-link">The premise</a>
                    <a href="#product" className="footer-link">The product</a>
                    <a href="#trust" className="footer-link">Trust &amp; capabilities</a>
                    <Link to="/login" className="footer-link">Sign in</Link>
                </div>

                {/* For Users */}
                <div>
                    <h4 style={{
                        fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.14em',
                        color: 'var(--text-subtle)', marginBottom: '16px', fontWeight: '700'
                    }}>
                        For Users
                    </h4>
                    <a href="#two-sides" className="footer-link">For Engineers</a>
                    <a href="#two-sides" className="footer-link">For Clinicians</a>
                    <a href="#spotlight" className="footer-link">Demo flow</a>
                    <a href="mailto:info@healthai.eu" className="footer-link">Contact us</a>
                </div>

                {/* Legal */}
                <div>
                    <h4 style={{
                        fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.14em',
                        color: 'var(--text-subtle)', marginBottom: '16px', fontWeight: '700'
                    }}>
                        Legal
                    </h4>
                    <Link to="/privacy" className="footer-link">Privacy Policy</Link>
                    <Link to="/terms" className="footer-link">Terms of Service</Link>
                    <a href="mailto:legal@healthai.eu?subject=NDA%20template%20request" className="footer-link">NDA Template</a>
                    <a href="mailto:legal@healthai.eu?subject=Data%20request" className="footer-link">Data Request</a>
                </div>
            </div>

            <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)', margin: '24px 0' }} />

            <div className="flex justify-between items-center" style={{
                flexWrap: 'wrap', gap: '16px', paddingBottom: '24px'
            }}>
                <p className="text-muted text-xs">
                    © 2026 HEALTH AI - SENG 384 Software Engineering Project.
                </p>
                <div className="flex gap-4 items-center" style={{ flexWrap: 'wrap' }}>
                    <span className="flex items-center gap-1 text-xs" style={{ color: 'hsl(119 80% 70%)' }}>
                        <ShieldCheck size={12} /> Data export/delete controls
                    </span>
                    <span className="flex items-center gap-1 text-xs" style={{ color: 'hsl(155 70% 72%)' }}>
                        <Lock size={12} /> NDA-protected posts
                    </span>
                    <span className="flex items-center gap-1 text-xs" style={{ color: 'hsl(180 70% 72%)' }}>
                        <Building2 size={12} /> .edu only
                    </span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
