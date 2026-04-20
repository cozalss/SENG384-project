const pulse = {
    animation: 'skeleton-pulse 1.6s ease-in-out infinite'
};

const bar = (w = '100%', h = 12) => ({
    width: w,
    height: h,
    borderRadius: '6px',
    background: 'rgba(255, 255, 255, 0.04)',
    backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.02) 0%, rgba(94, 210, 156, 0.06) 50%, rgba(255,255,255,0.02) 100%)',
    backgroundSize: '200% 100%',
    ...pulse
});

const SkeletonCard = () => {
    return (
        <div
            className="editorial-panel"
            style={{
                display: 'grid',
                gridTemplateColumns: '220px 1fr auto',
                gap: '32px',
                padding: '32px 36px',
                alignItems: 'stretch'
            }}
            aria-hidden="true"
        >
            {/* Visual slot */}
            <div style={{
                borderRadius: '18px',
                minHeight: '160px',
                background: 'rgba(255, 255, 255, 0.02)',
                backgroundImage: 'linear-gradient(135deg, rgba(94, 210, 156, 0.06), rgba(34, 211, 238, 0.03))',
                ...pulse
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
                        <div style={{ width: '34px', height: '34px', borderRadius: '11px', ...pulse, background: 'rgba(255,255,255,0.04)' }} />
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
        </div>
    );
};

export default SkeletonCard;
