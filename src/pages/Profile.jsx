import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, MapPin, Building, Globe, Mail, Briefcase, Download, Trash2, Activity, Shield, Calendar, CheckCircle2, AlertTriangle, ArrowLeft, Sparkles } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimReady } from '../hooks/useAnimReady';
import { useToast } from '../hooks/useToast';

const Profile = ({ user, updateUser, deleteUser, posts, logout }) => {
    const navigate = useNavigate();
    const toast = useToast();
    const animReady = useAnimReady();
    const [editMode, setEditMode] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [city, setCity] = useState(user?.city || '');
    const [country, setCountry] = useState(user?.country || '');
    const [institution, setInstitution] = useState(user?.institution || '');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [saved, setSaved] = useState(false);
    const [trackedUserId, setTrackedUserId] = useState(user?.id);

    if (user && user.id !== trackedUserId) {
        setTrackedUserId(user.id);
        setName(user.name || '');
        setCity(user.city || '');
        setCountry(user.country || '');
        setInstitution(user.institution || '');
    }

    const handleSave = () => {
        if (updateUser) {
            updateUser(user.id, { name, city, country, institution });
        }
        setEditMode(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        toast.success('Profile updated', { title: 'Saved' });
    };

    const handleExportData = () => {
        const userData = {
            profile: { name: user.name, email: user.email, role: user.role, institution: user.institution, city: user.city, country: user.country, registeredAt: user.registeredAt },
            posts: (posts || []).filter(p => p.authorId === user.id).map(p => ({ title: p.title, domain: p.domain, status: p.status, createdAt: p.createdAt })),
            exportedAt: new Date().toISOString(),
            format: 'GDPR Article 20 - Data Portability'
        };

        const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `healthai-data-export-${user?.id}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Your JSON export has started downloading.', { title: 'Data exported' });
    };

    const handleDeleteAccount = async () => {
        if (deleteUser) {
            await deleteUser();
        } else if (logout) {
            await logout();
        }
        navigate('/login');
    };

    const myPosts = (posts || []).filter(p => p.authorId === user?.id);
    const activePosts = myPosts.filter(p => p.status === 'Active').length;
    const closedPosts = myPosts.filter(p => p.status === 'CLOSED').length;

    const accentGradient = user?.role === 'Engineer'
        ? 'linear-gradient(135deg, var(--primary), var(--accent))'
        : 'linear-gradient(135deg, var(--secondary), #34d399)';

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '80px' }}>

            <motion.button
                whileHover={{ x: -2 }}
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-muted mb-6 font-medium"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '13px', letterSpacing: '0.02em' }}
            >
                <ArrowLeft size={15} /> Back
            </motion.button>

            {/* Editorial page header */}
            <motion.section
                initial={animReady ? {  opacity: 0, y: 20  } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="editorial-header"
            >
                <div className="editorial-header-inner">
                    <div>
                        <span className="editorial-eyebrow">
                            <Sparkles size={11} /> Your Workspace
                        </span>
                        <h1 className="editorial-display">
                            Your <span className="accent">Profile</span>
                        </h1>
                        <p className="editorial-subtitle">
                            Manage your identity, control your data, and exercise your rights under GDPR.
                        </p>
                    </div>
                </div>
            </motion.section>

            {/* Saved Success Message */}
            <AnimatePresence>
                {saved && (
                    <motion.div
                        initial={animReady ? {  opacity: 0, y: -10  } : false}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{
                            background: 'linear-gradient(135deg, rgba(94, 210, 156, 0.08), rgba(34, 211, 238, 0.04))',
                            border: '1px solid rgba(94, 210, 156, 0.2)',
                            padding: '14px 18px', marginBottom: '24px',
                            borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '10px'
                        }}
                    >
                        <CheckCircle2 size={18} color="#8be8bc" />
                        <span style={{ fontSize: '13.5px', color: '#8be8bc', fontWeight: '600' }}>Profile updated successfully.</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'start' }}>

                {/* Left: Profile Card */}
                <motion.div
                    initial={animReady ? {  opacity: 0, y: 20  } : false}
                    animate={{ opacity: 1, y: 0 }}
                    className="editorial-panel"
                    style={{ padding: '40px 32px', textAlign: 'center' }}
                >
                    <motion.div
                        whileHover={{ scale: 1.06, rotate: 3 }}
                        transition={{ type: 'spring', stiffness: 320 }}
                        style={{
                            width: '92px', height: '92px', borderRadius: '26px',
                            background: accentGradient,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 20px', fontSize: '38px', fontWeight: '800', color: '#070b0a',
                            fontFamily: 'var(--font-heading)',
                            boxShadow: '0 18px 42px rgba(94, 210, 156, 0.35), inset 0 2px 0 rgba(255,255,255,0.2)'
                        }}
                    >
                        {user?.name?.charAt(0)}
                    </motion.div>

                    <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-heading)', letterSpacing: '-0.03em', marginBottom: '10px', fontWeight: '700' }}>{user?.name}</h2>
                    <span className="pill pill-neon" style={{ marginBottom: '20px' }}>
                        {user?.role}
                    </span>

                    <div style={{ margin: '20px 0', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />

                    <div className="flex-col gap-3" style={{ textAlign: 'left' }}>
                        {[
                            { icon: <Mail size={15} />, label: user?.email },
                            { icon: <Building size={15} />, label: user?.institution },
                            { icon: <MapPin size={15} />, label: `${user?.city}, ${user?.country}` },
                            { icon: <Calendar size={15} />, label: `Joined ${new Date(user?.registeredAt).toLocaleDateString()}` }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 text-muted text-sm" style={{ padding: '6px 0' }}>
                                <span style={{ color: 'var(--text-subtle)' }}>{item.icon}</span>
                                <span style={{ fontSize: '13px', wordBreak: 'break-word' }}>{item.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '24px' }}>
                        {[
                            { value: myPosts.length, label: 'Total', color: 'var(--text-main)' },
                            { value: activePosts, label: 'Active', color: '#8be8bc' },
                            { value: closedPosts, label: 'Closed', color: '#67e8f9' }
                        ].map((s, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -3, borderColor: 'rgba(94, 210, 156, 0.25)' }}
                                transition={{ type: 'spring', stiffness: 320 }}
                                style={{
                                    background: 'rgba(7, 11, 10, 0.5)', padding: '14px 8px',
                                    borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)',
                                    transition: 'all 0.3s'
                                }}>
                                <div style={{ fontSize: '26px', fontWeight: '800', color: s.color, fontFamily: 'var(--font-heading)', letterSpacing: '-0.03em' }}>{s.value}</div>
                                <div style={{ fontSize: '9.5px', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: '700', marginTop: '2px' }}>{s.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Right: Settings */}
                <div className="flex-col gap-6">

                    {/* Edit Profile */}
                    <motion.div
                        initial={animReady ? {  opacity: 0, y: 20  } : false}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="editorial-panel"
                    >
                        <div className="flex justify-between items-center mb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '18px' }}>
                            <div>
                                <span className="editorial-eyebrow" style={{ marginBottom: '8px' }}>
                                    <UserCircle size={11} /> Settings
                                </span>
                                <h3 className="editorial-section-heading">Profile Details</h3>
                            </div>
                            {!editMode ? (
                                <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }} onClick={() => setEditMode(true)} className="btn-lux-ghost" style={{ padding: '10px 18px', fontSize: '12.5px' }}>
                                    Edit
                                </motion.button>
                            ) : (
                                <div className="flex gap-2">
                                    <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }} onClick={() => { setEditMode(false); setName(user.name); setCity(user.city); setCountry(user.country); setInstitution(user.institution); }} className="btn-lux-ghost" style={{ padding: '10px 18px', fontSize: '12.5px' }}>Cancel</motion.button>
                                    <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }} onClick={handleSave} className="btn-lux" style={{ padding: '10px 18px', fontSize: '12.5px' }}>
                                        <CheckCircle2 size={14} /> Save
                                    </motion.button>
                                </div>
                            )}
                        </div>

                        <div className="flex-col gap-4">
                            {[
                                { label: 'Full Name', icon: <UserCircle size={12} />, value: name, setter: setName, disabled: !editMode },
                                { label: 'Institution', icon: <Building size={12} />, value: institution, setter: setInstitution, disabled: !editMode },
                                { label: 'Country', icon: <Globe size={12} />, value: country, setter: setCountry, disabled: !editMode },
                                { label: 'City', icon: <MapPin size={12} />, value: city, setter: setCity, disabled: !editMode }
                            ].map((field, i) => (
                                <div key={i}>
                                    <label className="input-lux-label flex items-center gap-2" style={{ display: 'inline-flex' }}>
                                        {field.icon} {field.label}
                                    </label>
                                    <input
                                        type="text"
                                        className="input-lux"
                                        style={{
                                            opacity: field.disabled ? 0.55 : 1,
                                            cursor: field.disabled ? 'default' : 'text'
                                        }}
                                        value={field.value}
                                        onChange={(e) => field.setter(e.target.value)}
                                        disabled={field.disabled}
                                    />
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* GDPR Section */}
                    <motion.div
                        initial={animReady ? {  opacity: 0, y: 20  } : false}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="editorial-panel"
                    >
                        <span className="editorial-eyebrow cyan">
                            <Shield size={11} /> Privacy
                        </span>
                        <h3 className="editorial-section-heading">Data Rights (GDPR)</h3>
                        <p className="text-muted text-sm mb-6" style={{ lineHeight: '1.7', fontSize: '13.5px' }}>
                            Exercise your data rights under GDPR Article 15, 17, and 20.
                        </p>

                        <div className="flex-col gap-3">
                            <motion.button whileHover={{ x: 4 }} id="export-data-btn" onClick={handleExportData} className="btn-lux-ghost" style={{ justifyContent: 'flex-start', padding: '14px 20px', width: '100%' }}>
                                <Download size={15} /> Export My Data (JSON)
                            </motion.button>

                            <motion.button whileHover={{ x: 4 }} id="delete-account-btn" onClick={() => setShowDeleteConfirm(true)} style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                justifyContent: 'flex-start', padding: '14px 20px', borderRadius: '13px',
                                background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)',
                                color: 'var(--badge-error-text)', cursor: 'pointer',
                                fontWeight: '600', fontSize: '13.5px', letterSpacing: '0.01em',
                                transition: 'all 0.3s'
                            }}
                                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.28)'; }}
                                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.15)'; }}
                            >
                                <Trash2 size={15} /> Delete My Account (Art. 17)
                            </motion.button>
                        </div>
                    </motion.div>

                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <div className="modal-overlay">
                        <motion.div
                            initial={animReady ? {  opacity: 0, scale: 0.92  } : false}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.92 }}
                            className="glass-panel modal-content"
                            style={{ maxWidth: '480px', borderRadius: '20px' }}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div style={{ background: 'rgba(239, 68, 68, 0.08)', padding: '12px', borderRadius: '14px' }}>
                                    <AlertTriangle color="var(--error)" size={28} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '20px', fontWeight: '700', fontFamily: 'var(--font-heading)', margin: 0 }}>Permanent Deletion</h2>
                                    <p style={{ fontSize: '12px', color: 'var(--text-subtle)', margin: 0 }}>GDPR Art. 17 — Right to Erasure</p>
                                </div>
                            </div>

                            <p style={{ fontSize: '14px', color: 'var(--text-subtle)', lineHeight: '1.75', marginBottom: '32px' }}>
                                This action will permanently delete your account, all published announcements, and associated data. This operation cannot be reversed.
                            </p>

                            <div className="flex justify-end gap-3">
                                <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)} style={{ padding: '12px 24px', borderRadius: '12px' }}>Cancel</button>
                                <button className="btn btn-danger" onClick={handleDeleteAccount} style={{ padding: '12px 24px', borderRadius: '12px' }}>
                                    <Trash2 size={16} /> Permanently Delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Profile;
