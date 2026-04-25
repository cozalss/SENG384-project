import { useState, useEffect } from 'react';
import { Shield, Download, Search, Clock, Users, FileText, Activity, Trash2, Power, Briefcase, Lock } from 'lucide-react';
 
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
    subscribeToLogsRT,
    subscribeToUsersRT,
    updateUserInFirestore,
    deletePostFromFirestore
} from '../services/firestore';
import { useAnimReady } from '../hooks/useAnimReady';
import { useToast } from '../hooks/useToast';
import PxSelect from '../components/PxSelect';

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
            // eslint-disable-next-line react-hooks/set-state-in-effect
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

    const exportToCSV = () => {
        const headers = ['Timestamp', 'User', 'Role', 'Action', 'Target Entity', 'Result', 'Details'];
        const rows = [headers.join(',')];
        filteredLogs.forEach(log => {
            rows.push([
                `"${new Date(log.timestamp).toLocaleString()}"`, `"${log.userName || 'Unknown'}"`,
                `"${log.role || 'N/A'}"`, `"${log.actionType || 'Unknown'}"`,
                `"${log.targetEntity || '-'}"`, `"${log.result || '-'}"`, `"${log.details || '-'}"`
            ].join(','));
        });
        const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `health_ai_logs_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const getActionColor = (action) => {
        if (!action) return 'var(--text-muted)';
        if (action.includes('CREATE')) return '#34d399';
        if (action.includes('FAIL')) return '#fca5a5';
        if (action.includes('MEETING')) return '#a5b4fc';
        if (action.includes('EDIT')) return '#fcd34d';
        return '#cbd5e1';
    };

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
                                    style={{
                                        position: 'absolute', inset: 0,
                                        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                                        borderRadius: '10px', zIndex: -1,
                                        boxShadow: '0 8px 22px rgba(96, 165, 250, 0.3)'
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
                            <div className="editorial-panel" style={{ padding: '24px', textAlign: 'center' }}>
                                <Users size={32} color="#93c5fd" style={{ margin: '0 auto 12px' }} />
                                <h3 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 4px', color: 'white' }}>{users.length}</h3>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase' }}>Total Users</p>
                            </div>
                            <div className="editorial-panel" style={{ padding: '24px', textAlign: 'center' }}>
                                <FileText size={32} color="#34d399" style={{ margin: '0 auto 12px' }} />
                                <h3 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 4px', color: 'white' }}>{posts?.length || 0}</h3>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase' }}>Total Announcements</p>
                            </div>
                            <div className="editorial-panel" style={{ padding: '24px', textAlign: 'center' }}>
                                <Activity size={32} color="#fcd34d" style={{ margin: '0 auto 12px' }} />
                                <h3 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 4px', color: 'white' }}>{posts?.filter(p => p.status === 'Active')?.length || 0}</h3>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase' }}>Active Projects</p>
                            </div>
                            <div className="editorial-panel" style={{ padding: '24px', textAlign: 'center' }}>
                                <Shield size={32} color="#fca5a5" style={{ margin: '0 auto 12px' }} />
                                <h3 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 4px', color: 'white' }}>{logs.length}</h3>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase' }}>Monitored Events</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* 2. USERS MANAGEMENT */}
                {activeTab === 'users' && (
                    <motion.div key="users" initial={animReady ? { opacity:0, y:10 } : false} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="editorial-panel" style={{ padding: '0', overflow: 'hidden' }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                <thead>
                                    <tr style={{ background: 'var(--panel-light)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                                        <th style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>Name / Email</th>
                                        <th style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>Role</th>
                                        <th style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>Status</th>
                                        <th style={{ padding: '16px 24px', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u, i) => (
                                        <tr key={u.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--background-alt)' }}>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{u.name}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>{u.email}</div>
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <span className={`badge ${u.role === 'Admin' ? 'badge-primary' : 'badge-secondary'}`}>{u.role}</span>
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
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {/* 3. POSTS MANAGEMENT */}
                {activeTab === 'posts' && (
                    <motion.div key="posts" initial={animReady ? { opacity:0, y:10 } : false} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="editorial-panel" style={{ padding: '0', overflow: 'hidden' }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                <thead>
                                    <tr style={{ background: 'var(--panel-light)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                                        <th style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>Title & Setup</th>
                                        <th style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>Status</th>
                                        <th style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>Privacy</th>
                                        <th style={{ padding: '16px 24px', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {posts?.map((p, i) => (
                                        <tr key={p.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--background-alt)' }}>
                                            <td style={{ padding: '16px 24px', maxWidth: '300px' }}>
                                                <div style={{ fontWeight: '600', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>By: {p.authorName}</div>
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <span style={{ fontSize:'12px', color: p.status === 'CLOSED' ? '#34d399' : '#a5b4fc'}}>{p.status}</span>
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
                    </motion.div>
                )}

                {/* 4. AUDIT LOGS */}
                {activeTab === 'logs' && (
                    <motion.div key="logs" initial={animReady ? { opacity:0, y:10 } : false} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
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
                                        background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(249, 168, 96, 0.08), transparent 65%)',
                                    }} />
                                    <div style={{
                                        position: 'relative',
                                        width: 56, height: 56, margin: '0 auto 14px',
                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                        borderRadius: 16,
                                        background: 'rgba(255, 255, 255, 0.04)',
                                        border: '1px solid rgba(255, 255, 255, 0.07)',
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
                                                            {new Date(log.timestamp).toLocaleString(undefined, {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})}
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
