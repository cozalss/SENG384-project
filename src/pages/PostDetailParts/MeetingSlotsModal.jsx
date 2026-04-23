import { Calendar, Send, Video, X } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimReady } from '../../hooks/useAnimReady';

const MeetingSlotsModal = ({
    open,
    onClose,
    slots,
    selectedSlot,
    onSelectSlot,
    onSend,
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
                        className="glass-panel modal-content"
                        style={{ maxWidth: '650px', borderRadius: '24px', margin: 'auto' }}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="slots-modal-title"
                    >
                        <div className="flex items-center gap-4 mb-8" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '24px' }}>
                            <div style={{ background: 'rgba(96, 165, 250, 0.12)', padding: '12px', borderRadius: '16px', boxShadow: '0 0 20px rgba(96, 165, 250, 0.1)' }}>
                                <Calendar color="var(--primary-light)" size={32} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h2 id="slots-modal-title" style={{ fontSize: '22px', fontWeight: '800', margin: 0, fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>Propose Meeting Times</h2>
                                <div style={{ fontSize: '13px', color: 'var(--text-subtle)', marginTop: '4px' }}>Select a preferred slot for external collaboration</div>
                            </div>
                            <button onClick={onClose} className="btn-icon" aria-label="Close meeting slots dialog">
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{
                            background: 'rgba(16, 185, 129, 0.05)',
                            padding: '16px 20px',
                            borderRadius: '14px',
                            border: '1px solid rgba(16, 185, 129, 0.12)',
                            marginBottom: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <Video size={18} color="var(--secondary)" />
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
                                Meetings take place via Zoom / Teams. No data is stored on platform.
                            </p>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                            gap: '12px',
                            marginBottom: '40px',
                            padding: '4px'
                        }}>
                            {slots.map(slot => (
                                <button
                                    key={slot.id}
                                    className={`time-slot ${selectedSlot?.id === slot.id ? 'time-slot-selected' : ''}`}
                                    style={{
                                        padding: '16px',
                                        height: 'auto',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '4px',
                                        width: '100%',
                                        textAlign: 'left',
                                        border: '1px solid var(--border)',
                                        borderRadius: '12px',
                                        background: selectedSlot?.id === slot.id ? 'var(--primary-light-alpha)' : 'transparent',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onClick={() => onSelectSlot(slot)}
                                    aria-pressed={selectedSlot?.id === slot.id}
                                >
                                    <div style={{ fontSize: '13px', fontWeight: '700', color: selectedSlot?.id === slot.id ? 'var(--primary-light)' : 'var(--text-main)' }}>{slot.label.split(' at ')[0]}</div>
                                    <div style={{ fontSize: '11px', opacity: 0.7, color: 'var(--text-muted)' }}>{slot.label.split(' at ')[1]}</div>
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-end gap-4">
                            <button className="btn btn-secondary" onClick={onClose} style={{ padding: '14px 28px', borderRadius: '14px' }}>Cancel</button>
                            <button className="btn btn-accent" disabled={!selectedSlot} onClick={onSend} style={{ padding: '14px 36px', borderRadius: '14px' }}>
                                <Send size={18} /> Send Meeting Request
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default MeetingSlotsModal;
