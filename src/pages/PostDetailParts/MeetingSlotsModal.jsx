import { useMemo } from 'react';
import { Calendar, Send, Video, X, Clock } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { useAnimReady } from '../../hooks/useAnimReady';
import '../../styles/login-cinematic.css';

/* Group time slots by their day so the modal reads as a calendar instead of a
   bag of buttons. We trust the slot.label format from generateTimeSlots():
   "<weekday>, <month> <day> at <hh>:00". If a future label format changes
   we still degrade gracefully (fall into "Other" bucket). */
const splitLabel = (label = '') => {
    const idx = label.indexOf(' at ');
    if (idx === -1) return { day: label, time: '' };
    return { day: label.slice(0, idx).trim(), time: label.slice(idx + 4).trim() };
};

const MeetingSlotsModal = ({
    open,
    onClose,
    slots,
    selectedSlot,
    onSelectSlot,
    onSend,
}) => {
    const animReady = useAnimReady();

    const grouped = useMemo(() => {
        const map = new Map();
        for (const s of slots || []) {
            const { day } = splitLabel(s.label);
            if (!map.has(day)) map.set(day, []);
            map.get(day).push(s);
        }
        return Array.from(map.entries());
    }, [slots]);

    return (
        <AnimatePresence>
            {open && (
                <div className="modal-overlay">
                    <motion.div
                        initial={animReady ? { opacity: 0, scale: 0.92, y: 20 } : false}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, y: 16 }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                        className="glass-panel modal-content"
                        style={{ maxWidth: '650px', borderRadius: '24px', margin: 'auto' }}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="slots-modal-title"
                    >
                        <div className="flex items-center gap-4 mb-6" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '24px' }}>
                            <motion.div
                                initial={animReady ? { scale: 0.6, rotate: -10, opacity: 0 } : false}
                                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
                                style={{ background: 'rgba(96, 165, 250, 0.12)', padding: '12px', borderRadius: '16px', boxShadow: '0 0 20px rgba(96, 165, 250, 0.15)' }}
                            >
                                <Calendar color="var(--primary-light)" size={32} />
                            </motion.div>
                            <div style={{ flex: 1 }}>
                                <h2 id="slots-modal-title" style={{ fontSize: '22px', fontWeight: '800', margin: 0, fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>Propose Meeting Times</h2>
                                <div style={{ fontSize: '13px', color: 'var(--text-subtle)', marginTop: '4px' }}>Pick one slot — the author confirms externally</div>
                            </div>
                            <button onClick={onClose} className="btn-icon" aria-label="Close meeting slots dialog">
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{
                            background: 'rgba(34, 211, 238, 0.04)',
                            padding: '14px 18px',
                            borderRadius: '13px',
                            border: '1px solid rgba(34, 211, 238, 0.12)',
                            marginBottom: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}>
                            <Video size={16} color="#67e8f9" />
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
                                Meetings take place via Zoom / Teams. No data is stored on platform.
                            </p>
                        </div>

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
                                gap: '12px',
                                marginBottom: '32px',
                                padding: '4px',
                                maxHeight: '54vh',
                                overflowY: 'auto',
                            }}
                            role="radiogroup"
                            aria-label="Available meeting slots"
                        >
                            {grouped.map(([day, daySlots], gi) => (
                                <div key={day} style={{ display: 'contents' }}>
                                    <motion.div
                                        className="slot-day-header"
                                        initial={animReady ? { opacity: 0, x: -8 } : false}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.08 + gi * 0.04, duration: 0.3 }}
                                    >
                                        <Calendar size={11} /> {day}
                                    </motion.div>
                                    {daySlots.map((slot, si) => {
                                        const { time } = splitLabel(slot.label);
                                        const isSelected = selectedSlot?.id === slot.id;
                                        return (
                                            <motion.button
                                                key={slot.id}
                                                type="button"
                                                role="radio"
                                                aria-checked={isSelected}
                                                aria-label={`${day} at ${time}, 60 minute meeting`}
                                                title={`${day} at ${time} · 60 min`}
                                                onClick={() => onSelectSlot(slot)}
                                                className={`slot-card${isSelected ? ' is-selected' : ''}`}
                                                initial={animReady ? { opacity: 0, y: 8 } : false}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.12 + gi * 0.04 + si * 0.02, duration: 0.28 }}
                                                whileTap={{ scale: 0.97 }}
                                            >
                                                <span className="slot-card-time">{time || slot.label}</span>
                                                <span className="slot-card-meta">
                                                    <Clock size={10} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                                                    60 min
                                                </span>
                                                <span className="slot-card-ribbon" aria-hidden="true" />
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>

                        <div className="px-modal-footer">
                            <button type="button" className="px-btn ghost" onClick={onClose}>Cancel</button>
                            <button
                                type="button"
                                className="px-btn primary"
                                disabled={!selectedSlot}
                                onClick={onSend}
                                aria-disabled={!selectedSlot}
                            >
                                <Send size={16} /> Send Meeting Request
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default MeetingSlotsModal;
