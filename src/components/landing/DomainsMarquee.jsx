import ScrollReveal from './ScrollReveal';

const DomainsMarquee = ({ isMobile, domains }) => {
    return (
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
    );
};

export default DomainsMarquee;
