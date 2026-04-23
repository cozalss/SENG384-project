import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, MapPin, Briefcase, Calendar, CheckCircle2,
    LockKeyhole, FileText, Clock, Sparkles,
} from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useAnimReady } from '../hooks/useAnimReady';
import { useToast } from '../hooks/useToast';
import { usePostEngagement } from '../hooks/usePostEngagement';

import NDAModal from './PostDetailParts/NDAModal';
import MeetingSlotsModal from './PostDetailParts/MeetingSlotsModal';
import EditPostModal from './PostDetailParts/EditPostModal';
import AuthorCard from './PostDetailParts/AuthorCard';
import WorkflowActionPanel from './PostDetailParts/WorkflowActionPanel';

const generateTimeSlots = () => {
    const slots = [];
    const now = new Date();
    for (let d = 1; d <= 5; d++) {
        const date = new Date(now);
        date.setDate(date.getDate() + d);
        if (date.getDay() === 0 || date.getDay() === 6) continue;
        for (const hour of [10, 14, 16]) {
            const slotDate = new Date(date);
            slotDate.setHours(hour, 0, 0, 0);
            slots.push({
                id: `slot-${d}-${hour}`,
                date: slotDate,
                label: `${slotDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at ${hour}:00`,
            });
        }
    }
    return slots;
};

