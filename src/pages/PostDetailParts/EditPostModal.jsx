import { useEffect } from 'react';
import { CheckCircle2, Edit3, X } from 'lucide-react';
 
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimReady } from '../../hooks/useAnimReady';

const EditPostModal = ({
    open,
    onClose,
    title,
    description,
    onChangeTitle,
    onChangeDescription,
    onSave,
    saved,
    onResetSaved,
}) => {
    const animReady = useAnimReady();

    // Auto-close after successful save (was previously an unguarded setTimeout).
    useEffect(() => {
        if (!saved) return;
        const t = setTimeout(() => {
            onClose();
            onResetSaved();
        }, 1200);
        return () => clearTimeout(t);
    }, [saved, onClose, onResetSaved]);

    const handleCloseClick = () => {
        onClose();
        onResetSaved();
    };

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
                            borderRadius: '24px', maxWidth: '600px', margin: 'auto',
                            '--pc-glow': 'rgba(34, 211, 238, 0.45)',
                            '--pc-glow-soft': 'rgba(34, 211, 238, 0.18)',
                        }}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="edit-modal-title"
                    >
                        <span className="premium-card-halo" aria-hidden="true" />
                        <div className="flex items-center gap-4 mb-8" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '24px' }}>
                            <div style={{ background: 'rgba(34, 211, 238, 0.12)', padding: '12px', borderRadius: '16px' }}>
                                <Edit3 color="var(--accent-light)" size={32} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h2 id="edit-modal-title" style={{ fontSize: '22px', fontWeight: '800', margin: 0, fontFamily: 'var(--font-heading)' }}>Edit Announcement</h2>
                            </div>
                            <button onClick={handleCloseClick} className="btn-icon" aria-label="Close edit dialog">
                                <X size={20} />
                            </button>
                        </div>

                        {saved && (
                            <motion.div
                                initial={animReady ? { opacity: 0, y: -8 } : false}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)',
                                    borderLeft: '4px solid var(--secondary)', padding: '16px 20px', marginBottom: '28px',
                                    borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px'
                                }}
                                role="status"
                            >
                                <CheckCircle2 size={20} color="#34d399" />
                                <span style={{ fontSize: '15px', color: 'var(--badge-success-text)', fontWeight: '600' }}>Announcement updated successfully</span>
                            </motion.div>
                        )}

                        <div className="flex-col gap-6 mb-10">
                            <div className="flex-col gap-2">
                                <label htmlFor="edit-post-title" className="text-sm font-semibold color-muted">Protocol Title</label>
                                <input id="edit-post-title" type="text" className="input-field" style={{ borderRadius: '16px' }} value={title} onChange={(e) => onChangeTitle(e.target.value)} />
                            </div>
                            <div className="flex-col gap-2">
                                <label htmlFor="edit-post-desc" className="text-sm font-semibold color-muted">Clinical Context</label>
                                <textarea id="edit-post-desc" className="input-field" style={{ minHeight: '140px', borderRadius: '16px' }} value={description} onChange={(e) => onChangeDescription(e.target.value)} />
                            </div>
                        </div>

                        <div className="px-modal-footer">
                            <button type="button" className="px-btn ghost" onClick={handleCloseClick}>Cancel</button>
                            <button type="button" className="px-btn primary" onClick={onSave}>
                                <CheckCircle2 size={16} /> Save changes
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default EditPostModal;
