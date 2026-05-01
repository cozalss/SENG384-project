import { useState, useMemo, useEffect } from 'react';
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
import { useTilt } from '../hooks/useInteractiveFX';
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
        return { ink: 'hsl(155 70% 70%)', wash: 'rgba(52, 211, 153, 0.14)', glow: 'rgba(52, 211, 153, 0.18)' };
    if (d.includes('device') || d.includes('robot') || d.includes('iot'))
        return { ink: '#7dd3fc', wash: 'rgba(56, 189, 248, 0.14)', glow: 'rgba(56, 189, 248, 0.18)' };
    if (d.includes('diagn') || d.includes('ai') || d.includes('ml'))
        return { ink: 'var(--brand-soft-text)', wash: 'rgba(34, 211, 102, 0.14)', glow: 'rgba(34, 211, 102, 0.18)' };
    // Default — brand green
    return { ink: 'var(--brand-soft-text)', wash: 'rgba(34, 211, 102, 0.12)', glow: 'rgba(34, 211, 102, 0.16)' };
};

const MS_PER_DAY = 86400000;
const INITIAL_DASHBOARD_NOW = Date.now();

/* Feed card — extracted so each card can own its own useTilt handlers.
   The Link itself wears the premium-card class and a halo overlay so the
   spotlight and shine sweep land directly on the card surface (the outer
   motion wrapper exists only for layout/exit animation). */
const DashFeedCard = ({
    animReady, index, post, status, isSaved, accent,
    isLocalMatch, matchExplanation, domainIconNode, onToggleBookmark,
}) => {
    const tilt = useTilt({ max: 5, scale: 1.012 });
    return (
        <motion.div
            layout
            initial={animReady ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45, delay: Math.min(index * 0.04, 0.3), ease: [0.22, 1, 0.36, 1] }}
        >
            <div style={{ position: 'relative' }}>
                <Link
                    {...tilt}
                    to={`/post/${post.id}`}
                    className="editorial-card dash-feed-card premium-card premium-card--halo"
                    style={{
                        '--card-accent-ink': accent.ink,
                        '--card-accent-wash': accent.wash,
                        '--card-accent-glow': accent.glow,
                        '--pc-glow': accent.glow,
                        '--pc-glow-soft': accent.wash,
                    }}
                >
                    <span className="premium-card-halo" aria-hidden="true" />
                    <div className="card-visual" style={{
                        background: `radial-gradient(ellipse 70% 90% at 50% 50%, ${accent.glow}, transparent 70%), linear-gradient(135deg, rgba(26, 24, 30, 0.7), rgba(10, 10, 14, 0.5))`,
                    }}>
                        <div className="visual-glow" style={{ background: `radial-gradient(circle at 30% 30%, ${accent.glow}, transparent 60%)` }} />
                        <div style={{ position: 'relative', zIndex: 1, color: accent.ink }}>
                            {domainIconNode}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: 0, position: 'relative', zIndex: 3 }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', alignItems: 'center' }}>
                            <span className="pill pill-neon">
                                {post.authorRole === 'Engineer' ? 'Engineer' : 'Healthcare Professional'}
                            </span>
                            <span className="pill pill-dim" style={{ textTransform: 'uppercase' }}>
                                {post.domain}
                            </span>
                            <span className={`pill ${status.cls}`}>{status.label}</span>
                            {isLocalMatch && (
                                <span className="pill pill-cyan" style={{ animation: 'statusPulse 2.4s infinite' }}>
                                    <MapPin size={10} /> Local
                                </span>
                            )}
                        </div>

                        <h2
                            className="card-title"
                            style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: 'clamp(22px, 2.2vw, 28px)',
                                fontWeight: 600,
                                letterSpacing: '-0.03em',
                                lineHeight: '1.12',
                                color: 'var(--text-main)',
                                marginTop: '2px'
                            }}
                        >
                            {post.title}
                        </h2>

                        <p style={{
                            color: 'var(--text-muted)', fontSize: '14px',
                            lineHeight: '1.7', letterSpacing: '-0.005em',
                            display: '-webkit-box', WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical', overflow: 'hidden',
                            maxWidth: '640px'
                        }}>
                            {post.explanation}
                        </p>

                        {matchExplanation && (
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                color: 'var(--brand-soft-text)', fontSize: '11.5px', fontWeight: '600',
                                letterSpacing: '0.04em',
                                textTransform: 'uppercase',
                                alignSelf: 'flex-start'
                            }}>
                                <Sparkles size={12} /> Match · {matchExplanation}
                            </div>
                        )}

                        <div style={{
                            display: 'flex', flexWrap: 'wrap', gap: '20px',
                            alignItems: 'center', justifyContent: 'space-between',
                            marginTop: '8px',
                            paddingTop: '18px',
                            borderTop: '1px solid var(--border)'
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
                                    background: `linear-gradient(135deg, ${accent.ink}, color-mix(in srgb, ${accent.ink} 70%, transparent))`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: '700', fontSize: '13px', color: 'var(--fg-on-accent)',
                                    flexShrink: 0,
                                    boxShadow: `0 6px 16px -4px ${accent.glow}, inset 0 1px 0 rgba(255,255,255,0.2)`
                                }}>
                                    {(post.authorName || '?').charAt(0)}
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
                                        <Calendar size={10} /> {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{
                        display: 'flex', alignItems: 'center',
                        alignSelf: 'stretch', paddingLeft: '8px',
                        borderLeft: '1px dashed var(--border)',
                        position: 'relative', zIndex: 3
                    }} className="cta-slot">
                        <span className="card-cta">
                            Explore <ArrowUpRight size={14} strokeWidth={2.5} />
                        </span>
                    </div>
                </Link>

                <button
                    onClick={onToggleBookmark}
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
};

