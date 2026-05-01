import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, FileText, MapPin, Globe, Briefcase, Tag, Clock, LockKeyhole, Shield, Sparkles, Send, Edit3, AlertCircle, HelpCircle } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { useAnimReady } from '../hooks/useAnimReady';
import { useToast } from '../hooks/useToast';
import PxSelect from '../components/PxSelect';
import WizardProgress from '../components/WizardProgress';

const CreatePost = ({ user, addPost }) => {
    const navigate = useNavigate();
    const animReady = useAnimReady();
    const toast = useToast();
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
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    // Field-level validation — populated on submit attempt. Keys match formData.
    const [fieldErrors, setFieldErrors] = useState({});
    const clearFieldError = (key) => {
        setFieldErrors((prev) => {
            if (!prev[key]) return prev;
            const { [key]: _removed, ...rest } = prev;
            return rest;
        });
    };

    const domains = ['Telemedicine', 'AI Diagnostics', 'Wearable Tech', 'Genomics', 'Mental Health Tech', 'Surgical Robotics', 'Drug Discovery', 'Health Data Analytics', 'Others'];

    const stages = [
        { value: 'idea', label: 'Idea Stage', icon: '💡', desc: 'Conceptual — no implementation yet' },
        { value: 'concept validation', label: 'Concept Validation', icon: '🔬', desc: 'Researching feasibility' },
        { value: 'prototype developed', label: 'Prototype Developed', icon: '⚙️', desc: 'Working MVP exists' },
        { value: 'pilot testing', label: 'Pilot Testing', icon: '🧪', desc: 'Testing with real users' },
        { value: 'pre-deployment', label: 'Pre-Deployment', icon: '🚀', desc: 'Ready for market entry' }
    ];

    const TITLE_MAX = 140;
    const EXPLANATION_MAX = 4000;
    const EXPERTISE_MAX = 1000;
    const HIGH_LEVEL_MAX = 4000;

    const buildPost = (status) => {
        const now = new Date();
        const expiry = new Date(now);
        expiry.setDate(expiry.getDate() + formData.expiryDays);
        return {
            id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            title: formData.title.trim(),
            domain: formData.domain,
            projectStage: formData.projectStage,
            explanation: formData.explanation.trim(),
            highLevelIdea: formData.highLevelIdea?.trim() || '',
            expertiseNeeded: formData.expertiseNeeded.trim(),
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
            status,
        };
    };

    const handleSaveDraft = async () => {
        if (submitting) return;
        setError('');
        const titleTrimmed = formData.title.trim();
        if (!titleTrimmed) {
            setFieldErrors({ title: 'Drafts still need a title so you can find them later.' });
            setError('Please add a title before saving as draft.');
            setStep(1);
            return;
        }
        setFieldErrors({});
        setSubmitting(true);
        try {
            // usePosts.addPost overrides the inline status from buildPost; the
            // hook's second argument (isDraft) is what actually decides whether
            // the post lands as 'Draft' or 'Active'. Without this flag, drafts
            // were silently being published as Active.
            if (addPost) await addPost(buildPost('Draft'), true);
            toast.success('Saved to My Posts as a draft. You can publish whenever you are ready.', { title: 'Draft saved' });
            navigate('/my-posts');
        } catch (err) {
            console.error('Save draft failed:', err);
            setError('Could not save draft. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = async () => {
        if (submitting) return; // guard against double-clicks during the await
        setError('');
        const errs = {};
        const titleTrimmed = formData.title.trim();
        const explanationTrimmed = formData.explanation.trim();
        const expertiseTrimmed = formData.expertiseNeeded.trim();
        if (!titleTrimmed) errs.title = 'Title is required.';
        else if (titleTrimmed.length > TITLE_MAX) errs.title = `Title is too long (max ${TITLE_MAX} chars).`;
        if (!explanationTrimmed) errs.explanation = 'Description is required.';
        else if (explanationTrimmed.length > EXPLANATION_MAX) errs.explanation = `Description is too long (max ${EXPLANATION_MAX} chars).`;
        if (!expertiseTrimmed) errs.expertiseNeeded = 'Tell us what expertise you need.';
        else if (expertiseTrimmed.length > EXPERTISE_MAX) errs.expertiseNeeded = `Required expertise is too long (max ${EXPERTISE_MAX} chars).`;
        if ((formData.highLevelIdea || '').length > HIGH_LEVEL_MAX) {
            errs.highLevelIdea = `Technical blueprint is too long (max ${HIGH_LEVEL_MAX} chars).`;
        }
        if (Object.keys(errs).length > 0) {
            setFieldErrors(errs);
            setError('Please complete the highlighted fields before publishing.');
            // Jump to the earliest step containing an error so the user can see it.
            if (errs.title || errs.explanation) setStep(1);
            else if (errs.expertiseNeeded || errs.highLevelIdea) setStep(2);
            return;
        }
        setFieldErrors({});

        setSubmitting(true);
        try {
            if (addPost) {
                await addPost(buildPost('Active'), false);
            }
            setSubmitted(true);
        } catch (err) {
            console.error('Publish post failed:', err);
            setError('Could not publish your announcement. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const nextStep = () => { if (step < totalSteps) setStep(step + 1); };
    const prevStep = () => { if (step > 1) setStep(step - 1); };

    if (submitted) {
        return (
            <div className="flex justify-center items-center" style={{ minHeight: '60vh' }}>
                <motion.div
                    initial={animReady ? {  opacity: 0, scale: 0.9  } : false}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                    className="editorial-panel text-center"
                    style={{ padding: 'clamp(36px, 8vw, 64px) clamp(22px, 6vw, 48px)', maxWidth: '520px', width: '100%' }}
                >
                    <motion.div
                        initial={animReady ? {  scale: 0, rotate: -15  } : false}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.2, type: 'spring', damping: 12 }}
                        style={{
                            width: '76px', height: '76px', borderRadius: '22px',
                            background: 'var(--brand-gradient, linear-gradient(135deg, var(--primary), var(--accent)))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 26px',
                            boxShadow: 'var(--brand-avatar-shadow, 0 18px 44px rgba(96, 165, 250, 0.4))'
                        }}
                    >
                        <CheckCircle2 size={36} color="var(--fg-on-accent)" strokeWidth={2.5} />
                    </motion.div>
                    <h2 style={{ fontSize: '30px', marginBottom: '12px', fontFamily: 'var(--font-heading)', letterSpacing: '-0.035em', fontWeight: '800' }}>
                        Published <span style={{
                            background: 'linear-gradient(135deg, var(--primary-light), var(--accent-light))',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text', fontStyle: 'italic'
                        }}>successfully</span>
                    </h2>
                    <p className="text-muted mb-8" style={{ fontSize: '14.5px', lineHeight: '1.7', maxWidth: '400px', margin: '0 auto 28px' }}>
                        Your announcement is now visible to potential cross-disciplinary partners across the network.
                    </p>
                    <div className="flex gap-3" style={{ justifyContent: 'center' }}>
                        <button type="button" onClick={() => navigate('/dashboard')} className="px-btn primary lg">
                            <Sparkles size={15} /> View in Feed
                        </button>
                        <button type="button" onClick={() => navigate('/my-posts')} className="px-btn ghost lg">
                            My Posts
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ maxWidth: '820px', margin: '0 auto', paddingBottom: '80px' }}>
            <motion.button
                whileHover={{ x: -2 }}
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-muted mb-6 font-medium"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '13px', letterSpacing: '0.02em' }}
            >
                <ArrowLeft size={15} /> Back
            </motion.button>

            {/* Editorial header */}
            <motion.section
                initial={animReady ? {  opacity: 0, y: 20  } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="editorial-header"
            >
                <div className="editorial-header-inner">
                    <div>
                        <span className="editorial-eyebrow">
                            <Edit3 size={11} /> Compose
                        </span>
                        <h1 className="editorial-display">
                            New <span className="accent">Announcement</span>
                        </h1>
                        <p className="editorial-subtitle">
                            Describe your project in three steps — find the right cross-disciplinary partner.
                        </p>
                    </div>
                </div>
            </motion.section>

            <motion.div
                initial={animReady ? {  opacity: 0, y: 20  } : false}
                animate={{ opacity: 1, y: 0 }}
                className="editorial-panel"
                style={{ padding: 'clamp(24px, 4.5vw, 36px) clamp(18px, 5vw, 40px) clamp(24px, 4vw, 32px)' }}
            >

                {/* Step Progress — single continuous amber→emerald gradient bar */}
                <WizardProgress
                    steps={[
                        { label: 'Core Details' },
                        { label: 'Technical Info' },
                        { label: 'Settings' },
                    ]}
                    current={step}
                    onStepClick={(n) => setStep(n)}
                />

                {/* Error */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={animReady ? {  opacity: 0, height: 0  } : false}
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
                        initial={animReady ? {  opacity: 0, x: 20  } : false}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25 }}
                    >
                        {step === 1 && (
                            <div className="flex-col" style={{ gap: '32px', paddingTop: '12px' }}>
                                <div className="flex-col gap-2">
                                    <label className="input-lux-label flex items-center gap-2" style={{ display: 'inline-flex' }}><FileText size={14} /> Title *</label>
                                    <input
                                        id="post-title-input"
                                        type="text"
                                        className={`input-lux ${fieldErrors.title ? 'is-error' : ''}`}
                                        placeholder="e.g. ML-Based ECG Anomaly Detection for Rural Clinics"
                                        value={formData.title}
                                        onChange={(e) => { setFormData({ ...formData, title: e.target.value }); clearFieldError('title'); }}
                                        aria-invalid={!!fieldErrors.title}
                                        required
                                    />
                                    {fieldErrors.title && (
                                        <span className="px-field-error"><AlertCircle size={12} /> {fieldErrors.title}</span>
                                    )}
                                </div>

                                <div className="flex-col gap-2">
                                    <label className="input-lux-label flex items-center gap-2" style={{ display: 'inline-flex' }}><Tag size={14} /> Domain *</label>
                                    <PxSelect
                                        id="post-domain-select"
                                        ariaLabel="Domain"
                                        value={formData.domain}
                                        onChange={(v) => setFormData({ ...formData, domain: v })}
                                        options={domains.map(d => ({ value: d, label: d }))}
                                    />
                                </div>

                                <div className="flex-col gap-2">
                                    <label className="input-lux-label flex items-center gap-2" style={{ display: 'inline-flex' }}><Briefcase size={14} /> Project Stage *</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
                                        {stages.map(s => (
                                            <div
                                                key={s.value}
                                                onClick={() => setFormData({ ...formData, projectStage: s.value })}
                                                style={{
                                                    padding: '16px', borderRadius: '14px', cursor: 'pointer',
                                                    background: formData.projectStage === s.value ? 'var(--selected-bg, rgba(96, 165, 250, 0.08))' : 'var(--background-alt)',
                                                    border: `1px solid ${formData.projectStage === s.value ? 'var(--selected-border, rgba(96, 165, 250, 0.3))' : 'var(--border)'}`,
                                                    transition: 'all 0.25s',
                                                    boxShadow: formData.projectStage === s.value ? '0 12px 28px -22px rgba(8, 120, 79, 0.36)' : 'none'
                                                }}
                                            >
                                                <div style={{ fontSize: '18px', marginBottom: '6px' }}>{s.icon}</div>
                                                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '3px', color: formData.projectStage === s.value ? 'var(--selected-text, #a5b4fc)' : 'var(--text-main)' }}>{s.label}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>{s.desc}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex-col gap-2">
                                    <label className="input-lux-label flex items-center gap-2" style={{ display: 'inline-flex' }}><Edit3 size={14} /> Project Description *</label>
                                    <textarea
                                        id="post-description-input"
                                        className={`input-lux ${fieldErrors.explanation ? 'is-error' : ''}`}
                                        style={{ minHeight: '140px', resize: 'vertical' }}
                                        placeholder="Describe the problem you're solving, initial outcomes, and ideal partner profile..."
                                        value={formData.explanation}
                                        onChange={(e) => { setFormData({ ...formData, explanation: e.target.value }); clearFieldError('explanation'); }}
                                        aria-invalid={!!fieldErrors.explanation}
                                        required
                                    />
                                    {fieldErrors.explanation && (
                                        <span className="px-field-error"><AlertCircle size={12} /> {fieldErrors.explanation}</span>
                                    )}
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="flex-col" style={{ gap: '32px', paddingTop: '12px' }}>
                                <div className="flex-col gap-2">
                                    <label className="input-lux-label flex items-center gap-2" style={{ display: 'inline-flex' }}><Sparkles size={14} /> Technical Blueprint / High-Level Idea</label>
                                    <p className="text-xs text-muted mb-1" style={{ lineHeight: '1.5' }}>Optional. If confidentiality is set to "meeting-only", this will be hidden until NDA is signed.</p>
                                    <textarea className="input-lux" style={{ minHeight: '120px', resize: 'vertical' }} placeholder="Describe technical details, methodologies, or architecture..." value={formData.highLevelIdea} onChange={(e) => setFormData({ ...formData, highLevelIdea: e.target.value })} />
                                </div>

                                <div className="flex-col gap-2">
                                    <label className="input-lux-label flex items-center gap-2" style={{ display: 'inline-flex' }}><Briefcase size={14} /> Required Expertise *</label>
                                    <textarea
                                        id="post-expertise-input"
                                        className={`input-lux ${fieldErrors.expertiseNeeded ? 'is-error' : ''}`}
                                        style={{ minHeight: '100px', resize: 'vertical' }}
                                        placeholder="What specific expertise or role do you need from your partner?"
                                        value={formData.expertiseNeeded}
                                        onChange={(e) => { setFormData({ ...formData, expertiseNeeded: e.target.value }); clearFieldError('expertiseNeeded'); }}
                                        aria-invalid={!!fieldErrors.expertiseNeeded}
                                        required
                                    />
                                    {fieldErrors.expertiseNeeded && (
                                        <span className="px-field-error"><AlertCircle size={12} /> {fieldErrors.expertiseNeeded}</span>
                                    )}
                                </div>

                                <div className="flex-col gap-2">
                                    <label className="input-lux-label flex items-center gap-2" style={{ display: 'inline-flex' }}><Tag size={14} /> Collaboration Type</label>
                                    <PxSelect
                                        ariaLabel="Collaboration type"
                                        value={formData.collaborationType}
                                        onChange={(v) => setFormData({ ...formData, collaborationType: v, commitmentLevel: v })}
                                        options={[
                                            { value: 'co-development', label: 'Co-development', hint: 'Build together end-to-end' },
                                            { value: 'advisory', label: 'Advisory', hint: 'Strategic input, light touch' },
                                            { value: 'licensing', label: 'Licensing', hint: 'Transfer IP / permissions' },
                                            { value: 'joint research', label: 'Joint research', hint: 'Shared scientific scope' },
                                            { value: 'pilot partnership', label: 'Pilot partnership', hint: 'Limited, defined rollout' },
                                        ]}
                                    />
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="flex-col" style={{ gap: '32px', paddingTop: '12px' }}>
                                <div className="create-post-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div className="flex-col gap-2">
                                        <label className="input-lux-label flex items-center gap-2" style={{ display: 'inline-flex' }}><Globe size={14} /> Country</label>
                                        <input type="text" className="input-lux" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
                                    </div>
                                    <div className="flex-col gap-2">
                                        <label className="input-lux-label flex items-center gap-2" style={{ display: 'inline-flex' }}><MapPin size={14} /> City</label>
                                        <input type="text" className="input-lux" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                                    </div>
                                </div>

                                <div className="flex-col gap-2">
                                    <label className="input-lux-label flex items-center gap-2" style={{ display: 'inline-flex' }}>
                                        <LockKeyhole size={14} /> Confidentiality Level
                                        <span
                                            tabIndex={0}
                                            role="tooltip"
                                            aria-label="A Non-Disclosure Agreement is a lightweight in-platform acknowledgement. When an interested partner clicks Express Interest, they are asked to accept the NDA before they can read any details you marked confidential. This protects your high-level idea and intellectual property from casual browsing."
                                            title="A Non-Disclosure Agreement is a lightweight in-platform acknowledgement. When an interested partner clicks Express Interest, they are asked to accept the NDA before they can read any details you marked confidential. This protects your high-level idea and intellectual property from casual browsing."
                                            style={{
                                                display: 'inline-flex', alignItems: 'center',
                                                color: 'var(--text-subtle)', cursor: 'help',
                                                marginLeft: 4,
                                            }}
                                        >
                                            <HelpCircle size={13} />
                                        </span>
                                    </label>
                                    <p className="text-xs text-muted" style={{ lineHeight: 1.55, marginTop: -4, marginBottom: 4 }}>
                                        Choose <strong>Public</strong> when the information is safe to disclose openly.
                                        Choose <strong>NDA Protected</strong> if your high-level idea contains
                                        intellectual property (IP) you want shielded until a partner accepts the NDA.
                                    </p>
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
                                                    background: formData.confidentiality === opt.value ? 'var(--selected-bg, rgba(96, 165, 250, 0.08))' : 'var(--background-alt)',
                                                    border: `1px solid ${formData.confidentiality === opt.value ? 'var(--selected-border, rgba(96, 165, 250, 0.3))' : 'var(--border)'}`,
                                                    transition: 'all 0.25s', textAlign: 'center'
                                                }}
                                            >
                                                <div style={{ margin: '0 auto 10px', color: formData.confidentiality === opt.value ? 'var(--primary-light)' : 'var(--text-subtle)' }}>{opt.icon}</div>
                                                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px', color: formData.confidentiality === opt.value ? 'var(--selected-text, #a5b4fc)' : 'var(--text-main)' }}>{opt.label}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>{opt.desc}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex-col gap-2">
                                    <label className="input-lux-label flex items-center gap-2" style={{ display: 'inline-flex' }}><Clock size={14} /> Expiry (days)</label>
                                    <PxSelect
                                        ariaLabel="Expiry"
                                        value={String(formData.expiryDays)}
                                        onChange={(v) => setFormData({ ...formData, expiryDays: parseInt(v, 10) })}
                                        options={[
                                            { value: '15', label: '15 days', hint: 'Short discovery window' },
                                            { value: '30', label: '30 days', hint: 'Default' },
                                            { value: '60', label: '60 days' },
                                            { value: '90', label: '90 days', hint: 'Extended, one quarter' },
                                        ]}
                                    />
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mt-10" style={{ borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                    <div>
                        {step > 1 && (
                            <button type="button" onClick={prevStep} className="px-btn ghost">
                                <ArrowLeft size={15} /> Previous
                            </button>
                        )}
                    </div>
                    <div className="flex gap-3">
                        {step < totalSteps ? (
                            <button type="button" onClick={nextStep} className="px-btn primary" disabled={submitting}>
                                Next Step <ArrowRight size={15} />
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    id="save-draft-btn"
                                    onClick={handleSaveDraft}
                                    className="px-btn ghost lg"
                                    disabled={submitting}
                                >
                                    <FileText size={15} /> Save as Draft
                                </button>
                                <button
                                    type="button"
                                    id="publish-post-btn"
                                    onClick={handleSubmit}
                                    className="px-btn primary lg"
                                    disabled={submitting}
                                >
                                    <Send size={15} /> {submitting ? 'Publishing…' : 'Publish announcement'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default CreatePost;
