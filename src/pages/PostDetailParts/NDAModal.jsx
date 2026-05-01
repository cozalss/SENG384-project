import { CheckCircle2, Loader2, MessageSquare, Send, ShieldAlert, X } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { useAnimReady } from '../../hooks/useAnimReady';

const NDAModal = ({
    open,
    onClose,
    acceptedNda,
    onToggleNda,
    interestMessage,
    onChangeMessage,
    onSubmit,
    submitting = false,
}) => {
    const animReady = useAnimReady();

    return (
        <AnimatePresence>
            {open && (
                <div className="modal-overlay">
                    <motion.div
                        initial={animReady ? { opacity: 0, scale: 0.92, y: 20 } : false}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 20 }}
                        transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                        className="glass-panel modal-content premium-card premium-card--halo"
                        style={{
                            borderRadius: '24px', maxWidth: '580px', margin: 'auto',
                            '--pc-glow': 'rgba(239, 68, 68, 0.45)',
                            '--pc-glow-soft': 'rgba(239, 68, 68, 0.18)',
                        }}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="nda-modal-title"
                    >
                        <span className="premium-card-halo" aria-hidden="true" />
                        <div className="flex items-center gap-4 mb-8" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '24px' }}>
                            <div style={{ background: 'rgba(239, 68, 68, 0.12)', padding: '12px', borderRadius: '16px', boxShadow: '0 0 20px rgba(239, 68, 68, 0.1)' }}>
                                <ShieldAlert color="var(--error)" size={32} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h2 id="nda-modal-title" style={{ fontSize: '22px', fontWeight: '800', margin: 0, letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)' }}>Non-Disclosure Agreement</h2>
                                <div style={{ fontSize: '13px', color: 'var(--text-subtle)', marginTop: '4px' }}>Standard IP Protection Protocol</div>
                            </div>
                            <button onClick={onClose} className="btn-icon" aria-label="Close NDA dialog">
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{
                            background: 'var(--panel-light)',
                            padding: '20px',
                            borderRadius: '16px',
                            border: '1px solid var(--border)',
                            marginBottom: '28px'
                        }}>
                            <p style={{ fontSize: '15px', color: 'var(--text-main)', lineHeight: '1.75', margin: 0 }}>
                                By proceeding, you agree to protect all intellectual property, conceptual schematics, and clinical methodologies shared during the collaboration process. No data extraction is authorized prior to formal documentation.
                            </p>
                        </div>

                        <div className="flex-col gap-3 mb-8">
                            <label htmlFor="nda-interest-msg" className="text-sm font-semibold flex items-center gap-2 mb-1" style={{ color: 'var(--text-muted)' }}>
                                <MessageSquare size={14} /> Short Message (Optional)
                            </label>
                            <textarea
                                id="nda-interest-msg"
                                className="input-field"
                                style={{ minHeight: '100px', resize: 'vertical', borderRadius: '16px' }}
                                placeholder="Introduce yourself and explain why this project interests you..."
                                value={interestMessage}
                                onChange={(e) => onChangeMessage(e.target.value)}
                            />
                        </div>

                        <button
                            className="nda-checkbox-wrapper"
                            style={{
                                background: acceptedNda ? 'var(--selected-bg, rgba(96, 165, 250, 0.08))' : 'var(--background-alt)',
                                padding: '24px',
                                borderRadius: '18px',
                                border: '1px solid',
                                borderColor: acceptedNda ? 'var(--selected-border, rgba(96, 165, 250, 0.3))' : 'rgba(255,255,255,0.06)',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'start',
                                gap: '16px',
                                width: '100%',
                                textAlign: 'left',
                                marginBottom: '40px'
                            }}
                            onClick={onToggleNda}
                            aria-checked={acceptedNda}
                            role="checkbox"
                        >
                            <div style={{
                                width: '26px', height: '26px', borderRadius: '8px',
                                border: '2px solid',
                                borderColor: acceptedNda ? 'var(--primary)' : 'var(--text-subtle)',
                                background: acceptedNda ? 'var(--primary)' : 'transparent',
                                flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.25s', marginTop: '2px',
                                boxShadow: acceptedNda ? '0 12px 28px -22px rgba(8, 120, 79, 0.42)' : 'none'
                            }}>
                                {acceptedNda && <CheckCircle2 size={16} color="white" strokeWidth={3} />}
                            </div>
                            <div style={{ fontSize: '14px', color: acceptedNda ? 'var(--text-main)' : 'var(--text-muted)', userSelect: 'none', lineHeight: '1.6', fontWeight: acceptedNda ? '600' : '400' }}>
                                I accept the Non-Disclosure Agreement and understand that all shared information is confidential.
                            </div>
                        </button>

                        <div className="px-modal-footer">
                            <button type="button" className="px-btn ghost" onClick={onClose} disabled={submitting}>Cancel</button>
                            <button type="button" className="px-btn primary" disabled={!acceptedNda || submitting} onClick={onSubmit}>
                                {submitting ? (
                                    <>
                                        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Sending…
                                    </>
                                ) : (
                                    <>
                                        Accept &amp; Express Interest <Send size={16} />
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default NDAModal;
