/**
 * Cinematic loading skeleton — a single shimmer sweep travels across the entire
 * card via a sibling overlay (`.skeleton-shimmer-overlay`), so all bars share
 * one synchronized highlight instead of each pulsing on its own clock. This
 * reads as "the page is loading" not "every piece is broken".
 */

const bar = (w = '100%', h = 12) => ({
    width: w,
    height: h,
    borderRadius: '6px',
    background: 'rgba(255, 255, 255, 0.05)',
    backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.02) 100%)',
});

const SkeletonCard = () => {
    return (
        <div
            className="editorial-panel skeleton-card-shell"
            style={{
                position: 'relative',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
                gap: 'clamp(20px, 4vw, 32px)',
                padding: 'clamp(26px, 5vw, 32px) clamp(20px, 5vw, 36px)',
                alignItems: 'stretch',
                overflow: 'hidden',
            }}
            aria-hidden="true"
            aria-busy="true"
        >
            {/* Visual slot */}
            <div style={{
                borderRadius: '18px',
                minHeight: '160px',
                background: 'rgba(255, 255, 255, 0.03)',
                backgroundImage: 'linear-gradient(135deg, rgba(96, 165, 250, 0.06), rgba(34, 211, 238, 0.03))',
                position: 'relative',
                overflow: 'hidden',
            }} />

            {/* Content slot */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: 0 }}>
                {/* Tag row */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ ...bar('90px', 22), borderRadius: '7px' }} />
                    <div style={{ ...bar('70px', 22), borderRadius: '7px' }} />
                    <div style={{ ...bar('60px', 22), borderRadius: '7px' }} />
                </div>
                {/* Title */}
                <div style={bar('80%', 26)} />
                <div style={bar('55%', 26)} />
                {/* Description */}
                <div style={{ marginTop: '4px', ...bar('100%', 10) }} />
                <div style={bar('72%', 10)} />

                {/* Footer */}
                <div style={{
                    marginTop: '10px',
                    paddingTop: '18px',
                    borderTop: '1px solid rgba(255,255,255,0.04)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={bar('160px', 28)} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '11px', background: 'rgba(255,255,255,0.05)' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={bar('110px', 11)} />
                            <div style={bar('70px', 9)} />
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA slot */}
            <div style={{
                alignSelf: 'stretch',
                borderLeft: '1px dashed rgba(255,255,255,0.04)',
                paddingLeft: '12px',
                display: 'flex',
                alignItems: 'center'
            }}>
                <div style={{ ...bar('90px', 34), borderRadius: '12px' }} />
            </div>

            {/* Single shimmer overlay sweeping across the whole card. One animation,
                all bars feel synchronized — premium loading state. */}
            <div className="skeleton-shimmer-overlay" aria-hidden="true" />
        </div>
    );
};

export default SkeletonCard;
