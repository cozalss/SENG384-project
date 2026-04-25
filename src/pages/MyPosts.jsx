import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FileText, Plus, MapPin, Calendar, Eye, CheckCircle2, Clock, Archive,
    Briefcase, Inbox, Send, ArrowUpRight, Layers,
} from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useAnimReady } from '../hooks/useAnimReady';
import { useToast } from '../hooks/useToast';
import AnimatedCounter from '../components/AnimatedCounter';

const MyPosts = ({ posts, user, updatePostStatus }) => {
    const animReady = useAnimReady();
    const toast = useToast();
    const [filterStatus, setFilterStatus] = useState('All');

    const handleStatusChange = (postId, newStatus) => {
        updatePostStatus(postId, newStatus);
        if (newStatus === 'Active') toast.success('Announcement is now live in the feed.', { title: 'Published' });
        else if (newStatus === 'CLOSED') toast.success('Announcement marked as Partner Found.', { title: 'Closed' });
    };

    const myPosts = posts.filter(p => p.authorId === user?.id && p.status !== 'DELETED');
    const filteredPosts = myPosts.filter(p => filterStatus === 'All' || p.status === filterStatus);

    const stats = {
        total: myPosts.length,
        draft: myPosts.filter(p => p.status === 'Draft').length,
        active: myPosts.filter(p => p.status === 'Active').length,
        closed: myPosts.filter(p => p.status === 'CLOSED').length,
        meeting: myPosts.filter(p => p.status === 'Meeting Scheduled').length,
    };

    const getStatusPill = (status) => {
        if (status === 'CLOSED') return { label: 'Partner Found', cls: 'pill-neon' };
        if (status === 'Meeting Scheduled') return { label: status, cls: 'pill-cyan' };
        if (status === 'Active') return { label: status, cls: 'pill-neon' };
        if (status === 'Draft') return { label: status, cls: 'pill-amber' };
        if (status === 'Expired') return { label: status, cls: 'pill-amber' };
        return { label: status, cls: 'pill-cyan' };
    };

    const tabs = ['All', 'Draft', 'Active', 'Meeting Scheduled', 'CLOSED'];

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
                style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}
            >
                {[
                    { icon: FileText, label: 'Total', value: stats.total, tone: 'amber' },
                    { icon: Archive, label: 'Drafts', value: stats.draft, tone: 'amber' },
                    { icon: Eye, label: 'Active', value: stats.active, tone: 'cyan' },
                    { icon: Clock, label: 'Meeting', value: stats.meeting, tone: 'violet' },
                    { icon: CheckCircle2, label: 'Closed', value: stats.closed, tone: 'emerald' },
                ].map((s, i) => {
                    const Icon = s.icon;
                    return (
                        <motion.div
                            key={s.label}
                            className={`dash-stat-card tone-${s.tone}`}
                            whileHover={{ y: -2 }}
                            transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
                        >
                            <div className="dash-stat-icon"><Icon size={16} strokeWidth={2} /></div>
                            <div className="dash-stat-body">
                                <span className="dash-stat-value">
                                    <AnimatedCounter value={s.value} duration={850 + i * 80} />
                                </span>
                                <span className="dash-stat-label">{s.label}</span>
                            </div>
                        </motion.div>
                    );
                })}
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
                                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
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
                            background: 'radial-gradient(ellipse 60% 50% at 30% 30%, rgba(249, 168, 96, 0.09), transparent 60%), radial-gradient(ellipse 55% 45% at 80% 80%, rgba(34, 211, 238, 0.07), transparent 65%)',
                        }} />
                        <div style={{
                            position: 'relative',
                            width: 72, height: 72, margin: '0 auto 22px',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            borderRadius: 20,
                            background: 'linear-gradient(135deg, rgba(249, 168, 96, 0.14), rgba(34, 211, 238, 0.1))',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            color: '#f5c48a',
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 12px 32px -8px rgba(249, 168, 96, 0.25)',
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
                            const expiresSoon = post.expiryDate && new Date(post.expiryDate) < new Date();
                            return (
                                <motion.div
                                    key={post.id}
                                    layout
                                    initial={animReady ? { opacity: 0, y: 18 } : false}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -14 }}
                                    transition={{ duration: 0.45, delay: Math.min(index * 0.04, 0.3), ease: [0.22, 1, 0.36, 1] }}
                                    whileHover={{ x: 3, transition: { duration: 0.18 } }}
                                    className="editorial-panel editorial-panel-hover"
                                    style={{ padding: '26px 30px' }}
                                >
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'space-between', alignItems: 'flex-start' }}>
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
                                                    { icon: <Calendar size={11} />, text: new Date(post.createdAt).toLocaleDateString() },
                                                ].map((item, i) => (
                                                    <div key={i} className="flex items-center gap-1" style={{
                                                        background: 'rgba(255, 255, 255, 0.04)',
                                                        border: '1px solid rgba(255, 255, 255, 0.06)',
                                                        padding: '5px 10px', borderRadius: 9,
                                                        textTransform: item.capitalize ? 'capitalize' : 'none',
                                                        fontSize: 11, letterSpacing: '0.01em',
                                                    }}>
                                                        {item.icon} {item.text}
                                                    </div>
                                                ))}
                                                {post.expiryDate && (
                                                    <div className="flex items-center gap-1" style={{
                                                        background: expiresSoon ? 'rgba(251, 113, 133, 0.1)' : 'rgba(255, 255, 255, 0.04)',
                                                        border: `1px solid ${expiresSoon ? 'rgba(251, 113, 133, 0.26)' : 'rgba(255,255,255,0.06)'}`,
                                                        padding: '5px 10px', borderRadius: 9,
                                                        color: expiresSoon ? '#fda4af' : 'var(--text-muted)',
                                                        fontSize: 11,
                                                    }}>
                                                        <Clock size={11} /> {expiresSoon ? 'Expired' : 'Expires'}: {new Date(post.expiryDate).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex gap-2" style={{ flexShrink: 0 }}>
                                            <Link to={`/post/${post.id}`} className="px-btn sm">
                                                <ArrowUpRight size={14} /> View
                                            </Link>
                                            {post.status === 'Draft' && (
                                                <button type="button" className="px-btn primary sm" onClick={() => handleStatusChange(post.id, 'Active')}>
                                                    <Send size={14} /> Publish
                                                </button>
                                            )}
                                            {post.status === 'Active' && (
                                                <button type="button" className="px-btn primary sm" onClick={() => handleStatusChange(post.id, 'CLOSED')}>
                                                    <CheckCircle2 size={14} /> Close
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MyPosts;
