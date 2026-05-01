import { useNavigate } from 'react-router-dom';
import { MapPin, MessageSquare, UserCircle } from 'lucide-react';

import { motion } from 'framer-motion';
import { useAnimReady } from '../../hooks/useAnimReady';
import '../../styles/login-cinematic.css';

const AuthorCard = ({ post, isAuthor, accentGradient }) => {
    const animReady = useAnimReady();
    const navigate = useNavigate();

    const authorName = post?.authorName || 'Unknown Author';
    const authorInitial = authorName.trim().charAt(0).toUpperCase() || '?';
    const authorRole = post?.authorRole || 'Member';
    const cityCountry = [post?.city, post?.country].filter(Boolean).join(', ');

    const isEngineer = /engineer/i.test(authorRole);
    const isPro = /healthcare|professional|clinician|doctor|md/i.test(authorRole);
    const badgeClass = isEngineer
        ? 'author-role-badge is-engineer'
        : isPro
            ? 'author-role-badge is-pro'
            : 'author-role-badge';

    return (
        <motion.div
            initial={animReady ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="editorial-panel"
            style={{ padding: '24px 26px' }}
        >
            <span className="editorial-eyebrow" style={{ marginBottom: '14px' }}>
                <UserCircle size={11} /> Posted By
            </span>
            <div className="flex items-start gap-3">
                <motion.div
                    whileHover={{ scale: 1.06, rotate: 4 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                    style={{
                        width: '46px', height: '46px', borderRadius: '14px',
                        background: accentGradient,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '18px', fontWeight: '800', color: '#070b0a',
                        boxShadow: '0 10px 24px rgba(96, 165, 250, 0.32), inset 0 1px 0 rgba(255,255,255,0.18)',
                        flexShrink: 0,
                        fontFamily: 'var(--font-heading)',
                        letterSpacing: '-0.02em',
                    }}
                    aria-hidden="true"
                >
                    {authorInitial}
                </motion.div>
                <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '14.5px', fontWeight: '600', letterSpacing: '-0.01em', color: 'var(--text-main)' }}>
                        {authorName}
                    </div>
                    <span className={badgeClass}>{authorRole}</span>
                    {cityCountry && (
                        <div className="author-meta-row">
                            <MapPin size={11} /> {cityCountry}
                        </div>
                    )}
                </div>
                {!isAuthor && post?.authorId && (
                    <motion.button
                        whileHover={{ scale: 1.04, y: -1 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => navigate('/chat', { state: { recipient: { id: post.authorId, name: authorName, role: authorRole } } })}
                        style={{
                            background: 'rgba(96, 165, 250, 0.08)',
                            border: '1px solid rgba(96, 165, 250, 0.22)',
                            color: '#93c5fd',
                            padding: '8px 13px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '12px',
                            fontWeight: '600',
                            letterSpacing: '0.02em',
                            transition: 'background 0.2s, border-color 0.2s',
                            flexShrink: 0,
                        }}
                        aria-label={`Send message to ${authorName}`}
                    >
                        <MessageSquare size={13} /> Message
                    </motion.button>
                )}
            </div>
        </motion.div>
    );
};

export default AuthorCard;
