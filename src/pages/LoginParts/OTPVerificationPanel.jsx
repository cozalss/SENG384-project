import { useRef } from 'react';
import { ArrowLeft, ArrowRight, Mail, RefreshCw, Shield } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import AuthErrorBanner from './AuthErrorBanner';

const OTPVerificationPanel = ({
    pendingUser,
    enteredCode,
    onChangeCode,
    onSubmit,
    onResend,
    onBack,
    resendCooldown,
    verifying,
    error,
}) => {
    const digitRefs = useRef([]);

    const maskedEmail = pendingUser
        ? pendingUser.email.replace(/(.{2}).+(@.+)/, '$1***$2')
        : '';

    const handleDigitChange = (index, value) => {
        const digit = value.replace(/\D/g, '').slice(-1);
        const updated = [...enteredCode];
        updated[index] = digit;
        onChangeCode(updated);
        if (digit && index < 5) digitRefs.current[index + 1]?.focus();
    };

    const handleDigitKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !enteredCode[index] && index > 0) {
            digitRefs.current[index - 1]?.focus();
        }
    };

    const handleDigitPaste = (e) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
            onChangeCode(pasted.split(''));
            digitRefs.current[5]?.focus();
            e.preventDefault();
        }
    };

    return (
        <div className="flex justify-center items-center" style={{ minHeight: '90vh', position: 'relative', padding: '40px 20px' }}>
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="editorial-panel"
                style={{
                    width: '100%', maxWidth: '480px', padding: '52px 44px 40px',
                    position: 'relative', zIndex: 1,
                    boxShadow: '0 40px 90px rgba(0, 0, 0, 0.55), 0 0 120px rgba(96, 165, 250, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                }}
            >
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.45), rgba(34, 211, 238, 0.3), transparent)',
                    pointerEvents: 'none',
                }} />
                <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    background: 'radial-gradient(ellipse 60% 50% at 0% 0%, rgba(96, 165, 250, 0.12), transparent 60%), radial-gradient(ellipse 55% 55% at 100% 100%, rgba(34, 211, 238, 0.10), transparent 60%)',
                }} />

                <motion.button
                    whileHover={{ x: -2 }}
                    onClick={onBack}
                    className="flex items-center gap-2 text-muted font-medium"
                    style={{
                        fontSize: '12.5px', marginBottom: '28px',
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: 0, transition: 'color 0.2s', position: 'relative', zIndex: 2,
                        letterSpacing: '0.02em',
                    }}
                >
                    <ArrowLeft size={14} /> Back to form
                </motion.button>

                <div style={{ textAlign: 'center', marginBottom: '34px', position: 'relative', zIndex: 2 }}>
                    <motion.div
                        animate={{
                            boxShadow: [
                                '0 0 30px rgba(96, 165, 250, 0.3), 0 12px 28px rgba(96, 165, 250, 0.3)',
                                '0 0 60px rgba(34, 211, 238, 0.35), 0 14px 34px rgba(34, 211, 238, 0.3)',
                                '0 0 30px rgba(96, 165, 250, 0.3), 0 12px 28px rgba(96, 165, 250, 0.3)',
                            ],
                        }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                        whileHover={{ rotate: 6, scale: 1.05 }}
                        style={{
                            display: 'inline-flex',
                            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                            padding: '14px', borderRadius: '20px', marginBottom: '22px',
                        }}
                    >
                        <Mail size={30} color="#070b0a" strokeWidth={2.5} />
                    </motion.div>
                    <h1 style={{
                        fontSize: 'clamp(28px, 3.2vw, 36px)',
                        marginBottom: '10px',
                        letterSpacing: '-0.035em',
                        fontFamily: 'var(--font-heading)',
                        fontWeight: '800',
                        lineHeight: '1.06',
                    }}>
                        Check your <span style={{
                            background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--accent-light) 50%, var(--primary-light) 100%)',
                            backgroundSize: '200% auto',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            animation: 'shimmer 5s linear infinite',
                            fontStyle: 'italic',
                            display: 'inline-block',
                            paddingRight: '0.12em',
                            paddingBottom: '0.03em',
                        }}>email</span>
                    </h1>
                    <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: '1.7', letterSpacing: '0.005em' }}>
                        We sent a 6-digit confirmation code to<br />
                        <strong style={{ color: 'var(--text-main)' }}>{maskedEmail}</strong>
                    </p>
                </div>

                <AuthErrorBanner error={error} variant="otp" />

                {verifying && (
                    <div className="animate-fade-in text-center" style={{
                        background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)',
                        padding: '16px', marginBottom: '24px', borderRadius: 'var(--border-radius-sm)',
                    }}>
                        <div style={{
                            width: '28px', height: '28px', border: '3px solid rgba(99,102,241,0.2)',
                            borderTopColor: 'var(--primary)', borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite', margin: '0 auto 10px',
                        }} />
                        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                        <p className="text-sm font-medium" style={{ color: 'var(--badge-primary-text)' }}>Creating your account…</p>
                    </div>
                )}

                <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }} role="group" aria-label="6-digit verification code">
                        {enteredCode.map((digit, i) => (
                            <input
                                key={i}
                                ref={el => { digitRefs.current[i] = el; }}
                                id={`otp-digit-${i}`}
                                aria-label={`Digit ${i + 1} of 6`}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={e => handleDigitChange(i, e.target.value)}
                                onKeyDown={e => handleDigitKeyDown(i, e)}
                                onPaste={handleDigitPaste}
                                style={{
                                    width: '54px', height: '64px',
                                    textAlign: 'center', fontSize: '26px', fontWeight: '800',
                                    fontFamily: 'var(--font-heading)',
                                    background: digit ? 'rgba(96, 165, 250, 0.12)' : 'rgba(7, 11, 10, 0.5)',
                                    border: digit ? '2px solid rgba(96, 165, 250, 0.55)' : '2px solid rgba(255,255,255,0.06)',
                                    borderRadius: '14px',
                                    color: 'var(--text-main)',
                                    outline: 'none',
                                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                                    caretColor: 'var(--primary)',
                                    letterSpacing: '-0.02em',
                                }}
                                onFocus={e => {
                                    e.target.style.borderColor = 'rgba(96, 165, 250, 0.8)';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(96, 165, 250, 0.14), 0 8px 24px rgba(96, 165, 250, 0.1)';
                                    e.target.style.transform = 'translateY(-1px)';
                                }}
                                onBlur={e => {
                                    e.target.style.borderColor = digit ? 'rgba(96, 165, 250, 0.55)' : 'rgba(255,255,255,0.06)';
                                    e.target.style.boxShadow = 'none';
                                    e.target.style.transform = 'translateY(0)';
                                }}
                            />
                        ))}
                    </div>

                    <motion.button
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        id="verify-code-button"
                        type="submit"
                        className="btn-lux btn-announce"
                        disabled={verifying}
                        style={{
                            width: '100%', padding: '15px',
                            fontSize: '14.5px', justifyContent: 'center',
                        }}
                    >
                        {verifying ? 'Verifying…' : 'Verify & Create Account'}
                        {!verifying && <ArrowRight size={17} style={{ marginLeft: '2px' }} strokeWidth={2.5} />}
                    </motion.button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '22px' }}>
                    <p className="text-muted" style={{ fontSize: '13px', marginBottom: '10px' }}>
                        Didn&apos;t receive an email?
                    </p>
                    <button
                        id="resend-code-button"
                        onClick={onResend}
                        disabled={resendCooldown > 0}
                        className="flex items-center gap-2"
                        style={{
                            margin: '0 auto', background: 'none', border: 'none',
                            cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                            color: resendCooldown > 0 ? 'var(--text-subtle)' : 'var(--primary-light)',
                            fontWeight: '600', fontSize: '13.5px',
                            transition: 'color 0.2s',
                        }}
                    >
                        <RefreshCw size={14} />
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                    </button>
                </div>

                <div style={{
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
                    margin: '24px 0 16px',
                }} />
                <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-subtle)', lineHeight: '1.6' }}>
                    <Shield size={11} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                    Code expires once used. Check your spam folder if not received.
                </p>
            </motion.div>
        </div>
    );
};

export default OTPVerificationPanel;
