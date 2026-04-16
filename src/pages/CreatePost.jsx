import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, FileText, MapPin, Globe, Briefcase, Tag, Clock, LockKeyhole, Shield, Sparkles, Send, Edit3 } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

const CreatePost = ({ user, addPost }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const totalSteps = 3;

    const [formData, setFormData] = useState({
        title: '',
        domain: 'Telemedicine',
        projectStage: 'idea',
        explanation: '',
        highLevelIdea: '',
        expertiseNeeded: '',
        collaborationType: 'co-development',
        commitmentLevel: 'co-development',
        city: user?.city || '',
        country: user?.country || '',
        confidentiality: 'overview-public',
        expiryDays: 30
    });

    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const domains = ['Telemedicine', 'AI Diagnostics', 'Wearable Tech', 'Genomics', 'Mental Health Tech', 'Surgical Robotics', 'Drug Discovery', 'Health Data Analytics'];

    const stages = [
        { value: 'idea', label: 'Idea Stage', icon: '💡', desc: 'Conceptual — no implementation yet' },
        { value: 'concept validation', label: 'Concept Validation', icon: '🔬', desc: 'Researching feasibility' },
        { value: 'prototype developed', label: 'Prototype Developed', icon: '⚙️', desc: 'Working MVP exists' },
        { value: 'pilot testing', label: 'Pilot Testing', icon: '🧪', desc: 'Testing with real users' },
        { value: 'pre-deployment', label: 'Pre-Deployment', icon: '🚀', desc: 'Ready for market entry' }
    ];

    const handleSubmit = () => {
        setError('');
        if (!formData.title || !formData.explanation || !formData.expertiseNeeded) {
            setError('Please fill in all required fields (Title, Description, Required Expertise).');
            setStep(1);
            return;
        }

        const now = new Date();
        const expiry = new Date(now);
        expiry.setDate(expiry.getDate() + formData.expiryDays);

        const newPost = {
            id: `post-${Date.now()}`,
            title: formData.title,
            domain: formData.domain,
            projectStage: formData.projectStage,
            explanation: formData.explanation,
            highLevelIdea: formData.highLevelIdea,
            expertiseNeeded: formData.expertiseNeeded,
            collaborationType: formData.collaborationType,
            commitmentLevel: formData.commitmentLevel,
            city: formData.city || user?.city,
            country: formData.country || user?.country,
            confidentiality: formData.confidentiality,
            authorId: user?.id,
            authorName: user?.name,
            authorRole: user?.role,
            createdAt: now.toISOString(),
            expiryDate: expiry.toISOString(),
            status: 'Active',
            interests: [],
            meetings: []
        };

        if (addPost) {
            addPost(newPost);
        }
        setSubmitted(true);
    };

    const nextStep = () => { if (step < totalSteps) setStep(step + 1); };
    const prevStep = () => { if (step > 1) setStep(step - 1); };

    const selectStyle = {
        cursor: 'pointer', appearance: 'none', fontSize: '14px',
        padding: '14px 16px', background: 'var(--panel-light)',
        border: '1px solid var(--border)', borderRadius: '12px'
    };

    if (submitted) {
        return (
            <div className="flex justify-center items-center" style={{ minHeight: '60vh' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                    className="glass-panel text-center"
                    style={{ padding: '64px 48px', maxWidth: '500px', width: '100%', position: 'relative', overflow: 'hidden' }}
                >
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: 'linear-gradient(90deg, var(--primary), var(--accent), var(--secondary))' }} />
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', damping: 12 }}
                        style={{
                            width: '72px', height: '72px', borderRadius: '24px',
                            background: 'linear-gradient(135deg, var(--secondary), #34d399)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 24px',
                            boxShadow: '0 12px 30px rgba(16, 185, 129, 0.3)'
                        }}
                    >
                        <CheckCircle2 size={36} color="white" />
                    </motion.div>
                    <h2 style={{ fontSize: '28px', marginBottom: '12px', fontFamily: 'var(--font-heading)', letterSpacing: '-0.03em' }}>
                        Published Successfully!
                    </h2>
                    <p className="text-muted mb-8" style={{ fontSize: '15px', lineHeight: '1.7' }}>
                        Your announcement is now visible to potential cross-disciplinary partners across the network.
                    </p>
                    <div className="flex gap-3" style={{ justifyContent: 'center' }}>
                        <button onClick={() => navigate('/dashboard')} className="btn btn-accent" style={{ padding: '14px 32px', borderRadius: '14px' }}>
                            <Sparkles size={16} /> View in Feed
                        </button>
                        <button onClick={() => navigate('/my-posts')} className="btn btn-secondary" style={{ padding: '14px 24px', borderRadius: '14px' }}>
                            My Posts
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ maxWidth: '740px', margin: '0 auto', paddingBottom: '80px' }}>
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted mb-6 font-medium" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '14px' }}>
                <ArrowLeft size={16} /> Back
            </button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel"
                style={{ padding: '40px 44px 36px', position: 'relative', overflow: 'hidden' }}
            >
                {/* Top accent */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg, transparent, var(--primary), var(--accent), transparent)' }} />

                <div className="flex items-center gap-4 mb-8" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '24px' }}>
                    <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', padding: '12px', borderRadius: '16px', boxShadow: '0 6px 20px rgba(94, 210, 156,0.25)' }}>
                        <Edit3 size={24} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '24px', fontFamily: 'var(--font-heading)', letterSpacing: '-0.03em' }}>New Announcement</h1>
                        <p className="text-muted text-sm">Describe your project to find the right partner</p>
                    </div>
                </div>

                {/* Step Progress Bar */}
                <div className="flex items-center gap-4 mb-10 create-post-steps">
                    {[
                        { n: 1, label: 'Core Details' },
                        { n: 2, label: 'Technical Info' },
                        { n: 3, label: 'Settings' }
                    ].map((s, i) => (
                        <div key={s.n} className="flex items-center gap-3" style={{ flex: i < 2 ? 1 : 'unset' }}>
                            <div
                                className={`step-dot ${step === s.n ? 'step-dot-active' : step > s.n ? 'step-dot-completed' : 'step-dot-inactive'}`}
                                onClick={() => setStep(s.n)}
                                style={{ cursor: 'pointer' }}
                            >
                                {step > s.n ? <CheckCircle2 size={16} /> : s.n}
                            </div>
                            <span className="text-xs font-semibold hide-mobile" style={{ color: step >= s.n ? 'var(--text-main)' : 'var(--text-subtle)', whiteSpace: 'nowrap' }}>{s.label}</span>
                            {i < 2 && <div className={`step-line ${step > s.n ? 'step-line-active' : ''}`}></div>}
                        </div>
                    ))}
                </div>

                {/* Error */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{ background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.12)', borderLeft: '3px solid var(--error)', padding: '14px 18px', marginBottom: '24px', borderRadius: 'var(--border-radius-sm)', fontSize: '13px', color: 'var(--badge-error-text)' }}
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25 }}
                    >
                        {step === 1 && (
                            <div className="flex-col gap-4">
                                <div className="flex-col gap-2">
                                    <label className="text-sm font-semibold flex items-center gap-2"><FileText size={14} /> Title *</label>
                                    <input id="post-title-input" type="text" className="input-field" style={{ borderRadius: '12px' }} placeholder="e.g. ML-Based ECG Anomaly Detection for Rural Clinics" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                                </div>

                                <div className="flex-col gap-2">
                                    <label className="text-sm font-semibold flex items-center gap-2"><Tag size={14} /> Domain *</label>
                                    <select id="post-domain-select" className="input-field" style={selectStyle} value={formData.domain} onChange={(e) => setFormData({ ...formData, domain: e.target.value })}>
                                        {domains.map(d => <option key={d} value={d} style={{ background: 'var(--background)' }}>{d}</option>)}
                                    </select>
                                </div>

                                <div className="flex-col gap-2">
                                    <label className="text-sm font-semibold flex items-center gap-2"><Briefcase size={14} /> Project Stage *</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
                                        {stages.map(s => (
                                            <div
                                                key={s.value}
                                                onClick={() => setFormData({ ...formData, projectStage: s.value })}
                                                style={{
                                                    padding: '16px', borderRadius: '14px', cursor: 'pointer',
                                                    background: formData.projectStage === s.value ? 'rgba(94, 210, 156, 0.08)' : 'var(--background-alt)',
                                                    border: `1px solid ${formData.projectStage === s.value ? 'rgba(94, 210, 156, 0.3)' : 'rgba(255,255,255,0.06)'}`,
                                                    transition: 'all 0.25s',
                                                    boxShadow: formData.projectStage === s.value ? '0 0 20px rgba(94, 210, 156,0.08)' : 'none'
                                                }}
                                            >
                                                <div style={{ fontSize: '18px', marginBottom: '6px' }}>{s.icon}</div>
                                                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '3px', color: formData.projectStage === s.value ? '#a5b4fc' : 'var(--text-main)' }}>{s.label}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>{s.desc}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex-col gap-2">
                                    <label className="text-sm font-semibold flex items-center gap-2"><Edit3 size={14} /> Project Description *</label>
                                    <textarea id="post-description-input" className="input-field" style={{ minHeight: '120px', resize: 'vertical', borderRadius: '12px' }} placeholder="Describe the problem you're solving, initial outcomes, and ideal partner profile..." value={formData.explanation} onChange={(e) => setFormData({ ...formData, explanation: e.target.value })} required />
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="flex-col gap-4">
                                <div className="flex-col gap-2">
                                    <label className="text-sm font-semibold flex items-center gap-2"><Sparkles size={14} /> Technical Blueprint / High-Level Idea</label>
                                    <p className="text-xs text-muted mb-1" style={{ lineHeight: '1.5' }}>Optional. If confidentiality is set to "meeting-only", this will be hidden until NDA is signed.</p>
                                    <textarea className="input-field" style={{ minHeight: '100px', resize: 'vertical', borderRadius: '12px' }} placeholder="Describe technical details, methodologies, or architecture..." value={formData.highLevelIdea} onChange={(e) => setFormData({ ...formData, highLevelIdea: e.target.value })} />
                                </div>

                                <div className="flex-col gap-2">
                                    <label className="text-sm font-semibold flex items-center gap-2"><Briefcase size={14} /> Required Expertise *</label>
                                    <textarea id="post-expertise-input" className="input-field" style={{ minHeight: '80px', resize: 'vertical', borderRadius: '12px' }} placeholder="What specific expertise or role do you need from your partner?" value={formData.expertiseNeeded} onChange={(e) => setFormData({ ...formData, expertiseNeeded: e.target.value })} required />
                                </div>

                                <div className="flex-col gap-2">
                                    <label className="text-sm font-semibold flex items-center gap-2"><Tag size={14} /> Collaboration Type</label>
                                    <select className="input-field" style={selectStyle} value={formData.collaborationType} onChange={(e) => setFormData({ ...formData, collaborationType: e.target.value, commitmentLevel: e.target.value })}>
                                        {['co-development', 'advisory', 'licensing', 'joint research', 'pilot partnership'].map(t => (
                                            <option key={t} value={t} style={{ background: 'var(--background)', textTransform: 'capitalize' }}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="flex-col gap-4">
                                <div className="create-post-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div className="flex-col gap-2">
                                        <label className="text-sm font-semibold flex items-center gap-2"><Globe size={14} /> Country</label>
                                        <input type="text" className="input-field" style={{ borderRadius: '12px' }} value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
                                    </div>
                                    <div className="flex-col gap-2">
                                        <label className="text-sm font-semibold flex items-center gap-2"><MapPin size={14} /> City</label>
                                        <input type="text" className="input-field" style={{ borderRadius: '12px' }} value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                                    </div>
                                </div>

                                <div className="flex-col gap-2">
                                    <label className="text-sm font-semibold flex items-center gap-2"><LockKeyhole size={14} /> Confidentiality Level</label>
                                    <div className="create-post-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        {[
                                            { value: 'overview-public', label: 'Public Info', desc: 'Everyone can see details', icon: <Globe size={18} /> },
                                            { value: 'meeting-only', label: 'NDA Protected', desc: 'Details locked until NDA', icon: <Shield size={18} /> }
                                        ].map(opt => (
                                            <div
                                                key={opt.value}
                                                onClick={() => setFormData({ ...formData, confidentiality: opt.value })}
                                                style={{
                                                    padding: '20px', cursor: 'pointer', borderRadius: '14px',
                                                    background: formData.confidentiality === opt.value ? 'rgba(94, 210, 156, 0.08)' : 'var(--background-alt)',
                                                    border: `1px solid ${formData.confidentiality === opt.value ? 'rgba(94, 210, 156, 0.3)' : 'rgba(255,255,255,0.06)'}`,
                                                    transition: 'all 0.25s', textAlign: 'center'
                                                }}
                                            >
                                                <div style={{ margin: '0 auto 10px', color: formData.confidentiality === opt.value ? 'var(--primary-light)' : 'var(--text-subtle)' }}>{opt.icon}</div>
                                                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px', color: formData.confidentiality === opt.value ? '#a5b4fc' : 'var(--text-main)' }}>{opt.label}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>{opt.desc}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex-col gap-2">
                                    <label className="text-sm font-semibold flex items-center gap-2"><Clock size={14} /> Expiry (days)</label>
                                    <select className="input-field" style={selectStyle} value={formData.expiryDays} onChange={(e) => setFormData({ ...formData, expiryDays: parseInt(e.target.value) })}>
                                        {[15, 30, 60, 90].map(d => <option key={d} value={d} style={{ background: 'var(--background)' }}>{d} days</option>)}
                                    </select>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mt-10" style={{ borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                    <div>
                        {step > 1 && (
                            <button onClick={prevStep} className="btn btn-secondary" style={{ padding: '12px 24px', borderRadius: '12px' }}>
                                <ArrowLeft size={16} /> Previous
                            </button>
                        )}
                    </div>
                    <div className="flex gap-3">
                        {step < totalSteps ? (
                            <button onClick={nextStep} className="btn btn-primary" style={{ padding: '12px 28px', borderRadius: '12px' }}>
                                Next Step <ArrowRight size={16} />
                            </button>
                        ) : (
                            <button id="publish-post-btn" onClick={handleSubmit} className="btn btn-accent" style={{ padding: '14px 32px', borderRadius: '14px', fontSize: '15px', boxShadow: '0 6px 20px rgba(94, 210, 156,0.25)' }}>
                                <Send size={16} /> Publish Announcement
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default CreatePost;
