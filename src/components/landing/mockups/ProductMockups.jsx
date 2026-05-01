import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import {
    Activity, Brain, Watch, Pill, FlaskConical,
    BarChart3, Cog, ChevronDown, Check, Lock, Search, MapPin,
    CalendarCheck, Clock, ArrowRight, X, Globe2,
} from 'lucide-react';

const SERIF = "'Instrument Serif', serif";
const BARLOW = "'Barlow', sans-serif";

/* ============================================================
   BROWSER CHROME — wraps every mockup so it reads as "a peek
   into the product" rather than "a card on a marketing page".
   ============================================================ */
export const BrowserChrome = ({ url = 'healthai.app', children, className = '' }) => (
    <div className={`px-mock-chrome liquid-glass ${className}`} aria-hidden="true">
        <div className="px-mock-chrome-bar">
            <span className="px-mock-dot" style={{ background: '#ff5f57' }} />
            <span className="px-mock-dot" style={{ background: '#febc2e' }} />
            <span className="px-mock-dot" style={{ background: '#28c840' }} />
            <div className="px-mock-url" style={{ fontFamily: BARLOW }}>
                <Lock size={11} strokeWidth={2.2} />
                <span>{url}</span>
            </div>
            <span className="px-mock-chrome-spacer" />
        </div>
        <div className="px-mock-chrome-body">{children}</div>
    </div>
);

/* ============================================================
   1) WIZARD MOCKUP — stylised CreatePost step 1.
   Uses the real WizardProgress visual and the real domain/stage
   data so the mockup matches what a signed-in user actually sees.
   ============================================================ */
const DOMAINS = [
    { v: 'Telemedicine', icon: <Activity size={14} strokeWidth={1.7} /> },
    { v: 'AI Diagnostics', icon: <Brain size={14} strokeWidth={1.7} /> },
    { v: 'Wearable Tech', icon: <Watch size={14} strokeWidth={1.7} /> },
    { v: 'Genomics', icon: <FlaskConical size={14} strokeWidth={1.7} /> },
    { v: 'Mental Health Tech', icon: <Brain size={14} strokeWidth={1.7} /> },
    { v: 'Surgical Robotics', icon: <Cog size={14} strokeWidth={1.7} /> },
    { v: 'Drug Discovery', icon: <Pill size={14} strokeWidth={1.7} /> },
    { v: 'Health Data Analytics', icon: <BarChart3 size={14} strokeWidth={1.7} /> },
];

const STAGES = [
    { v: 'idea', label: 'Idea', desc: 'Conceptual' },
    { v: 'concept', label: 'Concept', desc: 'Validating' },
    { v: 'prototype', label: 'Prototype', desc: 'MVP exists' },
    { v: 'pilot', label: 'Pilot', desc: 'Live testing' },
    { v: 'pre-deploy', label: 'Pre-deploy', desc: 'Market-ready' },
];

export const WizardMockup = () => {
    return (
        <BrowserChrome url="healthai.app/create">
            <div className="px-mock-wizard">
                {/* Wizard progress strip */}
                <div className="px-mock-wiz-progress">
                    <div className="px-mock-wiz-track">
                        <div className="px-mock-wiz-fill" style={{ width: '33%' }} />
                    </div>
                    <div className="px-mock-wiz-steps" style={{ fontFamily: BARLOW }}>
                        <span className="px-mock-wiz-step is-active"><i>1</i> Core details</span>
                        <span className="px-mock-wiz-step"><i>2</i> Technical info</span>
                        <span className="px-mock-wiz-step"><i>3</i> Settings</span>
                    </div>
                </div>

                {/* Title input */}
                <label className="px-mock-field">
                    <span className="px-mock-label" style={{ fontFamily: BARLOW }}>Project title</span>
                    <span className="px-mock-input">
                        <span className="px-mock-input-text">ML-Based ECG Anomaly Detection for Rural Clinics</span>
                        <span className="px-mock-caret" />
                    </span>
                </label>

                {/* Domain pseudo-select */}
                <label className="px-mock-field">
                    <span className="px-mock-label" style={{ fontFamily: BARLOW }}>Domain</span>
                    <span className="px-mock-select">
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            <Brain size={14} strokeWidth={1.7} /> AI Diagnostics
                        </span>
                        <ChevronDown size={14} strokeWidth={1.8} />
                    </span>
                </label>

                {/* Stage tiles row */}
                <div className="px-mock-field">
                    <span className="px-mock-label" style={{ fontFamily: BARLOW }}>Project stage</span>
                    <div className="px-mock-stage-row">
                        {STAGES.map((s) => (
                            <span
                                key={s.v}
                                className={`px-mock-stage${s.v === 'prototype' ? ' is-selected' : ''}`}
                                style={{ fontFamily: BARLOW }}
                            >
                                <span className="px-mock-stage-label">{s.label}</span>
                                <span className="px-mock-stage-desc">{s.desc}</span>
                            </span>
                        ))}
                    </div>
                </div>

                <div className="px-mock-wiz-actions">
                    <span className="px-mock-btn-ghost" style={{ fontFamily: BARLOW }}>Save draft</span>
                    <span className="px-mock-btn-primary" style={{ fontFamily: BARLOW }}>
                        Continue <ArrowRight size={14} strokeWidth={2} />
                    </span>
                </div>
            </div>
        </BrowserChrome>
    );
};

