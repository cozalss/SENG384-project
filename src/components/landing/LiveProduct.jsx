import { motion } from 'framer-motion';
import {
    FileText, Search, ShieldCheck, Video, Sparkles,
    MapPin, Briefcase, Lock, Calendar, ArrowRight, CheckCircle2,
} from 'lucide-react';

/**
 * LiveProduct — three platform mockups floating together in space.
 *
 * Replaces the prior "How it works" 4-step list. The thesis here is the
 * same (Post → Discover → Partner Found) but expressed as actual product
 * UI mockups instead of prose. Each panel is a frozen moment of the real
 * application — written with the same Sora/charcoal/green vocabulary the
 * rest of the site uses, so the section feels like a press shot of the
 * product rather than a marketing illustration.
 *
 * The panels are absolutely placed and slightly rotated so they read as
 * a stack of physical screens caught mid-flight. Soft animated fiber
 * lines connect them, signaling the workflow without prose.
 */

const cardEnter = (delay) => ({
    initial: { opacity: 0, y: 24, scale: 0.95 },
    whileInView: { opacity: 1, y: 0, scale: 1 },
    viewport: { once: true, margin: '-120px' },
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
});

const PostPanel = () => (
    <motion.div className="lp-card lp-card--post" {...cardEnter(0.05)}>
        <div className="lp-card-bar">
            <span className="lp-card-bar-eyebrow">
                <FileText size={11} /> Create Post
            </span>
            <span className="lp-card-bar-stamp">DRAFT</span>
        </div>

        <div className="lp-field">
            <label>Title</label>
            <div className="lp-input lp-input--filled">
                AI support tool for clinic intake workflow
                <span className="lp-typer-caret" />
            </div>
        </div>

        <div className="lp-field-row">
            <div className="lp-field">
                <label>Domain</label>
                <div className="lp-input lp-input--small">Cardiology</div>
            </div>
            <div className="lp-field">
                <label>City</label>
                <div className="lp-input lp-input--small">
                    <MapPin size={10} /> New York
                </div>
            </div>
            <div className="lp-field">
                <label>Stage</label>
                <div className="lp-input lp-input--small">
                    <Briefcase size={10} /> Pilot
                </div>
            </div>
        </div>

        <div className="lp-field">
            <label>Looking for</label>
            <div className="lp-tags">
                <span>Frontend prototype</span>
                <span>Clinical workflow feedback</span>
                <span>Data visualization</span>
            </div>
        </div>

        <div className="lp-field">
            <label>Confidential detail</label>
            <div className="lp-locked">
                <Lock size={11} /> Optional blueprint locked by NDA
            </div>
        </div>

        <button className="lp-cta lp-cta--publish" type="button" tabIndex={-1}>
            <span>Publish Announcement</span>
            <ArrowRight size={14} />
        </button>
    </motion.div>
);

const DiscoverPanel = () => (
    <motion.div className="lp-card lp-card--feed" {...cardEnter(0.18)}>
        <div className="lp-card-bar">
            <span className="lp-card-bar-eyebrow">
                <Search size={11} /> Dashboard Feed
            </span>
            <span className="lp-card-bar-counter">Filtered results</span>
        </div>

        <div className="lp-filters">
            <span className="lp-chip lp-chip--active">All posts</span>
            <span className="lp-chip">Same city</span>
            <span className="lp-chip">AI Diagnostics</span>
            <span className="lp-chip">Pilot</span>
        </div>

        <div className="lp-feed">
            <div className="lp-feed-card lp-feed-card--match">
                <div className="lp-feed-card-head">
                    <span className="lp-feed-tag lp-feed-tag--clinic">Cardiology</span>
                    <span className="lp-feed-time">Active</span>
                    <span className="lp-feed-pulse" aria-hidden="true" />
                </div>
                <div className="lp-feed-title">AI support tool for clinic intake workflow</div>
                <div className="lp-feed-meta">
                    <MapPin size={10} /> New York
                    <span>•</span>
                    <Briefcase size={10} /> Pilot
                    <span className="lp-feed-new">ROLE FIT</span>
                </div>
                <button className="lp-feed-cta" type="button" tabIndex={-1}>
                    Express Interest <ArrowRight size={12} />
                </button>
            </div>

            <div className="lp-feed-card lp-feed-card--dim">
                <div className="lp-feed-card-head">
                    <span className="lp-feed-tag lp-feed-tag--robot">Surgical robotics</span>
                    <span className="lp-feed-time">Saved</span>
                </div>
                <div className="lp-feed-title">Rehabilitation exercise tracking dashboard</div>
                <div className="lp-feed-meta">
                    <MapPin size={10} /> London · <Briefcase size={10} /> Research
                </div>
            </div>

            <div className="lp-feed-card lp-feed-card--dim">
                <div className="lp-feed-card-head">
                    <span className="lp-feed-tag lp-feed-tag--rad">Radiology</span>
                    <span className="lp-feed-time">Open</span>
                </div>
                <div className="lp-feed-title">Remote monitoring notification workflow</div>
                <div className="lp-feed-meta">
                    <MapPin size={10} /> Izmir · <Briefcase size={10} /> Concept
                </div>
            </div>
        </div>
    </motion.div>
);

