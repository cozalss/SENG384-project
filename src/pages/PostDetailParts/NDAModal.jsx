import { useState } from 'react';
import { MessageSquare, Send, ShieldAlert, X, Lock } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { useAnimReady } from '../../hooks/useAnimReady';
import '../../styles/login-cinematic.css';

/* Outer component manages AnimatePresence so the modal exit animation plays.
   When `open` is true we mount <NDAModalContent>, which holds its own ephemeral
   "locked" state. Because the inner component is keyed by an "instance id" that
   we bump every time we render it from a closed → open transition, the lock
   state resets cleanly without a setState-in-effect. */
const NDAModal = (props) => {
    return (
        <AnimatePresence>
            {props.open && <NDAModalContent {...props} />}
        </AnimatePresence>
    );
};

const NDAModalContent = ({
    onClose,
    acceptedNda,
    onToggleNda,
    interestMessage,
    onChangeMessage,
    onSubmit,
}) => {
    const animReady = useAnimReady();

    /* "locked" plays the brief "stamp" pulse on the Accept button before the
       parent transitions out. Visual only — submit handler runs after the
       animation completes. State resets implicitly because this component
       unmounts whenever `open` drops to false (see <NDAModal> above). */
    const [locked, setLocked] = useState(false);

    const handleAcceptClick = () => {
        if (!acceptedNda || locked) return;
        setLocked(true);
        // Match the 520ms stamp animation, then run the real submit.
        // Reduced-motion users skip the delay (animation is disabled in CSS).
        const reduce = typeof window !== 'undefined' && window.matchMedia
            ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
            : false;
        const delay = reduce ? 0 : 360;
        setTimeout(() => {
            onSubmit();
        }, delay);
    };

    return (
        <div className="modal-overlay">
            <motion.div
                initial={animReady ? { opacity: 0, scale: 0.92, y: 24 } : false}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 16 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="glass-panel modal-content"
                style={{ borderRadius: '24px', maxWidth: '580px', margin: 'auto' }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="nda-modal-title"
            >
                <div className="flex items-center gap-4 mb-8" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '24px' }}>
                    <motion.div
                        initial={animReady ? { scale: 0.6, rotate: -12, opacity: 0 } : false}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
                        style={{ background: 'rgba(239, 68, 68, 0.12)', padding: '12px', borderRadius: '16px', boxShadow: '0 0 20px rgba(239, 68, 68, 0.15)' }}
                    >
                        <ShieldAlert color="var(--error)" size={32} />
                    </motion.div>
                    <div style={{ flex: 1 }}>
                        <h2 id="nda-modal-title" style={{ fontSize: '22px', fontWeight: '800', margin: 0, letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)' }}>Non-Disclosure Agreement</h2>
                        <div style={{ fontSize: '13px', color: 'var(--text-subtle)', marginTop: '4px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <Lock size={11} /> Standard IP Protection Protocol
                        </div>
                    </div>
                    <button onClick={onClose} className="btn-icon" aria-label="Close NDA dialog">
                        <X size={20} />
                    </button>
                </div>

                <div className="nda-legal-scroll" style={{ marginBottom: '24px' }} tabIndex={0} aria-label="NDA legal text">
                    <p>
                        By proceeding, you agree to protect all intellectual property, conceptual
                        schematics, and clinical methodologies shared during the collaboration process.
                        No data extraction is authorized prior to formal documentation.
                    </p>
                    <p>
                        You will treat as confidential any information disclosed in connection with this
                        project, including but not limited to study designs, patient cohort definitions,
                        model architectures, training datasets, and unpublished findings.
                    </p>
                    <p>
                        Confidential information may be shared internally only with collaborators bound
                        by equivalent confidentiality terms. Public disclosure, publication, or transfer
                        to third parties requires written authorization from the originating party.
                    </p>
                    <p>
                        These obligations remain in force for a period of three (3) years from the date
                        of acceptance, irrespective of whether the collaboration proceeds to a formal
                        engagement.
                    </p>
                </div>

                <div className="flex-col gap-3 mb-6">
                    <label htmlFor="nda-interest-msg" className="text-sm font-semibold flex items-center gap-2 mb-1" style={{ color: 'var(--text-muted)' }}>
                        <MessageSquare size={14} /> Short Message (Optional)
                    </label>
                    <textarea
                        id="nda-interest-msg"
                        className="input-field"
                        style={{ minHeight: '92px', resize: 'vertical', borderRadius: '14px' }}
                        placeholder="Introduce yourself and explain why this project interests you..."
                        value={interestMessage}
                        onChange={(e) => onChangeMessage(e.target.value)}
                    />
                </div>

                <button
                    type="button"
                    className="nda-checkbox-wrapper"
                    style={{
                        background: acceptedNda ? 'hsla(119, 99%, 46%, 0.06)' : 'var(--background-alt)',
                        padding: '20px 22px',
                        borderRadius: '16px',
                        border: '1px solid',
                        borderColor: acceptedNda ? 'hsla(119, 99%, 46%, 0.32)' : 'rgba(255,255,255,0.06)',
                        cursor: 'pointer',
                        transition: 'background 0.3s ease, border-color 0.3s ease',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '14px',
                        width: '100%',
                        textAlign: 'left',
                        marginBottom: '32px',
                    }}
                    onClick={onToggleNda}
                    aria-checked={acceptedNda}
                    role="checkbox"
                >
                    <span className={`nda-check${acceptedNda ? ' is-checked' : ''}`} aria-hidden="true">
                        <svg viewBox="0 0 24 24">
                            <polyline points="5 12 10 17 19 7" />
                        </svg>
                    </span>
                    <span style={{
                        fontSize: '14px',
                        color: acceptedNda ? 'var(--text-main)' : 'var(--text-muted)',
                        userSelect: 'none',
                        lineHeight: '1.6',
                        fontWeight: acceptedNda ? '600' : '400',
                        transition: 'color 0.25s ease',
                    }}>
                        I accept the Non-Disclosure Agreement and understand that all shared information
                        is confidential.
                    </span>
                </button>

                <div className="px-modal-footer">
                    <button type="button" className="px-btn ghost" onClick={onClose} disabled={locked}>Cancel</button>
                    <button
                        type="button"
                        className={`px-btn primary nda-accept-btn${locked ? ' is-locked nda-stamp-burst' : ''}`}
                        disabled={!acceptedNda || locked}
                        onClick={handleAcceptClick}
                    >
                        {locked
                            ? <>Accepted <span aria-hidden="true">✓</span></>
                            : <>Accept &amp; Express Interest <Send size={16} /></>
                        }
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default NDAModal;