/* ============================================================
   2) FEED MOCKUP — stylised Dashboard with filter row + 3 cards.
   ============================================================ */
const FEED_POSTS = [
    {
        title: 'AI support tool for clinic intake workflow',
        author: 'Healthcare Professional · New York',
        domain: 'AI Diagnostics',
        stage: 'Prototype',
        loc: 'New York, US',
        hours: 14,
    },
    {
        title: 'Patient follow-up dashboard needs frontend support',
        author: 'Engineer / Developer · London',
        domain: 'Wearable Tech',
        stage: 'Pilot',
        loc: 'London, UK',
        hours: 31,
    },
    {
        title: 'Radiology workflow idea looking for ML review',
        author: 'Healthcare Professional · Izmir',
        domain: 'AI Diagnostics',
        stage: 'Concept',
        loc: 'Izmir, TR',
        hours: 62,
    },
];

export const FeedMockup = () => (
    <BrowserChrome url="healthai.app/dashboard">
        <div className="px-mock-feed">
            {/* Filter chip row */}
            <div className="px-mock-filter-row">
                <span className="px-mock-filter-pill is-active" style={{ fontFamily: BARLOW }}>
                    <Search size={12} strokeWidth={1.8} /> Engineer posts
                </span>
                <span className="px-mock-filter-pill" style={{ fontFamily: BARLOW }}>
                    AI Diagnostics
                </span>
                <span className="px-mock-filter-pill" style={{ fontFamily: BARLOW }}>
                    Pilot
                </span>
                <span className="px-mock-filter-pill" style={{ fontFamily: BARLOW }}>
                    <MapPin size={12} strokeWidth={1.8} /> Turkey
                </span>
            </div>

            {/* Post cards */}
            <div className="px-mock-feed-list">
                {FEED_POSTS.map((p) => (
                    <article key={p.title} className="px-mock-post liquid-glass">
                        <header className="px-mock-post-head">
                            <span className="px-mock-domain-tag" style={{ fontFamily: BARLOW }}>{p.domain}</span>
                            <span className="px-mock-stage-tag" style={{ fontFamily: BARLOW }}>{p.stage}</span>
                            <span className="px-mock-time" style={{ fontFamily: BARLOW }}>{p.hours}h ago</span>
                        </header>
                        <h4 className="px-mock-post-title" style={{ fontFamily: SERIF }}>{p.title}</h4>
                        <footer className="px-mock-post-foot" style={{ fontFamily: BARLOW }}>
                            <span>{p.author}</span>
                            <span className="px-mock-post-loc"><MapPin size={11} strokeWidth={1.8} /> {p.loc}</span>
                        </footer>
                    </article>
                ))}
            </div>
        </div>
    </BrowserChrome>
);

/* ============================================================
   3) NDA MOCKUP — modal-like card. The four real clauses tick
   themselves on as the section enters the viewport so the user
   visually experiences the gate.
   ============================================================ */
const NDA_CLAUSES = [
    'Intellectual property — both sides protect IP from disclosure.',
    'Conceptual schematics — diagrams shared off-platform stay confidential.',
    'Clinical methodologies — patient-data and protocols are NDA-bound.',
    'Two-sided consent — the author also accepts before any reply is sent.',
];

