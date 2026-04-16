import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, MapPin, Briefcase, Calendar, Filter, Command, Tag, Sparkles, ArrowUpRight, Bookmark, BookmarkCheck, LayoutDashboard } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import Tilt from 'react-parallax-tilt';

const Dashboard = ({ posts, user, updateUser }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDomain, setFilterDomain] = useState('All');
    const [filterStage, setFilterStage] = useState('All');
    const [filterCountry, setFilterCountry] = useState('All');
    const [filterCity, setFilterCity] = useState('All');
    const [filterStatus, setFilterStatus] = useState('Active');
    const [feedType, setFeedType] = useState('all'); // 'all' or 'saved'

    const savedPostIds = useMemo(() => user?.savedPosts || [], [user?.savedPosts]);

    const toggleBookmark = (e, postId) => {
        e.preventDefault();
        e.stopPropagation();
        const currentSaved = [...savedPostIds];
        const index = currentSaved.indexOf(postId);
        if (index > -1) {
            currentSaved.splice(index, 1);
        } else {
            currentSaved.push(postId);
        }
        updateUser({ savedPosts: currentSaved });
    };

    const allDomains = useMemo(() => ['All', ...new Set(posts.map(p => p.domain))], [posts]);
    const stages = ['All', 'idea', 'concept validation', 'prototype developed', 'pilot testing', 'pre-deployment'];
    const countries = useMemo(() => ['All', ...new Set(posts.map(p => p.country).filter(Boolean))], [posts]);
    const cities = useMemo(() => ['All', ...new Set(posts.map(p => p.city).filter(Boolean))], [posts]);
    const statuses = ['All', 'Active', 'Meeting Scheduled', 'CLOSED', 'Expired'];

    const filteredPosts = useMemo(() => {
        return posts.filter(post => {
            if (post.status === 'DELETED') return false;
            if (filterStatus !== 'All' && post.status !== filterStatus) return false;
            if (searchTerm && !post.title.toLowerCase().includes(searchTerm.toLowerCase()) && !post.explanation.toLowerCase().includes(searchTerm.toLowerCase()) && !post.domain.toLowerCase().includes(searchTerm.toLowerCase()) && !(post.expertiseNeeded || '').toLowerCase().includes(searchTerm.toLowerCase())) return false;
            if (filterDomain !== 'All' && post.domain !== filterDomain) return false;
            if (filterStage !== 'All' && post.projectStage !== filterStage) return false;
            if (filterCountry !== 'All' && post.country !== filterCountry) return false;
            if (filterCountry !== 'All' && post.country !== filterCountry) return false;
            if (filterCity !== 'All' && post.city !== filterCity) return false;
            if (feedType === 'saved' && !savedPostIds.includes(post.id)) return false;
            return true;
        });
    }, [posts, filterStatus, searchTerm, filterDomain, filterStage, filterCountry, filterCity, feedType, savedPostIds]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return 'badge-primary';
            case 'Meeting Scheduled': return 'badge-accent';
            case 'CLOSED': return 'badge-success';
            case 'Expired': return 'badge-warning';
            default: return 'badge-primary';
        }
    };

    const isLocalMatch = (post) => {
        return user?.city && post.city && user.city.toLowerCase() === post.city.toLowerCase();
    };

    const getMatchExplanation = (post) => {
        const reasons = [];
        if (isLocalMatch(post)) reasons.push('Same city');
        if (post.authorRole !== user?.role) reasons.push('Complementary role');
        return reasons.join(' • ');
    };

    const getCardAccentColor = (post) => {
        return post.authorRole === 'Engineer'
            ? 'linear-gradient(90deg, var(--primary), var(--accent))'
            : 'linear-gradient(90deg, var(--secondary), #34d399)';
    };

    const selectStyle = {
        cursor: 'pointer', appearance: 'none', fontSize: '13px',
        padding: '10px 14px', background: 'var(--panel-light)',
        border: '1px solid var(--border)',
        borderRadius: '10px'
    };

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '80px' }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex justify-between items-center mb-8"
                style={{
                    background: 'var(--panel-base)',
                    padding: '28px 32px',
                    borderRadius: 'var(--border-radius-lg)',
                    border: '1px solid var(--border)',
                    position: 'relative', overflow: 'hidden'
                }}
            >
                {/* Subtle gradient accent */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '2px',
                    background: 'linear-gradient(90deg, transparent, var(--primary), var(--accent), transparent)'
                }} />
                
                <div className="flex flex-col">
                    <h1 style={{ fontSize: '36px', marginBottom: '8px', letterSpacing: '-0.04em', fontFamily: 'var(--font-heading)' }}>
                        <span className="text-gradient-primary">Innovator</span> Feed
                    </h1>
                    <p className="text-muted" style={{ fontSize: '15px' }}>Discover cross-disciplinary expertise to accelerate health-tech.</p>
                </div>

                <div className="flex gap-4">
                    <Link to="/create-post" id="new-announcement-btn" className="btn btn-accent" style={{
                        padding: '14px 28px', fontSize: '14px', borderRadius: '14px',
                        boxShadow: '0 6px 20px rgba(94, 210, 156, 0.25)'
                    }}>
                        <Plus size={18} />
                        New Announcement
                    </Link>
                </div>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-1 mb-8" style={{
                background: 'var(--panel-base)',
                borderRadius: '14px',
                padding: '6px',
                width: 'fit-content',
                border: '1px solid var(--border)'
            }}>
                <button
                    onClick={() => setFeedType('all')}
                    className="flex items-center gap-2"
                    style={{
                        padding: '10px 24px',
                        borderRadius: '12px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        fontSize: '14px',
                        fontWeight: '600',
                        background: feedType === 'all' ? 'linear-gradient(135deg, var(--primary), var(--accent))' : 'transparent',
                        color: feedType === 'all' ? 'white' : 'var(--text-muted)',
                        boxShadow: feedType === 'all' ? '0 8px 25px rgba(94, 210, 156, 0.3)' : 'none'
                    }}
                >
                    <LayoutDashboard size={16} /> All Channels
                </button>
                <button
                    onClick={() => setFeedType('saved')}
                    className="flex items-center gap-2"
                    style={{
                        padding: '10px 24px',
                        borderRadius: '12px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        fontSize: '14px',
                        fontWeight: '600',
                        background: feedType === 'saved' ? 'linear-gradient(135deg, var(--primary), var(--accent))' : 'transparent',
                        color: feedType === 'saved' ? 'white' : 'var(--text-muted)',
                        boxShadow: feedType === 'saved' ? '0 8px 25px rgba(94, 210, 156, 0.3)' : 'none'
                    }}
                >
                    <Bookmark size={16} /> Saved Projects
                    {savedPostIds.length > 0 && (
                        <span style={{
                            background: 'white', color: 'var(--primary)',
                            padding: '2px 8px', borderRadius: '20px', fontSize: '11px', marginLeft: '6px'
                        }}>
                            {savedPostIds.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Advanced Filters */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="glass-panel"
                style={{ padding: '20px 24px', marginBottom: '40px', borderRadius: 'var(--border-radius-md)', background: 'var(--panel-base)' }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Search Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px' }} className="items-center">
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                            <input
                                id="search-input"
                                type="text"
                                placeholder="Search projects, domains, technologies..."
                                className="input-field"
                                style={{ paddingLeft: '48px', background: 'var(--panel-light)', border: '1px solid var(--border)' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium" style={{
                            color: 'var(--text-subtle)', padding: '8px 14px',
                            background: 'var(--panel-light)', borderRadius: '10px',
                            border: '1px solid var(--border)'
                        }}>
                            <Filter size={13} /> {filteredPosts.length} result{filteredPosts.length !== 1 ? 's' : ''}
                        </div>
                    </div>

                    {/* Filter Row */}
                    <div className="dashboard-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
                        <select id="filter-domain" className="input-field" style={selectStyle} value={filterDomain} onChange={(e) => setFilterDomain(e.target.value)}>
                            {allDomains.map(d => <option key={d} value={d} style={{ background: 'var(--background)' }}>Domain: {d}</option>)}
                        </select>
                        <select id="filter-stage" className="input-field" style={selectStyle} value={filterStage} onChange={(e) => setFilterStage(e.target.value)}>
                            {stages.map(s => <option key={s} value={s} style={{ background: 'var(--background)' }}>Stage: {s}</option>)}
                        </select>
                        <select id="filter-country" className="input-field" style={selectStyle} value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)}>
                            {countries.map(c => <option key={c} value={c} style={{ background: 'var(--background)' }}>Country: {c}</option>)}
                        </select>
                        <select id="filter-city" className="input-field" style={selectStyle} value={filterCity} onChange={(e) => setFilterCity(e.target.value)}>
                            {cities.map(c => <option key={c} value={c} style={{ background: 'var(--background)' }}>City: {c}</option>)}
                        </select>
                        <select id="filter-status" className="input-field" style={selectStyle} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            {statuses.map(s => <option key={s} value={s} style={{ background: 'var(--background)' }}>Status: {s}</option>)}
                        </select>
                    </div>
                </div>
            </motion.div>

            {/* Posts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' }}>
                {filteredPosts.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-panel"
                        style={{ padding: '80px 48px', textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1 / -1' }}
                    >
                        <Command size={64} style={{ margin: '0 auto 24px', opacity: 0.15 }} />
                        <h3 style={{ fontSize: '24px', color: 'var(--text-main)', marginBottom: '12px', fontWeight: '600' }}>No announcements found</h3>
                        <p style={{ fontSize: '15px', maxWidth: '400px', margin: '0 auto', lineHeight: '1.7' }}>Adjust your filters or be the first to post a new collaboration request in this category.</p>
                    </motion.div>
                ) : (
                    filteredPosts.map((post, index) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.45, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
                        >
                            <Tilt
                                tiltMaxAngleX={5}
                                tiltMaxAngleY={5}
                                perspective={1400}
                                scale={1.015}
                                transitionSpeed={400}
                                glareEnable={true}
                                glareMaxOpacity={0.06}
                                glareColor="#8be8bc"
                                glarePosition="all"
                                glareBorderRadius="16px"
                                style={{ borderRadius: '16px' }}
                            >
                                <Link to={`/post/${post.id}`} className="glass-panel" style={{
                                    padding: '28px 28px 24px', display: 'flex', flexDirection: 'column',
                                    textDecoration: 'none', color: 'inherit', position: 'relative',
                                    overflow: 'hidden', height: '100%',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    border: '1px solid var(--border)'
                                }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                                        e.currentTarget.style.boxShadow = '0 25px 50px rgba(0,0,0,0.4), 0 0 40px rgba(94, 210, 156,0.04)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--surface-hover)';
                                        e.currentTarget.style.boxShadow = 'var(--glass-shadow)';
                                    }}
                                >
                                    {/* Top accent bar */}
                                    <div style={{ position: 'absolute', top: 0, left: 0, height: '2px', width: '100%', background: getCardAccentColor(post) }} />

                                    <div className="flex justify-between items-start mb-5">
                                        <div style={{ width: 'calc(100% - 40px)' }}>
                                            <div className="flex gap-2 items-center mb-4 flex-wrap">
                                                <span className={`badge ${post.authorRole === 'Engineer' ? 'badge-primary' : 'badge-success'}`}>
                                                    {post.authorRole}
                                                </span>
                                                <span className="badge badge-warning" style={{ textTransform: 'capitalize' }}>
                                                    {post.domain}
                                                </span>
                                                <span className={`badge ${getStatusColor(post.status)}`}>
                                                    {post.status === 'CLOSED' ? 'Partner Found' : post.status}
                                                </span>
                                                {isLocalMatch(post) && (
                                                    <span className="badge badge-accent" style={{ animation: 'statusPulse 2s infinite' }}>
                                                        <MapPin size={10} style={{ marginRight: '4px' }} /> Local
                                                    </span>
                                                )}
                                            </div>
                                            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '14px', lineHeight: '1.3', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>{post.title}</h2>
                                        </div>

                                        <button
                                            onClick={(e) => toggleBookmark(e, post.id)}
                                            style={{
                                                padding: '10px',
                                                borderRadius: '12px',
                                                border: '1px solid var(--border)',
                                                background: savedPostIds.includes(post.id) ? 'rgba(94, 210, 156, 0.1)' : 'var(--background-alt)',
                                                color: savedPostIds.includes(post.id) ? 'var(--primary-light)' : 'var(--text-muted)',
                                                transition: 'all 0.3s ease',
                                                zIndex: 5
                                            }}
                                            onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.color = 'var(--primary-light)'; }}
                                            onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; if (!savedPostIds.includes(post.id)) e.currentTarget.style.color = 'var(--text-muted)'; }}
                                        >
                                            {savedPostIds.includes(post.id) ? <BookmarkCheck size={20} fill="currentColor" /> : <Bookmark size={20} />}
                                        </button>
                                    </div>

                                    <div style={{ flexGrow: 1, marginBottom: '20px' }}>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.7', display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {post.explanation}
                                        </p>
                                    </div>

                                    {/* Match explanation */}
                                    {getMatchExplanation(post) && (
                                        <div style={{
                                            background: 'linear-gradient(135deg, rgba(94, 210, 156, 0.06), rgba(34, 211, 238, 0.04))',
                                            padding: '10px 14px', borderRadius: '10px', marginBottom: '14px',
                                            border: '1px solid var(--border)'
                                        }}>
                                            <span className="text-xs font-semibold" style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Sparkles size={12} /> Match: {getMatchExplanation(post)}
                                            </span>
                                        </div>
                                    )}

                                    <div style={{
                                        background: 'var(--panel-light)', padding: '14px',
                                        borderRadius: 'var(--border-radius-sm)', marginBottom: '20px',
                                        border: '1px solid var(--border)'
                                    }}>
                                        <span className="text-xs text-muted block mb-1 font-medium" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '10px' }}>Required Partner</span>
                                        <strong style={{
                                            fontSize: '13px',
                                            color: post.authorRole === 'Engineer' ? '#6ee7b7' : '#a5b4fc',
                                            fontWeight: '600'
                                        }}>
                                            {post.authorRole === 'Engineer' ? 'Clinical / Healthcare Expert' : 'Engineering / Dev Expert'}
                                        </strong>
                                    </div>

                                    <div className="flex items-center justify-between" style={{ paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                                        <div className="flex items-center gap-3">
                                            <div style={{
                                                width: '32px', height: '32px', borderRadius: '10px',
                                                background: getCardAccentColor(post),
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: '700', fontSize: '12px', color: 'white',
                                                boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                                            }}>
                                                {post.authorName.charAt(0)}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '13px', fontWeight: '600' }}>{post.authorName}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Calendar size={10} /> {new Date(post.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1" style={{
                                            padding: '8px 14px', fontSize: '12px', fontWeight: '600',
                                            color: 'var(--primary-light)', background: 'rgba(94, 210, 156, 0.06)',
                                            borderRadius: '10px', border: '1px solid var(--border)'
                                        }}>
                                            Explore <ArrowUpRight size={13} />
                                        </div>
                                    </div>

                                </Link>
                            </Tilt>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Dashboard;
