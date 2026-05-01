import { useRef, useMemo } from 'react';
import { ArrowLeft, ArrowRight, Mail, RefreshCw, Shield } from 'lucide-react';

import { motion } from 'framer-motion';
import AuthErrorBanner from './AuthErrorBanner';
import '../../styles/login-cinematic.css';

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

    // When all six digits are present we tag the row with `otp-all-filled`
    // so each cell does the staggered green ripple defined in
    // login-cinematic.css. Pure presentational signal — submit logic
    // still gates on confirmCode equality in the parent.
    const allFilled = useMemo(
        () => enteredCode.length === 6 && enteredCode.every(d => /^\d$/.test(d)),
        [enteredCode]
    );

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
        <div className="flex justify-center items-center" style={{ minHeight: '100vh', position: 'relative', padding: '40px 20px',
            background: 'radial-gradient(ellipse 60% 60% at 50% 30%, rgba(34, 211, 102, 0.06), transparent 70%), linear-gradient(180deg, hsl(160 30% 4%), hsl(160 30% 6%))',
        }}>
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="editorial-panel"
                style={{
                    width: '100%', maxWidth: '480px', padding: 'clamp(36px, 8vw, 52px) clamp(18px, 5vw, 44px) clamp(32px, 7vw, 40px)',
                    position: 'relative', zIndex: 1,
                    boxShadow: '0 40px 90px rgba(0, 0, 0, 0.55), 0 0 120px rgba(34, 211, 102, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                }}
            >
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(34, 211, 102, 0.55) 30%, rgba(34, 211, 238, 0.3) 70%, transparent)',
                    pointerEvents: 'none',
                }} />
                <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    background: 'radial-gradient(ellipse 60% 50% at 0% 0%, rgba(34, 211, 102, 0.08), transparent 60%), radial-gradient(ellipse 55% 55% at 100% 100%, rgba(34, 211, 238, 0.06), transparent 60%)',
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

                <div style={{ textAlign: 'center', marginBottom: '32px', position: 'relative', zIndex: 2 }}>
                    {/* Step indicator — mirrors the Login form's "Step 1" chip
                        so users recognize they're now in the second auth step. */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '4px 10px',
                        borderRadius: 999,
                        background: 'rgba(34, 211, 102, 0.06)',
                        border: '1px solid rgba(34, 211, 102, 0.18)',
                        color: 'hsl(119 80% 70%)',
                        fontFamily: 'Sora, sans-serif',
                        fontSize: 9.5,
                        fontWeight: 700,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        marginBottom: 22,
                    }}>
                        <span style={{
                            width: 5, height: 5, borderRadius: '50%',
                            background: 'hsl(119 99% 56%)',
                            boxShadow: '0 0 8px hsl(119 99% 56%)',
                        }} />
                        Step 2 · Verify
                    </div>

                    <motion.div
                        animate={{
                            boxShadow: [
                                '0 0 28px rgba(34, 211, 102, 0.32), 0 12px 28px rgba(34, 211, 102, 0.28)',
                                '0 0 50px rgba(34, 211, 102, 0.42), 0 14px 32px rgba(34, 211, 102, 0.36)',
                                '0 0 28px rgba(34, 211, 102, 0.32), 0 12px 28px rgba(34, 211, 102, 0.28)',
                            ],
                        }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                        whileHover={{ rotate: 6, scale: 1.05 }}
                        style={{
                            display: 'inline-flex',
                            background: 'linear-gradient(135deg, hsl(119 99% 50%) 0%, hsl(119 99% 44%) 100%)',
                            padding: '14px', borderRadius: '20px', marginBottom: '22px',
                        }}
                    >
                        <Mail size={30} color="hsl(0 0% 6%)" strokeWidth={2.5} />
                    </motion.div>
                    <h1 style={{
                        fontSize: 'clamp(28px, 3.2vw, 36px)',
                        marginBottom: '10px',
                        letterSpacing: '-0.04em',
                        fontFamily: 'Sora, var(--font-heading)',
                        fontWeight: 600,
                        lineHeight: '1.05',
                        color: 'hsl(0 0% 96%)',
                    }}>
                        Check your <span style={{
                            background: 'linear-gradient(100deg, hsl(119 99% 56%), hsl(155 80% 65%), hsl(180 75% 70%))',
                            backgroundSize: '220% auto',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            animation: 'auroraText 7s linear infinite',
                            fontFamily: "'Instrument Serif', Georgia, serif",
                            fontStyle: 'italic',
                            fontWeight: 400,
                            display: 'inline-block',
                            paddingRight: '0.12em',
                            paddingBottom: '0.03em',
                        }}>email</span>
                    </h1>
                    <p style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.62)', lineHeight: '1.7', letterSpacing: '0.005em' }}>
                        We sent a 6-digit confirmation code to<br />
                        <strong style={{ color: 'hsl(0 0% 96%)' }}>{maskedEmail}</strong>
                    </p>
                </div>

                <AuthErrorBanner error={error} variant="otp" />

                {verifying && (
                    <div className="animate-fade-in text-center" style={{
                        background: 'rgba(34, 211, 102, 0.06)', border: '1px solid rgba(34, 211, 102, 0.22)',
                        padding: '16px', marginBottom: '22px', borderRadius: '12px',
                    }} role="status" aria-live="polite">
                        <div className="otp-spinner" style={{
                            width: '28px', height: '28px',
                            border: '2.5px solid rgba(34, 211, 102, 0.18)',
                            borderTopColor: 'hsl(119 99% 56%)', borderRadius: '50%',
                            margin: '0 auto 10px',
                        }} />
                        <style>{`
                            .otp-spinner { animation: otp-spin 0.8s linear infinite; }
                            @keyframes otp-spin { 100% { transform: rotate(360deg); } }
                            @media (prefers-reduced-motion: reduce) {
                              .otp-spinner { animation: none; opacity: 0.6; }
                            }
                        `}</style>
                        <p className="text-sm font-medium" style={{ color: 'hsl(119 80% 75%)' }}>Creating your account…</p>
                    </div>
                )}

                <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <motion.div
                        className={allFilled ? 'otp-all-filled' : ''}
                        style={{ display: 'flex', gap: 'clamp(6px, 2vw, 10px)', justifyContent: 'center' }}
                        role="group"
                        aria-label="6-digit verification code"
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: {},
                            visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
                        }}
                    >
                        {enteredCode.map((digit, i) => (
                            <motion.input
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
                                variants={{
                                    hidden: { opacity: 0, y: 12, scale: 0.9 },
                                    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
                                }}
                                style={{
                                    width: 'clamp(38px, 12vw, 54px)', height: 'clamp(50px, 14vw, 64px)',
                                    textAlign: 'center', fontSize: 'clamp(20px, 6vw, 26px)', fontWeight: '600',
                                    fontFamily: 'Sora, var(--font-heading)',
                                    background: digit ? 'rgba(34, 211, 102, 0.10)' : 'rgba(7, 11, 10, 0.5)',
                                    border: digit ? '2px solid rgba(34, 211, 102, 0.55)' : '2px solid rgba(255,255,255,0.06)',
                                    borderRadius: '14px',
                                    color: 'hsl(0 0% 96%)',
                                    outline: 'none',
                                    transition: 'border-color 0.2s cubic-bezier(0.32, 0.72, 0, 1), background 0.2s, box-shadow 0.2s, transform 0.2s',
                                    caretColor: 'hsl(119 99% 56%)',
                                    letterSpacing: '-0.03em',
                                }}
                                onFocus={e => {
                                    e.target.style.borderColor = 'rgba(34, 211, 102, 0.8)';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(34, 211, 102, 0.16), 0 8px 24px rgba(34, 211, 102, 0.14)';
                                    e.target.style.transform = 'translateY(-1px)';
                                }}
                                onBlur={e => {
                                    e.target.style.borderColor = digit ? 'rgba(34, 211, 102, 0.55)' : 'rgba(255,255,255,0.06)';
                                    e.target.style.boxShadow = 'none';
                                    e.target.style.transform = 'translateY(0)';
                                }}
                            />
                        ))}
                    </motion.div>

                    <button
                        id="verify-code-button"
                        type="submit"
                        className="px-btn primary lg"
                        disabled={verifying}
                        style={{ width: '100%', justifyContent: 'center' }}
                    >
                        {verifying ? 'Verifying…' : 'Verify & Create Account'}
                        {!verifying && <ArrowRight size={17} style={{ marginLeft: '2px' }} strokeWidth={2.5} />}
                    </button>
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
                            color: resendCooldown > 0 ? 'rgba(255,255,255,0.4)' : 'hsl(119 80% 72%)',
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
