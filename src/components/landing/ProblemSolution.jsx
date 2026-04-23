import { X, ArrowRight, Check } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const ProblemSolution = ({ isMobile, compareItems }) => {
    return (
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
    );
};

export default ProblemSolution;