const PostDetail = ({ posts, user, updatePost, updatePostStatus, addMeetingRequest, addInterest, respondToMeeting }) => {
    const animReady = useAnimReady();
    const toast = useToast();
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

    const isAuthor = user?.id === post?.authorId;
    // Subcollection-backed real-time engagement. Falls back to legacy arrays
    // if a post still has the old inline shape (mock data, pre-migration rows).
    const { interests: liveInterests, meetings: liveMeetings } = usePostEngagement(post?.id);
    const legacyInterests = Array.isArray(post?.interests) ? post.interests : [];
    const legacyMeetings = Array.isArray(post?.meetings) ? post.meetings : [];
    const interests = liveInterests.length ? liveInterests : legacyInterests;
    const meetings = liveMeetings.length ? liveMeetings : legacyMeetings;

    const myInterest = interests.find(i => i && i.userId === user?.id);
    const myMeeting = meetings.find(m => m && (
        m.proposedBy === user?.id ||
        (isAuthor && m.status === 'accepted')
    ));

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
                    initial={animReady ? { opacity: 0, scale: 0.95 } : false}
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

    const canExpressInterest = !isAuthor && user?.role !== post.authorRole && post.status === 'Active';
    const isConfidential = post.confidentiality === 'meeting-only';
    const pendingMeetings = meetings.filter(m => m && m.status === 'pending');

    const submitInterest = () => {
        if (!acceptedNda) return;
        setShowNda(false);
        if (addInterest) {
            addInterest(post.id, {
                userId: user?.id,
                userName: user?.name,
                message: interestMessage || 'Interested in your project.',
                timestamp: new Date().toISOString(),
            });
        }
        toast.success('The author has been notified of your interest.', { title: 'Interest sent' });
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
                timestamp: new Date().toISOString(),
            });
            toast.success(`Proposed: ${selectedSlot.label}. Waiting for author confirmation.`, {
                title: 'Meeting request sent',
            });
        }
        setShowMeetingModal(false);
    };

    const handleRespondMeeting = (meetingId, decision) => {
        respondToMeeting(post.id, meetingId, decision);
        toast.success(
            decision === 'accepted' ? 'Meeting confirmed — notify the other side externally.' : 'Meeting declined.',
            { title: decision === 'accepted' ? 'Accepted' : 'Declined' }
        );
    };

    const handleClosePost = () => {
        updatePostStatus(post.id, 'CLOSED');
        toast.success('Announcement closed — partner found.', { title: 'Closed' });
    };

    const handleOpenEdit = () => {
        setEditTitle(post.title);
        setEditDescription(post.explanation);
        setShowEditModal(true);
    };

    const handleSaveEdit = () => {
        if (updatePost) {
            updatePost(post.id, { title: editTitle, explanation: editDescription });
        }
        setEditSaved(true);
    };

    const accentGradient = post.authorRole === 'Engineer'
        ? 'linear-gradient(135deg, var(--primary), var(--accent))'
        : 'linear-gradient(135deg, var(--secondary), #34d399)';

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '80px' }}>
            <motion.button
                initial={animReady ? { opacity: 0, x: -10 } : false}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ x: -2 }}
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-muted mb-6 font-medium"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.2s', fontSize: '13px', letterSpacing: '0.02em' }}
                onMouseOver={(e) => e.target.style.color = '#93c5fd'}
                onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}
            >
                <ArrowLeft size={15} /> Return to Network
            </motion.button>

            <div className="post-detail-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) 1fr', gap: '24px', alignItems: 'start' }}>
                <motion.div
                    initial={animReady ? { opacity: 0, y: 20 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="editorial-panel"
                    style={{ padding: '40px 44px 36px' }}
                >
                    <div className="flex gap-2 items-center mb-5" style={{ flexWrap: 'wrap' }}>
                        <span className={`pill ${post.status === 'CLOSED' ? 'pill-neon' : post.status === 'Meeting Scheduled' ? 'pill-cyan' : 'pill-neon'}`}>
                            {post.status === 'CLOSED' ? 'Partner Found' : (post.status || 'Active')}
                        </span>
                        {post.domain && <span className="pill pill-dim">{post.domain}</span>}
                        {post.authorRole && <span className="pill pill-cyan">{post.authorRole}</span>}
                        {isConfidential && (
                            <span className="pill pill-amber" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                <LockKeyhole size={10} /> Confidential
                            </span>
                        )}
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(28px, 3.6vw, 44px)',
                        lineHeight: '1.08',
                        marginBottom: '24px',
                        letterSpacing: '-0.035em',
                        fontFamily: 'var(--font-heading)',
                        fontWeight: '800',
                    }}>
                        {post.title || 'Untitled announcement'}
                    </h1>

                    <div className="flex items-center gap-2 flex-wrap" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '28px' }}>
                        {[
                            post.projectStage && { icon: <Briefcase size={12} />, text: post.projectStage, capitalize: true },
                            (post.city || post.country) && { icon: <MapPin size={12} />, text: [post.city, post.country].filter(Boolean).join(', ') },
                            post.createdAt && { icon: <Calendar size={12} />, text: (() => {
                                const d = new Date(post.createdAt);
                                return isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
                            })() },
                        ].filter(Boolean).map((item, i) => (
                            <div key={i} className="flex items-center gap-1.5" style={{
                                background: 'rgba(7, 11, 10, 0.5)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                padding: '6px 12px', borderRadius: '9px',
                                fontSize: '11.5px', color: 'var(--text-muted)',
                                textTransform: item.capitalize ? 'capitalize' : 'none',
                                letterSpacing: '0.01em', fontWeight: '500',
                            }}>
                                {item.icon} {item.text}
                            </div>
                        ))}
                        {post.expiryDate && (
                            <div className="flex items-center gap-1.5" style={{
                                background: 'rgba(245, 158, 11, 0.06)',
                                border: '1px solid rgba(245, 158, 11, 0.18)',
                                padding: '6px 12px', borderRadius: '9px',
                                color: '#fcd34d', fontSize: '11.5px', fontWeight: '500',
                            }}>
                                <Clock size={12} /> Expires: {new Date(post.expiryDate).toLocaleDateString()}
                            </div>
                        )}
                    </div>

                    <section style={{ marginTop: '32px' }}>
                        <span className="editorial-eyebrow" style={{ marginBottom: '14px' }}>
                            <Sparkles size={11} /> Executive Overview
                        </span>
                        <p style={{ fontSize: '16px', lineHeight: '1.85', color: 'var(--text-main)', letterSpacing: '-0.005em' }}>
                            {post.explanation}
                        </p>
                    </section>

                    {post.highLevelIdea && (
                        <section style={{ marginTop: '36px' }}>
                            <span className="editorial-eyebrow cyan" style={{ marginBottom: '14px' }}>
                                <FileText size={11} /> Technical Blueprint
                            </span>

                            {isConfidential && !isAuthor ? (
                                <div style={{
                                    background: 'rgba(245, 158, 11, 0.04)',
                                    padding: '20px 22px', borderRadius: '16px',
                                    border: '1px solid rgba(245, 158, 11, 0.18)',
                                    display: 'flex', gap: '16px',
                                }}>
                                    <LockKeyhole size={20} color="#fcd34d" style={{ flexShrink: 0, marginTop: '2px' }} />
                                    <div>
                                        <h4 style={{ color: '#fcd34d', fontSize: '14px', marginBottom: '4px', fontWeight: '700', letterSpacing: '-0.01em' }}>Information Restricted</h4>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', lineHeight: '1.7', margin: 0 }}>
                                            This section is locked under NDA protocol. Express interest, sign the non-disclosure terms, and schedule a meeting to review details.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div style={{
                                    background: 'rgba(34, 211, 238, 0.04)',
                                    border: '1px solid rgba(34, 211, 238, 0.14)',
                                    padding: '22px 24px', borderRadius: '16px',
                                }}>
                                    <p style={{ fontSize: '15px', lineHeight: '1.85', color: 'var(--text-main)', margin: 0, letterSpacing: '-0.005em' }}>
                                        {post.highLevelIdea}
                                    </p>
                                </div>
                            )}
                        </section>
                    )}

                    <section style={{ marginTop: '36px', marginBottom: '4px' }}>
                        <span className="editorial-eyebrow" style={{ marginBottom: '14px' }}>
                            <CheckCircle2 size={11} /> Required Expertise
                        </span>
                        <div style={{
                            background: 'rgba(96, 165, 250, 0.04)',
                            border: '1px solid rgba(96, 165, 250, 0.14)',
                            padding: '22px 24px', borderRadius: '16px',
                        }}>
                            <p style={{ fontSize: '15px', lineHeight: '1.85', color: 'var(--text-main)', margin: 0, letterSpacing: '-0.005em' }}>
                                {post.expertiseNeeded}
                            </p>
                        </div>
                    </section>
                </motion.div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <WorkflowActionPanel
                        post={post}
                        isAuthor={isAuthor}
                        isConfidential={isConfidential}
                        canExpressInterest={canExpressInterest}
                        derivedWorkflowState={derivedWorkflowState}
                        myMeeting={myMeeting}
                        selectedSlot={selectedSlot}
                        pendingMeetings={pendingMeetings}
                        onClosePost={handleClosePost}
                        onOpenEdit={handleOpenEdit}
                        onRespondMeeting={handleRespondMeeting}
                        onOpenNda={() => setShowNda(true)}
                        onProposeMeeting={handleProposeMeeting}
                    />

                    <AuthorCard post={post} isAuthor={isAuthor} accentGradient={accentGradient} />
                </div>
            </div>

            {typeof document !== 'undefined' && createPortal(
                <>
                    <NDAModal
                        open={showNda}
                        onClose={() => setShowNda(false)}
                        acceptedNda={acceptedNda}
                        onToggleNda={() => setAcceptedNda(!acceptedNda)}
                        interestMessage={interestMessage}
                        onChangeMessage={setInterestMessage}
                        onSubmit={submitInterest}
                    />
                    <MeetingSlotsModal
                        open={showMeetingModal}
                        onClose={() => setShowMeetingModal(false)}
                        slots={proposedSlots}
                        selectedSlot={selectedSlot}
                        onSelectSlot={setSelectedSlot}
                        onSend={handleSendMeetingRequest}
                    />
                    <EditPostModal
                        open={showEditModal}
                        onClose={() => setShowEditModal(false)}
                        title={editTitle}
                        description={editDescription}
                        onChangeTitle={setEditTitle}
                        onChangeDescription={setEditDescription}
                        onSave={handleSaveEdit}
                        saved={editSaved}
                        onResetSaved={() => setEditSaved(false)}
                    />
                </>,
                document.body
            )}
        </div>
    );
};

export default PostDetail;
