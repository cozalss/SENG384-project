import { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Search, Plus, MapPin, Calendar, Filter, Sparkles, ArrowUpRight,
    Bookmark, BookmarkCheck, LayoutDashboard, Brain, HeartPulse,
    Stethoscope, FlaskConical, Dna, Microscope, Cpu, Activity,
    Layers, MessageSquare, TrendingUp, FileText, Flame, Clock, Users, X
} from 'lucide-react';
import AnimatedCounter from '../components/AnimatedCounter';

import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useAnimReady } from '../hooks/useAnimReady';
import { useToast } from '../hooks/useToast';
import SkeletonCard from '../components/SkeletonCard';
import PxSelect from '../components/PxSelect';

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

/* Domain → accent hue tokens. Gives cards a visual identity at a glance
   instead of the generic blue treatment that had every card look the same. */
const domainAccent = (domain = '') => {
    const d = domain.toLowerCase();
    if (d.includes('neur') || d.includes('rehab') || d.includes('vr') || d.includes('cognitive'))
        return { ink: '#c4b5fd', wash: 'rgba(167, 139, 250, 0.14)', glow: 'rgba(167, 139, 250, 0.18)' };
    if (d.includes('cardio') || d.includes('heart'))
        return { ink: '#fda4af', wash: 'rgba(251, 113, 133, 0.14)', glow: 'rgba(251, 113, 133, 0.18)' };
    if (d.includes('imag') || d.includes('radio') || d.includes('scan'))
        return { ink: '#67e8f9', wash: 'rgba(34, 211, 238, 0.14)', glow: 'rgba(34, 211, 238, 0.18)' };
    if (d.includes('bio') || d.includes('genom') || d.includes('dna'))
        return { ink: '#6ee7b7', wash: 'rgba(52, 211, 153, 0.14)', glow: 'rgba(52, 211, 153, 0.18)' };
    if (d.includes('clinic') || d.includes('research') || d.includes('pharm'))
        return { ink: '#fcd34d', wash: 'rgba(245, 158, 11, 0.14)', glow: 'rgba(245, 158, 11, 0.18)' };
    if (d.includes('device') || d.includes('robot') || d.includes('iot'))
        return { ink: '#7dd3fc', wash: 'rgba(56, 189, 248, 0.14)', glow: 'rgba(56, 189, 248, 0.18)' };
    if (d.includes('diagn') || d.includes('ai') || d.includes('ml'))
        return { ink: '#f5c48a', wash: 'rgba(249, 168, 96, 0.14)', glow: 'rgba(249, 168, 96, 0.18)' };
    // Default — aurora amber
    return { ink: '#f5c48a', wash: 'rgba(249, 168, 96, 0.12)', glow: 'rgba(249, 168, 96, 0.16)' };
};

const MS_PER_DAY = 86400000;
const INITIAL_DASHBOARD_NOW = Date.now();

/* FlipNumber — animates a numeric digit transition with a vertical roll.
   Used for the "10 results" pill so the count change is felt, not just read.
   Falls back to a plain swap if reduced-motion is on. */