/* Stat tile — its own component so each instance gets its own useTilt
   handler set (hooks can't be looped in render). The premium-card class
   layers spotlight + soft glow on top of the existing tone-* style. */
const DashStatCard = ({ icon: Icon, label, value, tone, index }) => {
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
                    <AnimatedCounter value={value} duration={850 + index * 100} />
                </span>
                <span className="dash-stat-label">{label}</span>
            </div>
        </motion.div>
    );
};

const Dashboard = ({ posts, user, updateUser, toggleSavedPost, postsLoading = false }) => {
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

    useEffect(() => {
        const id = window.setInterval(() => setNow(Date.now()), 60000);
        return () => window.clearInterval(id);
    }, []);

    const savedPostIds = useMemo(() => user?.savedPosts || [], [user?.savedPosts]);

    const toggleBookmark = async (e, postId) => {
        e.preventDefault();
        e.stopPropagation();
        const wasSaved = savedPostIds.includes(postId);
        try {
            if (toggleSavedPost) {
                await toggleSavedPost(postId);
            } else {
                // Legacy fallback if the prop isn't wired (older route configs).
                const updatedSaved = wasSaved
                    ? savedPostIds.filter(id => id !== postId)
                    : [...savedPostIds, postId];
                updateUser({ savedPosts: updatedSaved });
            }
            toast.success(wasSaved ? 'Removed from saved' : 'Saved to bookmarks', {
                title: wasSaved ? 'Unsaved' : 'Saved'
            });
        } catch (err) {
            console.error('toggleBookmark failed:', err);
            toast.error('Could not update your bookmarks. Please retry.', { title: 'Bookmark failed' });
        }
    };

    const allDomains = useMemo(() => ['All', ...new Set(posts.map(p => p.domain))], [posts]);
    const stages = ['All', 'idea', 'concept validation', 'prototype developed', 'pilot testing', 'pre-deployment'];
    const countries = useMemo(() => ['All', ...new Set(posts.map(p => p.country).filter(Boolean))], [posts]);
    const cities = useMemo(() => ['All', ...new Set(posts.map(p => p.city).filter(Boolean))], [posts]);
    const statuses = ['All', 'Active', 'Meeting Scheduled', 'CLOSED', 'Expired'];

    const filteredPosts = useMemo(() => {
        return posts.filter(post => {
            if (post.status === 'DELETED') return false;
            // Drafts are private to the author — they must never leak into the
            // public feed even when the user picks "All" from the status filter.
            if (post.status === 'Draft' && post.authorId !== user?.id) return false;
            if (filterStatus !== 'All' && post.status !== filterStatus) return false;
            if (searchTerm) {
                const q = searchTerm.toLowerCase();
                if (!(post.title || '').toLowerCase().includes(q) &&
                    !(post.explanation || '').toLowerCase().includes(q) &&
                    !(post.domain || '').toLowerCase().includes(q) &&
                    !(post.expertiseNeeded || '').toLowerCase().includes(q)) return false;
            }
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
    // The "pending meetings" tile previously read `p.meetings` from the parent
    // doc, but meetings live in a /posts/{id}/meetings subcollection now —
    // the parent only carries the denormalized counter `meetingCount`. We
    // approximate "engagement" with that counter so the tile is meaningful
    // again without subscribing to N subcollections from the feed view.
    //
    // "Live" excludes DELETED, Draft, and Expired so every counter answers
    // "things you can act on right now". The previous shape only excluded
    // DELETED, which made "New this week" count Drafts that the feed itself
    // hides — leading to the disconnect of "1 new" with zero new visible.
    const stats = useMemo(() => {
        const livePosts = posts.filter(p =>
            p.status !== 'DELETED' && p.status !== 'Draft' && p.status !== 'Expired'
        );
        const active = livePosts.filter(p => p.status === 'Active').length;
        const newThisWeek = livePosts.filter(p => {
            const created = new Date(p.createdAt).getTime();
            return Number.isFinite(created) && (now - created) < (7 * MS_PER_DAY);
        }).length;
        const saved = savedPostIds.length;
        const engagedActive = livePosts.filter(p =>
            p.status === 'Active' && ((p.meetingCount || 0) > 0 || (p.interestCount || 0) > 0)
        ).length;
        return { active, newThisWeek, saved, engagedActive };
    }, [posts, savedPostIds, now]);

    // ---- Trending domains — top 4 by ACTIVE post count ----
    // The trending sidebar is a discovery affordance: clicking a row should
    // land the user on actual posts. Counting CLOSED/Meeting Scheduled posts
    // would inflate the numbers for projects that are no longer accepting
    // collaborators, so we restrict to Active. (Drafts/Expired/Deleted were
    // already excluded.)
    const trendingDomains = useMemo(() => {
        const counts = new Map();
        posts.forEach(p => {
            if (p.status !== 'Active') return;
            if (!p.domain) return;
            counts.set(p.domain, (counts.get(p.domain) || 0) + 1);
        });
        return Array.from(counts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([name, count]) => ({ name, count }));
    }, [posts]);

    // Clicking a trending row sets the domain filter AND clears Status back to
    // "All" so the user actually sees the matched projects (the default
    // Status:Active is fine because trendingDomains itself is Active-only,
    // but switching to All keeps the click promise true even if a domain's
    // last Active post just flipped to Meeting Scheduled mid-session).
    const onTrendingClick = (name) => {
        if (filterDomain === name) {
            setFilterDomain('All');
        } else {
            setFilterDomain(name);
            setFilterStatus('All');
        }
    };

    // ---- Recent activity — last 5 user-visible posts ----
    // Mirrors the feed's exclusion rules so what the sidebar previews matches
    // what the user can actually open.
    const recentActivity = useMemo(() => {
        return [...posts]
            .filter(p =>
                p.status !== 'DELETED' && p.status !== 'Draft' && p.status !== 'Expired'
            )
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);
    }, [posts]);

    const isLocalMatch = (post) => {
        return user?.city && post.city && user.city.toLowerCase() === post.city.toLowerCase();
    };

    // Naive keyword tokenizer that strips punctuation, drops short fillers, and
    // returns a Set so overlap is O(min(a, b)). Brief 4.3 explicitly asks for
    // "shared expertise tags" surfaced in the match explanation, but the data
    // model carries plain free-text expertise fields rather than discrete tags
    // — so we tokenize on the fly. Tokens shorter than 4 chars are skipped to
    // avoid noise like "and", "for", "the".
    const STOP_WORDS = new Set([
        'with', 'that', 'this', 'from', 'into', 'have', 'been', 'their', 'will',
        'would', 'could', 'should', 'about', 'using', 'work', 'team', 'need',
        'looking', 'experience', 'expertise', 'skills', 'knowledge', 'background',
    ]);
    const tokenize = (text = '') => {
        const set = new Set();
        text.toLowerCase()
            .replace(/[^a-z0-9\s+#.-]/g, ' ')
            .split(/\s+/)
            .forEach(tok => {
                const t = tok.replace(/^[.+#-]+|[.+#-]+$/g, '');
                if (t.length >= 4 && !STOP_WORDS.has(t)) set.add(t);
            });
        return set;
    };

    // Shared tokens between the post's "expertise needed" and what the user
    // wrote in their own bio/profile. We don't have a structured profile bio,
    // so we approximate the viewer's profile by combining domain interests
    // they've engaged with. As a fallback we still highlight cross-role +
    // city matches even when there is no token overlap.
    const sharedExpertiseTags = (post) => {
        if (!post.expertiseNeeded) return [];
        const postTokens = tokenize(post.expertiseNeeded);
        // Approximate user expertise from their own posts (their authored work
        // is the strongest signal we have without a formal profile bio field).
        const userText = (posts || [])
            .filter(p => p.authorId === user?.id)
            .map(p => `${p.domain} ${p.expertiseNeeded || ''} ${p.explanation || ''}`)
            .join(' ');
        if (!userText) return [];
        const userTokens = tokenize(userText);
        const shared = [];
        for (const t of postTokens) {
            if (userTokens.has(t)) shared.push(t);
            if (shared.length >= 3) break;
        }
        return shared;
    };

    const getMatchExplanation = (post) => {
        const reasons = [];
        if (isLocalMatch(post)) reasons.push('Same city');
        if (post.authorRole !== user?.role) reasons.push('Complementary role');
        const shared = sharedExpertiseTags(post);
        if (shared.length > 0) reasons.push(`Shared: ${shared.join(', ')}`);
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
                    { icon: Clock, label: 'In conversation', value: stats.engagedActive, tone: 'violet' },
                ].map((s, i) => {
                    const Icon = s.icon;
                    return (
                        <DashStatCard key={s.label} icon={Icon} label={s.label} value={s.value} tone={s.tone} index={i} />
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
                        <div className="dash-result-pill">
                            <Filter size={11} /> {filteredPosts.length} {filteredPosts.length === 1 ? 'result' : 'results'}
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
                                            initial={false}
                                            transition={{ type: 'spring', stiffness: 380, damping: 32, mass: 0.8 }}
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

                <div className="filter-row" style={{ marginTop: 12, alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                    {[
                        { id: 'domain', value: filterDomain, setter: setFilterDomain, opts: allDomains, label: 'Domain' },
                        { id: 'stage', value: filterStage, setter: setFilterStage, opts: stages, label: 'Stage' },
                        { id: 'country', value: filterCountry, setter: setFilterCountry, opts: countries, label: 'Country' },
                        { id: 'city', value: filterCity, setter: setFilterCity, opts: cities, label: 'City' },
                        { id: 'status', value: filterStatus, setter: setFilterStatus, opts: statuses, label: 'Status' },
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
                        />
                    ))}
                    {(searchTerm || filterDomain !== 'All' || filterStage !== 'All' || filterCountry !== 'All' || filterCity !== 'All' || filterStatus !== 'Active') && (
                        <button
                            type="button"
                            id="clear-filters-btn"
                            onClick={() => {
                                setSearchTerm('');
                                setFilterDomain('All');
                                setFilterStage('All');
                                setFilterCountry('All');
                                setFilterCity('All');
                                setFilterStatus('Active');
                            }}
                            className="px-btn ghost sm"
                            style={{ marginLeft: 'auto' }}
                        >
                            <X size={13} /> Clear filters
                        </button>
                    )}
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
                            {/* Brand-green ambient glow */}
                            <div aria-hidden="true" style={{
                                position: 'absolute', inset: 0, pointerEvents: 'none',
                                background: 'radial-gradient(ellipse 60% 50% at 30% 30%, rgba(34, 211, 102, 0.10), transparent 60%), radial-gradient(ellipse 55% 45% at 80% 80%, rgba(34, 211, 238, 0.06), transparent 65%)',
                            }} />
                            <div style={{
                                position: 'relative',
                                width: 72, height: 72, margin: '0 auto 22px',
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                borderRadius: 20,
                                background: 'linear-gradient(135deg, rgba(34, 211, 102, 0.16), rgba(34, 211, 238, 0.10))',
                                border: '1px solid rgba(34, 211, 102, 0.18)',
                                color: 'var(--brand-soft-text)',
                                boxShadow: 'var(--shadow-warm-sm)',
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
                                <DashFeedCard
                                    key={post.id}
                                    animReady={animReady}
                                    index={index}
                                    post={post}
                                    status={status}
                                    isSaved={isSaved}
                                    accent={accent}
                                    isLocalMatch={isLocalMatch(post)}
                                    matchExplanation={getMatchExplanation(post)}
                                    domainIconNode={domainIcon(post.domain)}
                                    onToggleBookmark={(e) => toggleBookmark(e, post.id)}
                                />
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
                                            onClick={() => onTrendingClick(d.name)}
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
