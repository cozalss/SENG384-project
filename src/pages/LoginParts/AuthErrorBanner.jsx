// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

const AuthErrorBanner = ({ error, variant = 'form' }) => {
    if (variant === 'otp') {
        return (
            <AnimatePresence mode="wait">
                {error && (
                    <motion.div
                        key="err"
                        initial={{ opacity: 0, y: -8, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -8, height: 0 }}
                        role="alert"
                        style={{
                            background: 'rgba(239,68,68,0.08)',
                            border: '1px solid rgba(239,68,68,0.15)',
                            borderLeft: '3px solid var(--error)',
                            padding: '14px 18px',
                            color: 'var(--badge-error-text)',
                            fontSize: '13px',
                            marginBottom: '24px',
                            borderRadius: 'var(--border-radius-sm)',
                            lineHeight: '1.5',
                        }}
                    >
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>
        );
    }

    return (
        <AnimatePresence mode="wait">
            {error && (
                <motion.div
                    key="error"
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    role="alert"
                    style={{
                        background: 'rgba(239, 68, 68, 0.06)',
                        border: '1px solid rgba(239, 68, 68, 0.22)',
                        padding: '13px 16px',
                        color: '#fca5a5',
                        fontSize: '12.5px',
                        marginBottom: '20px',
                        borderRadius: '12px',
                        lineHeight: '1.55',
                        letterSpacing: '0.005em',
                        position: 'relative',
                        zIndex: 2,
                    }}
                >
                    {error}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AuthErrorBanner;
