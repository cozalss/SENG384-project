import { useState } from 'react';
import { createPortal } from 'react-dom';

import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Briefcase, Calendar, CheckCircle2, ShieldAlert, Send, Video, LockKeyhole, FileText, UserCircle, Clock, X, Edit3, MessageSquare, Sparkles, ArrowUpRight } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
const PostDetail = ({ posts, user, updatePost, updatePostStatus, addMeetingRequest, addInterest, respondToMeeting }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const post = posts.find((p) => p.id === id);

    const [showNda, setShowNda] = useState(false);
    const [acceptedNda, setAcceptedNda] = useState(false);
    const [interestMessage, setInterestMessage] = useState('');
    const [showMeetingModal, setShowMeetingModal] = useState(false);
    const [proposedSlots, setProposedSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editSaved, setEditSaved] = useState(false);

    const myInterest = post?.interests?.find(i => i.userId === user?.id);
    const myMeeting = post?.meetings?.find(m => m.proposedBy === user?.id);

    let derivedWorkflowState = 'initial';
    if (myMeeting) {
        if (myMeeting.status === 'accepted') derivedWorkflowState = 'scheduled';
        else if (myMeeting.status === 'declined') derivedWorkflowState = 'declined';
        else derivedWorkflowState = 'meeting-requested';
    } else if (myInterest) {
        derivedWorkflowState = 'interested';
    }

    if (!post) {
        return (
            <div className="flex justify-center items-center" style={{ minHeight: '60vh' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-panel"
                    style={{ padding: '64px', textAlign: 'center', width: '100%', maxWidth: '500px' }}
                >
                    <FileText size={48} color="var(--text-subtle)" style={{ margin: '0 auto 16px', opacity: 0.4 }} />
                    <h2 style={{ fontSize: '24px', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>Project Not Found</h2>
                    <p className="text-muted mb-6">The requested collaboration protocol does not exist or has been removed.</p>
                    <button className="btn btn-secondary" onClick={() => navigate('/dashboard')} style={{ width: '100%', borderRadius: '12px' }}>
                        Return to Feed
                    </button>
                </motion.div>
            </div>
        );
    }

    const isAuthor = user?.id === post.authorId;
    const canExpressInterest = !isAuthor && user?.role !== post.authorRole && post.status === 'Active';
    const isConfidential = post.confidentiality === 'meeting-only';

    const submitInterest = () => {
        if (acceptedNda) {
            setShowNda(false);
            if (addInterest) {
                addInterest(post.id, {
                    userId: user?.id,
                    userName: user?.name,
                    message: interestMessage || 'Interested in your project.',
                    timestamp: new Date().toISOString()
                });
            }
        }
    };

    const generateTimeSlots = () => {
        const slots = [];
        const now = new Date();
        for (let d = 1; d <= 5; d++) {
            const date = new Date(now);
            date.setDate(date.getDate() + d);
            if (date.getDay() === 0 || date.getDay() === 6) continue;
            for (const hour of [10, 14, 16]) {
                date.setHours(hour, 0, 0, 0);
                slots.push({
                    id: `slot-${d}-${hour}`,
                    date: new Date(date),
                    label: `${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at ${hour}:00`
                });
            }
        }
        return slots;
    };

    const handleProposeMeeting = () => {
        setProposedSlots(generateTimeSlots());
        setShowMeetingModal(true);
    };

    const handleSendMeetingRequest = () => {
        if (selectedSlot && addMeetingRequest) {
            addMeetingRequest(post.id, {
                proposedBy: user?.id,
                proposedByName: user?.name,
                slot: selectedSlot,
                status: 'pending',
                timestamp: new Date().toISOString()
            });
        }
        setShowMeetingModal(false);
    };

    const getStatusBadge = () => {
        switch (post.status) {
            case 'Active': return 'badge-primary';
            case 'Meeting Scheduled': return 'badge-accent';
            case 'CLOSED': return 'badge-success';
            default: return 'badge-primary';
        }
    };

    const accentGradient = post.authorRole === 'Engineer'
        ? 'linear-gradient(135deg, var(--primary), var(--accent))'
        : 'linear-gradient(135deg, var(--secondary), #34d399)';

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '80px' }}>

            <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-muted mb-8 font-medium"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.2s' }}
                onMouseOver={(e) => e.target.style.color = 'var(--text-main)'}
                onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}
            >
                <ArrowLeft size={16} /> Return to Network
            </motion.button>

            <div className="post-detail-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) 1fr', gap: '24px', alignItems: 'start' }}>

                {/* Main Content Pane */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="glass-panel"
                    style={{ position: 'relative', overflow: 'hidden', padding: '0' }}
                >
                    {/* Top accent */}
                    <div style={{ height: '3px', width: '100%', background: accentGradient }} />

                    <div style={{ padding: '36px 40px 32px' }}>
                        <div className="flex gap-2 items-center mb-6 flex-wrap">
                            <span className={`badge ${getStatusBadge()}`} style={{ padding: '7px 14px', fontSize: '11px' }}>
                                <span className={`status-dot ${post.status === 'Active' ? 'status-dot-active' : post.status === 'Meeting Scheduled' ? 'status-dot-meeting' : 'status-dot-closed'}`}></span>
                                {post.status === 'CLOSED' ? 'Partner Found' : post.status}
                            </span>
                            <span className="badge badge-warning text-sm" style={{ textTransform: 'none', padding: '7px 14px', fontSize: '11px' }}>
                                {post.domain}
                            </span>
                            <span className={`badge ${post.authorRole === 'Engineer' ? 'badge-primary' : 'badge-success'}`} style={{ padding: '7px 14px', fontSize: '11px' }}>
                                {post.authorRole}
                            </span>
                            {isConfidential && (
                                <span className="badge badge-error flex items-center gap-1" style={{ padding: '7px 14px', fontSize: '11px' }}>
                                    <LockKeyhole size={11} /> Confidential
                                </span>
                            )}
                        </div>

                        <h1 style={{ fontSize: '32px', lineHeight: '1.25', marginBottom: '24px', letterSpacing: '-0.03em', fontFamily: 'var(--font-heading)' }}>{post.title}</h1>

                        <div className="flex items-center gap-4 text-muted font-medium text-sm flex-wrap" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '28px' }}>
                            {[
                                { icon: <Briefcase size={14} />, text: `Stage: ${post.projectStage}`, capitalize: true },
                                { icon: <MapPin size={14} />, text: `${post.city}, ${post.country}` },
                                { icon: <Calendar size={14} />, text: `Posted: ${new Date(post.createdAt).toLocaleDateString()}` }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-2" style={{
                                    background: 'var(--panel-light)', padding: '6px 14px', borderRadius: '10px',
                                    fontSize: '13px', textTransform: item.capitalize ? 'capitalize' : 'none'
                                }}>
                                    {item.icon} {item.text}
                                </div>
                            ))}
                            {post.expiryDate && (
                                <div className="flex items-center gap-2" style={{ background: 'rgba(245, 158, 11, 0.06)', padding: '6px 14px', borderRadius: '10px', color: 'var(--badge-warning-text)', fontSize: '13px' }}>
                                    <Clock size={14} /> Expires: {new Date(post.expiryDate).toLocaleDateString()}
                                </div>
                            )}
                        </div>

                        <section style={{ marginTop: '36px' }}>
                            <h3 style={{ fontSize: '18px', marginBottom: '16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-heading)' }}>
                                <span style={{ color: 'var(--primary-light)', fontSize: '14px', fontWeight: '800' }}>//</span> Executive Overview
                            </h3>
                            <p style={{ fontSize: '16px', lineHeight: '1.85', color: 'var(--text-main)' }}>{post.explanation}</p>
                        </section>

                        {post.highLevelIdea && (
                            <section style={{ marginTop: '40px' }}>
                                <h3 style={{ fontSize: '18px', marginBottom: '16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-heading)' }}>
                                    <span style={{ color: 'var(--accent-light)', fontSize: '14px', fontWeight: '800' }}>//</span> Technical Blueprint
                                </h3>

                                {isConfidential && !isAuthor ? (
                                    <div style={{ background: 'rgba(245, 158, 11, 0.04)', padding: '24px', borderRadius: '14px', borderLeft: '3px solid #f59e0b', border: '1px solid rgba(245, 158, 11, 0.08)', display: 'flex', gap: '16px' }}>
                                        <LockKeyhole size={24} color="#fcd34d" style={{ flexShrink: 0, marginTop: '2px' }} />
                                        <div>
                                            <h4 style={{ color: 'var(--badge-warning-text)', fontSize: '15px', marginBottom: '4px', fontWeight: '600' }}>Information Restricted</h4>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.65', margin: 0 }}>This section is locked under NDA protocol. Express interest, sign the non-disclosure terms, and schedule a meeting to review details.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ background: 'rgba(34, 211, 238, 0.04)', border: '1px solid rgba(34, 211, 238, 0.12)', padding: '24px', borderRadius: '14px' }}>
                                        <p style={{ fontSize: '15px', lineHeight: '1.85', color: 'var(--text-main)', margin: 0 }}>{post.highLevelIdea}</p>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Expertise Needed Section */}
                        <section style={{ marginTop: '40px', marginBottom: '28px' }}>
                            <h3 style={{ fontSize: '18px', marginBottom: '16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-heading)' }}>
                                <span style={{ color: 'var(--badge-success-text)', fontSize: '14px', fontWeight: '800' }}>//</span> Required Expertise
                            </h3>
                            <div style={{ background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.1)', padding: '24px', borderRadius: '14px' }}>
                                <p style={{ fontSize: '15px', lineHeight: '1.85', color: 'var(--text-main)', margin: 0 }}>{post.expertiseNeeded}</p>
                            </div>
                        </section>
                    </div>
                </motion.div>

                {/* Sidebar / Interaction Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="glass-panel"
                        style={{ padding: '28px' }}
                    >
                        <h3 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-subtle)', borderBottom: '1px solid var(--border)', paddingBottom: '14px', marginBottom: '20px' }}>
                            Target Counterparty
                        </h3>

                        <div className="flex items-center gap-4 mb-6 text-sm">
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '12px',
                                background: post.authorRole === 'Engineer' ? 'rgba(16,185,129,0.08)' : 'rgba(94, 210, 156,0.08)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: `1px solid ${post.authorRole === 'Engineer' ? 'rgba(16,185,129,0.15)' : 'rgba(94, 210, 156,0.15)'}`
                            }}>
                                <UserCircle size={22} color={post.authorRole === 'Engineer' ? 'var(--secondary)' : 'var(--primary-light)'} />
                            </div>
                            <div>
                                <span className="text-muted block font-medium" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Required Role</span>
                                <span style={{ fontWeight: '700', fontSize: '14px', color: post.authorRole === 'Engineer' ? '#6ee7b7' : '#a5b4fc' }}>
                                    {post.authorRole === 'Engineer' ? 'Healthcare Professional' : 'Engineering Expert'}
                                </span>
                            </div>
                        </div>

                        <div style={{ background: 'var(--panel-light)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border)' }}>
                            <div className="mb-4">
                                <span className="text-xs text-muted block mb-1 font-semibold" style={{ textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.06em' }}>Collaboration Type</span>
                                <span className="font-semibold text-sm" style={{ textTransform: 'capitalize' }}>{post.commitmentLevel}</span>
                            </div>
                            <div>
                                <span className="text-xs text-muted block mb-1 font-semibold" style={{ textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.06em' }}>Data Sharing Level</span>
                                <span className="font-semibold text-sm" style={{ color: isConfidential ? '#fca5a5' : '#6ee7b7' }}>
                                    {isConfidential ? 'NDA Required' : 'Public Information'}
                                </span>
                            </div>
                        </div>

                        {/* Workflow Action Container */}
                        <div style={{ marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>

                            {/* Author actions */}
                            {isAuthor && post.status !== 'CLOSED' && (
                                <div className="flex-col gap-3">
                                    <p className="text-xs text-muted text-center" style={{ lineHeight: '1.6' }}>You can close this announcement when a partner is found.</p>
                                    <button onClick={() => updatePostStatus(post.id, 'CLOSED')} className="btn btn-success" style={{ width: '100%', padding: '12px', borderRadius: '12px' }}>
                                        <CheckCircle2 size={16} /> Partner Found (Close)
                                    </button>
                                    <button onClick={() => { setEditTitle(post.title); setEditDescription(post.explanation); setShowEditModal(true); }} className="btn btn-secondary" style={{ width: '100%', padding: '12px', borderRadius: '12px' }}>
                                        <Edit3 size={16} /> Edit Announcement
                                    </button>
                                    
                                    {post.meetings && post.meetings.filter(m => m.status === 'pending').length > 0 && (
                                        <div style={{ marginTop: '16px' }}>
                                            <h4 style={{ fontSize: '13px', color: 'var(--text-main)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Requests</h4>
                                            {post.meetings.filter(m => m.status === 'pending').map(m => (
                                                <div key={m.id} style={{ background: 'var(--panel-lighter)', padding: '16px', borderRadius: '12px', marginBottom: '8px', border: '1px solid var(--border)' }}>
                                                    <div style={{ fontSize: '14px', marginBottom: '12px', lineHeight: '1.4' }}>
                                                        <strong style={{ color: 'var(--primary-light)' }}>{m.proposedByName}</strong> requested meeting slot:<br/>
                                                        <span style={{ color: 'var(--badge-primary-text)', fontSize: '13px' }}>📅 {m.slot?.label}</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => respondToMeeting(post.id, m.id, 'accepted')} className="btn btn-success" style={{ padding: '8px 12px', fontSize: '12px', flex: 1 }}>Accept</button>
                                                        <button onClick={() => respondToMeeting(post.id, m.id, 'declined')} className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '12px', flex: 1, color: 'var(--badge-error-text)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>Decline</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 1: Express Interest */}
                            {canExpressInterest && derivedWorkflowState === 'initial' && (
                                <div className="flex-col gap-3">
                                    <button id="express-interest-btn" onClick={() => setShowNda(true)} className="btn btn-accent" style={{ width: '100%', padding: '16px', fontSize: '15px', borderRadius: '14px', boxShadow: '0 6px 20px rgba(94, 210, 156,0.25)' }}>
                                        <Send size={18} /> Express Interest
                                    </button>
                                    <p className="text-xs text-muted text-center" style={{ lineHeight: '1.5' }}>
                                        NDA acceptance required before contact
                                    </p>
                                </div>
                            )}

                            {/* Step 2: Interest Sent */}
                            {derivedWorkflowState === 'interested' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.12)', padding: '24px', borderRadius: '14px', textAlign: 'center' }}
                                >
                                    <CheckCircle2 color="#34d399" size={28} style={{ margin: '0 auto 12px' }} />
                                    <h3 style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--badge-success-text)', fontWeight: '600' }}>Interest Expressed</h3>
                                    <p className="text-muted text-xs mb-4" style={{ lineHeight: '1.6' }}>The author has been notified. Propose available time slots for an external meeting.</p>
                                    <button onClick={handleProposeMeeting} className="btn btn-primary" style={{ width: '100%', fontSize: '14px', padding: '12px', borderRadius: '12px' }}>
                                        <Calendar size={16} /> Propose Meeting Times
                                    </button>
                                </motion.div>
                            )}

                            {/* Step 3: Meeting Requested */}
                            {derivedWorkflowState === 'meeting-requested' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    style={{ background: 'rgba(94, 210, 156, 0.06)', border: '1px solid rgba(94, 210, 156, 0.12)', padding: '24px', borderRadius: '14px', textAlign: 'center' }}
                                >
                                    <Clock color="#8be8bc" size={28} style={{ margin: '0 auto 12px' }} />
                                    <h3 style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--badge-primary-text)', fontWeight: '600' }}>Meeting Request Sent</h3>
                                    <p className="text-muted text-xs mb-4" style={{ lineHeight: '1.6' }}>
                                        Waiting for the author to accept your proposed time slot. You will be notified once confirmed.
                                    </p>
                                    <div style={{ background: 'var(--panel-base)', padding: '12px', borderRadius: '10px', fontSize: '13px', color: 'var(--badge-primary-text)', marginBottom: '12px' }}>
                                        📅 {myMeeting?.slot?.label || selectedSlot?.label || 'Slot selected'}
                                    </div>
                                </motion.div>
                            )}
                            
                            {/* Meeting Declined */}
                            {derivedWorkflowState === 'declined' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    style={{ background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.15)', padding: '24px', borderRadius: '14px', textAlign: 'center' }}
                                >
                                    <X color="#fca5a5" size={28} style={{ margin: '0 auto 12px' }} />
                                    <h3 style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--badge-error-text)', fontWeight: '600' }}>Meeting Declined</h3>
                                    <p className="text-muted text-xs mb-4" style={{ lineHeight: '1.6' }}>
                                        The author has declined your proposed meeting time. 
                                    </p>
                                    <button onClick={handleProposeMeeting} className="btn btn-primary" style={{ width: '100%', fontSize: '14px', padding: '12px', borderRadius: '12px' }}>
                                        <Calendar size={16} /> Propose New Time
                                    </button>
                                </motion.div>
                            )}

                            {/* Step 4: Meeting confirmed */}
                            {derivedWorkflowState === 'scheduled' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
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
                                    <a href="https://zoom.us" target="_blank" rel="noreferrer" className="btn btn-accent" style={{ width: '100%', fontSize: '14px', padding: '12px', textDecoration: 'none', borderRadius: '12px' }}>
                                        <Video size={16} /> Open External Meeting
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

                    {/* Author Info Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="glass-panel"
                        style={{ padding: '24px' }}
                    >
                        <h4 style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Posted By</h4>
                        <div className="flex items-center gap-4">
                            <div style={{
                                width: '44px', height: '44px', borderRadius: '14px',
                                background: accentGradient,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '18px', fontWeight: '700', color: 'white',
                                boxShadow: '0 6px 16px rgba(0,0,0,0.3)'
                            }}>
                                {post.authorName.charAt(0)}
                            </div>
                            <div>
                                <div style={{ fontSize: '15px', fontWeight: '600' }}>{post.authorName}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>{post.authorRole}</div>
                            </div>
                            {!isAuthor && (
                                <button 
                                    onClick={() => navigate('/chat', { state: { recipient: { id: post.authorId, name: post.authorName, role: post.authorRole } } })}
                                    style={{
                                        marginLeft: 'auto',
                                        background: 'var(--panel-lighter)',
                                        border: '1px solid var(--border)',
                                        color: '#fff',
                                        padding: '8px 12px',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontSize: '13px',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; }}
                                >
                                    <MessageSquare size={14} /> Message
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>



            {/* Portal-rendered Modals to escape PageTransition transform/filter constraints */}
            {typeof document !== 'undefined' && createPortal(
                <>
                    {/* NDA Modal */}
                    <AnimatePresence>
                        {showNda && (
                            <div className="modal-overlay">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.92, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.92, y: 20 }}
                                    className="glass-panel modal-content"
                                    style={{ borderRadius: '24px', maxWidth: '580px', margin: 'auto' }}
                                >
                                    <div className="flex items-center gap-4 mb-8" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '24px' }}>
                                        <div style={{ background: 'rgba(239, 68, 68, 0.12)', padding: '12px', borderRadius: '16px', boxShadow: '0 0 20px rgba(239, 68, 68, 0.1)' }}>
                                            <ShieldAlert color="var(--error)" size={32} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0, letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)' }}>Non-Disclosure Agreement</h2>
                                            <div style={{ fontSize: '13px', color: 'var(--text-subtle)', marginTop: '4px' }}>Standard IP Protection Protocol</div>
                                        </div>
                                        <button onClick={() => setShowNda(false)} className="btn-icon">
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
                                        <label className="text-sm font-semibold flex items-center gap-2 mb-1" style={{ color: 'var(--text-muted)' }}>
                                            <MessageSquare size={14} /> Short Message (Optional)
                                        </label>
                                        <textarea
                                            className="input-field"
                                            style={{ minHeight: '100px', resize: 'vertical', borderRadius: '16px' }}
                                            placeholder="Introduce yourself and explain why this project interests you..."
                                            value={interestMessage}
                                            onChange={(e) => setInterestMessage(e.target.value)}
                                        />
                                    </div>

                                    <motion.div
                                        whileTap={{ scale: 0.98 }}
                                        className="flex items-start gap-4 mb-10"
                                        style={{
                                            background: acceptedNda ? 'rgba(94, 210, 156, 0.08)' : 'var(--background-alt)',
                                            padding: '24px',
                                            borderRadius: '18px',
                                            border: '1px solid',
                                            borderColor: acceptedNda ? 'rgba(94, 210, 156, 0.3)' : 'rgba(255,255,255,0.06)',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onClick={() => setAcceptedNda(!acceptedNda)}
                                    >
                                        <div style={{
                                            width: '26px', height: '26px', borderRadius: '8px',
                                            border: '2px solid',
                                            borderColor: acceptedNda ? 'var(--primary)' : 'var(--text-subtle)',
                                            background: acceptedNda ? 'var(--primary)' : 'transparent',
                                            flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            transition: 'all 0.25s', marginTop: '2px',
                                            boxShadow: acceptedNda ? '0 0 15px rgba(94, 210, 156, 0.4)' : 'none'
                                        }}>
                                            {acceptedNda && <CheckCircle2 size={16} color="white" strokeWidth={3} />}
                                        </div>
                                        <div style={{ fontSize: '14px', color: acceptedNda ? 'var(--text-main)' : 'var(--text-muted)', userSelect: 'none', lineHeight: '1.6', fontWeight: acceptedNda ? '600' : '400' }}>
                                            I accept the Non-Disclosure Agreement and understand that all shared information is confidential.
                                        </div>
                                    </motion.div>

                                    <div className="flex justify-end gap-4">
                                        <button className="btn btn-secondary" onClick={() => setShowNda(false)} style={{ padding: '14px 28px', borderRadius: '14px' }}>Cancel</button>
                                        <button className="btn btn-accent" disabled={!acceptedNda} onClick={submitInterest} style={{ padding: '14px 36px', borderRadius: '14px' }}>
                                            Accept & Express Interest <Send size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Meeting Time Slot Modal */}
                    <AnimatePresence>
                        {showMeetingModal && (
                            <div className="modal-overlay">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.92, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.92, y: 20 }}
                                    className="glass-panel modal-content"
                                    style={{ maxWidth: '650px', borderRadius: '24px', margin: 'auto' }}
                                >
                                    <div className="flex items-center gap-4 mb-8" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '24px' }}>
                                        <div style={{ background: 'rgba(94, 210, 156, 0.12)', padding: '12px', borderRadius: '16px', boxShadow: '0 0 20px rgba(94, 210, 156, 0.1)' }}>
                                            <Calendar color="var(--primary-light)" size={32} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0, fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>Propose Meeting Times</h2>
                                            <div style={{ fontSize: '13px', color: 'var(--text-subtle)', marginTop: '4px' }}>Select a preferred slot for external collaboration</div>
                                        </div>
                                        <button onClick={() => setShowMeetingModal(false)} className="btn-icon">
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
                                        {proposedSlots.map(slot => (
                                            <motion.div
                                                key={slot.id}
                                                whileHover={{ y: -4, scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className={`time-slot ${selectedSlot?.id === slot.id ? 'time-slot-selected' : ''}`}
                                                style={{ padding: '16px', height: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}
                                                onClick={() => setSelectedSlot(slot)}
                                            >
                                                <div style={{ fontSize: '13px', fontWeight: '700' }}>{slot.label.split(' at ')[0]}</div>
                                                <div style={{ fontSize: '11px', opacity: 0.7 }}>{slot.label.split(' at ')[1]}</div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    <div className="flex justify-end gap-4">
                                        <button className="btn btn-secondary" onClick={() => setShowMeetingModal(false)} style={{ padding: '14px 28px', borderRadius: '14px' }}>Cancel</button>
                                        <button className="btn btn-accent" disabled={!selectedSlot} onClick={handleSendMeetingRequest} style={{ padding: '14px 36px', borderRadius: '14px' }}>
                                            <Send size={18} /> Send Meeting Request
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Edit Modal */}
                    <AnimatePresence>
                        {showEditModal && (
                            <div className="modal-overlay">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.92, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.92, y: 20 }}
                                    className="glass-panel modal-content"
                                    style={{ borderRadius: '24px', maxWidth: '600px', margin: 'auto' }}
                                >
                                    <div className="flex items-center gap-4 mb-8" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '24px' }}>
                                        <div style={{ background: 'rgba(34, 211, 238, 0.12)', padding: '12px', borderRadius: '16px' }}>
                                            <Edit3 color="var(--accent-light)" size={32} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0, fontFamily: 'var(--font-heading)' }}>Edit Announcement</h2>
                                        </div>
                                        <button onClick={() => { setShowEditModal(false); setEditSaved(false); }} className="btn-icon">
                                            <X size={20} />
                                        </button>
                                    </div>

                                    {editSaved && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            style={{
                                                background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)',
                                                borderLeft: '4px solid var(--secondary)', padding: '16px 20px', marginBottom: '28px',
                                                borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px'
                                            }}>
                                            <CheckCircle2 size={20} color="#34d399" />
                                            <span style={{ fontSize: '15px', color: 'var(--badge-success-text)', fontWeight: '600' }}>Announcement updated successfully</span>
                                        </motion.div>
                                    )}

                                    <div className="flex-col gap-6 mb-10">
                                        <div className="flex-col gap-2">
                                            <label className="text-sm font-semibold color-muted">Protocol Title</label>
                                            <input type="text" className="input-field" style={{ borderRadius: '16px' }} value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                                        </div>
                                        <div className="flex-col gap-2">
                                            <label className="text-sm font-semibold color-muted">Clinical Context</label>
                                            <textarea className="input-field" style={{ minHeight: '140px', borderRadius: '16px' }} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-4">
                                        <button className="btn btn-secondary" onClick={() => { setShowEditModal(false); setEditSaved(false); }} style={{ padding: '14px 28px', borderRadius: '14px' }}>Cancel</button>
                                        <button className="btn btn-accent" onClick={() => {
                                            if (updatePost) {
                                                updatePost(post.id, { title: editTitle, explanation: editDescription });
                                            }
                                            setEditSaved(true);
                                            setTimeout(() => { setShowEditModal(false); setEditSaved(false); }, 1200);
                                        }} style={{ padding: '14px 28px', borderRadius: '14px' }}>
                                            <CheckCircle2 size={18} /> Save Changes
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </>
                , document.body
            )}


        </div>
    );
};

export default PostDetail;
