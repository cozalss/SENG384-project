import { useState, useEffect } from 'react';
import { Shield, Download, Search, Clock, Users, FileText, Activity, Trash2, Power, Briefcase, Lock } from 'lucide-react';
 
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
    subscribeToLogsRT,
    subscribeToUsersRT,
    updateUserInFirestore,
    deletePostFromFirestore,
    purgeOldLogs,
    RETENTION_MONTHS,
} from '../services/firestore';
import { useAnimReady } from '../hooks/useAnimReady';
import { useToast } from '../hooks/useToast';
import { useTilt } from '../hooks/useInteractiveFX';
import PxSelect from '../components/PxSelect';

const AdminStatTile = ({ icon: Icon, color, value, label, glowRgba }) => {
    const tilt = useTilt({ max: 7, scale: 1.025 });
    return (
        <motion.div
            {...tilt}
            className="editorial-panel premium-card premium-card--soft"
            style={{ padding: '24px', textAlign: 'center', '--pc-glow': glowRgba, '--pc-glow-soft': glowRgba.replace('0.45', '0.18') }}
        >
            <Icon size={32} color={color} style={{ margin: '0 auto 12px', position: 'relative', zIndex: 3 }} />
            <h3 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 4px', color: 'var(--text-main)', position: 'relative', zIndex: 3 }}>{value}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', position: 'relative', zIndex: 3 }}>{label}</p>
        </motion.div>
    );
};

