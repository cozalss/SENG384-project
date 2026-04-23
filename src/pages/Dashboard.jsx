import { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Search, Plus, MapPin, Calendar, Filter, Sparkles, ArrowUpRight,
    Bookmark, BookmarkCheck, LayoutDashboard, Brain, HeartPulse,
    Stethoscope, FlaskConical, Dna, Microscope, Cpu, Activity,
    Layers, MessageSquare
} from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useAnimReady } from '../hooks/useAnimReady';
import { useToast } from '../hooks/useToast';
import SkeletonCard from '../components/SkeletonCard';

/* Domain → illustration icon map (stylized, editorial) */
const domainIcon = (domain = '') => {
    const d = domain.toLowerCase();
    if (d.includes('neur') || d.includes('rehab') || d.includes('vr') || d.includes('cognitive')) return <Brain size={96} strokeWidth={1.1} />;
    if (d.includes('cardio') || d.includes('heart')) return <HeartPulse size={96} strokeWidth={1.1} />;
    if (d.includes('imag') || d.includes('radio') || d.includes('scan')) return <Microscope size={96} strokeWidth={1.1} />;
    if (d.includes('bio') || d.includes('genom') || d.includes('dna')) return <Dna size={96} strokeWidth={1.1} />;
    if (d.includes('clinic') || d.includes('research') || d.includes('pharm')) return <FlaskConical size={96} strokeWidth={1.1} />;
    if (d.includes('device') || d.includes('robot') || d.includes('iot')) return <Cpu size={96} strokeWidth={1.1} />;
    if (d.includes('diagn') || d.includes('ai') || d.includes('ml')) return <Activity size={96} strokeWidth={1.1} />;
    return <Stethoscope size={96} strokeWidth={1.1} />;
};

