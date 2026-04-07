import { useState, useEffect } from 'react';
import { Shield, Download, Search, Clock, Users, FileText, Activity, Trash2, Power, Briefcase, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    subscribeToLogsRT, 
    subscribeToUsersRT, 
    updateUserInFirestore, 
    deletePostFromFirestore 
} from '../services/firestore';

const AdminDashboard = ({ user, posts }) => {
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'posts', 'logs'
    const [logs, setLogs] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Log filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('All');
    const [filterAction, setFilterAction] = useState('All');

    useEffect(() => {
        let unsubLogs;
        let unsubUsers;
        try {
            unsubLogs = subscribeToLogsRT((data) => {
                data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                setLogs(data);
                setLoading(false);
            });
            unsubUsers = subscribeToUsersRT((data) => {
                setUsers(data);
            });
        } catch (err) {
            console.error("Dashboard subscription error:", err);
            setLoading(false);
        }
        return () => {
            if (unsubLogs) unsubLogs();
            if (unsubUsers) unsubUsers();
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
        }
    };

    const handleDeletePost = async (post) => {
        if (window.confirm(`WARNING: Deleting post "${post.title}". This cannot be undone. Proceed?`)) {
            await deletePostFromFirestore(post.id);
        }
    };

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '80px', maxWidth: '1200px', margin: '0 auto' }}>
            
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                style={{
                    background: 'rgba(239, 68, 68, 0.05)', padding: '28px 32px',
                    borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(239, 68, 68, 0.15)',
                    position: 'relative', overflow: 'hidden', marginBottom: '24px'
                }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: 'linear-gradient(90deg, transparent, var(--error), var(--primary), transparent)' }} />
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div style={{ background: 'rgba(239,68,68,0.1)', padding: '14px', borderRadius: '16px' }}>
                            <Shield size={28} color="var(--error)" />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '32px', marginBottom: '4px', letterSpacing: '-0.04em', fontFamily: 'var(--font-heading)' }}>
                                System <span style={{ color: 'var(--error)' }}>Admin</span>
                            </h1>
                            <p className="text-muted" style={{ fontSize: '15px' }}>Global oversight and management console.</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6" style={{ background: 'var(--panel-light)', padding: '6px', borderRadius: '14px', border: '1px solid var(--border)' }}>
                {[
                    { id: 'overview', label: 'Overview', icon: <Activity size={16} /> },
                    { id: 'users', label: 'Users', icon: <Users size={16} /> },
                    { id: 'posts', label: 'Announcements', icon: <FileText size={16} /> },
                    { id: 'logs', label: 'Audit Logs', icon: <Clock size={16} /> },
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                            fontSize: '14px', fontWeight: '600', transition: 'all 0.2s',
                            background: activeTab === tab.id ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                            color: activeTab === tab.id ? '#fca5a5' : 'var(--text-muted)'
                        }}>
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {/* 1. OVERVIEW */}
                {activeTab === 'overview' && (
                    <motion.div key="overview" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                            <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
                                <Users size={32} color="#818cf8" style={{ margin: '0 auto 12px' }} />
                                <h3 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 4px', color: 'white' }}>{users.length}</h3>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase' }}>Total Users</p>
                            </div>
                            <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
                                <FileText size={32} color="#34d399" style={{ margin: '0 auto 12px' }} />
                                <h3 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 4px', color: 'white' }}>{posts?.length || 0}</h3>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase' }}>Total Announcements</p>
                            </div>
                            <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
                                <Activity size={32} color="#fcd34d" style={{ margin: '0 auto 12px' }} />
                                <h3 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 4px', color: 'white' }}>{posts?.filter(p => p.status === 'Active')?.length || 0}</h3>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase' }}>Active Projects</p>
                            </div>
                            <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
                                <Shield size={32} color="#fca5a5" style={{ margin: '0 auto 12px' }} />
                                <h3 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 4px', color: 'white' }}>{logs.length}</h3>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase' }}>Monitored Events</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* 2. USERS MANAGEMENT */}
                {activeTab === 'users' && (
                    <motion.div key="users" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
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
                    <motion.div key="posts" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
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
                    <motion.div key="logs" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
                        <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '16px' }} className="items-center">
                                <div style={{ position: 'relative' }}>
                                    <Search size={18} style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                                    <input type="text" placeholder="Search events..." className="input-field" style={{ paddingLeft: '48px', background: 'rgba(0,0,0,0.2)' }}
                                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                </div>
                                <select className="input-field" style={{ width: '160px', background: 'rgba(0,0,0,0.2)' }} value={filterRole} onChange={e => setFilterRole(e.target.value)}>
                                    <option value="All">All Roles</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Engineer">Engineer</option>
                                    <option value="Healthcare Professional">Healthcare</option>
                                </select>
                                <select className="input-field" style={{ width: '160px', background: 'rgba(0,0,0,0.2)' }} value={filterAction} onChange={e => setFilterAction(e.target.value)}>
                                    <option value="All">All Actions</option>
                                    <option value="LOGIN">Logins</option>
                                    <option value="POST">Posts</option>
                                    <option value="MEETING">Meetings</option>
                                </select>
                                <button onClick={exportToCSV} className="btn btn-secondary" style={{ padding: '12px 20px', display: 'flex', gap: '8px' }}>
                                    <Download size={16} /> Export CSV
                                </button>
                            </div>
                        </div>

                        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                            {loading ? (
                                <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading audit records...</div>
                            ) : filteredLogs.length === 0 ? (
                                <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>No logs found matching your criteria.</div>
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
