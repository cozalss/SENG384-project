import { useNavigate } from 'react-router-dom';
import { MessageSquare, UserCircle } from 'lucide-react';
 
import { motion } from 'framer-motion';
import { useAnimReady } from '../../hooks/useAnimReady';

const AuthorCard = ({ post, isAuthor, accentGradient }) => {
    const animReady = useAnimReady();
    const navigate = useNavigate();

    const authorName = post?.authorName || 'Unknown Author';
    const authorInitial = authorName.trim().charAt(0).toUpperCase() || '?';
    const authorRole = post?.authorRole || 'Member';

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
            <div className="flex items-center gap-3">
                <motion.div
                    whileHover={{ scale: 1.06, rotate: 4 }}
                    style={{
                        width: '42px', height: '42px', borderRadius: '13px',
                        background: accentGradient,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '17px', fontWeight: '800', color: '#070b0a',
                        boxShadow: '0 8px 22px rgba(96, 165, 250, 0.3)'
                    }}
                    aria-hidden="true"
                >
                    {authorInitial}
                </motion.div>
                <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', letterSpacing: '-0.01em' }}>{authorName}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-subtle)', letterSpacing: '0.02em' }}>{authorRole}</div>
                </div>
                {!isAuthor && post?.authorId && (
                    <motion.button
                        whileHover={{ scale: 1.04, y: -1 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => navigate('/chat', { state: { recipient: { id: post.authorId, name: authorName, role: authorRole } } })}
                        style={{
                            marginLeft: 'auto',
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
                            transition: 'background 0.2s, border-color 0.2s'
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
