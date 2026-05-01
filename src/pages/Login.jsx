import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Activity, Mail, ArrowRight, ArrowLeft, Shield, CheckCircle2, Lock, Eye, EyeOff, Globe,
} from 'lucide-react';
import {
    getUserByEmail,
    emailExists,
    addUserToFirestore,
    hashPassword,
    addActivityLog,
    checkLoginRateLimit,
    recordFailedLogin,
    clearLoginRateLimit,
    RATE_LIMIT_CONFIG,
} from '../services/firestore';
import { sendConfirmationEmail, generateConfirmationCode } from '../services/emailService';

import { motion, LayoutGroup } from 'framer-motion';

import AuthErrorBanner from './LoginParts/AuthErrorBanner';
import RegisterFormFields from './LoginParts/RegisterFormFields';
import OTPVerificationPanel from './LoginParts/OTPVerificationPanel';
import LoginCinematicSide from './LoginParts/LoginCinematicSide';
import '../styles/login-cinematic.css';

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
    const [confirmCodeExpiresAt, setConfirmCodeExpiresAt] = useState(0);
    const [enteredCode, setEnteredCode] = useState(['', '', '', '', '', '']);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [pendingUser, setPendingUser] = useState(null);

    // OTP lifetime — 10 minutes. After this window the code is rejected even
    // if the user later types it correctly. Bug audit flagged the absence of
    // any TTL, which let a user generate a code, screenshot it, and reuse it
    // indefinitely.
    const OTP_TTL_MS = 10 * 60 * 1000;

    useEffect(() => {
        if (resendCooldown <= 0) return;
        const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [resendCooldown]);

    // WebGL/Canvas Aurora Effect
    useEffect(() => {
        const canvas = document.getElementById('aurora');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        let frameId;
        let time = 0;

        const draw = () => {
            time += 0.005;
            ctx.clearRect(0, 0, width, height);
            
            ctx.globalCompositeOperation = 'lighter';
            
            const drawWave = (offset, color) => {
                ctx.beginPath();
                ctx.moveTo(0, height);
                for (let i = 0; i <= width; i += 20) {
                    const y = height * 0.6 + 
                              Math.sin(i * 0.003 + time + offset) * 120 + 
                              Math.cos(i * 0.002 - time) * 80;
                    ctx.lineTo(i, y);
                }
                ctx.lineTo(width, height);
                ctx.lineTo(0, height);
                
                const grad = ctx.createLinearGradient(0, height * 0.2, 0, height);
                grad.addColorStop(0, 'transparent');
                grad.addColorStop(0.5, color);
                grad.addColorStop(1, 'transparent');
                
                ctx.fillStyle = grad;
                ctx.fill();
            };

            drawWave(0, 'rgba(34, 211, 102, 0.15)');
            drawWave(2, 'rgba(34, 211, 238, 0.12)');
            drawWave(4, 'rgba(245, 158, 11, 0.08)');
            
            frameId = requestAnimationFrame(draw);
        };

        draw();

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        window.addEventListener('resize', handleResize);
        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Holographic Form Panel 3D Effect
    useEffect(() => {
        const panel = document.querySelector('.editorial-panel');
        if (!panel) return;
        
        const onMouseMove = (e) => {
            const rect = panel.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            panel.style.setProperty('--mx', `${x}%`);
            panel.style.setProperty('--my', `${y}%`);
            
            const tiltX = (y - 50) / 20;
            const tiltY = (x - 50) / -20;
            panel.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
        };
        
        const onMouseLeave = () => {
            panel.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            panel.style.transition = 'transform 0.5s ease-out';
            setTimeout(() => { panel.style.transition = 'transform 0.1s ease-out'; }, 500);
        };
        
        panel.addEventListener('mousemove', onMouseMove);
        panel.addEventListener('mouseleave', onMouseLeave);
        
        return () => {
            panel.removeEventListener('mousemove', onMouseMove);
            panel.removeEventListener('mouseleave', onMouseLeave);
        };
    }, [mode, verificationStep]);

    // Strip standard whitespace, BOM, and zero-width characters before regex
    // tests. Pasted emails often arrive with trailing invisibles that the
    // .edu regex would reject downstream — only after the user has typed
    // their password. Normalize once here, with explicit Unicode escapes so
    // the regex is unambiguous regardless of editor encoding.
    const sanitizeEmail = (raw) => (raw || '')
        // Strips control chars, NBSP, BOM, and zero-width joiners that pasted
        // emails frequently carry. Regular ASCII space is left alone — the @
        // split surfaces it as an invalid address with a clearer error.
        // eslint-disable-next-line no-control-regex
        .replace(/[\u0000-\u001F\u007F-\u00A0\uFEFF\u200B-\u200D]/g, '')
        .trim()
        .toLowerCase();

    const validateEduEmail = (email) => {
        const parts = email.split('@');
        if (parts.length !== 2) return false;
        const domain = parts[1];
        // Domain must be pure ASCII and end in .edu / .edu.<2 letter cc>.
        if (!/^[a-z0-9.-]+$/i.test(domain)) return false;
        return /\.edu(\.[a-z]{2})?$/i.test(domain);
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
        if (verifying) return; // belt-and-braces guard against double-submit

        const normalizedEmail = sanitizeEmail(formData.email);

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
                // Brief 5.2 — brute-force protection. Must run BEFORE the password
                // hash comparison so an attacker can't burn cycles probing hashes
                // once locked out. We check by email rather than by user ID
                // because we don't want to confirm whether the email exists
                // before the lockout window closes.
                const limit = await checkLoginRateLimit(normalizedEmail);
                if (limit.locked) {
                    const minutes = Math.max(1, Math.ceil(limit.retryAfterMs / 60000));
                    setError(`Too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`);
                    setVerifying(false);
                    await addActivityLog({
                        id: `log-${Date.now()}`,
                        timestamp: new Date().toISOString(),
                        userId: 'unknown',
                        userName: normalizedEmail,
                        role: 'N/A',
                        actionType: 'LOGIN_RATE_LIMITED',
                        targetEntity: 'session',
                        result: 'failure',
                        details: `Locked out for ${minutes}m after ${limit.count} failed attempts`,
                    });
                    return;
                }

                const existingUser = await getUserByEmail(normalizedEmail);

                if (!existingUser) {
                    const lim = await recordFailedLogin(normalizedEmail);
                    setError(
                        lim.locked
                            ? `Too many failed attempts. Try again in ${Math.ceil(lim.retryAfterMs / 60000)} minutes.`
                            : 'No account found with this email. Please register first.'
                    );
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
                        details: `Account not found (attempt ${lim.count}/${RATE_LIMIT_CONFIG.MAX_ATTEMPTS})`,
                    });
                    return;
                }

                const hashedInput = await hashPassword(formData.password);
                if (existingUser.passwordHash !== hashedInput) {
                    const lim = await recordFailedLogin(normalizedEmail);
                    setError(
                        lim.locked
                            ? `Too many failed attempts. Try again in ${Math.ceil(lim.retryAfterMs / 60000)} minutes.`
                            : `Incorrect password. ${RATE_LIMIT_CONFIG.MAX_ATTEMPTS - lim.count} attempt${RATE_LIMIT_CONFIG.MAX_ATTEMPTS - lim.count === 1 ? '' : 's'} remaining.`
                    );
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
                        details: `Invalid password (attempt ${lim.count}/${RATE_LIMIT_CONFIG.MAX_ATTEMPTS})`,
                    });
                    return;
                }

                // Successful auth — reset the failure ledger so the user starts
                // fresh and isn't penalized for a single mistype days later.
                await clearLoginRateLimit(normalizedEmail);

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
                // The seeded admin@healthai.edu shortcut is a development-only
                // convenience for grading and demos. In production builds, the
                // form-selected role is honored even for that email so the
                // address can't be used as a backdoor by anyone who can reach
                // the registration page.
                const actualRole = (
                    import.meta.env.DEV && normalizedEmail === 'admin@healthai.edu'
                ) ? 'Admin' : formData.role;
                const newUser = {
                    id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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
                setConfirmCodeExpiresAt(Date.now() + OTP_TTL_MS);
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
        if (verifying) return; // guard against double-submit while creating account
        const typed = enteredCode.join('');
        if (typed.length < 6) {
            setError('Please enter the complete 6-digit code.');
            return;
        }
        // Reject expired codes regardless of whether the digits match —
        // prevents "screenshot the code, reuse it later" replays. The user
        // can press "Resend" to issue a fresh code.
        if (!confirmCodeExpiresAt || Date.now() > confirmCodeExpiresAt) {
            setError('This code has expired. Please request a new one.');
            return;
        }
        if (typed !== confirmCode) {
            setError('Incorrect code. Please check your email and try again.');
            return;
        }
        setVerifying(true);
        try {
            await addUserToFirestore(pendingUser);
            // Burn the code so it can't be replayed — even within the TTL.
            setConfirmCode('');
            setConfirmCodeExpiresAt(0);
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
            setConfirmCodeExpiresAt(Date.now() + OTP_TTL_MS);
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
        color: focusedField === field ? 'hsl(119 99% 60%)' : 'var(--text-subtle)',
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
        <div className="login-shell">
            <canvas id="aurora" />
            <div className="login-shell-grain" aria-hidden="true" />

            <LoginCinematicSide />

            <div className="login-pane">
                <motion.div
                    initial={{ opacity: 0, y: 24, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="editorial-panel"
                    style={{
                        width: '100%',
                        maxWidth: mode === 'register' ? '500px' : '440px',
                        padding: 'clamp(28px, 4vw, 40px) clamp(22px, 4vw, 36px) clamp(24px, 4vw, 32px)',
                        position: 'relative',
                        zIndex: 1,
                        transition: 'max-width 0.4s ease',
                        overflow: 'hidden',
                        boxShadow: '0 40px 90px rgba(0, 0, 0, 0.55), 0 0 90px rgba(34, 211, 102, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                    }}
                >
                    {/* Top brand rail (green) */}
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
                        background: 'linear-gradient(90deg, transparent, rgba(34, 211, 102, 0.55) 30%, rgba(34, 211, 238, 0.28) 70%, transparent)',
                        pointerEvents: 'none',
                    }} />
                    <div style={{
                        position: 'absolute', inset: 0, pointerEvents: 'none',
                        background:
                            'radial-gradient(ellipse 60% 50% at 0% 0%, rgba(34, 211, 102, 0.07), transparent 60%),' +
                            'radial-gradient(ellipse 55% 55% at 100% 100%, rgba(34, 211, 238, 0.05), transparent 60%)',
                    }} />

                    <motion.div whileHover={{ x: -2 }} style={{ position: 'relative', zIndex: 2 }}>
                        <Link to="/" className="flex items-center gap-2 text-muted font-medium" style={{
                            fontSize: '12.5px', marginBottom: '24px', transition: 'color 0.2s',
                            textDecoration: 'none', letterSpacing: '0.02em',
                        }}>
                            <ArrowLeft size={14} /> Back to Home
                        </Link>
                    </motion.div>

                    <div style={{ position: 'relative', zIndex: 2, marginBottom: '26px' }}>
                        {/* Step indicator — anchors the user in the auth flow */}
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
                            marginBottom: 18,
                        }}>
                            <span style={{
                                width: 5, height: 5, borderRadius: '50%',
                                background: 'hsl(119 99% 56%)',
                                boxShadow: '0 0 8px hsl(119 99% 56%)',
                            }} />
                            {mode === 'login' ? 'Step 1 · Identify' : 'Step 1 · Register'}
                        </div>

                        <h1 style={{
                            fontFamily: 'Sora, var(--font-heading)',
                            fontSize: 'clamp(28px, 3.2vw, 36px)',
                            marginBottom: '8px',
                            letterSpacing: 0,
                            fontWeight: 600,
                            lineHeight: '1.05',
                            color: 'var(--text-main)',
                        }}>
                            {mode === 'login' ? (
                                <>Welcome <span style={{
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
                                }}>back</span></>
                            ) : (
                                <>Join the <span style={{
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
                                }}>network</span></>
                            )}
                        </h1>
                        <p style={{
                            fontSize: '13px',
                            color: 'var(--text-muted)',
                            letterSpacing: '0.005em',
                            lineHeight: 1.55,
                        }}>
                            {mode === 'login'
                                ? 'Identify yourself with your institutional credentials.'
                                : 'Create your institutional account · .edu required.'}
                        </p>
                    </div>

                    <LayoutGroup>
                        <div className="segmented-control" style={{
                            marginBottom: '20px', display: 'flex', width: '100%', position: 'relative', zIndex: 2,
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
                                            className="dash-segmented-fill"
                                            initial={false}
                                            style={{
                                                position: 'absolute', inset: 0,
                                                borderRadius: '10px', zIndex: -1,
                                            }}
                                            transition={{ type: 'spring', stiffness: 380, damping: 32, mass: 0.8 }}
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
                            background: 'rgba(34, 211, 102, 0.06)',
                            border: '1px solid rgba(34, 211, 102, 0.22)',
                            padding: '16px',
                            marginBottom: '18px',
                            borderRadius: '12px',
                            position: 'relative', zIndex: 2,
                        }} role="status" aria-live="polite">
                            <div className="login-spinner" style={{
                                width: '26px', height: '26px',
                                border: '2.5px solid rgba(34, 211, 102, 0.18)',
                                borderTopColor: 'hsl(119 99% 56%)',
                                borderRadius: '50%',
                                margin: '0 auto 8px',
                            }} />
                            <style>{`
                                .login-spinner { animation: login-spin 0.8s linear infinite; }
                                @keyframes login-spin { 100% { transform: rotate(360deg); } }
                                @media (prefers-reduced-motion: reduce) {
                                  .login-spinner { animation: none; opacity: 0.6; }
                                }
                            `}</style>
                            <p style={{ color: 'hsl(119 80% 75%)', fontSize: '12.5px', fontWeight: '600', letterSpacing: '0.01em' }}>
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
                            className="px-input"
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
                            className="px-input"
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

                    <button
                        id="submit-button"
                        type="submit"
                        className="px-btn primary lg"
                        disabled={verifying}
                        style={{
                            width: '100%', marginTop: '12px',
                            justifyContent: 'center',
                        }}
                    >
                        {verifying ? 'Sending code…' : mode === 'login' ? 'Sign In' : 'Create Account'}
                        {!verifying && <ArrowRight size={17} style={{ marginLeft: '2px' }} strokeWidth={2.5} />}
                    </button>
                </form>

                    <div className="login-visual" style={{ textAlign: 'center', marginTop: '28px', position: 'relative', zIndex: '1' }}>
                        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, var(--border), transparent)', marginBottom: '18px' }} />
                        <div className="flex gap-4 justify-center mb-4" style={{ flexWrap: 'wrap' }}>
                            {[
                                { icon: <Shield size={13} />, label: 'GDPR' },
                                { icon: <CheckCircle2 size={13} />, label: 'NDA Protected' },
                                { icon: <Globe size={13} />, label: '.edu Only' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-subtle)', fontSize: '11px' }}>
                                    <span style={{ color: 'hsl(119 80% 70%)' }}>{item.icon}</span> {item.label}
                                </div>
                            ))}
                        </div>
                        <p style={{ fontSize: '11px', color: 'var(--text-subtle)', lineHeight: '1.6' }}>
                            Access is governed by <span style={{ fontWeight: 600, color: 'hsl(119 80% 75%)' }}>GDPR controls</span> and <span style={{ fontWeight: 600, color: 'hsl(119 80% 75%)' }}>NDA terms</span>.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
