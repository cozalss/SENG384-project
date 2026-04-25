import { Calendar, CheckCircle2, Clock, Edit3, Send, UserCircle, Video, X } from 'lucide-react';
 
import { motion } from 'framer-motion';
import { useAnimReady } from '../../hooks/useAnimReady';

const WorkflowActionPanel = ({
    post,
    isAuthor,
    isConfidential,
    canExpressInterest,
    derivedWorkflowState,
    myMeeting,
    selectedSlot,
    pendingMeetings,
    onClosePost,
    onOpenEdit,
    onRespondMeeting,
    onOpenNda,
    onProposeMeeting,
}) => {
    const animReady = useAnimReady();

    return (
        <motion.div
            initial={animReady ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="editorial-panel"
            style={{ padding: '28px 30px' }}
        >
            <span className="editorial-eyebrow cyan" style={{ marginBottom: '18px' }}>
                <UserCircle size={11} /> Target Counterparty
            </span>

            <div className="flex items-center gap-3 mb-5">
                <div style={{
                    width: '42px', height: '42px', borderRadius: '13px',
                    background: 'rgba(34, 211, 238, 0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid rgba(34, 211, 238, 0.25)',
                    flexShrink: 0
                }}>
                    <UserCircle size={22} color="#67e8f9" />
                </div>
                <div style={{ minWidth: 0 }}>
                    <span className="input-lux-label" style={{ marginBottom: '3px' }}>Required Role</span>
                    <span style={{ fontWeight: '700', fontSize: '14px', color: '#67e8f9', letterSpacing: '-0.01em' }}>
                        {post.authorRole === 'Engineer' ? 'Healthcare Professional' : 'Engineering Expert'}
                    </span>
                </div>
            </div>

            <div style={{
                background: 'rgba(7, 11, 10, 0.5)',
                borderRadius: '14px', padding: '18px',
                border: '1px solid rgba(255,255,255,0.05)'
            }}>
                <div className="mb-3">
                    <span className="input-lux-label" style={{ marginBottom: '4px' }}>Collaboration Type</span>
                    <span className="font-semibold" style={{ textTransform: 'capitalize', fontSize: '13.5px', color: 'var(--text-main)', letterSpacing: '-0.01em' }}>{post.commitmentLevel}</span>
                </div>
                <div>
                    <span className="input-lux-label" style={{ marginBottom: '4px' }}>Data Sharing Level</span>
                    <span className="font-semibold" style={{ fontSize: '13.5px', color: isConfidential ? '#fca5a5' : '#93c5fd', letterSpacing: '-0.01em' }}>
                        {isConfidential ? 'NDA Required' : 'Public Information'}
                    </span>
                </div>
            </div>

            <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                {/* Author control panel. Hidden when the post is CLOSED or when the
                    author has already confirmed a meeting — in that case the
                    "Meeting Confirmed" card below takes over this slot. */}
                {isAuthor && post.status !== 'CLOSED' && derivedWorkflowState !== 'scheduled' && (
                    <div className="flex-col gap-3">
                        <p className="text-xs text-muted text-center" style={{ lineHeight: '1.6' }}>Close this announcement when a partner is found.</p>
                        <button type="button" onClick={onClosePost} className="px-btn primary" style={{ width: '100%', justifyContent: 'center' }}>
                            <CheckCircle2 size={15} /> Partner Found (Close)
                        </button>
                        <button type="button" onClick={onOpenEdit} className="px-btn ghost" style={{ width: '100%', justifyContent: 'center' }}>
                            <Edit3 size={15} /> Edit Announcement
                        </button>

                        {pendingMeetings.length > 0 && (
                            <div style={{ marginTop: '16px' }}>
                                <h4 style={{ fontSize: '13px', color: 'var(--text-main)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Requests</h4>
                                {pendingMeetings.map(m => (
                                    <div key={m.id} style={{ background: 'var(--panel-lighter)', padding: '16px', borderRadius: '12px', marginBottom: '8px', border: '1px solid var(--border)' }}>
                                        <div style={{ fontSize: '14px', marginBottom: '12px', lineHeight: '1.4' }}>
                                            <strong style={{ color: 'var(--primary-light)' }}>{m.proposedByName || 'A collaborator'}</strong> requested meeting slot:<br/>
                                            <span style={{ color: 'var(--badge-primary-text)', fontSize: '13px' }}>📅 {m.slot?.label || 'Time slot pending'}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => onRespondMeeting(m.id, 'accepted')} className="px-btn primary sm" style={{ flex: 1 }}>Accept</button>
                                            <button type="button" onClick={() => onRespondMeeting(m.id, 'declined')} className="px-btn danger sm" style={{ flex: 1 }}>Decline</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {canExpressInterest && derivedWorkflowState === 'initial' && (
                    <div className="flex-col gap-3">
                        <button type="button" id="express-interest-btn" onClick={onOpenNda} className="px-btn primary lg" style={{ width: '100%', justifyContent: 'center' }}>
                            <Send size={16} /> Express Interest
                        </button>
                        <p className="text-xs text-muted text-center" style={{ lineHeight: '1.5' }}>
                            NDA acceptance required before contact
                        </p>
                    </div>
                )}

                {derivedWorkflowState === 'interested' && (
                    <motion.div
                        initial={animReady ? { opacity: 0, scale: 0.95 } : false}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.12)', padding: '24px', borderRadius: '14px', textAlign: 'center' }}
                    >
                        <CheckCircle2 color="#34d399" size={28} style={{ margin: '0 auto 12px' }} />
                        <h3 style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--badge-success-text)', fontWeight: '600' }}>Interest Expressed</h3>
                        <p className="text-muted text-xs mb-4" style={{ lineHeight: '1.6' }}>The author has been notified. Propose available time slots for an external meeting.</p>
                        <button type="button" onClick={onProposeMeeting} className="px-btn primary" style={{ width: '100%', justifyContent: 'center' }}>
                            <Calendar size={16} /> Propose Meeting Times
                        </button>
                    </motion.div>
                )}

                {derivedWorkflowState === 'meeting-requested' && (
                    <motion.div
                        initial={animReady ? { opacity: 0, scale: 0.95 } : false}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ background: 'rgba(249, 168, 96, 0.06)', border: '1px solid rgba(249, 168, 96, 0.16)', padding: '24px', borderRadius: '14px', textAlign: 'center' }}
                    >
                        <Clock color="#f5c48a" size={28} style={{ margin: '0 auto 12px' }} />
                        <h3 style={{ fontSize: '16px', marginBottom: '8px', color: '#f5c48a', fontWeight: 600, fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>Meeting request sent</h3>
                        <p className="text-muted text-xs mb-4" style={{ lineHeight: '1.6' }}>
                            Waiting for the author to accept your proposed time slot. You will be notified once confirmed.
                        </p>
                        <div style={{ background: 'rgba(249, 168, 96, 0.08)', padding: '12px', borderRadius: '10px', fontSize: '13px', color: '#f5c48a', marginBottom: '12px' }}>
                            📅 {myMeeting?.slot?.label || selectedSlot?.label || 'Time slot pending'}
                        </div>
                    </motion.div>
                )}

                {derivedWorkflowState === 'declined' && (
                    <motion.div
                        initial={animReady ? { opacity: 0, scale: 0.95 } : false}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ background: 'rgba(251, 113, 133, 0.06)', border: '1px solid rgba(251, 113, 133, 0.18)', padding: '24px', borderRadius: '14px', textAlign: 'center' }}
                    >
                        <X color="#fda4af" size={28} style={{ margin: '0 auto 12px' }} />
                        <h3 style={{ fontSize: '16px', marginBottom: '8px', color: '#fda4af', fontWeight: 600, fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>Meeting declined</h3>
                        <p className="text-muted text-xs mb-4" style={{ lineHeight: '1.6' }}>
                            The author has declined your proposed meeting time.
                        </p>
                        <button type="button" onClick={onProposeMeeting} className="px-btn primary" style={{ width: '100%', justifyContent: 'center' }}>
                            <Calendar size={16} /> Propose new time
                        </button>
                    </motion.div>
                )}

                {derivedWorkflowState === 'scheduled' && (
                    <motion.div
                        initial={animReady ? { opacity: 0, scale: 0.95 } : false}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ background: 'rgba(34, 211, 238, 0.06)', border: '1px solid rgba(34, 211, 238, 0.15)', padding: '20px', borderRadius: '14px', textAlign: 'center' }}
                    >
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Video color="#67e8f9" size={20} />
                            <h3 style={{ fontSize: '15px', color: 'var(--badge-accent-text)', margin: 0, fontWeight: '600' }}>Meeting Confirmed</h3>
                        </div>
                        <p className="text-muted text-xs mb-4" style={{ margin: 0, lineHeight: '1.6' }}>
                            Meet externally via Zoom/Teams. No recordings stored on platform.
                        </p>
                        <div style={{ background: 'var(--panel-base)', padding: '12px', borderRadius: '10px', fontSize: '13px', color: 'var(--badge-accent-text)', marginBottom: '12px' }}>
                            📅 {myMeeting?.slot?.label || selectedSlot?.label || 'Confirmed slot'}
                        </div>
                        {isAuthor && post.status !== 'CLOSED' && (
                            <button type="button" onClick={onClosePost} className="px-btn ghost sm" style={{ width: '100%', justifyContent: 'center', marginBottom: '8px' }}>
                                <CheckCircle2 size={14} /> Mark Partner Found (Close)
                            </button>
                        )}
                        <a href="https://zoom.us" target="_blank" rel="noreferrer" className="px-btn primary" style={{ width: '100%', justifyContent: 'center' }}>
                            <Video size={16} /> Open external meeting
                        </a>
                    </motion.div>
                )}

                {post.status === 'CLOSED' && (
                    <div style={{ background: 'var(--panel-light)', padding: '20px', borderRadius: '14px', textAlign: 'center', border: '1px solid var(--border)' }}>
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <CheckCircle2 size={18} color="var(--secondary)" />
                            <h3 style={{ fontSize: '15px', margin: 0, fontWeight: '600', color: 'var(--badge-success-text)' }}>Partner Found</h3>
                        </div>
                        <p className="text-muted text-xs" style={{ margin: 0 }}>This announcement has been closed successfully.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default WorkflowActionPanel;