const Dashboard = ({ posts, user, updateUser, postsLoading = false }) => {
    const animReady = useAnimReady();
    const toast = useToast();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDomain, setFilterDomain] = useState('All');
    const [filterStage, setFilterStage] = useState('All');
    const [filterCountry, setFilterCountry] = useState('All');
    const [filterCity, setFilterCity] = useState('All');
    const [filterStatus, setFilterStatus] = useState('Active');
    const [feedType, setFeedType] = useState(
        // Honor state hint from UserMenu → "Saved" shortcut
        location.state?.feedType === 'saved' ? 'saved' : 'all'
    );

    const savedPostIds = useMemo(() => user?.savedPosts || [], [user?.savedPosts]);

    const toggleBookmark = (e, postId) => {
        e.preventDefault();
        e.stopPropagation();
        const currentSaved = [...savedPostIds];
        const index = currentSaved.indexOf(postId);
        const wasSaved = index > -1;
        if (wasSaved) currentSaved.splice(index, 1);
        else currentSaved.push(postId);
        updateUser({ savedPosts: currentSaved });
        toast.success(wasSaved ? 'Removed from saved' : 'Saved to bookmarks', {
            title: wasSaved ? 'Unsaved' : 'Saved'
        });
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
            if (searchTerm &&
                !post.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
                !post.explanation.toLowerCase().includes(searchTerm.toLowerCase()) &&
                !post.domain.toLowerCase().includes(searchTerm.toLowerCase()) &&
                !(post.expertiseNeeded || '').toLowerCase().includes(searchTerm.toLowerCase())) return false;
            if (filterDomain !== 'All' && post.domain !== filterDomain) return false;
            if (filterStage !== 'All' && post.projectStage !== filterStage) return false;
            if (filterCountry !== 'All' && post.country !== filterCountry) return false;
            if (filterCity !== 'All' && post.city !== filterCity) return false;
            if (feedType === 'saved' && !savedPostIds.includes(post.id)) return false;
            return true;
        });
    }, [posts, filterStatus, searchTerm, filterDomain, filterStage, filterCountry, filterCity, feedType, savedPostIds]);

    const isLocalMatch = (post) => {
        return user?.city && post.city && user.city.toLowerCase() === post.city.toLowerCase();
    };

    const getMatchExplanation = (post) => {
        const reasons = [];
        if (isLocalMatch(post)) reasons.push('Same city');
        if (post.authorRole !== user?.role) reasons.push('Complementary role');
        return reasons.join(' • ');
    };

    const getStatusPill = (status) => {
        if (status === 'CLOSED') return { label: 'Partner Found', cls: 'pill-neon' };
        if (status === 'Meeting Scheduled') return { label: status, cls: 'pill-cyan' };
        if (status === 'Expired') return { label: status, cls: 'pill-amber' };
        return { label: status, cls: 'pill-cyan' };
    };

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '100px' }}>
            {/* ===== UNIFIED DISCOVERY PORTAL ===== */}
            <motion.section
                initial={animReady ? { opacity: 0, y: 24 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="discovery-portal"
            >
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) auto',
                    gap: '40px',
                    alignItems: 'flex-start',
                    position: 'relative', zIndex: 2,
                    marginBottom: '32px'
                }} className="portal-top">
                    {/* Editorial title + description */}
                    <div>
                        <motion.div
                            initial={animReady ? {  opacity: 0, x: -12  } : false}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                padding: '6px 14px', borderRadius: '999px', fontSize: '11px',
                                fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.14em',
                                background: 'rgba(96, 165, 250, 0.08)', color: '#93c5fd',
                                border: '1px solid rgba(96, 165, 250, 0.2)',
                                marginBottom: '20px'
                            }}
                        >
                            <Layers size={11} /> Discovery Portal
                        </motion.div>

                        <motion.h1
                            initial={animReady ? {  opacity: 0, y: 12  } : false}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.15 }}
                            className="editorial-title"
                        >
                            Innovator <span className="accent">Feed</span>
                        </motion.h1>

                        <motion.p
                            initial={animReady ? {  opacity: 0  } : false}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.25 }}
                            style={{
                                fontSize: '16px', color: 'var(--text-muted)',
                                maxWidth: '560px', lineHeight: '1.6', letterSpacing: '-0.005em'
                            }}
                        >
                            Discover cross-disciplinary expertise to accelerate health-tech.
                        </motion.p>
                    </div>

                    {/* New Announcement — floating CTA */}
                    <motion.div
                        initial={animReady ? {  opacity: 0, scale: 0.9  } : false}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Link
                            to="/create-post"
                            id="new-announcement-btn"
                            className="btn btn-announce"
                            style={{
                                padding: '14px 22px', borderRadius: '14px',
                                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                                color: '#070b0a', fontWeight: '700', fontSize: '13.5px',
                                letterSpacing: '0.01em',
                                border: '1px solid rgba(255,255,255,0.1)',
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                textDecoration: 'none',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <Plus size={17} strokeWidth={2.5} /> New Announcement
                        </Link>
                    </motion.div>
                </div>

                {/* Integrated search + tabs row */}
                <motion.div
                    initial={animReady ? {  opacity: 0, y: 12  } : false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.35 }}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0, 1fr) auto',
                        gap: '16px',
                        alignItems: 'center',
                        position: 'relative', zIndex: 2,
                        marginBottom: '20px'
                    }}
                    className="portal-search-row"
                >
                    <div className="portal-search">
                        <Search size={18} color="var(--text-subtle)" />
                        <input
                            id="search-input"
                            type="text"
                            placeholder="Search projects, domains, technologies…"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '5px 11px', borderRadius: '8px',
                            background: 'rgba(96, 165, 250, 0.08)',
                            border: '1px solid rgba(96, 165, 250, 0.16)',
                            color: '#93c5fd', fontSize: '11px', fontWeight: '700',
                            letterSpacing: '0.04em', whiteSpace: 'nowrap'
                        }}>
                            <Filter size={11} /> {filteredPosts.length} {filteredPosts.length === 1 ? 'result' : 'results'}
                        </div>
                    </div>

                    {/* Segmented tabs — LayoutGroup animates the pill */}
                    <LayoutGroup>
                        <div className="segmented-control">
                            {[
                                { key: 'all', label: 'All Channels', icon: <LayoutDashboard size={14} /> },
                                { key: 'saved', label: 'Saved', icon: <Bookmark size={14} />, count: savedPostIds.length }
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setFeedType(tab.key)}
                                    className={`segmented-tab ${feedType === tab.key ? 'active' : ''}`}
                                >
                                    {feedType === tab.key && (
                                        <motion.span
                                            layoutId="segmented-pill"
                                            style={{
                                                position: 'absolute', inset: 0,
                                                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                                                borderRadius: '10px', zIndex: -1,
                                                boxShadow: '0 8px 22px rgba(96, 165, 250, 0.3)'
                                            }}
                                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                    {tab.icon} {tab.label}
                                    {tab.count > 0 && (
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center',
                                            justifyContent: 'center',
                                            minWidth: '18px', height: '18px', padding: '0 5px',
                                            borderRadius: '999px',
                                            background: feedType === tab.key ? 'rgba(7,11,10,0.3)' : 'rgba(96,165,250,0.15)',
                                            color: feedType === tab.key ? '#070b0a' : '#93c5fd',
                                            fontSize: '10px', fontWeight: '800',
                                            marginLeft: '2px'
                                        }}>{tab.count}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </LayoutGroup>
                </motion.div>

                {/* Elegant single-line filters */}
                <motion.div
                    initial={animReady ? {  opacity: 0, y: 8  } : false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.45 }}
                    className="filter-row"
                    style={{ position: 'relative', zIndex: 2 }}
                >
                    {[
                        { id: 'domain', value: filterDomain, setter: setFilterDomain, opts: allDomains, label: 'Domain' },
                        { id: 'stage', value: filterStage, setter: setFilterStage, opts: stages, label: 'Stage' },
                        { id: 'country', value: filterCountry, setter: setFilterCountry, opts: countries, label: 'Country' },
                        { id: 'city', value: filterCity, setter: setFilterCity, opts: cities, label: 'City' },
                        { id: 'status', value: filterStatus, setter: setFilterStatus, opts: statuses, label: 'Status' }
                    ].map(f => (
                        <select
                            key={f.id}
                            id={`filter-${f.id}`}
                            className="filter-chip"
                            value={f.value}
                            onChange={(e) => f.setter(e.target.value)}
                        >
                            {f.opts.map(o => (
                                <option key={o} value={o} style={{ background: '#0a1210', color: 'var(--text-main)' }}>
                                    {f.label}: {o}
                                </option>
                            ))}
                        </select>
                    ))}
                </motion.div>
            </motion.section>

            {/* ===== EDITORIAL FEED ===== */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Loading skeletons — shown while Firestore subscription initializes */}
                {postsLoading && posts.length === 0 && (
                    <>
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </>
                )}

                <AnimatePresence mode="popLayout">
                    {!postsLoading && filteredPosts.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={animReady ? {  opacity: 0, scale: 0.95  } : false}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="editorial-card"
                            style={{
                                display: 'block', textAlign: 'center',
                                padding: '72px 48px', color: 'var(--text-muted)'
                            }}
                        >
                            <Sparkles size={48} style={{ margin: '0 auto 24px', opacity: 0.25 }} />
                            <h3 style={{ fontSize: '26px', color: 'var(--text-main)', marginBottom: '12px', fontWeight: '700' }}>
                                No announcements found
                            </h3>
                            <p style={{ fontSize: '15px', maxWidth: '440px', margin: '0 auto', lineHeight: '1.7' }}>
                                Adjust your filters or be the first to post a new collaboration request in this category.
                            </p>
                        </motion.div>
                    ) : (
                        filteredPosts.map((post, index) => {
                            const status = getStatusPill(post.status);
                            const isSaved = savedPostIds.includes(post.id);
                            const offset = index % 3;
                            return (
                                <motion.div
                                    key={post.id}
                                    layout
                                    initial={animReady ? {  opacity: 0, y: 28  } : false}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                                    whileHover={{ y: -4 }}
                                    style={{
                                        marginLeft: offset === 1 ? '24px' : offset === 2 ? '12px' : '0',
                                        marginRight: offset === 2 ? '24px' : '0'
                                    }}
                                >
                                    <div style={{ position: 'relative' }}>
                                        <Link to={`/post/${post.id}`} className="editorial-card">
                                            {/* VISUAL SLOT — stylized domain icon with glow */}
                                            <div className="card-visual">
                                                <div className="visual-glow" />
                                                <div style={{ position: 'relative', zIndex: 1, color: '#93c5fd' }}>
                                                    {domainIcon(post.domain)}
                                                </div>
                                            </div>

                                            {/* CONTENT SLOT */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: 0 }}>
                                                {/* Top: tag cluster (upper-right area of title block) */}
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', alignItems: 'center' }}>
                                                    <span className="pill pill-neon">
                                                        {post.authorRole === 'Engineer' ? 'Engineer' : 'Healthcare Professional'}
                                                    </span>
                                                    <span className="pill pill-dim" style={{ textTransform: 'uppercase' }}>
                                                        {post.domain}
                                                    </span>
                                                    <span className={`pill ${status.cls}`}>{status.label}</span>
                                                    {isLocalMatch(post) && (
                                                        <span className="pill pill-cyan" style={{ animation: 'statusPulse 2.4s infinite' }}>
                                                            <MapPin size={10} /> Local
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Editorial title */}
                                                <h2
                                                    className="card-title"
                                                    style={{
                                                        fontSize: 'clamp(22px, 2.2vw, 28px)',
                                                        fontWeight: '800',
                                                        letterSpacing: '-0.03em',
                                                        lineHeight: '1.12',
                                                        color: 'var(--text-main)',
                                                        marginTop: '2px'
                                                    }}
                                                >
                                                    {post.title}
                                                </h2>

                                                {/* Description */}
                                                <p style={{
                                                    color: 'var(--text-muted)', fontSize: '14px',
                                                    lineHeight: '1.7', letterSpacing: '-0.005em',
                                                    display: '-webkit-box', WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                                    maxWidth: '640px'
                                                }}>
                                                    {post.explanation}
                                                </p>

                                                {/* Match ribbon — only if relevant */}
                                                {getMatchExplanation(post) && (
                                                    <div style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                        color: '#67e8f9', fontSize: '11.5px', fontWeight: '600',
                                                        letterSpacing: '0.04em',
                                                        textTransform: 'uppercase',
                                                        alignSelf: 'flex-start'
                                                    }}>
                                                        <Sparkles size={12} /> Match · {getMatchExplanation(post)}
                                                    </div>
                                                )}

                                                {/* Required expertise + author row */}
                                                <div style={{
                                                    display: 'flex', flexWrap: 'wrap', gap: '20px',
                                                    alignItems: 'center', justifyContent: 'space-between',
                                                    marginTop: '8px',
                                                    paddingTop: '18px',
                                                    borderTop: '1px solid rgba(255,255,255,0.05)'
                                                }}>
                                                    <div className="expertise-badge">
                                                        <span className="expertise-badge-label">Required Expertise</span>
                                                        <span className="expertise-badge-role">
                                                            <MessageSquare size={11} />
                                                            {post.authorRole === 'Engineer' ? 'Clinical / Healthcare Expert' : 'Engineering / Dev Expert'}
                                                        </span>
                                                    </div>

                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{
                                                            width: '34px', height: '34px', borderRadius: '11px',
                                                            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontWeight: '800', fontSize: '13px', color: '#070b0a',
                                                            flexShrink: 0
                                                        }}>
                                                            {post.authorName.charAt(0)}
                                                        </div>
                                                        <div style={{ minWidth: 0 }}>
                                                            <div style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
                                                                {post.authorName}
                                                            </div>
                                                            <div style={{
                                                                fontSize: '11px', color: 'var(--text-subtle)',
                                                                display: 'flex', alignItems: 'center', gap: '4px',
                                                                letterSpacing: '0.02em'
                                                            }}>
                                                                <Calendar size={10} /> {new Date(post.createdAt).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* CTA SLOT — right edge, aligned */}
                                            <div style={{
                                                display: 'flex', alignItems: 'center',
                                                alignSelf: 'stretch', paddingLeft: '8px',
                                                borderLeft: '1px dashed rgba(255,255,255,0.04)'
                                            }} className="cta-slot">
                                                <span className="card-cta">
                                                    Explore <ArrowUpRight size={14} strokeWidth={2.5} />
                                                </span>
                                            </div>
                                        </Link>

                                        {/* Bookmark float button moved OUTSIDE of the Link */}
                                        <button
                                            onClick={(e) => toggleBookmark(e, post.id)}
                                            className={`bookmark-float ${isSaved ? 'saved' : ''}`}
                                            aria-label={isSaved ? 'Remove bookmark' : 'Save project'}
                                            style={{ 
                                                position: 'absolute', 
                                                top: '24px', 
                                                right: '24px',
                                                zIndex: 10 
                                            }}
                                        >
                                            {isSaved ? <BookmarkCheck size={17} fill="currentColor" /> : <Bookmark size={17} />}
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>

            {/* Collapse visual column on narrow screens */}
            <style>{`
                @media (max-width: 900px) {
                    .portal-top { grid-template-columns: 1fr !important; }
                    .portal-search-row { grid-template-columns: 1fr !important; }
                    .cta-slot { border-left: 0 !important; padding-left: 0 !important; }
                    .editorial-card .card-cta { align-self: flex-start; }
                }
                @media (max-width: 700px) {
                    .discovery-portal .editorial-title { font-size: 40px; }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
