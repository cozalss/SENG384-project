/**
 * Premium skeleton loaders (2026 spec): 1.4s linear shimmer sweep with an
 * aurora-tinted highlight, replacing the old 2s pulse. Pure CSS — no JS
 * animation cost on pages rendering many skeletons at once.
 *
 * Shimmer styles live in index.css as `.shimmer`; this component composes
 * the typical editorial-card layout.
 */

const SkeletonBlock = ({ width = '100%', height = '16px', radius = '8px', style = {} }) => (
    <div
        className="shimmer"
        style={{ width, height, borderRadius: radius, ...style }}
    />
);

const SkeletonCard = () => (
    <div
        className="editorial-card"
        aria-hidden="true"
        style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
            gap: 'clamp(20px, 4vw, 32px)',
            padding: 'clamp(26px, 5vw, 32px) clamp(20px, 5vw, 36px)',
            pointerEvents: 'none',
        }}
    >
        {/* Visual slot */}
        <SkeletonBlock width="100%" height="100%" radius="18px" style={{ minHeight: 160 }} />

        {/* Body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
            <div style={{ display: 'flex', gap: 8 }}>
                <SkeletonBlock width="120px" height="22px" radius="999px" />
                <SkeletonBlock width="90px" height="22px" radius="999px" />
            </div>
            <SkeletonBlock width="70%" height="28px" radius="8px" />
            <SkeletonBlock width="100%" height="14px" radius="6px" />
            <SkeletonBlock width="96%" height="14px" radius="6px" />
            <SkeletonBlock width="78%" height="14px" radius="6px" />
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                marginTop: 10,
                paddingTop: 14,
                borderTop: '1px dashed rgba(255,255,255,0.05)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <SkeletonBlock width="32px" height="32px" radius="50%" />
                    <SkeletonBlock width="110px" height="12px" />
                </div>
                <SkeletonBlock width="86px" height="14px" radius="6px" />
            </div>
        </div>

        {/* CTA column */}
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <SkeletonBlock width="108px" height="40px" radius="11px" />
        </div>
    </div>
);

const SkeletonGrid = ({ count = 3 }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {Array.from({ length: count }).map((_, i) => (
            <SkeletonCard key={i} />
        ))}
    </div>
);

export { SkeletonBlock, SkeletonCard, SkeletonGrid };
export default SkeletonGrid;
