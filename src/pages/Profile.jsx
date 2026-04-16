import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, MapPin, Building, Globe, Mail, Briefcase, Download, Trash2, Activity, Shield, Calendar, CheckCircle2, AlertTriangle, ArrowLeft, Sparkles } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

const Profile = ({ user, updateUser, deleteUser, posts, logout }) => {
    const navigate = useNavigate();
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
    };

    const handleDeleteAccount = () => {
        if (deleteUser) {
            deleteUser(user.id);
        }
        if (logout) logout();
        navigate('/login');
    };

    const myPosts = (posts || []).filter(p => p.authorId === user?.id);
    const activePosts = myPosts.filter(p => p.status === 'Active').length;
    const closedPosts = myPosts.filter(p => p.status === 'CLOSED').length;

    const accentGradient = user?.role === 'Engineer'
        ? 'linear-gradient(135deg, var(--primary), var(--accent))'
        : 'linear-gradient(135deg, var(--secondary), #34d399)';

    return (
        <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '80px' }}>

            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted mb-6 font-medium"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '14px' }}>
                <ArrowLeft size={16} /> Back
            </button>

            {/* Saved Success Message */}
            <AnimatePresence>
                {saved && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{
                            background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.12)',
                            borderLeft: '3px solid var(--secondary)', padding: '14px 18px', marginBottom: '24px',
                            borderRadius: 'var(--border-radius-sm)', display: 'flex', alignItems: 'center', gap: '10px'
                        }}
                    >
                        <CheckCircle2 size={18} color="#34d399" />
                        <span style={{ fontSize: '14px', color: 'var(--badge-success-text)', fontWeight: '600' }}>Profile updated successfully!</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'start' }}>

                {/* Left: Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel"
                    style={{ padding: '40px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}
                >
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: accentGradient }} />

                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        style={{
                            width: '88px', height: '88px', borderRadius: '24px',
                            background: accentGradient,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 20px', fontSize: '36px', fontWeight: '800', color: 'white',
                            fontFamily: 'var(--font-heading)',
                            boxShadow: '0 12px 30px rgba(0,0,0,0.3)'
                        }}
                    >
                        {user?.name?.charAt(0)}
                    </motion.div>

                    <h2 style={{ fontSize: '22px', fontFamily: 'var(--font-heading)', letterSpacing: '-0.03em', marginBottom: '8px' }}>{user?.name}</h2>
                    <span className={`badge ${user?.role === 'Engineer' ? 'badge-primary' : 'badge-success'}`} style={{ marginBottom: '20px' }}>
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
                            { value: activePosts, label: 'Active', color: 'var(--primary-light)' },
                            { value: closedPosts, label: 'Closed', color: 'var(--badge-success-text)' }
                        ].map((s, i) => (
                            <div key={i} style={{
                                background: 'var(--panel-light)', padding: '14px 8px',
                                borderRadius: '12px', border: '1px solid var(--border)'
                            }}>
                                <div style={{ fontSize: '24px', fontWeight: '800', color: s.color, fontFamily: 'var(--font-heading)' }}>{s.value}</div>
                                <div style={{ fontSize: '10px', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Right: Settings */}
                <div className="flex-col gap-6">

                    {/* Edit Profile */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-panel"
                        style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}
                    >
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg, transparent, var(--primary), transparent)' }} />
                        <div className="flex justify-between items-center mb-6" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                            <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <UserCircle size={20} color="var(--primary-light)" /> Profile Settings
                            </h3>
                            {!editMode ? (
                                <button onClick={() => setEditMode(true)} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '10px' }}>
                                    Edit
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button onClick={() => { setEditMode(false); setName(user.name); setCity(user.city); setCountry(user.country); setInstitution(user.institution); }} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '10px' }}>Cancel</button>
                                    <button onClick={handleSave} className="btn btn-accent" style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '10px' }}>
                                        <CheckCircle2 size={14} /> Save
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex-col gap-4">
                            {[
                                { label: 'Full Name', icon: <UserCircle size={14} />, value: name, setter: setName, disabled: !editMode },
                                { label: 'Institution', icon: <Building size={14} />, value: institution, setter: setInstitution, disabled: !editMode },
                                { label: 'Country', icon: <Globe size={14} />, value: country, setter: setCountry, disabled: !editMode },
                                { label: 'City', icon: <MapPin size={14} />, value: city, setter: setCity, disabled: !editMode }
                            ].map((field, i) => (
                                <div key={i} className="flex-col gap-2">
                                    <label className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                                        {field.icon} {field.label}
                                    </label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        style={{
                                            borderRadius: '12px',
                                            opacity: field.disabled ? 0.7 : 1,
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
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-panel"
                        style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}
                    >
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg, transparent, var(--secondary), transparent)' }} />
                        <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-heading)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Shield size={20} color="var(--secondary)" /> Data Privacy (GDPR)
                        </h3>
                        <p className="text-muted text-sm mb-6" style={{ lineHeight: '1.6' }}>
                            Exercise your data rights under GDPR Article 15, 17, and 20.
                        </p>

                        <div className="flex-col gap-3">
                            <button id="export-data-btn" onClick={handleExportData} className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: '14px 20px', borderRadius: '12px' }}>
                                <Download size={16} /> Export My Data (JSON)
                            </button>

                            <button id="delete-account-btn" onClick={() => setShowDeleteConfirm(true)} className="btn" style={{
                                justifyContent: 'flex-start', padding: '14px 20px', borderRadius: '12px',
                                background: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.1)',
                                color: 'var(--badge-error-text)'
                            }}>
                                <Trash2 size={16} /> Delete My Account (Art. 17)
                            </button>
                        </div>
                    </motion.div>

                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <div className="modal-overlay">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92 }}
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