const FlipNumber = ({ value }) => {
    const str = String(value);
    return (
        <span className="flip-number">
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                    key={str}
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -8, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
                    className="flip-number-digit"
                >
                    {str}
                </motion.span>
            </AnimatePresence>
        </span>
    );
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
    const [now, setNow] = useState(INITIAL_DASHBOARD_NOW);
    /* When a card is freshly bookmarked, briefly remember its id so we can
       render a one-shot particle-burst animation. Auto-clears via timeout so
       the burst doesn't replay on rerenders. */
    const [burstId, setBurstId] = useState(null);
    const burstTimerRef = useRef(null);

    useEffect(() => {
        const id = window.setInterval(() => setNow(Date.now()), 60000);
        return () => window.clearInterval(id);
    }, []);

    useEffect(() => () => {
        if (burstTimerRef.current) window.clearTimeout(burstTimerRef.current);
    }, []);

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
        if (!wasSaved) {
            // Trigger a brief particle burst confirmation on the saved card.
            setBurstId(postId);
            if (burstTimerRef.current) window.clearTimeout(burstTimerRef.current);
            burstTimerRef.current = window.setTimeout(() => setBurstId(null), 700);
        }
    };

    const allDomains = useMemo(() => ['All', ...new Set(posts.map(p => p.domain))], [posts]);
    const stages = ['All', 'idea', 'concept validation', 'prototype developed', 'pilot testing', 'pre-deployment'];
    const countries = useMemo(() => ['All', ...new Set(posts.map(p => p.country).filter(Boolean))], [posts]);
    const cities = useMemo(() => ['All', ...new Set(posts.map(p => p.city).filter(Boolean))], [posts]);
    const statuses = ['All', 'Active', 'Meeting Scheduled', 'CLOSED', 'Expired'];

    // True when the user has narrowed the feed beyond the default state.
    // 'Active' is the default for status, so non-default means anything else.
    const hasActiveFilters =
        searchTerm !== '' ||
        filterDomain !== 'All' ||
        filterStage !== 'All' ||
        filterCountry !== 'All' ||
        filterCity !== 'All' ||
        filterStatus !== 'Active';

    const clearAllFilters = () => {
        setSearchTerm('');
        setFilterDomain('All');
        setFilterStage('All');
        setFilterCountry('All');
        setFilterCity('All');
        setFilterStatus('Active');
    };

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

    // ---- Dashboard stats ----
    // Premium dashboards show a pulse at a glance. These four numbers answer
    // "what's happening right now?" without making the user read every card.
    const stats = useMemo(() => {
        const livePosts = posts.filter(p => p.status !== 'DELETED');
        const active = livePosts.filter(p => p.status === 'Active').length;
        const newThisWeek = livePosts.filter(p => {
            const created = new Date(p.createdAt).getTime();
            return (now - created) < (7 * MS_PER_DAY);
        }).length;
        const saved = savedPostIds.length;
        const pendingMeetings = livePosts.filter(p => (p.meetings || []).some(m => m.status === 'pending')).length;
        return { active, newThisWeek, saved, pendingMeetings };
    }, [posts, savedPostIds, now]);

    // ---- Trending domains — top 3 by active post count ----
    const trendingDomains = useMemo(() => {
        const counts = new Map();
        posts.forEach(p => {
            if (p.status === 'DELETED' || p.status === 'Expired') return;
            counts.set(p.domain, (counts.get(p.domain) || 0) + 1);
        });
        return Array.from(counts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([name, count]) => ({ name, count }));
    }, [posts]);

    // ---- Recent activity — last 5 non-deleted posts ----
    const recentActivity = useMemo(() => {
        return [...posts]
            .filter(p => p.status !== 'DELETED')
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);
    }, [posts]);

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
        <div className="animate-fade-in dash-page-shell" style={{ paddingBottom: '100px' }}>
            {/* Ambient aurora wash — sits behind the hero + stat strip at ~8%
                opacity so it reads as mood, not decoration. Below z=0 so cards
                always render crisply on top. */}
            <div className="dash-ambient-aurora" aria-hidden="true">
                <span className="dash-ambient-blob a" />
                <span className="dash-ambient-blob b" />
                <span className="dash-ambient-blob c" />
            </div>

            {/* ===== COMPACT HERO ===== */}
            <motion.section
                initial={animReady ? { opacity: 0, y: 24 } : false}
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
                            <Layers size={11} /> Discovery Portal
                        </motion.div>

                        <motion.h1
                            initial={animReady ? { opacity: 0, y: 10 } : false}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.55, delay: 0.12 }}
                            className="dash-title"
                        >
                            Innovator <span className="dash-title-accent">Feed</span>
                        </motion.h1>

                        <motion.p
                            initial={animReady ? { opacity: 0 } : false}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="dash-subtitle"
                        >
                            Discover cross-disciplinary expertise to accelerate health-tech.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={animReady ? { opacity: 0, scale: 0.95 } : false}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.22 }}
                    >
                        <Link
                            to="/create-post"
                            id="new-announcement-btn"
                            className="px-btn primary lg"
                            style={{ whiteSpace: 'nowrap' }}
                        >
                            <Plus size={16} strokeWidth={2.5} /> New Announcement
                        </Link>
                    </motion.div>
                </div>
            </motion.section>

            {/* ===== STAT STRIP — at-a-glance pulse ===== */}
            <motion.div
                initial={animReady ? { opacity: 0, y: 10 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.26 }}
                className="dash-stat-strip"
            >
                {[
                    { icon: Flame, label: 'Active', value: stats.active, tone: 'amber' },
                    { icon: Sparkles, label: 'New this week', value: stats.newThisWeek, tone: 'cyan' },
                    { icon: Bookmark, label: 'Saved', value: stats.saved, tone: 'emerald' },
                    { icon: Clock, label: 'Pending meetings', value: stats.pendingMeetings, tone: 'violet' },
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
                                    <AnimatedCounter value={s.value} duration={850 + i * 100} />
                                </span>
                                <span className="dash-stat-label">{s.label}</span>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* ===== SEARCH + TABS + FILTERS (unified control strip) ===== */}
            <motion.div
                initial={animReady ? { opacity: 0, y: 10 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.32 }}
                className="dash-controls"
            >
                <div className="dash-search-row">
                    <div className="portal-search">
                        <Search size={18} color="var(--text-subtle)" />
                        <input
                            id="search-input"
                            type="text"
                            placeholder="Search projects, domains, technologies…"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="dash-result-pill" aria-live="polite">
                            <Filter size={11} />
                            <FlipNumber value={filteredPosts.length} />
                            <span style={{ marginLeft: 4 }}>
                                {filteredPosts.length === 1 ? 'result' : 'results'}
                            </span>
                        </div>
                    </div>

                    <LayoutGroup>
                        <div className="segmented-control">
                            {[
                                { key: 'all', label: 'All Channels', icon: <LayoutDashboard size={14} /> },
                                { key: 'saved', label: 'Saved', icon: <Bookmark size={14} />, count: savedPostIds.length },
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setFeedType(tab.key)}
                                    className={`segmented-tab ${feedType === tab.key ? 'active' : ''}`}
                                >
                                    {feedType === tab.key && (
                                        <motion.span
                                            layoutId="segmented-pill"
                                            className="dash-segmented-fill"
                                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                    {tab.icon} {tab.label}
                                    {tab.count > 0 && (
                                        <span className={`dash-tab-count ${feedType === tab.key ? 'active' : ''}`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </LayoutGroup>
                </div>

                <div className="filter-row" style={{ marginTop: 12 }}>
                    {[
                        { id: 'domain', value: filterDomain, setter: setFilterDomain, opts: allDomains, label: 'Domain', defaultVal: 'All' },
                        { id: 'stage', value: filterStage, setter: setFilterStage, opts: stages, label: 'Stage', defaultVal: 'All' },
                        { id: 'country', value: filterCountry, setter: setFilterCountry, opts: countries, label: 'Country', defaultVal: 'All' },
                        { id: 'city', value: filterCity, setter: setFilterCity, opts: cities, label: 'City', defaultVal: 'All' },
                        { id: 'status', value: filterStatus, setter: setFilterStatus, opts: statuses, label: 'Status', defaultVal: 'Active' },
                    ].map(f => (
                        <PxSelect
                            key={f.id}
                            id={`filter-${f.id}`}
                            size="sm"
                            ariaLabel={f.label}
                            label={`${f.label}:`}
                            value={f.value}
                            onChange={f.setter}
                            options={f.opts.map(o => ({ value: o, label: o }))}
                            isActive={f.value !== f.defaultVal}
                        />
                    ))}

                    <AnimatePresence>
                        {hasActiveFilters && (
                            <motion.button
                                key="clear-filters"
                                type="button"
                                onClick={clearAllFilters}
                                className="dash-clear-filters"
                                initial={animReady ? { opacity: 0, scale: 0.92, x: -6 } : false}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.92, x: -6 }}
                                transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
                                aria-label="Clear all filters"
                            >
                                <X size={12} strokeWidth={2.4} /> Clear filters
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* ===== FEED + RIGHT RAIL ===== */}
            <div className="dash-main-grid">
            <div className="dash-feed" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
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
                            initial={animReady ? {  opacity: 0, scale: 0.98, y: 8  } : false}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                            className="editorial-card"
                            style={{
                                position: 'relative',
                                display: 'block', textAlign: 'center',
                                padding: 'clamp(44px, 9vw, 84px) clamp(18px, 5vw, 48px)', color: 'var(--text-muted)',
                                overflow: 'hidden',
                            }}
                        >
                            {/* Aurora glow behind the empty — echoes the amber+cyan system */}
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
                                <Sparkles size={30} strokeWidth={1.6} />
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
                                {searchTerm ? `No matches for "${searchTerm}"` : 'No announcements found'}
                            </h3>
                            <p style={{
                                position: 'relative',
                                fontSize: 14.5, maxWidth: 440, margin: '0 auto', lineHeight: 1.65,
                                letterSpacing: '-0.005em',
                            }}>
                                {searchTerm
                                    ? `No matches for "${searchTerm}". Try broadening your search, or clear the filters above to see everything active.`
                                    : 'Adjust your filters above, or be the first to post a new collaboration request in this category.'}
                            </p>
                        </motion.div>
                    ) : (
                        filteredPosts.map((post, index) => {
                            const status = getStatusPill(post.status);
                            const isSaved = savedPostIds.includes(post.id);
                            const accent = domainAccent(post.domain);
                            return (
                                <motion.div
                                    key={post.id}
                                    layout
                                    initial={animReady ? { opacity: 0, y: 20 } : false}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -16 }}
                                    transition={{ duration: 0.45, delay: Math.min(index * 0.04, 0.3), ease: [0.22, 1, 0.36, 1] }}
                                    whileHover={{ y: -3 }}
                                >
                                    <div style={{ position: 'relative' }}>
                                        <Link
                                            to={`/post/${post.id}`}
                                            className="editorial-card dash-feed-card"
                                            style={{
                                                '--card-accent-ink': accent.ink,
                                                '--card-accent-wash': accent.wash,
                                                '--card-accent-glow': accent.glow,
                                            }}
                                        >
                                            {/* VISUAL SLOT — domain-accented icon with halo */}
                                            <div className="card-visual" style={{
                                                background: `radial-gradient(ellipse 70% 90% at 50% 50%, ${accent.glow}, transparent 70%), linear-gradient(135deg, rgba(26, 24, 30, 0.7), rgba(10, 10, 14, 0.5))`,
                                            }}>
                                                <div className="visual-glow" style={{ background: `radial-gradient(circle at 30% 30%, ${accent.glow}, transparent 60%)` }} />
                                                <div style={{ position: 'relative', zIndex: 1, color: accent.ink }}>
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
                                                        fontFamily: 'var(--font-heading)',
                                                        fontSize: 'clamp(22px, 2.2vw, 28px)',
                                                        // Premium display caps at 600 — 800 read as bold-template, not editorial.
                                                        fontWeight: 600,
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

                                                {/* Match ribbon — only if relevant. Leading green dot pulses
                                                    softly to draw the eye when the card matches the user's
                                                    profile (same city, complementary role). */}
                                                {getMatchExplanation(post) && (
                                                    <div className="match-ribbon">
                                                        <span className="match-ribbon-dot" aria-hidden="true" />
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
                                                            background: `linear-gradient(135deg, ${accent.ink}, ${accent.ink}99)`,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontWeight: '700', fontSize: '13px', color: '#1a1012',
                                                            flexShrink: 0,
                                                            boxShadow: `0 6px 16px -4px ${accent.glow}, inset 0 1px 0 rgba(255,255,255,0.2)`
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
                                            className={`bookmark-float ${isSaved ? 'saved' : ''} ${burstId === post.id ? 'is-bursting' : ''}`}
                                            aria-label={isSaved ? 'Remove bookmark' : 'Save project'}
                                            style={{
                                                position: 'absolute',
                                                top: '24px',
                                                right: '24px',
                                                zIndex: 10
                                            }}
                                        >
                                            {isSaved ? <BookmarkCheck size={17} fill="currentColor" /> : <Bookmark size={17} />}
                                            {/* Particle burst — six radiating sparks confirm the save action.
                                                CSS-only via a single .is-bursting class for perf. */}
                                            {burstId === post.id && (
                                                <span className="bookmark-burst" aria-hidden="true">
                                                    {[0, 1, 2, 3, 4, 5].map(i => (
                                                        <span key={i} className={`burst-spark s${i}`} />
                                                    ))}
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>

            {/* ===== RIGHT RAIL ===== */}
            <aside className="dash-rail">
                {/* Trending Domains */}
                <motion.div
                    initial={animReady ? { opacity: 0, y: 10 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="dash-rail-card"
                >
                    <div className="dash-rail-head">
                        <span className="dash-rail-eyebrow"><TrendingUp size={11} /> Trending</span>
                        <h4 className="dash-rail-title">Top domains</h4>
                    </div>
                    {trendingDomains.length === 0 ? (
                        <p className="dash-rail-empty">No activity yet.</p>
                    ) : (
                        <ul className="dash-rail-list">
                            {trendingDomains.map((d, i) => {
                                const accent = domainAccent(d.name);
                                return (
                                    <li key={d.name}>
                                        <button
                                            type="button"
                                            className={`dash-rail-row ${filterDomain === d.name ? 'is-active' : ''}`}
                                            onClick={() => setFilterDomain(filterDomain === d.name ? 'All' : d.name)}
                                        >
                                            <span className="dash-rail-rank">{i + 1}</span>
                                            <span className="dash-rail-dot" style={{ background: accent.ink }} />
                                            <span className="dash-rail-label" title={d.name}>{d.name}</span>
                                            <span className="dash-rail-count">{d.count}</span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </motion.div>

                {/* Recent activity pulse */}
                <motion.div
                    initial={animReady ? { opacity: 0, y: 10 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.48 }}
                    className="dash-rail-card"
                >
                    <div className="dash-rail-head">
                        <span className="dash-rail-eyebrow"><Activity size={11} /> Pulse</span>
                        <h4 className="dash-rail-title">Latest posts</h4>
                    </div>
                    {recentActivity.length === 0 ? (
                        <p className="dash-rail-empty">Quiet for now.</p>
                    ) : (
                        <ul className="dash-rail-list compact">
                            {recentActivity.map(p => {
                                const accent = domainAccent(p.domain);
                                const hoursAgo = Math.max(1, Math.floor((now - new Date(p.createdAt)) / 3600000));
                                return (
                                    <li key={p.id}>
                                        <Link
                                            to={`/post/${p.id}`}
                                            className="dash-rail-row dash-rail-row-post"
                                        >
                                            <span className="dash-rail-dot" style={{ background: accent.ink }} />
                                            <div className="dash-rail-post-body">
                                                <span className="dash-rail-post-title" title={p.title}>{p.title}</span>
                                                <span className="dash-rail-post-meta">
                                                    {p.authorName} · {hoursAgo < 24 ? `${hoursAgo}h ago` : `${Math.floor(hoursAgo / 24)}d ago`}
                                                </span>
                                            </div>
                                            <ArrowUpRight size={13} className="dash-rail-arrow" />
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </motion.div>

                {/* Saved shortcut */}
                <motion.div
                    initial={animReady ? { opacity: 0, y: 10 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.56 }}
                    className="dash-rail-card dash-rail-cta"
                >
                    <div className="dash-rail-cta-glow" aria-hidden="true" />
                    <div className="dash-rail-cta-body">
                        <Users size={18} className="dash-rail-cta-icon" />
                        <h4 className="dash-rail-title">{savedPostIds.length} saved for later</h4>
                        <p className="dash-rail-subtle">
                            {savedPostIds.length === 0
                                ? 'Bookmark projects to revisit them.'
                                : 'Jump back into the threads you marked.'}
                        </p>
                        <button
                            type="button"
                            onClick={() => setFeedType(feedType === 'saved' ? 'all' : 'saved')}
                            className="px-btn sm"
                            style={{ marginTop: 10 }}
                        >
                            {feedType === 'saved' ? 'Show all' : 'Show saved'}
                        </button>
                    </div>
                </motion.div>
            </aside>
            </div>
        </div>
    );
};

export default Dashboard;
