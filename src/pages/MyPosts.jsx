import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, MapPin, Calendar, Eye, CheckCircle2, Clock, Archive, Briefcase, Inbox, Send, ArrowUpRight, Sparkles } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const MyPosts = ({ posts, user, updatePostStatus }) => {
    const [filterStatus, setFilterStatus] = useState('All');

    const myPosts = posts.filter(p => p.authorId === user?.id && p.status !== 'DELETED');

    const filteredPosts = myPosts.filter(p => {
        if (filterStatus !== 'All' && p.status !== filterStatus) return false;
        return true;
    });

    const stats = {
        total: myPosts.length,
        draft: myPosts.filter(p => p.status === 'Draft').length,
        active: myPosts.filter(p => p.status === 'Active').length,
        closed: myPosts.filter(p => p.status === 'CLOSED').length,
        meeting: myPosts.filter(p => p.status === 'Meeting Scheduled').length
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Draft': return 'badge-warning';
            case 'Active': return 'badge-primary';
            case 'Meeting Scheduled': return 'badge-accent';
            case 'CLOSED': return 'badge-success';
            case 'Expired': return 'badge-warning';
            default: return 'badge-primary';
        }
    };

    const getCardAccent = (status) => {
        switch (status) {
            case 'Draft': return 'linear-gradient(90deg, #f59e0b, #fcd34d)';
            case 'Active': return 'linear-gradient(90deg, var(--primary), var(--accent))';
            case 'CLOSED': return 'linear-gradient(90deg, var(--secondary), #34d399)';
            default: return 'linear-gradient(90deg, var(--accent), #a78bfa)';
        }
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '80px' }}>

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex justify-between items-center mb-8"
                style={{
                    background: 'var(--surface)', padding: '28px 32px',
                    borderRadius: 'var(--border-radius-lg)',
                    border: '1px solid var(--border)',
                    position: 'relative', overflow: 'hidden'
                }}
            >
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg, transparent, var(--primary), var(--accent), transparent)' }} />
                <div>
                    <h1 style={{ fontSize: '32px', marginBottom: '8px', letterSpacing: '-0.04em', fontFamily: 'var(--font-heading)' }}>
                        <span className="text-gradient-primary">My</span> Announcements
                    </h1>
                    <p className="text-muted text-sm">Manage your collaboration requests and track interest.</p>
                </div>
                <Link to="/create-post" className="btn btn-accent" style={{ padding: '12px 24px', borderRadius: '14px', boxShadow: '0 6px 20px rgba(99,102,241,0.25)' }}>
                    <Plus size={16} /> New Post
                </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="myposts-stats"
                style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px', marginBottom: '32px' }}
            >
                {[
                    { label: 'Total', value: stats.total, icon: <FileText size={18} />, color: 'var(--primary-light)', bg: 'rgba(99, 102, 241, 0.06)' },
                    { label: 'Drafts', value: stats.draft, icon: <Archive size={18} />, color: 'var(--badge-warning-text)', bg: 'rgba(245, 158, 11, 0.06)' },
                    { label: 'Active', value: stats.active, icon: <Eye size={18} />, color: 'var(--badge-success-text)', bg: 'rgba(16, 185, 129, 0.06)' },
                    { label: 'In Meeting', value: stats.meeting, icon: <Clock size={18} />, color: 'var(--accent-light)', bg: 'rgba(168, 85, 247, 0.06)' },
                    { label: 'Closed', value: stats.closed, icon: <CheckCircle2 size={18} />, color: 'var(--secondary)', bg: 'rgba(52, 211, 153, 0.06)' }
                ].map((s, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        className="glass-panel"
                        style={{ padding: '20px', textAlign: 'center', cursor: 'default', border: '1px solid var(--border)' }}
                    >
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '12px',
                            background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 10px', color: s.color
                        }}>{s.icon}</div>
                        <div style={{ fontSize: '28px', fontWeight: '800', color: s.color, fontFamily: 'var(--font-heading)' }}>{s.value}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-subtle)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 mb-6" style={{
                background: 'var(--panel-light)', padding: '4px', borderRadius: '14px',
                border: '1px solid var(--border)', display: 'inline-flex'
            }}>
                {['All', 'Draft', 'Active', 'Meeting Scheduled', 'CLOSED'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        style={{
                            padding: '8px 18px', fontSize: '13px', borderRadius: '10px', fontWeight: '600',
                            border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)',
                            background: filterStatus === status ? 'linear-gradient(135deg, var(--primary), rgba(99, 102, 241, 0.8))' : 'transparent',
                            color: filterStatus === status ? 'white' : 'var(--text-muted)',
                            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: filterStatus === status ? '0 4px 12px rgba(99, 102, 241, 0.25)' : 'none'
                        }}
                    >
                        {status === 'CLOSED' ? 'Partner Found' : status}
                    </button>
                ))}
            </div>

            {/* Posts List */}
            {filteredPosts.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-panel text-center"
                    style={{ padding: '80px 48px' }}
                >
                    <Inbox size={56} style={{ margin: '0 auto 20px', opacity: 0.15 }} />
                    <h3 style={{ fontSize: '24px', marginBottom: '10px', fontWeight: '600' }}>No announcements yet</h3>
                    <p className="text-muted text-sm mb-6" style={{ maxWidth: '400px', margin: '0 auto 24px', lineHeight: '1.7' }}>Create your first collaboration request to start finding partners.</p>
                    <Link to="/create-post" className="btn btn-accent" style={{ borderRadius: '14px', padding: '14px 28px' }}>
                        <Plus size={16} /> Create Announcement
                    </Link>
                </motion.div>
            ) : (
                <div className="flex-col gap-4">
                    {filteredPosts.map((post, index) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.06 }}
                            whileHover={{ x: 4, transition: { duration: 0.2 } }}
                            className="glass-panel"
                            style={{ padding: '28px 32px', position: 'relative', overflow: 'hidden', border: '1px solid var(--border)' }}
                        >
                            <div style={{ position: 'absolute', top: 0, left: 0, height: '3px', width: '100%', background: getCardAccent(post.status) }}></div>

                            <div className="flex justify-between items-start">
                                <div style={{ flex: 1 }}>
                                    <div className="flex gap-2 items-center mb-3 flex-wrap">
                                        <span className={`badge ${getStatusBadge(post.status)}`}>
                                            {post.status === 'CLOSED' ? 'Partner Found' : post.status}
                                        </span>
                                        <span className="badge badge-warning" style={{ textTransform: 'capitalize' }}>{post.domain}</span>
                                    </div>

                                    <Link to={`/post/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px', letterSpacing: '-0.02em', lineHeight: '1.3' }}>{post.title}</h2>
                                    </Link>

                                    <p className="text-muted text-sm" style={{ lineHeight: '1.7', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '16px' }}>
                                        {post.explanation}
                                    </p>

                                    <div className="flex items-center gap-3 text-xs text-muted flex-wrap">
                                        {[
                                            { icon: <MapPin size={11} />, text: `${post.city}, ${post.country}` },
                                            { icon: <Briefcase size={11} />, text: post.projectStage, capitalize: true },
                                            { icon: <Calendar size={11} />, text: new Date(post.createdAt).toLocaleDateString() }
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-1" style={{
                                                background: 'var(--panel-light)', padding: '5px 10px', borderRadius: '8px',
                                                textTransform: item.capitalize ? 'capitalize' : 'none'
                                            }}>
                                                {item.icon} {item.text}
                                            </div>
                                        ))}
                                        {post.expiryDate && (
                                            <div className="flex items-center gap-1" style={{
                                                background: new Date(post.expiryDate) < new Date() ? 'rgba(239, 68, 68, 0.06)' : 'var(--background-alt)',
                                                padding: '5px 10px', borderRadius: '8px',
                                                color: new Date(post.expiryDate) < new Date() ? '#fca5a5' : 'var(--text-muted)'
                                            }}>
                                                <Clock size={11} /> Expires: {new Date(post.expiryDate).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2" style={{ marginLeft: '24px', flexShrink: 0 }}>
                                    <Link to={`/post/${post.id}`} className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '12px', borderRadius: '10px' }}>
                                        <ArrowUpRight size={14} /> View
                                    </Link>
                                    {post.status === 'Draft' && (
                                        <button onClick={() => updatePostStatus(post.id, 'Active')} className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '12px', borderRadius: '10px' }}>
                                            <Send size={14} /> Publish
                                        </button>
                                    )}
                                    {post.status === 'Active' && (
                                        <button onClick={() => updatePostStatus(post.id, 'CLOSED')} className="btn btn-success" style={{ padding: '8px 14px', fontSize: '12px', borderRadius: '10px' }}>
                                            <CheckCircle2 size={14} /> Close
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyPosts;