const AdminDashboard = ({ user, posts }) => {
    const animReady = useAnimReady();
    const toast = useToast();
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'posts', 'logs'
    const [logs, setLogs] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Log filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('All');
    const [filterAction, setFilterAction] = useState('All');

    // Users tab filters (Brief 4.5.2 — "Filter by role" + completeness view)
    const [userFilterRole, setUserFilterRole] = useState('All');
    const [userSearchTerm, setUserSearchTerm] = useState('');

    // Posts tab filters (Brief 4.5.1 — "Filter by city, domain, status")
    const [postFilterCity, setPostFilterCity] = useState('All');
    const [postFilterDomain, setPostFilterDomain] = useState('All');
    const [postFilterStatus, setPostFilterStatus] = useState('All');
    // Brief 4.5.1 — "View lifecycle history". Click a status badge to expand
    // its timeline inline; null means nothing expanded.
    const [expandedHistory, setExpandedHistory] = useState(null);

    // Retention sweep state. Persists across reloads via localStorage so a single
    // operator opening the dashboard repeatedly doesn't slam Firestore with
    // back-to-back delete batches. Brief 4.6.3 mandates a 24-month retention
    // window — without a Cloud Function, the admin dashboard is the only
    // surface that can drive the sweep, so we run it on mount with a 24h
    // throttle and surface the result to the operator.
    const [retentionInfo, setRetentionInfo] = useState(() => {
        try {
            const raw = localStorage.getItem('health_ai_retention_sweep');
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    });
    const [retentionSweeping, setRetentionSweeping] = useState(false);

    const runRetentionSweep = async () => {
        setRetentionSweeping(true);
        try {
            const result = await purgeOldLogs(RETENTION_MONTHS);
            const info = {
                at: new Date().toISOString(),
                deleted: result?.deleted || 0,
                cutoff: result?.cutoff || null,
                error: result?.error || null,
            };
            setRetentionInfo(info);
            try { localStorage.setItem('health_ai_retention_sweep', JSON.stringify(info)); } catch { /* private mode */ }
            if (info.error) {
                toast.error(`Retention sweep failed: ${info.error}`, { title: 'Retention error' });
            } else if (info.deleted > 0) {
                toast.success(`Removed ${info.deleted} log${info.deleted === 1 ? '' : 's'} older than ${RETENTION_MONTHS} months.`, {
                    title: 'Retention sweep complete',
                });
            } else {
                toast.info('No logs older than the retention window — nothing to delete.', {
                    title: 'Retention sweep complete',
                });
            }
        } finally {
            setRetentionSweeping(false);
        }
    };

    // Auto-sweep on mount, throttled to once per 24h. The operator can also
    // trigger a manual sweep from the audit logs tab — that one bypasses the
    // throttle since it's an explicit intent.
    useEffect(() => {
        if (retentionInfo?.at) {
            const since = Date.now() - new Date(retentionInfo.at).getTime();
            if (since < 24 * 60 * 60 * 1000) return; // already swept today
        }
        runRetentionSweep();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        let cancelled = false;
        let unsubLogs;
        let unsubUsers;
        try {
            unsubLogs = subscribeToLogsRT((data) => {
                if (cancelled) return;
                data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                setLogs(data);
                setLoading(false);
            });
            unsubUsers = subscribeToUsersRT((data) => {
                if (cancelled) return;
                setUsers(data);
            });
            } catch (err) {
            console.error("Dashboard subscription error:", err);
            // Subscription init failed; surface as "loaded with empty state"
            // so the UI can render an error placeholder. Rule misfire here.
            setLoading(false);
            return () => { cancelled = true; };
        }
        return () => {
            cancelled = true;
            if (typeof unsubLogs === 'function') unsubLogs();
            if (typeof unsubUsers === 'function') unsubUsers();
        };
    }, []);

    // -------- LOGS --------
    const filteredLogs = logs.filter(log => {
        if (filterRole !== 'All' && log.role !== filterRole) return false;
        if (filterAction !== 'All' && log.actionType && !log.actionType.includes(filterAction)) return false;
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            return (log.userName?.toLowerCase().includes(lower) || log.actionType?.toLowerCase().includes(lower) || log.details?.toLowerCase().includes(lower));
        }
        return true;
    });

    // CSV Excel-injection-safe escaper. RFC 4180 quote doubling for embedded
    // double quotes, plus a leading apostrophe whenever the cell starts with
    // a formula leader (=, +, -, @, tab, CR) so spreadsheets render the value
    // as text instead of executing it as a formula.
    const csvEscape = (value) => {
        const s = value == null ? '' : String(value);
        const leadsFormula = /^[=+\-@\t\r]/.test(s);
        const escaped = s.replace(/"/g, '""');
        return `"${leadsFormula ? `'${escaped}` : escaped}"`;
    };

    const exportToCSV = () => {
        const headers = ['Timestamp', 'User', 'Role', 'Action', 'Target Entity', 'Result', 'Details'];
        const rows = [headers.map(csvEscape).join(',')];
        filteredLogs.forEach(log => {
            rows.push([
                new Date(log.timestamp).toLocaleString('en-US'),
                log.userName || 'Unknown',
                log.role || 'N/A',
                log.actionType || 'Unknown',
                log.targetEntity || '-',
                log.result || '-',
                log.details || '-',
            ].map(csvEscape).join(','));
        });
        // CRLF line endings + UTF-8 BOM keep Excel from mis-parsing accented
        // characters and from collapsing rows on Windows.
        const csv = '﻿' + rows.join('\r\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `health_ai_logs_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const getActionColor = (action) => {
        if (!action) return 'var(--text-muted)';
        if (action.includes('CREATE')) return '#34d399';
        if (action.includes('FAIL')) return '#fca5a5';
        if (action.includes('MEETING')) return '#a5b4fc';
        if (action.includes('EDIT')) return '#fcd34d';
        return '#cbd5e1';
    };

    // -------- USERS (Brief 4.5.2) --------
    // Profile completeness — fraction of optional/identity fields the user
    // filled in. Surfaces gaps so admins can nudge low-completion accounts.
    // Five fields chosen to mirror the registration form: name, institution,
    // city, country, role. Email is required by registration so it always
    // counts as filled.
    const profileCompleteness = (u) => {
        const fields = ['name', 'institution', 'city', 'country', 'role'];
        const filled = fields.filter(k => (u?.[k] || '').toString().trim().length > 0).length;
        return Math.round((filled / fields.length) * 100);
    };

    const filteredUsers = users.filter(u => {
        if (userFilterRole !== 'All' && u.role !== userFilterRole) return false;
        if (userSearchTerm) {
            const q = userSearchTerm.toLowerCase();
            return (u.name || '').toLowerCase().includes(q)
                || (u.email || '').toLowerCase().includes(q)
                || (u.institution || '').toLowerCase().includes(q);
        }
        return true;
    });

    // -------- POSTS (Brief 4.5.1) --------
    const postCities = ['All', ...Array.from(new Set((posts || []).map(p => p.city).filter(Boolean)))];
    const postDomains = ['All', ...Array.from(new Set((posts || []).map(p => p.domain).filter(Boolean)))];
    const postStatuses = ['All', 'Draft', 'Active', 'Meeting Scheduled', 'CLOSED', 'Expired'];

    const filteredPosts = (posts || []).filter(p => {
        if (postFilterCity !== 'All' && p.city !== postFilterCity) return false;
        if (postFilterDomain !== 'All' && p.domain !== postFilterDomain) return false;
        if (postFilterStatus !== 'All' && p.status !== postFilterStatus) return false;
        return true;
    });

    // -------- ACTIONS --------
    const toggleUserStatus = async (targetUser) => {
        const newStatus = targetUser.status === 'frozen' ? 'active' : 'frozen';
        if (window.confirm(`Are you sure you want to ${newStatus === 'frozen' ? 'freeze' : 'unfreeze'} ${targetUser.name}?`)) {
            await updateUserInFirestore(targetUser.id, { status: newStatus });
            toast.success(
                `${targetUser.name} → ${newStatus === 'frozen' ? 'frozen' : 'active'}`,
                { title: newStatus === 'frozen' ? 'User frozen' : 'User unfrozen' }
            );
        }
    };

    const handleDeletePost = async (post) => {
        if (window.confirm(`WARNING: Deleting post "${post.title}". This cannot be undone. Proceed?`)) {
            await deletePostFromFirestore(post.id);
            toast.success(`"${post.title}" removed from the network.`, { title: 'Post deleted' });
        }
    };

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '80px', maxWidth: '1200px', margin: '0 auto' }}>

            {/* Editorial header */}
            <motion.section
                initial={animReady ? {  opacity: 0, y: 24  } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="editorial-header"
            >
                <div className="editorial-header-inner">
                    <div>
                        <span className="editorial-eyebrow" style={{ background: 'rgba(239, 68, 68, 0.06)', borderColor: 'rgba(239, 68, 68, 0.22)', color: '#fca5a5' }}>
                            <Shield size={11} /> System Admin
                        </span>
                        <h1 className="editorial-display">
                            Admin <span className="accent">Console</span>
                        </h1>
                        <p className="editorial-subtitle">
                            Global oversight — users, announcements, and audit trail in a single editorial cockpit.
                        </p>
                    </div>
                </div>
            </motion.section>

            {/* Tabs — animated pill */}
            <LayoutGroup>
                <div className="segmented-control" style={{ marginBottom: '24px', display: 'flex', flexWrap: 'wrap', width: '100%', justifyContent: 'space-evenly' }}>
                    {[
                        { id: 'overview', label: 'Overview', icon: <Activity size={14} /> },
                        { id: 'users', label: 'Users', icon: <Users size={14} /> },
                        { id: 'posts', label: 'Announcements', icon: <FileText size={14} /> },
                        { id: 'logs', label: 'Audit Logs', icon: <Clock size={14} /> }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`segmented-tab ${activeTab === tab.id ? 'active' : ''}`}
                            style={{ flex: 1, justifyContent: 'center' }}
                        >
                            {activeTab === tab.id && (
                                <motion.span
                                    layoutId="admin-pill"
                                    className="dash-segmented-fill"
                                    style={{
                                        position: 'absolute', inset: 0,
                                        borderRadius: '10px', zIndex: -1,
                                    }}
                                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                />
                            )}
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
            </LayoutGroup>

            <AnimatePresence mode="wait">
                {/* 1. OVERVIEW */}
                {activeTab === 'overview' && (
                    <motion.div key="overview" initial={animReady ? { opacity:0, y:10 } : false} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                            <AdminStatTile icon={Users} color="#93c5fd" value={users.length} label="Total Users" glowRgba="rgba(147, 197, 253, 0.45)" />
                            <AdminStatTile icon={FileText} color="#34d399" value={posts?.length || 0} label="Total Announcements" glowRgba="rgba(52, 211, 153, 0.45)" />
                            <AdminStatTile icon={Activity} color="#fcd34d" value={posts?.filter(p => p.status === 'Active')?.length || 0} label="Active Projects" glowRgba="rgba(252, 211, 77, 0.45)" />
                            <AdminStatTile icon={Shield} color="#fca5a5" value={logs.length} label="Monitored Events" glowRgba="rgba(252, 165, 165, 0.45)" />
                        </div>
                    </motion.div>
                )}

                {/* 2. USERS MANAGEMENT */}
                {activeTab === 'users' && (
                    <motion.div key="users" initial={animReady ? { opacity:0, y:10 } : false} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
                        {/* Filter bar — Brief 4.5.2 */}
                        <div className="editorial-panel" style={{ padding: '20px', marginBottom: '12px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '12px' }} className="items-center">
                                <div className="portal-search" style={{ padding: '11px 16px' }}>
                                    <Search size={16} color="var(--text-subtle)" />
                                    <input type="text" placeholder="Search name, email, institution…" value={userSearchTerm} onChange={(e) => setUserSearchTerm(e.target.value)} />
                                </div>
                                <PxSelect
                                    size="sm"
                                    ariaLabel="Filter users by role"
                                    label="Role:"
                                    value={userFilterRole}
                                    onChange={setUserFilterRole}
                                    options={[
                                        { value: 'All', label: 'All Roles' },
                                        { value: 'Admin', label: 'Admin' },
                                        { value: 'Engineer', label: 'Engineer' },
                                        { value: 'Healthcare Professional', label: 'Healthcare' },
                                    ]}
                                />
                                <div style={{ fontSize: 12, color: 'var(--text-subtle)', alignSelf: 'center', textAlign: 'right' }}>
                                    Showing <strong style={{ color: 'var(--text-main)' }}>{filteredUsers.length}</strong> of {users.length} users
                                </div>
                            </div>
                        </div>

                        <div className="editorial-panel" style={{ padding: '0', overflow: 'hidden' }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                <thead>
                                    <tr style={{ background: 'var(--panel-light)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                                        <th style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>Name / Email</th>
                                        <th style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>Role</th>
                                        <th style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>Profile</th>
                                        <th style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>Status</th>
                                        <th style={{ padding: '16px 24px', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((u, i) => {
                                        const completeness = profileCompleteness(u);
                                        const completenessTone = completeness >= 80 ? '#34d399' : completeness >= 50 ? '#fcd34d' : '#fca5a5';
                                        return (
                                        <tr key={u.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--background-alt)' }}>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{u.name}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>{u.email}</div>
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <span className={`badge ${u.role === 'Admin' ? 'badge-primary' : 'badge-secondary'}`}>{u.role}</span>
                                            </td>
                                            <td style={{ padding: '16px 24px', minWidth: 140 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div style={{
                                                        flex: 1, height: 6, borderRadius: 999,
                                                        background: 'var(--hl-faint)',
                                                        overflow: 'hidden', maxWidth: 90,
                                                    }}>
                                                        <div style={{
                                                            width: `${completeness}%`, height: '100%',
                                                            background: completenessTone,
                                                            borderRadius: 999,
                                                            transition: 'width 0.3s ease',
                                                        }} />
                                                    </div>
                                                    <span style={{ fontSize: 11, fontWeight: 700, color: completenessTone, fontVariantNumeric: 'tabular-nums' }}>
                                                        {completeness}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                {u.status === 'frozen'
                                                    ? <span style={{ color: 'var(--badge-error-text)', fontSize: '12px', background: 'rgba(239, 68, 68, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>Frozen</span>
                                                    : <span style={{ color: 'var(--secondary)', fontSize: '12px', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>Active</span>
                                                }
                                            </td>
                                            <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                                {u.id !== user.id && (
                                                    <button onClick={() => toggleUserStatus(u)} style={{
                                                        background: 'transparent', border: '1px solid var(--border)',
                                                        padding: '6px 12px', borderRadius: '8px', color: u.status === 'frozen' ? '#34d399' : '#fca5a5',
                                                        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px'
                                                    }}>
                                                        {u.status === 'frozen' ? 'Unfreeze' : 'Freeze'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        </div>
                    </motion.div>
                )}

                {/* 3. POSTS MANAGEMENT */}
                {activeTab === 'posts' && (
                    <motion.div key="posts" initial={animReady ? { opacity:0, y:10 } : false} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
                        {/* Filter bar — Brief 4.5.1 */}
                        <div className="editorial-panel" style={{ padding: '20px', marginBottom: '12px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '12px' }} className="items-center">
                                <PxSelect
                                    size="sm"
                                    ariaLabel="Filter posts by city"
                                    label="City:"
                                    value={postFilterCity}
                                    onChange={setPostFilterCity}
                                    options={postCities.map(c => ({ value: c, label: c }))}
                                />
                                <PxSelect
                                    size="sm"
                                    ariaLabel="Filter posts by domain"
                                    label="Domain:"
                                    value={postFilterDomain}
                                    onChange={setPostFilterDomain}
                                    options={postDomains.map(d => ({ value: d, label: d }))}
                                />
                                <PxSelect
                                    size="sm"
                                    ariaLabel="Filter posts by status"
                                    label="Status:"
                                    value={postFilterStatus}
                                    onChange={setPostFilterStatus}
                                    options={postStatuses.map(s => ({ value: s, label: s === 'CLOSED' ? 'Partner Found' : s }))}
                                />
                                <div style={{ fontSize: 12, color: 'var(--text-subtle)', alignSelf: 'center', textAlign: 'right' }}>
                                    Showing <strong style={{ color: 'var(--text-main)' }}>{filteredPosts.length}</strong> of {posts?.length || 0} posts
                                </div>
                            </div>
                        </div>

                        <div className="editorial-panel" style={{ padding: '0', overflow: 'hidden' }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                <thead>
                                    <tr style={{ background: 'var(--panel-light)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                                        <th style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>Title &amp; Setup</th>
                                        <th style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>City / Domain</th>
                                        <th style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>Status</th>
                                        <th style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>Privacy</th>
                                        <th style={{ padding: '16px 24px', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPosts.map((p, i) => (
                                        <tr key={p.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--background-alt)' }}>
                                            <td style={{ padding: '16px 24px', maxWidth: '300px' }}>
                                                <div style={{ fontWeight: '600', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>By: {p.authorName}</div>
                                            </td>
                                            <td style={{ padding: '16px 24px', fontSize: 12, color: 'var(--text-muted)' }}>
                                                <div>{p.city || '—'}</div>
                                                <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{p.domain || '—'}</div>
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => setExpandedHistory(expandedHistory === p.id ? null : p.id)}
                                                    style={{
                                                        background: 'transparent', border: '1px solid var(--border)',
                                                        padding: '4px 8px', borderRadius: 6, cursor: 'pointer',
                                                        fontSize: 12, color: p.status === 'CLOSED' ? '#34d399' : '#a5b4fc',
                                                        display: 'inline-flex', alignItems: 'center', gap: 4,
                                                    }}
                                                    title="Show lifecycle history"
                                                >
                                                    {p.status === 'CLOSED' ? 'Partner Found' : p.status}
                                                    <Clock size={11} />
                                                </button>
                                                {expandedHistory === p.id && Array.isArray(p.statusHistory) && p.statusHistory.length > 0 && (
                                                    <ul style={{
                                                        listStyle: 'none', margin: '8px 0 0', padding: '8px 10px',
                                                        background: 'var(--bg-overlay)',
                                                        border: '1px solid var(--border)',
                                                        borderRadius: 8, fontSize: 11, color: 'var(--text-muted)',
                                                        maxWidth: 240,
                                                    }}>
                                                        {p.statusHistory.slice().reverse().map((h, idx) => (
                                                            <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '2px 0' }}>
                                                                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{h.status}</span>
                                                                <span style={{ color: 'var(--text-subtle)' }}>
                                                                    {h.at ? new Date(h.at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                {p.confidentiality === 'meeting-only'
                                                    ? <Lock size={14} color="#fca5a5" title="Meeting Only" />
                                                    : <Briefcase size={14} color="#6ee7b7" title="Public Pitch" />
                                                }
                                            </td>
                                            <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                                <button onClick={() => handleDeletePost(p)} style={{
                                                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                                                    padding: '6px 10px', borderRadius: '8px', color: 'var(--badge-error-text)',
                                                    cursor: 'pointer', display: 'inline-flex', alignItems: 'center'
                                                }}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        </div>
                    </motion.div>
                )}

                {/* 4. AUDIT LOGS */}
                {activeTab === 'logs' && (
                    <motion.div key="logs" initial={animReady ? { opacity:0, y:10 } : false} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
                        {/* Retention status — Brief 4.6.3 ("defined retention period: 24 months").
                            Surfaces the last sweep so the operator can see GDPR compliance at a
                            glance, and lets them trigger a manual sweep on demand. */}
                        <div
                            className="editorial-panel"
                            style={{
                                padding: '14px 18px',
                                marginBottom: '12px',
                                display: 'flex',
                                gap: 14,
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                background: 'rgba(34, 211, 102, 0.04)',
                                border: '1px solid rgba(34, 211, 102, 0.18)',
                            }}
                        >
                            <Shield size={16} color="hsl(119 80% 70%)" />
                            <div style={{ flex: 1, minWidth: 220 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>
                                    {RETENTION_MONTHS}-month retention policy active
                                </div>
                                <div style={{ fontSize: 11.5, color: 'var(--text-subtle)', marginTop: 2 }}>
                                    {retentionInfo?.at ? (
                                        <>
                                            Last sweep: {new Date(retentionInfo.at).toLocaleString('en-US')}
                                            {' · '}
                                            {retentionInfo.error
                                                ? <span style={{ color: '#fca5a5' }}>error: {retentionInfo.error}</span>
                                                : `${retentionInfo.deleted} log${retentionInfo.deleted === 1 ? '' : 's'} purged`}
                                        </>
                                    ) : (
                                        retentionSweeping ? 'Running first sweep…' : 'No sweep performed yet this session.'
                                    )}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={runRetentionSweep}
                                disabled={retentionSweeping}
                                className="px-btn sm"
                                style={{ fontSize: 12 }}
                            >
                                {retentionSweeping ? (
                                    <>
                                        <Clock size={13} style={{ animation: 'spin 1s linear infinite' }} /> Sweeping…
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={13} /> Run sweep now
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="editorial-panel" style={{ padding: '20px', marginBottom: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '12px' }} className="items-center">
                                <div className="portal-search" style={{ padding: '11px 16px' }}>
                                    <Search size={16} color="var(--text-subtle)" />
                                    <input type="text" placeholder="Search events…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                </div>
                                <PxSelect
                                    size="sm"
                                    ariaLabel="Filter by role"
                                    label="Role:"
                                    value={filterRole}
                                    onChange={setFilterRole}
                                    options={[
                                        { value: 'All', label: 'All Roles' },
                                        { value: 'Admin', label: 'Admin' },
                                        { value: 'Engineer', label: 'Engineer' },
                                        { value: 'Healthcare Professional', label: 'Healthcare' },
                                    ]}
                                />
                                <PxSelect
                                    size="sm"
                                    ariaLabel="Filter by action"
                                    label="Action:"
                                    value={filterAction}
                                    onChange={setFilterAction}
                                    options={[
                                        { value: 'All', label: 'All Actions' },
                                        { value: 'LOGIN', label: 'Logins' },
                                        { value: 'POST', label: 'Posts' },
                                        { value: 'MEETING', label: 'Meetings' },
                                    ]}
                                />
                                <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }} onClick={exportToCSV} className="px-btn sm" style={{ fontSize: '12.5px', justifyContent: 'center' }}>
                                    <Download size={14} /> Export CSV
                                </motion.button>
                            </div>
                        </div>

                        <div className="editorial-panel" style={{ padding: '0', overflow: 'hidden' }}>
                            {loading ? (
                                <div style={{ padding: '60px 24px' }}>
                                    <div className="shimmer" style={{ height: 12, borderRadius: 6, marginBottom: 10 }} />
                                    <div className="shimmer" style={{ height: 12, width: '92%', borderRadius: 6, marginBottom: 10 }} />
                                    <div className="shimmer" style={{ height: 12, width: '76%', borderRadius: 6 }} />
                                </div>
                            ) : filteredLogs.length === 0 ? (
                                <div style={{ position: 'relative', padding: '72px 28px', textAlign: 'center', overflow: 'hidden' }}>
                                    <div aria-hidden="true" style={{
                                        position: 'absolute', inset: 0, pointerEvents: 'none',
                                        background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(34, 211, 102, 0.08), transparent 65%)',
                                    }} />
                                    <div style={{
                                        position: 'relative',
                                        width: 56, height: 56, margin: '0 auto 14px',
                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                        borderRadius: 16,
                                        background: 'var(--hl-faint)',
                                        border: '1px solid var(--border)',
                                        color: 'var(--text-muted)',
                                    }}>
                                        <Activity size={22} strokeWidth={1.6} />
                                    </div>
                                    <p style={{
                                        position: 'relative',
                                        fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 600,
                                        letterSpacing: '-0.02em', color: 'var(--text-main)', marginBottom: 6,
                                    }}>No audit records</p>
                                    <p style={{ position: 'relative', fontSize: 13, color: 'var(--text-subtle)', maxWidth: 340, margin: '0 auto', lineHeight: 1.55 }}>
                                        {searchTerm || filterRole !== 'All' || filterAction !== 'All'
                                            ? 'Try loosening the filters above.'
                                            : 'Events will appear here as users interact with the platform.'}
                                    </p>
                                </div>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                        <thead>
                                            <tr style={{ background: 'var(--panel-light)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                                                <th style={{ padding: '16px 24px', fontWeight: '600', color: 'var(--text-muted)' }}>Timestamp</th>
                                                <th style={{ padding: '16px 24px', fontWeight: '600', color: 'var(--text-muted)' }}>User</th>
                                                <th style={{ padding: '16px 24px', fontWeight: '600', color: 'var(--text-muted)' }}>Action Type</th>
                                                <th style={{ padding: '16px 24px', fontWeight: '600', color: 'var(--text-muted)' }}>Details</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredLogs.map((log, index) => (
                                                <tr key={log.id} style={{ borderBottom: '1px solid var(--border)', background: index % 2 === 0 ? 'transparent' : 'var(--background-alt)' }}>
                                                    <td style={{ padding: '16px 24px', color: 'var(--text-subtle)', whiteSpace: 'nowrap' }}>
                                                        <div className="flex items-center gap-2">
                                                            <Clock size={14} />
                                                            {new Date(log.timestamp).toLocaleString('en-US', {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '16px 24px' }}>
                                                        <div className="flex flex-col">
                                                            <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{log.userName || 'Unknown'}</span>
                                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{log.role}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '16px 24px' }}>
                                                        <span style={{ color: getActionColor(log.actionType), background: 'var(--panel-base)', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                                                            {log.actionType}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '16px 24px' }}>
                                                        <div style={{ color: 'var(--text-main)', marginBottom: '4px' }}>{log.details}</div>
                                                        <div style={{ color: 'var(--text-subtle)', fontSize: '11px', fontFamily: 'monospace' }}>Entity: {log.targetEntity}</div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;