export const NDAMockup = () => {
    const wrapRef = useRef(null);
    const inView = useInView(wrapRef, { once: true, margin: '-80px' });
    const [tickedCount, setTickedCount] = useState(0);

    useEffect(() => {
        if (!inView) return;
        let cancelled = false;
        let i = 0;
        const tick = () => {
            if (cancelled) return;
            i += 1;
            setTickedCount(i);
            if (i < NDA_CLAUSES.length) setTimeout(tick, 380);
        };
        const t = setTimeout(tick, 280);
        return () => { cancelled = true; clearTimeout(t); };
    }, [inView]);

    const allChecked = tickedCount >= NDA_CLAUSES.length;

    return (
        <div ref={wrapRef} className="px-mock-nda-wrap">
            <BrowserChrome url="healthai.app/post/2814">
                <div className="px-mock-nda-bg">
                    <div className="px-mock-nda-modal liquid-glass">
                        <header className="px-mock-nda-head">
                            <span className="px-mock-nda-icon liquid-glass">
                                <Lock size={16} strokeWidth={1.7} />
                            </span>
                            <div>
                                <span className="px-mock-nda-eyebrow" style={{ fontFamily: BARLOW }}>// Platform NDA</span>
                                <h4 className="px-mock-nda-title" style={{ fontFamily: SERIF }}>Sign before message one.</h4>
                            </div>
                            <span className="px-mock-nda-x" aria-hidden="true"><X size={14} strokeWidth={2} /></span>
                        </header>

                        <ul className="px-mock-nda-list">
                            {NDA_CLAUSES.map((c, i) => (
                                <li key={c} className={i < tickedCount ? 'is-checked' : ''}>
                                    <span className="px-mock-nda-check">
                                        {i < tickedCount && <Check size={12} strokeWidth={2.4} />}
                                    </span>
                                    <span style={{ fontFamily: BARLOW }}>{c}</span>
                                </li>
                            ))}
                        </ul>

                        <footer className="px-mock-nda-foot">
                            <span className="px-mock-btn-ghost" style={{ fontFamily: BARLOW }}>Decline</span>
                            <span
                                className={`px-mock-btn-primary px-mock-nda-cta${allChecked ? ' is-ready' : ''}`}
                                style={{ fontFamily: BARLOW }}
                            >
                                Accept & express interest <ArrowRight size={14} strokeWidth={2} />
                            </span>
                        </footer>
                    </div>
                </div>
            </BrowserChrome>
        </div>
    );
};

/* ============================================================
   4) SLOTS MOCKUP — stylised MeetingSlotsModal with three
   slots; the second slot is "selected" and the post now reads
   "Meeting Scheduled". Visualises the off-platform handoff.
   ============================================================ */
const SLOTS = [
    { day: 'Slot A', time: '10:00', tz: 'America/New_York' },
    { day: 'Slot B', time: '14:00', tz: 'America/New_York', selected: true },
    { day: 'Slot C', time: '16:00', tz: 'America/New_York' },
];

export const SlotsMockup = () => (
    <BrowserChrome url="healthai.app/post/2814/meet">
        <div className="px-mock-slots">
            <header className="px-mock-slots-head">
                <span className="px-mock-status-pill" style={{ fontFamily: BARLOW }}>
                    <CalendarCheck size={12} strokeWidth={1.8} /> Meeting scheduled
                </span>
                <span className="px-mock-slots-eyebrow" style={{ fontFamily: BARLOW }}>// Three proposed slots</span>
            </header>

            <h4 className="px-mock-slots-title" style={{ fontFamily: SERIF }}>
                Pick a time. We never join the call.
            </h4>

            <div className="px-mock-slots-grid">
                {SLOTS.map((s) => (
                    <div key={s.day} className={`px-mock-slot liquid-glass${s.selected ? ' is-selected' : ''}`}>
                        <span className="px-mock-slot-day" style={{ fontFamily: BARLOW }}>{s.day}</span>
                        <span className="px-mock-slot-time" style={{ fontFamily: SERIF }}>{s.time}</span>
                        <span className="px-mock-slot-tz" style={{ fontFamily: BARLOW }}>
                            <Clock size={10} strokeWidth={1.8} /> {s.tz}
                        </span>
                        {s.selected && (
                            <span className="px-mock-slot-badge">
                                <Check size={10} strokeWidth={2.4} />
                            </span>
                        )}
                    </div>
                ))}
            </div>

            <div className="px-mock-slots-foot" style={{ fontFamily: BARLOW }}>
                <Globe2 size={12} strokeWidth={1.8} />
                <span>Continue on Zoom, Teams, or in person; the app keeps only the meeting request status.</span>
            </div>
        </div>
    </BrowserChrome>
);
