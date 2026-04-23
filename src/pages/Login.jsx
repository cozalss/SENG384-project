import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Activity, Mail, ArrowRight, ArrowLeft, Shield, CheckCircle2, Lock, Eye, EyeOff, Globe,
} from 'lucide-react';
import { getUserByEmail, emailExists, addUserToFirestore, hashPassword, addActivityLog } from '../services/firestore';
import { sendConfirmationEmail, generateConfirmationCode } from '../services/emailService';
// eslint-disable-next-line no-unused-vars
import { motion, LayoutGroup } from 'framer-motion';

import AuthErrorBanner from './LoginParts/AuthErrorBanner';
import RegisterFormFields from './LoginParts/RegisterFormFields';
import OTPVerificationPanel from './LoginParts/OTPVerificationPanel';

const INITIAL_FORM_DATA = {
    name: '',
    email: '',
    password: '',
    role: 'Healthcare Professional',
    institution: '',
    city: '',
    country: '',
};

const Login = ({ login }) => {
    const [mode, setMode] = useState('login');
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [error, setError] = useState('');
    const [focusedField, setFocusedField] = useState(null);
    const [verifying, setVerifying] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [verificationStep, setVerificationStep] = useState('form');
    const [confirmCode, setConfirmCode] = useState('');
    const [enteredCode, setEnteredCode] = useState(['', '', '', '', '', '']);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [pendingUser, setPendingUser] = useState(null);

    useEffect(() => {
        if (resendCooldown <= 0) return;
        const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [resendCooldown]);

    const validateEduEmail = (email) => {
        const parts = email.split('@');
        if (parts.length !== 2) return false;
        return /\.edu(\.[a-z]{2})?$/i.test(parts[1]);
    };

    const isPersonalEmail = (email) => {
        const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'protonmail.com', 'icloud.com', 'mail.com'];
        const domain = email.split('@')[1]?.toLowerCase();
        return personalDomains.includes(domain);
    };

    const resetToLoginForm = () => {
        setFormData(INITIAL_FORM_DATA);
        setShowPassword(false);
        setVerificationStep('form');
        setEnteredCode(['', '', '', '', '', '']);
        setConfirmCode('');
        setPendingUser(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const normalizedEmail = formData.email ? formData.email.trim().toLowerCase() : '';

        if (mode === 'register') {
            if (isPersonalEmail(normalizedEmail)) {
                setError('Personal email providers (Gmail, Yahoo, Outlook, etc.) are not permitted. Only institutional .edu addresses are accepted.');
                return;
            }
            if (!validateEduEmail(normalizedEmail)) {
                setError('Registration requires a verified institutional .edu email address.');
                return;
            }
        }

        if (!normalizedEmail || !formData.password) {
            setError('Please enter your email and password.');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        setVerifying(true);

        try {
            if (mode === 'login') {
                const existingUser = await getUserByEmail(normalizedEmail);

                if (!existingUser) {
                    setError('No account found with this email. Please register first.');
                    setVerifying(false);
                    await addActivityLog({
                        id: `log-${Date.now()}`,
                        timestamp: new Date().toISOString(),
                        userId: 'unknown',
                        userName: normalizedEmail,
                        role: 'N/A',
                        actionType: 'LOGIN_FAILED',
                        targetEntity: 'session',
                        result: 'failure',
                        details: 'Account not found',
                    });
                    return;
                }

                const hashedInput = await hashPassword(formData.password);
                if (existingUser.passwordHash !== hashedInput) {
                    setError('Incorrect password. Please try again.');
                    setVerifying(false);
                    await addActivityLog({
                        id: `log-${Date.now()}`,
                        timestamp: new Date().toISOString(),
                        userId: existingUser.id,
                        userName: existingUser.name,
                        role: existingUser.role,
                        actionType: 'LOGIN_FAILED',
                        targetEntity: 'session',
                        result: 'failure',
                        details: 'Invalid password',
                    });
                    return;
                }

                // eslint-disable-next-line no-unused-vars
                const { passwordHash, ...safeUser } = existingUser;
                setVerifying(false);
                login(safeUser);
            } else {
                if (!formData.name) {
                    setError('Please enter your full name.');
                    setVerifying(false);
                    return;
                }
                if (!formData.institution || !formData.city || !formData.country) {
                    setError('Please complete institution, city, and country fields.');
                    setVerifying(false);
                    return;
                }

                const alreadyExists = await emailExists(normalizedEmail);
                if (alreadyExists) {
                    setError('An account with this email already exists. Please sign in instead.');
                    setVerifying(false);
                    return;
                }

                const hashedPassword = await hashPassword(formData.password);
                const actualRole = normalizedEmail === 'admin@healthai.edu' ? 'Admin' : formData.role;
                const newUser = {
                    id: `admin-${Date.now()}`,
                    name: formData.name,
                    email: normalizedEmail,
                    passwordHash: hashedPassword,
                    role: actualRole,
                    institution: formData.institution,
                    city: formData.city,
                    country: formData.country,
                    registeredAt: new Date().toISOString(),
                    status: 'active',
                    lastLogin: new Date().toISOString(),
                };

                const code = generateConfirmationCode();
                await sendConfirmationEmail(normalizedEmail, formData.name, code);

                setConfirmCode(code);
                setPendingUser(newUser);
                setEnteredCode(['', '', '', '', '', '']);
                setResendCooldown(60);
                setVerifying(false);
                setVerificationStep('verify');
            }
        } catch (err) {
            console.error('Auth error:', err);
            setError('An error occurred. Please try again.');
            setVerifying(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        const typed = enteredCode.join('');
        if (typed.length < 6) {
            setError('Please enter the complete 6-digit code.');
            return;
        }
        if (typed !== confirmCode) {
            setError('Incorrect code. Please check your email and try again.');
            return;
        }
        setVerifying(true);
        try {
            await addUserToFirestore(pendingUser);
            // eslint-disable-next-line no-unused-vars
            const { passwordHash, ...safeUser } = pendingUser;
            setVerifying(false);
            login(safeUser);
        } catch (err) {
            console.error('Account creation error:', err);
            setError('Failed to create account. Please try again.');
            setVerifying(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0 || !pendingUser) return;
        setError('');
        try {
            const code = generateConfirmationCode();
            await sendConfirmationEmail(pendingUser.email, pendingUser.name, code);
            setConfirmCode(code);
            setEnteredCode(['', '', '', '', '', '']);
            setResendCooldown(60);
        } catch (err) {
            console.error('Resend error:', err);
            setError('Failed to resend code. Please try again.');
        }
    };

    const inputWrapperStyle = () => ({
        position: 'relative',
        transition: 'all 0.3s ease',
    });

    const iconStyle = (field) => ({
        position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)',
        color: focusedField === field ? 'var(--primary-light)' : 'var(--text-subtle)',
        transition: 'color 0.3s ease',
    });

    if (verificationStep === 'verify') {
        return (
            <OTPVerificationPanel
                pendingUser={pendingUser}
                enteredCode={enteredCode}
                onChangeCode={setEnteredCode}
                onSubmit={handleVerify}
                onResend={handleResend}
                onBack={() => { setVerificationStep('form'); setError(''); }}
                resendCooldown={resendCooldown}
                verifying={verifying}
                error={error}
            />
        );
    }

    return (
        <div className="flex justify-center items-center" style={{ minHeight: '90vh', position: 'relative', padding: '40px 20px' }}>
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="editorial-panel"
                style={{
                    width: '100%',
                    maxWidth: mode === 'register' ? '560px' : '480px',
                    padding: '52px 44px 40px',
                    position: 'relative',
                    zIndex: 1,
                    transition: 'max-width 0.4s ease',
                    overflow: 'hidden',
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
                    background:
                        'radial-gradient(ellipse 60% 50% at 0% 0%, rgba(96, 165, 250, 0.12), transparent 60%),' +
                        'radial-gradient(ellipse 55% 55% at 100% 100%, rgba(34, 211, 238, 0.10), transparent 60%)',
                }} />

                <motion.div whileHover={{ x: -2 }} style={{ position: 'relative', zIndex: 2 }}>
                    <Link to="/" className="flex items-center gap-2 text-muted font-medium" style={{
                        fontSize: '12.5px', marginBottom: '28px', transition: 'color 0.2s',
                        textDecoration: 'none', letterSpacing: '0.02em',
                    }}>
                        <ArrowLeft size={14} /> Back to Home
                    </Link>
                </motion.div>

                <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', marginBottom: '34px' }}>
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
                            padding: '14px',
                            borderRadius: '20px',
                            marginBottom: '22px',
                        }}
                    >
                        <Activity size={32} color="#070b0a" strokeWidth={2.5} />
                    </motion.div>
                    <h1 style={{
                        fontSize: 'clamp(30px, 3.5vw, 40px)',
                        marginBottom: '8px',
                        letterSpacing: '-0.04em',
                        fontFamily: 'var(--font-heading)',
                        fontWeight: '800',
                        lineHeight: '1.05',
                    }}>
                        {mode === 'login' ? (
                            <>Welcome <span className="accent" style={{
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
                            }}>back</span></>
                        ) : (
                            <>Join the <span className="accent" style={{
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
                            }}>Network</span></>
                        )}
                    </h1>
                    <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', letterSpacing: '0.01em' }}>
                        {mode === 'login' ? 'Secure Platform Access' : 'Create Your Account'}
                    </p>
                </div>

                <LayoutGroup>
                    <div className="segmented-control" style={{
                        marginBottom: '22px', display: 'flex', width: '100%', position: 'relative', zIndex: 2,
                    }}>
                        {['login', 'register'].map(m => (
                            <button
                                key={m}
                                onClick={() => {
                                    if (mode === m) return;
                                    setMode(m);
                                    setError('');
                                    resetToLoginForm();
                                }}
                                className={`segmented-tab ${mode === m ? 'active' : ''}`}
                                style={{ flex: 1, justifyContent: 'center', padding: '11px 22px' }}
                            >
                                {mode === m && (
                                    <motion.span
                                        layoutId="login-pill"
                                        style={{
                                            position: 'absolute', inset: 0,
                                            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                                            borderRadius: '10px', zIndex: -1,
                                            boxShadow: '0 8px 22px rgba(96, 165, 250, 0.32)',
                                        }}
                                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                    />
                                )}
                                {m === 'login' ? 'Sign In' : 'Register'}
                            </button>
                        ))}
                    </div>
                </LayoutGroup>

                <AuthErrorBanner error={error} variant="form" />

                {verifying && (
                    <div className="animate-fade-in text-center" style={{
                        background: 'rgba(96, 165, 250, 0.06)',
                        border: '1px solid rgba(96, 165, 250, 0.2)',
                        padding: '18px',
                        marginBottom: '20px',
                        borderRadius: '14px',
                        position: 'relative', zIndex: 2,
                    }}>
                        <div style={{
                            width: '28px', height: '28px', border: '2.5px solid rgba(96, 165, 250, 0.2)',
                            borderTopColor: 'var(--primary)', borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite', margin: '0 auto 10px',
                        }} />
                        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                        <p style={{ color: '#93c5fd', fontSize: '13px', fontWeight: '600', letterSpacing: '0.01em' }}>
                            {mode === 'login' ? 'Verifying credentials…' : 'Sending confirmation email…'}
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: '1', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={inputWrapperStyle()}>
                        <Mail size={18} style={iconStyle('email')} />
                        <input
                            id="email-input"
                            type="email"
                            placeholder="Institutional Email (.edu required)"
                            className="input-lux"
                            style={{ paddingLeft: '44px' }}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField(null)}
                            required
                        />
                    </div>

                    <div style={inputWrapperStyle()}>
                        <Lock size={18} style={iconStyle('password')} />
                        <input
                            id="password-input"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            className="input-lux"
                            style={{ paddingLeft: '44px', paddingRight: '44px' }}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            onFocus={() => setFocusedField('password')}
                            onBlur={() => setFocusedField(null)}
                            required
                            minLength={6}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            style={{
                                position: 'absolute', top: '50%', right: '16px', transform: 'translateY(-50%)',
                                background: 'none', border: 'none', cursor: 'pointer', padding: '0',
                                color: 'var(--text-subtle)', display: 'flex', transition: 'color 0.2s',
                            }}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <RegisterFormFields
                        visible={mode === 'register'}
                        formData={formData}
                        setFormData={setFormData}
                        focusedField={focusedField}
                        setFocusedField={setFocusedField}
                    />

                    <motion.button
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        id="submit-button"
                        type="submit"
                        className="btn-lux btn-announce"
                        disabled={verifying}
                        style={{
                            width: '100%', marginTop: '12px', padding: '15px',
                            fontSize: '14.5px', justifyContent: 'center',
                        }}
                    >
                        {verifying ? 'Sending code…' : mode === 'login' ? 'Sign In' : 'Create Account'}
                        {!verifying && <ArrowRight size={17} style={{ marginLeft: '2px' }} strokeWidth={2.5} />}
                    </motion.button>
                </form>

                <div className="login-visual" style={{ textAlign: 'center', marginTop: '32px', position: 'relative', zIndex: '1' }}>
                    <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)', marginBottom: '20px' }} />
                    <div className="flex gap-4 justify-center mb-4" style={{ flexWrap: 'wrap' }}>
                        {[
                            { icon: <Shield size={13} />, label: 'GDPR' },
                            { icon: <CheckCircle2 size={13} />, label: 'NDA Protected' },
                            { icon: <Globe size={13} />, label: '.edu Only' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-subtle)', fontSize: '11px' }}>
                                <span style={{ color: 'var(--badge-success-text)' }}>{item.icon}</span> {item.label}
                            </div>
                        ))}
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--text-subtle)', lineHeight: '1.6' }}>
                        Access signifies agreement to our <a href="#" style={{ fontWeight: '500', color: 'var(--primary-light)' }}>GDPR Policy</a> and <a href="#" style={{ fontWeight: '500', color: 'var(--primary-light)' }}>NDA terms</a>.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
