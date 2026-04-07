// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
const shimmer = {
    initial: { x: '-100%' },
    animate: {
        x: '100%',
        transition: {
            repeat: Infinity,
            duration: 1.5,
            ease: 'linear',
        },
    },
};

const SkeletonBlock = ({ width = '100%', height = '16px', radius = '8px', style = {} }) => (
    <div style={{
        width, height, borderRadius: radius,
        background: 'var(--panel-base)',
        position: 'relative', overflow: 'hidden',
        ...style
    }}>
        <motion.div
            variants={shimmer}
            initial="initial"
            animate="animate"
            style={{
                position: 'absolute', top: 0, left: 0,
                width: '100%', height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
            }}
        />
    </div>
);

const SkeletonCard = () => (
    <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
            <SkeletonBlock width="80px" height="24px" radius="12px" />
            <SkeletonBlock width="120px" height="24px" radius="12px" />
            <SkeletonBlock width="60px" height="24px" radius="12px" />
        </div>
        <SkeletonBlock width="85%" height="24px" radius="6px" />
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <SkeletonBlock width="100px" height="28px" radius="6px" />
            <SkeletonBlock width="120px" height="28px" radius="6px" />
            <SkeletonBlock width="80px" height="28px" radius="6px" />
        </div>
        <SkeletonBlock width="100%" height="16px" style={{ marginTop: '8px' }} />
        <SkeletonBlock width="90%" height="16px" />
        <SkeletonBlock width="75%" height="16px" />
        <SkeletonBlock width="100%" height="44px" radius="8px" style={{ marginTop: '8px' }} />
        <SkeletonBlock width="100%" height="56px" radius="8px" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <SkeletonBlock width="32px" height="32px" radius="50%" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <SkeletonBlock width="100px" height="14px" />
                    <SkeletonBlock width="70px" height="10px" />
                </div>
            </div>
            <SkeletonBlock width="80px" height="32px" radius="8px" />
        </div>
    </div>
);

const SkeletonGrid = ({ count = 3 }) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px' }}>
        {Array.from({ length: count }).map((_, i) => (
            <SkeletonCard key={i} />
        ))}
    </div>
);

export { SkeletonBlock, SkeletonCard, SkeletonGrid };
export default SkeletonGrid;
