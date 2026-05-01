import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FileText, Plus, MapPin, Calendar, Eye, CheckCircle2, Clock, Archive,
    Briefcase, Inbox, Send, ArrowUpRight, Layers, Trash2,
} from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useAnimReady } from '../hooks/useAnimReady';
import { useToast } from '../hooks/useToast';
import { useTilt } from '../hooks/useInteractiveFX';
import AnimatedCounter from '../components/AnimatedCounter';
import { deletePostFromFirestore } from '../services/firestore';

const MyPostsStatCard = ({ icon: Icon, label, value, tone, index }) => {
    const tilt = useTilt({ max: 6, scale: 1.02 });
    return (
        <motion.div
            {...tilt}
            className={`dash-stat-card tone-${tone} premium-card premium-card--soft`}
            transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
        >
            <div className="dash-stat-icon"><Icon size={16} strokeWidth={2} /></div>
            <div className="dash-stat-body">
                <span className="dash-stat-value">
                    <AnimatedCounter value={value} duration={850 + index * 80} />
                </span>
                <span className="dash-stat-label">{label}</span>
            </div>
        </motion.div>
    );
};

const MyPostRow = ({ post, status, expiryState, animReady, index, onStatusChange, onDelete }) => {
    const expiryTone = expiryState === 'expired'
        ? { bg: 'rgba(251, 113, 133, 0.1)', border: 'rgba(251, 113, 133, 0.26)', ink: '#fda4af', label: 'Expired' }
        : expiryState === 'soon'
            ? { bg: 'rgba(251, 191, 36, 0.10)', border: 'rgba(251, 191, 36, 0.28)', ink: '#fcd34d', label: 'Expires soon' }
            : { bg: 'var(--hl-faint)', border: 'var(--border)', ink: 'var(--text-muted)', label: 'Expires' };
    const tilt = useTilt({ max: 3, scale: 1.005 });
    return (
        <motion.div
            {...tilt}
            layout
            initial={animReady ? { opacity: 0, y: 18 } : false}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.45, delay: Math.min(index * 0.04, 0.3), ease: [0.22, 1, 0.36, 1] }}
            className="editorial-panel editorial-panel-hover premium-card premium-card--soft"
            style={{ padding: '26px 30px' }}
        >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 3 }}>
                <div style={{ flex: 1, minWidth: 240 }}>
                    <div className="flex gap-2 items-center mb-3" style={{ flexWrap: 'wrap' }}>
                        <span className={`pill ${status.cls}`}>{status.label}</span>
                        <span className="pill pill-dim">{post.domain}</span>
                    </div>

                    <Link to={`/post/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <h2 style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: 'clamp(19px, 1.8vw, 22px)',
                            fontWeight: 600,
                            marginBottom: 10,
                            letterSpacing: '-0.028em',
                            lineHeight: 1.18,
                            color: 'var(--text-main)',
                        }}>{post.title}</h2>
                    </Link>

                    <p className="text-muted text-sm" style={{
                        lineHeight: 1.7,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        overflow: 'hidden', marginBottom: 14, fontSize: 13.5,
                        maxWidth: 620,
                    }}>
                        {post.explanation}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-muted" style={{ flexWrap: 'wrap' }}>
                        {[
                            { icon: <MapPin size={11} />, text: `${post.city}, ${post.country}` },
                            { icon: <Briefcase size={11} />, text: post.projectStage, capitalize: true },
                            { icon: <Calendar size={11} />, text: new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-1" style={{
                                background: 'var(--hl-faint)',
                                border: '1px solid var(--border)',
                                padding: '5px 10px', borderRadius: 9,
                                textTransform: item.capitalize ? 'capitalize' : 'none',
                                fontSize: 11, letterSpacing: '0.01em',
                            }}>
                                {item.icon} {item.text}
                            </div>
                        ))}
                        {post.expiryDate && (
                            <div className="flex items-center gap-1" style={{
                                background: expiryTone.bg,
                                border: `1px solid ${expiryTone.border}`,
                                padding: '5px 10px', borderRadius: 9,
                                color: expiryTone.ink,
                                fontSize: 11,
                            }}>
                                <Clock size={11} /> {expiryTone.label}: {new Date(post.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-2" style={{ flexShrink: 0, flexWrap: 'wrap' }}>
                    <Link to={`/post/${post.id}`} className="px-btn sm">
                        <ArrowUpRight size={14} /> View
                    </Link>
                    {post.status === 'Draft' && (
                        <button type="button" className="px-btn primary sm" onClick={() => onStatusChange(post.id, 'Active')}>
                            <Send size={14} /> Publish
                        </button>
                    )}
                    {post.status === 'Active' && (
                        <button type="button" className="px-btn primary sm" onClick={() => onStatusChange(post.id, 'CLOSED')}>
                            <CheckCircle2 size={14} /> Close
                        </button>
                    )}
                    <button
                        type="button"
                        className="px-btn ghost sm"
                        onClick={() => onDelete(post)}
                        title="Delete this post"
                        style={{ color: 'var(--badge-error-text, #fca5a5)' }}
                    >
                        <Trash2 size={14} /> Delete
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

const MyPosts = ({ posts, user, updatePostStatus }) => {
    const animReady = useAnimReady();
    const toast = useToast();
    const [filterStatus, setFilterStatus] = useState('All');
    const [currentTime] = useState(() => Date.now());

    const handleStatusChange = (postId, newStatus) => {
        updatePostStatus(postId, newStatus);
        if (newStatus === 'Active') toast.success('Announcement is now live in the feed.', { title: 'Published' });
        else if (newStatus === 'CLOSED') toast.success('Announcement marked as Partner Found.', { title: 'Closed' });
    };

    const handleDelete = async (post) => {
        if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
        try {
            await deletePostFromFirestore(post.id);
            toast.success(`"${post.title}" has been removed.`, { title: 'Post deleted' });
        } catch (err) {
            console.error('Delete post failed:', err);
            toast.error('Could not delete the post. Please try again.', { title: 'Delete failed' });
        }
    };

    const myPosts = posts.filter(p => p.authorId === user?.id && p.status !== 'DELETED');
    const filteredPosts = myPosts.filter(p => filterStatus === 'All' || p.status === filterStatus);

    const stats = {
        total: myPosts.length,
        draft: myPosts.filter(p => p.status === 'Draft').length,
        active: myPosts.filter(p => p.status === 'Active').length,
        closed: myPosts.filter(p => p.status === 'CLOSED').length,
        meeting: myPosts.filter(p => p.status === 'Meeting Scheduled').length,
        expired: myPosts.filter(p => p.status === 'Expired').length,
    };

    const getStatusPill = (status) => {
        if (status === 'CLOSED') return { label: 'Partner Found', cls: 'pill-neon' };
        if (status === 'Meeting Scheduled') return { label: status, cls: 'pill-cyan' };
        if (status === 'Active') return { label: status, cls: 'pill-neon' };
        if (status === 'Draft') return { label: status, cls: 'pill-amber' };
        if (status === 'Expired') return { label: status, cls: 'pill-amber' };
        return { label: status, cls: 'pill-cyan' };
    };

    const tabs = ['All', 'Draft', 'Active', 'Meeting Scheduled', 'CLOSED', 'Expired'];

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '80px' }}>

            {/* ===== COMPACT HERO — shares dash-* pattern with Dashboard for palette unity ===== */}
            <motion.section
                initial={animReady ? { opacity: 0, y: 20 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="dash-hero"
            >
                <div className="dash-hero-row">
                    <div className="dash-hero-text">
                        <motion.div
                            initial={animReady ? { opacity: 0, x: -8 } : false}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.08 }}
                            className="dash-eyebrow"
                        >
                            <Layers size={11} /> Your Publications
                        </motion.div>

                        <motion.h1
                            initial={animReady ? { opacity: 0, y: 10 } : false}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.55, delay: 0.12 }}
                            className="dash-title"
                        >
                            My <span className="dash-title-accent">Announcements</span>
                        </motion.h1>

                        <motion.p
                            initial={animReady ? { opacity: 0 } : false}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="dash-subtitle"
                        >
                            Manage your collaboration requests, track interest, and move projects forward.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={animReady ? { opacity: 0, scale: 0.95 } : false}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.22 }}
                    >
                        <Link to="/create-post" className="px-btn primary lg" style={{ whiteSpace: 'nowrap' }}>
                            <Plus size={16} strokeWidth={2.5} /> New Post
                        </Link>
                    </motion.div>
                </div>
            </motion.section>

            {/* ===== STAT STRIP ===== */}
            <motion.div
                initial={animReady ? { opacity: 0, y: 10 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.26 }}
                className="dash-stat-strip"
                style={{ gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' }}
            >
                {[
                    { icon: FileText, label: 'Total', value: stats.total, tone: 'amber' },
                    { icon: Archive, label: 'Drafts', value: stats.draft, tone: 'amber' },
                    { icon: Eye, label: 'Active', value: stats.active, tone: 'cyan' },
                    { icon: Clock, label: 'Meeting', value: stats.meeting, tone: 'violet' },
                    { icon: CheckCircle2, label: 'Closed', value: stats.closed, tone: 'emerald' },
                    { icon: Clock, label: 'Expired', value: stats.expired, tone: 'amber' },
                ].map((s, i) => (
                    <MyPostsStatCard
                        key={s.label}
                        icon={s.icon}
                        label={s.label}
                        value={s.value}
                        tone={s.tone}
                        index={i}
                    />
                ))}
            </motion.div>

            {/* ===== TABS ===== */}
            <motion.div
                initial={animReady ? { opacity: 0, y: 6 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{ marginBottom: 22 }}
            >
                <LayoutGroup>
                    <div className="segmented-control" style={{ flexWrap: 'wrap' }}>
                        {tabs.map(status => {
                            const active = filterStatus === status;
                            return (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`segmented-tab ${active ? 'active' : ''}`}
                                >
                                    {active && (
                                        <motion.span
                                            layoutId="myposts-pill"
                                            className="dash-segmented-fill"
                                            initial={false}
                                            transition={{ type: 'spring', stiffness: 380, damping: 32, mass: 0.8 }}
                                        />
                                    )}
                                    {status === 'CLOSED' ? 'Partner Found' : status}
                                </button>
                            );
                        })}
                    </div>
                </LayoutGroup>
            </motion.div>

            {/* ===== POSTS LIST ===== */}
            <AnimatePresence mode="popLayout">
                {filteredPosts.length === 0 ? (
                    <motion.div
                        key="empty"
                        initial={animReady ? { opacity: 0, scale: 0.98, y: 8 } : false}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                        className="editorial-panel"
                        style={{ position: 'relative', padding: 'clamp(44px, 9vw, 84px) clamp(18px, 5vw, 48px)', textAlign: 'center', overflow: 'hidden' }}
                    >
                        <div aria-hidden="true" style={{
                            position: 'absolute', inset: 0, pointerEvents: 'none',
                            background: 'radial-gradient(ellipse 60% 50% at 30% 30%, rgba(34, 211, 102, 0.09), transparent 60%), radial-gradient(ellipse 55% 45% at 80% 80%, rgba(34, 211, 238, 0.07), transparent 65%)',
                        }} />
                        <div style={{
                            position: 'relative',
                            width: 72, height: 72, margin: '0 auto 22px',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            borderRadius: 20,
                            background: 'linear-gradient(135deg, rgba(34, 211, 102, 0.14), rgba(34, 211, 238, 0.1))',
                            border: '1px solid var(--border)',
                            color: 'var(--brand-soft-text)',
                            boxShadow: 'var(--shadow-warm-sm)',
                        }}>
                            <Inbox size={30} strokeWidth={1.6} />
                        </div>
                        <h3 style={{
                            position: 'relative',
                            fontFamily: 'var(--font-heading)',
                            fontSize: 'clamp(22px, 2.4vw, 28px)',
                            fontWeight: 600,
                            letterSpacing: '-0.025em',
                            color: 'var(--text-main)',
                            marginBottom: 10,
                        }}>
                            No announcements yet
                        </h3>
                        <p className="text-muted" style={{
                            position: 'relative',
                            maxWidth: 440, margin: '0 auto 24px',
                            fontSize: 14.5, lineHeight: 1.65, letterSpacing: '-0.005em',
                        }}>
                            Create your first collaboration request to start finding partners.
                        </p>
                        <Link to="/create-post" className="px-btn primary" style={{ position: 'relative' }}>
                            <Plus size={16} /> Create announcement
                        </Link>
                    </motion.div>
                ) : (
                    <div className="flex-col gap-4">
                        {filteredPosts.map((post, index) => {
                            const status = getStatusPill(post.status);
                            // Three-state expiry: already past, within 7 days, or comfortably future.
                            // Previously this only flipped between "Expires" and "Expired" — and worse,
                            // the variable was named `expiresSoon` but actually meant "already expired",
                            // which produced a red "Expired" badge for posts that were merely close to
                            // their deadline. The clarified states match what the user actually needs
                            // to act on (renew vs. take a closer look).
                            let expiryState = 'future';
                            if (post.expiryDate) {
                                const ms = new Date(post.expiryDate).getTime() - currentTime;
                                if (ms <= 0) expiryState = 'expired';
                                else if (ms < 7 * 86400000) expiryState = 'soon';
                            }
                            return (
                                <MyPostRow
                                    key={post.id}
                                    post={post}
                                    status={status}
                                    expiryState={expiryState}
                                    animReady={animReady}
                                    index={index}
                                    onStatusChange={handleStatusChange}
                                    onDelete={handleDelete}
                                />
                            );
                        })}
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MyPosts;