const MeetPanel = () => (
    <motion.div className="lp-card lp-card--meet" {...cardEnter(0.32)}>
        <div className="lp-card-bar">
            <span className="lp-card-bar-eyebrow">
                <Video size={11} /> Meeting Request
            </span>
            <span className="lp-card-bar-success">
                <CheckCircle2 size={11} /> Accepted
            </span>
        </div>

        <div className="lp-avatars">
            <div className="lp-avatar lp-avatar--clinic" aria-hidden="true">
                <svg viewBox="0 0 48 48">
                    <defs>
                        <linearGradient id="lp-av-c" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="hsl(180 75% 60%)" />
                            <stop offset="100%" stopColor="hsl(180 75% 40%)" />
                        </linearGradient>
                    </defs>
                    <circle cx="24" cy="24" r="22" fill="url(#lp-av-c)" />
                    <text x="24" y="29" textAnchor="middle" fontFamily="Sora, sans-serif" fontWeight="700" fontSize="15" fill="#0a1210">DR</text>
                </svg>
                <span className="lp-avatar-tag">Clinician</span>
            </div>
            <div className="lp-link-fiber" aria-hidden="true">
                <ShieldCheck size={14} />
            </div>
            <div className="lp-avatar lp-avatar--engineer" aria-hidden="true">
                <svg viewBox="0 0 48 48">
                    <defs>
                        <linearGradient id="lp-av-e" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="hsl(119 99% 60%)" />
                            <stop offset="100%" stopColor="hsl(119 99% 40%)" />
                        </linearGradient>
                    </defs>
                    <circle cx="24" cy="24" r="22" fill="url(#lp-av-e)" />
                    <text x="24" y="29" textAnchor="middle" fontFamily="Sora, sans-serif" fontWeight="700" fontSize="15" fill="#0a1210">EN</text>
                </svg>
                <span className="lp-avatar-tag">Engineer</span>
            </div>
        </div>

        <div className="lp-meta-row">
            <div className="lp-meta">
                <Calendar size={11} />
                <div>
                    <span className="lp-meta-label">Selected slot</span>
                    <span className="lp-meta-value">External Zoom / Teams meeting</span>
                </div>
            </div>
        </div>

        <div className="lp-platform-row">
            <div className="lp-platform-icon">
                <Video size={14} />
            </div>
            <div>
                <span className="lp-meta-label">Zoom / Teams · External</span>
                <span className="lp-meta-value">HEALTH AI stores only the meeting request status</span>
            </div>
        </div>

        <div className="lp-trail">
            <span className="lp-trail-step is-done"><CheckCircle2 size={10} /> Interest sent</span>
            <span className="lp-trail-step is-done"><CheckCircle2 size={10} /> NDA accepted</span>
            <span className="lp-trail-step is-active"><CheckCircle2 size={10} /> Meeting slot accepted</span>
        </div>
    </motion.div>
);

const LiveProduct = () => {
    return (
        <section className="lp-section landing-cinema-section" aria-labelledby="lp-heading">
            <div className="lp-inner">
                <motion.div
                    className="lp-header"
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-120px' }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                    <span className="lp-eyebrow">
                        <Sparkles size={11} /> The Product
                    </span>
                    <h2 id="lp-heading" className="lp-heading">
                        Three screens. <em>One project flow.</em>
                    </h2>
                    <p className="lp-sub">
                        Create an announcement, discover a complementary role, accept the NDA when needed, propose a meeting, and continue in chat.
                    </p>
                </motion.div>

                <div className="lp-stage">
                    <div className="lp-stage-signal" aria-hidden="true">
                        <svg viewBox="0 0 900 260" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="lp-stage-ecg" x1="0%" x2="100%">
                                    <stop offset="0%" stopColor="hsl(180 75% 65%)" stopOpacity="0" />
                                    <stop offset="35%" stopColor="hsl(119 99% 56%)" stopOpacity="0.68" />
                                    <stop offset="72%" stopColor="hsl(180 75% 65%)" stopOpacity="0.58" />
                                    <stop offset="100%" stopColor="hsl(180 75% 65%)" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <g className="lp-stage-signal-grid">
                                {Array.from({ length: 7 }).map((_, i) => (
                                    <line key={`h-${i}`} x1="0" x2="900" y1={32 + i * 32} y2={32 + i * 32} />
                                ))}
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <line key={`v-${i}`} y1="0" y2="260" x1={40 + i * 74} x2={40 + i * 74} />
                                ))}
                            </g>
                            <path
                                className="lp-stage-signal-path"
                                d="M 0 138 L 120 138 L 142 108 L 166 168 L 195 138 L 345 138 L 372 76 L 416 208 L 454 138 L 610 138 L 638 104 L 670 174 L 704 138 L 900 138"
                            />
                        </svg>
                    </div>
                    {/* Connecting fiber line behind the panels */}
                    <svg
                        className="lp-stage-fiber"
                        viewBox="0 0 1200 480"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                    >
                        <defs>
                            <linearGradient id="lp-fiber-grad" x1="0%" x2="100%">
                                <stop offset="0%" stopColor="hsl(119 99% 56%)" stopOpacity="0" />
                                <stop offset="50%" stopColor="hsl(119 99% 56%)" stopOpacity="0.7" />
                                <stop offset="100%" stopColor="hsl(119 99% 56%)" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <path
                            d="M 100 380 C 360 380, 460 80, 600 240 S 900 380, 1100 100"
                            fill="none"
                            stroke="rgba(34, 211, 102, 0.10)"
                            strokeWidth="1.5"
                            strokeDasharray="4 8"
                        />
                        <path
                            d="M 100 380 C 360 380, 460 80, 600 240 S 900 380, 1100 100"
                            fill="none"
                            stroke="url(#lp-fiber-grad)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeDasharray="320"
                            style={{ animation: 'lp-fiber-flow 5s linear infinite' }}
                        />
                    </svg>

                    <div className="lp-stage-grid">
                        <PostPanel />
                        <DiscoverPanel />
                        <MeetPanel />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LiveProduct;
