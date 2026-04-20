import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, MapPin, Calendar, Eye, CheckCircle2, Clock, Archive, Briefcase, Inbox, Send, ArrowUpRight, Sparkles, Layers } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useAnimReady } from '../hooks/useAnimReady';
import { useToast } from '../hooks/useToast';

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
        meeting: myPosts.filter(p => p.status === 'Meeting Scheduled').length
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

            {/* Editorial page header */}
            <motion.section
                initial={animReady ? {  opacity: 0, y: 24  } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="editorial-header"
            >
                <div className="editorial-header-inner">
                    <div>
                        <span className="editorial-eyebrow">
                            <Layers size={11} /> Your Publications
                        </span>
                        <h1 className="editorial-display">
                            My <span className="accent">Announcements</span>
                        </h1>
                        <p className="editorial-subtitle">
                            Manage your collaboration requests, track interest, and move projects forward.
                        </p>
                    </div>

                    <motion.div
                        initial={animReady ? {  opacity: 0, scale: 0.9  } : false}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Link to="/create-post" className="btn-lux btn-announce" style={{ whiteSpace: 'nowrap' }}>
                            <Plus size={17} strokeWidth={2.5} /> New Post
                        </Link>
                    </motion.div>
                </div>
            </motion.section>

            {/* Stats */}
            <motion.div
                initial={animReady ? {  opacity: 0, y: 15  } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="myposts-stats"
                style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px', marginBottom: '32px' }}
            >
                {[
                    { label: 'Total', value: stats.total, icon: <FileText size={16} />, color: 'var(--text-main)' },
                    { label: 'Drafts', value: stats.draft, icon: <Archive size={16} />, color: '#fcd34d' },
                    { label: 'Active', value: stats.active, icon: <Eye size={16} />, color: '#8be8bc' },
                    { label: 'Meeting', value: stats.meeting, icon: <Clock size={16} />, color: '#67e8f9' },
                    { label: 'Closed', value: stats.closed, icon: <CheckCircle2 size={16} />, color: '#5eead4' }
                ].map((s, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -4, transition: { duration: 0.25 } }}
                        className="editorial-panel"
                        style={{
                            padding: '22px 18px',
                            textAlign: 'center',
                            cursor: 'default'
                        }}
                    >
                        <div style={{
                            width: '34px', height: '34px', borderRadius: '11px',
                            background: `${s.color}12`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 10px', color: s.color,
                            border: `1px solid ${s.color}22`
                        }}>{s.icon}</div>
                        <div style={{ fontSize: '30px', fontWeight: '800', color: s.color, fontFamily: 'var(--font-heading)', letterSpacing: '-0.03em' }}>{s.value}</div>
                        <div style={{ fontSize: '9.5px', color: 'var(--text-subtle)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: '2px' }}>{s.label}</div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Filter tabs — animated pill */}
            <LayoutGroup>
                <div className="segmented-control" style={{ marginBottom: '24px', flexWrap: 'wrap' }}>
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
                                        style={{
                                            position: 'absolute', inset: 0,
                                            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                                            borderRadius: '10px', zIndex: -1,
                                            boxShadow: '0 8px 22px rgba(94, 210, 156, 0.3)'
                                        }}
                                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                    />
                                )}
                                {status === 'CLOSED' ? 'Partner Found' : status}
                            </button>
                        );
                    })}
                </div>
            </LayoutGroup>

            {/* Posts List */}
            <AnimatePresence mode="popLayout">
                {filteredPosts.length === 0 ? (
                    <motion.div
                        key="empty"
                        initial={animReady ? {  opacity: 0, scale: 0.95  } : false}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="editorial-panel"
                        style={{ padding: '72px 48px', textAlign: 'center' }}
                    >
                        <Inbox size={48} style={{ margin: '0 auto 24px', opacity: 0.25 }} />
                        <h3 style={{ fontSize: '24px', marginBottom: '10px', fontWeight: '700', letterSpacing: '-0.03em' }}>No announcements yet</h3>
                        <p className="text-muted text-sm mb-6" style={{ maxWidth: '420px', margin: '0 auto 24px', lineHeight: '1.7', fontSize: '14px' }}>
                            Create your first collaboration request to start finding partners.
                        </p>
                        <Link to="/create-post" className="btn-lux">
                            <Plus size={16} /> Create Announcement
                        </Link>
                    </motion.div>
                ) : (
                    <div className="flex-col gap-4">
                        {filteredPosts.map((post, index) => {
                            const status = getStatusPill(post.status);
                            return (
                                <motion.div
                                    key={post.id}
                                    layout
                                    initial={animReady ? {  opacity: 0, y: 22  } : false}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -18 }}
                                    transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                                    whileHover={{ x: 4, transition: { duration: 0.2 } }}
                                    className="editorial-panel editorial-panel-hover"
                                    style={{ padding: '28px 32px' }}
                                >
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1, minWidth: '240px' }}>
                                            <div className="flex gap-2 items-center mb-3" style={{ flexWrap: 'wrap' }}>
                                                <span className={`pill ${status.cls}`}>{status.label}</span>
                                                <span className="pill pill-dim">{post.domain}</span>
                                            </div>

                                            <Link to={`/post/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                <h2 style={{
                                                    fontSize: 'clamp(19px, 1.8vw, 22px)',
                                                    fontWeight: '700',
                                                    marginBottom: '10px',
                                                    letterSpacing: '-0.025em',
                                                    lineHeight: '1.22',
                                                    color: 'var(--text-main)'
                                                }}>{post.title}</h2>
                                            </Link>

                                            <p className="text-muted text-sm" style={{
                                                lineHeight: '1.7',
                                                display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden', marginBottom: '14px', fontSize: '13.5px',
                                                maxWidth: '620px'
                                            }}>
                                                {post.explanation}
                                            </p>

                                            <div className="flex items-center gap-2 text-xs text-muted" style={{ flexWrap: 'wrap' }}>
                                                {[
                                                    { icon: <MapPin size={11} />, text: `${post.city}, ${post.country}` },
                                                    { icon: <Briefcase size={11} />, text: post.projectStage, capitalize: true },
                                                    { icon: <Calendar size={11} />, text: new Date(post.createdAt).toLocaleDateString() }
                                                ].map((item, i) => (
                                                    <div key={i} className="flex items-center gap-1" style={{
                                                        background: 'rgba(7, 11, 10, 0.5)',
                                                        border: '1px solid rgba(255,255,255,0.04)',
                                                        padding: '5px 10px', borderRadius: '9px',
                                                        textTransform: item.capitalize ? 'capitalize' : 'none',
                                                        fontSize: '11px', letterSpacing: '0.01em'
                                                    }}>
                                                        {item.icon} {item.text}
                                                    </div>
                                                ))}
                                                {post.expiryDate && (
                                                    <div className="flex items-center gap-1" style={{
                                                        background: new Date(post.expiryDate) < new Date() ? 'rgba(239, 68, 68, 0.06)' : 'rgba(7, 11, 10, 0.5)',
                                                        border: `1px solid ${new Date(post.expiryDate) < new Date() ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.04)'}`,
                                                        padding: '5px 10px', borderRadius: '9px',
                                                        color: new Date(post.expiryDate) < new Date() ? '#fca5a5' : 'var(--text-muted)',
                                                        fontSize: '11px'
                                                    }}>
                                                        <Clock size={11} /> Expires: {new Date(post.expiryDate).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex gap-2" style={{ flexShrink: 0 }}>
                                            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
                                                <Link to={`/post/${post.id}`} className="btn-lux-ghost" style={{ padding: '10px 16px', fontSize: '12.5px' }}>
                                                    <ArrowUpRight size={14} /> View
                                                </Link>
                                            </motion.div>
                                            {post.status === 'Draft' && (
                                                <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }} onClick={() => handleStatusChange(post.id, 'Active')} className="btn-lux" style={{ padding: '10px 16px', fontSize: '12.5px' }}>
                                                    <Send size={14} /> Publish
                                                </motion.button>
                                            )}
                                            {post.status === 'Active' && (
                                                <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }} onClick={() => handleStatusChange(post.id, 'CLOSED')} className="btn-lux" style={{ padding: '10px 16px', fontSize: '12.5px' }}>
                                                    <CheckCircle2 size={14} /> Close
                                                </motion.button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </AnimatePresence>

            {/* Unused placeholders suppressed */}
            <div style={{ display: 'none' }}><Sparkles /></div>
        </div>
    );
};

export default MyPosts;
