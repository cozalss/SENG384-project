import React, { useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
    Send, Search, ArrowLeft, MessageSquare, MoreVertical, Check, CheckCheck,
    Trash2, Smile, Reply, Copy, X, ChevronDown, PenSquare, Sparkles, AtSign
} from 'lucide-react';
import { useChat } from '../hooks/useChat';
import './Chat.css';

const QUICK_REACTIONS = ['❤️', '👍', '😂', '😮', '😢', '🔥'];

// ----- Time formatting -----
const pad = (n) => n.toString().padStart(2, '0');
const toDate = (ts) => (ts?.toDate ? ts.toDate() : ts instanceof Date ? ts : null);
const isSameDay = (a, b) =>
    a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const formatMessageTime = (ts) => {
    const d = toDate(ts);
    if (!d) return '';
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const formatRelativeShort = (ts) => {
    const d = toDate(ts);
    if (!d) return '';
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 45) return 'now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400 && isSameDay(now, d)) return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    const yest = new Date(now); yest.setDate(yest.getDate() - 1);
    if (isSameDay(yest, d)) return 'Yesterday';
    if ((now - d) / 86400000 < 7) {
        return d.toLocaleDateString('en-US', { weekday: 'short' });
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatDateHeader = (ts) => {
    const d = toDate(ts);
    if (!d) return '';
    const now = new Date();
    if (isSameDay(now, d)) return 'Today';
    const yest = new Date(now); yest.setDate(yest.getDate() - 1);
    if (isSameDay(yest, d)) return 'Yesterday';
    if ((now - d) / 86400000 < 7) return d.toLocaleDateString('en-US', { weekday: 'long' });
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

// ----- Message grouping -----
// Two consecutive messages from the same sender within 2 minutes become a
// "group" — avatar/header shown on first, time shown on last. A new date also
// always breaks a group.
const GROUP_WINDOW_MS = 2 * 60 * 1000;

const buildTimeline = (messages) => {
    // Returns a flat list: { kind: 'date', date } | { kind: 'msg', msg, first, last, date }
    const out = [];
    let lastDate = null;
    for (let i = 0; i < messages.length; i++) {
        const m = messages[i];
        const md = toDate(m.timestamp) || new Date();
        if (!lastDate || !isSameDay(lastDate, md)) {
            out.push({ kind: 'date', date: md, key: `d-${md.toDateString()}` });
            lastDate = md;
        }
        const prev = messages[i - 1];
        const next = messages[i + 1];
        const prevD = prev ? toDate(prev.timestamp) : null;
        const nextD = next ? toDate(next.timestamp) : null;

        const first = !prev || prev.senderId !== m.senderId
            || !prevD || !isSameDay(prevD, md)
            || (md - prevD) > GROUP_WINDOW_MS;
        const last = !next || next.senderId !== m.senderId
            || !nextD || !isSameDay(nextD, md)
            || (nextD - md) > GROUP_WINDOW_MS;

        out.push({ kind: 'msg', msg: m, first, last, date: md, key: m.id || `m-${i}` });
    }
    return out;
};

// ----- Small building blocks -----

const Avatar = ({ name, size = 40, online = false, ring = false }) => {
    const initials = (name || '?').trim().charAt(0).toUpperCase();
    // Pseudo-random but stable hue from name
    const hue = useMemo(() => {
        let h = 0;
        for (let i = 0; i < (name || '').length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
        return h;
    }, [name]);
    return (
        <div
            className={`mx-avatar ${online ? 'is-online' : ''} ${ring ? 'has-ring' : ''}`}
            style={{ width: size, height: size, '--mx-avatar-hue': hue }}
        >
            <div className="mx-avatar-face">{initials}</div>
            {online && <span className="mx-avatar-dot" />}
        </div>
    );
};

const TypingDots = () => (
    <div className="mx-typing">
        <span /><span /><span />
    </div>
);

// ----- Message Bubble -----

const MessageBubble = React.memo(function MessageBubble({
    item, mine, onReply, onReact, onCopy, onDelete, recipientName, currentUserId
}) {
    const { msg, first, last } = item;
    const [hovered, setHovered] = useState(false);
    const [pickerOpen, setPickerOpen] = useState(false);

    const reactions = msg.reactions || {};
    const reactionEntries = Object.entries(reactions).filter(([, users]) => (users || []).length > 0);

    const groupClass = [
        'mx-bubble-row',
        mine ? 'is-mine' : 'is-theirs',
        first ? 'g-first' : '',
        last ? 'g-last' : '',
        !first && !last ? 'g-mid' : ''
    ].join(' ').trim();

    return (
        <div
            className={groupClass}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => { setHovered(false); setPickerOpen(false); }}
        >
            {!mine && (
                <div className="mx-bubble-avatar-slot">
                    {first && <Avatar name={msg.senderName || recipientName} size={28} />}
                </div>
            )}

            <div className="mx-bubble-stack">
                {msg.replyTo && (
                    <div className={`mx-quote ${mine ? 'is-mine' : 'is-theirs'}`}>
                        <span className="mx-quote-author">
                            {msg.replyTo.senderId === currentUserId ? 'You' : (msg.replyTo.senderName || recipientName || 'Them')}
                        </span>
                        <span className="mx-quote-text">{msg.replyTo.text}</span>
                    </div>
                )}

                <motion.div
                    className="mx-bubble"
                    initial={{ opacity: 0, y: 6, scale: 0.985 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    layout="position"
                >
                    <span className="mx-bubble-text">{msg.text}</span>

                    {reactionEntries.length > 0 && (
                        <div className="mx-reactions">
                            {reactionEntries.map(([emoji, users]) => {
                                const youReacted = users.includes(currentUserId);
                                return (
                                    <button
                                        key={emoji}
                                        type="button"
                                        className={`mx-reaction-pill ${youReacted ? 'is-you' : ''}`}
                                        onClick={() => onReact(msg.id, emoji)}
                                        aria-label={`${emoji} ${users.length}`}
                                    >
                                        <span className="mx-reaction-emoji">{emoji}</span>
                                        <span className="mx-reaction-count">{users.length}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </motion.div>

                <AnimatePresence>
                    {last && (
                        <motion.div
                            className="mx-bubble-meta"
                            initial={{ opacity: 0, y: -2 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.18 }}
                        >
                            <span className="mx-bubble-time">{formatMessageTime(msg.timestamp)}</span>
                            {mine && (
                                <span className="mx-bubble-status">
                                    {msg.read ? <CheckCheck size={12} /> : <Check size={12} />}
                                </span>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Action toolbar lives inside the stack so its absolute
                    positioning anchors to the bubble's bounding box (the stack
                    shrinks to bubble width) instead of the full-width row,
                    which used to push the toolbar off-screen. */}
                <AnimatePresence>
                    {hovered && (
                        <motion.div
                            className="mx-bubble-actions"
                            initial={{ opacity: 0, y: 4, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 4, scale: 0.96 }}
                            transition={{ duration: 0.15 }}
                        >
                            <button
                                type="button"
                                title="React"
                                className="mx-action-btn"
                                onClick={() => setPickerOpen(v => !v)}
                            >
                                <Smile size={15} />
                            </button>
                            <button type="button" title="Reply" className="mx-action-btn" onClick={() => onReply(msg)}>
                                <Reply size={15} />
                            </button>
                            <button type="button" title="Copy" className="mx-action-btn" onClick={() => onCopy(msg)}>
                                <Copy size={15} />
                            </button>
                            {mine && (
                                <button type="button" title="Delete" className="mx-action-btn danger" onClick={() => onDelete(msg)}>
                                    <Trash2 size={15} />
                                </button>
                            )}
                            <AnimatePresence>
                                {pickerOpen && (
                                    <motion.div
                                        className="mx-reaction-picker"
                                        initial={{ opacity: 0, y: 6, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 6, scale: 0.9 }}
                                        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                                    >
                                        {QUICK_REACTIONS.map(e => (
                                            <button
                                                key={e}
                                                type="button"
                                                className="mx-reaction-picker-btn"
                                                onClick={() => { onReact(msg.id, e); setPickerOpen(false); }}
                                            >
                                                <span>{e}</span>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
});

// ----- Main Chat Component -----

const Chat = ({ user }) => {
    const {
        messages, conversations, activeRecipient, setActiveRecipient,
        send, reactToMessage, removeMessage, setTyping, loading, allUsers, otherIsTyping,
        clearHistory, deleteConvo,
    } = useChat(user);

    const location = useLocation();
    const [messageText, setMessageText] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showUserList, setShowUserList] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [replyTarget, setReplyTarget] = useState(null);
    const [showScrollFab, setShowScrollFab] = useState(false);
    const [toast, setToast] = useState(null);

    const searchInputRef = useRef(null);
    const composerRef = useRef(null);
    const scrollerRef = useRef(null);
    const endSentinelRef = useRef(null);

    // ---- Deep-link: came from a "Message" CTA on another page ----
    useEffect(() => {
        if (location.state?.recipient) {
            setActiveRecipient(location.state.recipient);
        }
    }, [location.state, setActiveRecipient]);

    // ---- Auto-scroll to bottom when new messages arrive (unless user is reading history) ----
    const prevMessageCountRef = useRef(0);
    useLayoutEffect(() => {
        const el = scrollerRef.current;
        if (!el) return;
        const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 140;
        const grew = messages.length > prevMessageCountRef.current;
        prevMessageCountRef.current = messages.length;
        if (grew && atBottom) {
            // Use auto (instant) for grew-while-at-bottom to avoid fighting with the animation
            el.scrollTop = el.scrollHeight;
        }
    }, [messages, otherIsTyping]);

    // When switching conversations, jump to bottom.
    const activeRecipientId = activeRecipient?.id;
    useEffect(() => {
        if (!activeRecipientId) return;
        const frame = requestAnimationFrame(() => {
            const el = scrollerRef.current;
            if (el) el.scrollTop = el.scrollHeight;
        });
        return () => cancelAnimationFrame(frame);
    }, [activeRecipientId]);

    // ---- Scroll FAB visibility ----
    const onScroll = useCallback(() => {
        const el = scrollerRef.current;
        if (!el) return;
        const fromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        setShowScrollFab(fromBottom > 320);
    }, []);

    // ---- Composer: auto-grow textarea ----
    const autosize = useCallback(() => {
        const ta = composerRef.current;
        if (!ta) return;
        ta.style.height = 'auto';
        ta.style.height = Math.min(ta.scrollHeight, 180) + 'px';
    }, []);
    useEffect(() => { autosize(); }, [messageText, autosize]);

    // ---- Keyboard shortcuts ----
    useEffect(() => {
        const onKey = (e) => {
            // "/" focuses search when not typing in a field
            const tag = e.target?.tagName;
            const editing = tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable;
            if (e.key === '/' && !editing) {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            if (e.key === 'Escape') {
                if (replyTarget) setReplyTarget(null);
                else if (showOptions) setShowOptions(false);
                else if (showUserList) setShowUserList(false);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [replyTarget, showOptions, showUserList]);

    // ---- Handlers ----
    const handleInputChange = (e) => {
        const val = e.target.value;
        setMessageText(val);
        setTyping(Boolean(val.trim()));
    };

    const handleSendMessage = async (e) => {
        e?.preventDefault?.();
        const text = messageText.trim();
        if (!text) return;
        const metadata = replyTarget
            ? { replyTo: { id: replyTarget.id, text: replyTarget.text, senderId: replyTarget.senderId, senderName: replyTarget.senderName } }
            : {};
        setMessageText('');
        setReplyTarget(null);
        await send(text, metadata);
        // Refocus composer after send for the next message
        composerRef.current?.focus();
    };

    const onComposerKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleReply = useCallback((msg) => {
        setReplyTarget(msg);
        requestAnimationFrame(() => composerRef.current?.focus());
    }, []);

    const handleReact = useCallback((messageId, emoji) => {
        reactToMessage(messageId, emoji);
    }, [reactToMessage]);

    const handleCopy = useCallback(async (msg) => {
        try {
            await navigator.clipboard?.writeText(msg.text || '');
            setToast('Copied');
            setTimeout(() => setToast(null), 1400);
        } catch { /* no-op */ }
    }, []);

    const handleDelete = useCallback(async (msg) => {
        if (!msg?.id) return;
        await removeMessage(msg.id);
        setToast('Message deleted');
        setTimeout(() => setToast(null), 1400);
    }, [removeMessage]);

    // ---- Derived state ----
    const filteredUsers = useMemo(
        () => allUsers.filter(u =>
            u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
        ),
        [allUsers, searchTerm]
    );

    // Dedupe by the other member's id: legacy conversations created before the
    // ID-separator switch (`_` → `__||__`) still live in Firestore, so the same
    // pair of users can have two convo docs. Keep the one that actually has a
    // last message (otherwise the most recent), and sum unread counts so badges
    // reflect every duplicate the user hasn't read.
    const filteredConversations = useMemo(() => {
        const byOther = new Map();
        for (const conv of conversations) {
            const otherId = conv.members.find(id => id !== user.id);
            const other = conv.memberData?.[otherId];
            if (!otherId || !other) continue;

            const existing = byOther.get(otherId);
            const unread = conv.unreadCount?.[user.id] || 0;
            if (!existing) {
                byOther.set(otherId, { conv, unreadTotal: unread });
                continue;
            }
            // Prefer a convo that has a real lastMessage over an empty stub.
            const existingHasMsg = !!existing.conv.lastMessage;
            const currentHasMsg = !!conv.lastMessage;
            const totalUnread = existing.unreadTotal + unread;
            if (!existingHasMsg && currentHasMsg) {
                byOther.set(otherId, { conv, unreadTotal: totalUnread });
            } else {
                // conversations are already sorted updatedAt desc, so the
                // existing entry is at least as fresh — just accumulate unread.
                byOther.set(otherId, { conv: existing.conv, unreadTotal: totalUnread });
            }
        }

        const term = searchTerm.toLowerCase();
        const out = [];
        for (const { conv, unreadTotal } of byOther.values()) {
            const otherId = conv.members.find(id => id !== user.id);
            const other = conv.memberData[otherId];
            if (term && !(other.name?.toLowerCase().includes(term) ||
                (conv.lastMessage && conv.lastMessage.toLowerCase().includes(term)))) {
                continue;
            }
            out.push({ ...conv, unreadCount: { ...(conv.unreadCount || {}), [user.id]: unreadTotal } });
        }
        out.sort((a, b) => (b.updatedAt?.toMillis?.() || 0) - (a.updatedAt?.toMillis?.() || 0));
        return out;
    }, [conversations, searchTerm, user.id]);

    const timeline = useMemo(() => buildTimeline(messages), [messages]);

    const scrollToBottomSmooth = useCallback(() => {
        const el = scrollerRef.current;
        if (!el) return;
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }, []);

    return (
        <div className="mx-page">
            <div className="mx-shell">
                {/* ================= SIDEBAR ================= */}
                <aside className={`mx-sidebar ${activeRecipient ? 'mobile-hidden' : ''}`}>
                    <header className="mx-sidebar-header">
                        <div className="mx-sidebar-title-row">
                            <div className="mx-sidebar-title">
                                <span className="mx-eyebrow">Inbox</span>
                                <h2>Messages</h2>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.06 }}
                                whileTap={{ scale: 0.94 }}
                                className={`mx-icon-btn mx-new-chat ${showUserList ? 'is-on' : ''}`}
                                onClick={() => setShowUserList(v => !v)}
                                title={showUserList ? 'Back to conversations' : 'New conversation'}
                            >
                                {showUserList ? <X size={18} /> : <PenSquare size={18} />}
                            </motion.button>
                        </div>

                        <div className="mx-search">
                            <Search size={15} />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder={showUserList ? "Find people…" : "Search conversations…"}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <kbd className="mx-kbd">/</kbd>
                        </div>
                    </header>

                    <div className="mx-sidebar-scroll">
                        {/* Direct conditional render — no AnimatePresence here.
                            The previous mode="wait" + two motion.div siblings was
                            causing the old branch to stay mounted during its exit
                            animation, pushing the new branch's content down and
                            leaving a large visual gap in the sidebar. A plain
                            conditional swap is instant and lets the content sit
                            flush under the search bar. */}
                        {showUserList ? (
                            <div className="mx-sidebar-panel">
                                <div className="mx-section-label"><AtSign size={11} /> Start a new chat</div>
                                {filteredUsers.length === 0 ? (
                                    <div className="mx-sidebar-empty">
                                        <p>No one matches "{searchTerm}".</p>
                                    </div>
                                ) : filteredUsers.map(u => (
                                    <button
                                        key={u.id}
                                        type="button"
                                        className="mx-row mx-row-user"
                                        onClick={() => {
                                            setActiveRecipient(u);
                                            setShowUserList(false);
                                            setSearchTerm('');
                                        }}
                                    >
                                        <Avatar name={u.name} size={44} online={u.isOnline} ring />
                                        <div className="mx-row-body">
                                            <span className="mx-row-name">{u.name}</span>
                                            <span className="mx-row-sub">{u.role || 'Healthcare Professional'}</span>
                                        </div>
                                        <Reply size={14} className="mx-row-cta" style={{ transform: 'scaleX(-1)' }} />
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="mx-sidebar-panel">
                                {filteredConversations.length === 0 ? (
                                    <div className="mx-sidebar-empty mx-sidebar-empty-cta">
                                        <div className="mx-empty-glow" aria-hidden="true" />
                                        <MessageSquare size={28} strokeWidth={1.5} />
                                        <p>{searchTerm ? `No chats match "${searchTerm}"` : 'No conversations yet.'}</p>
                                        {!searchTerm && (
                                            <button type="button" className="mx-outline-btn" onClick={() => setShowUserList(true)}>
                                                Find someone
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <LayoutGroup>
                                        {filteredConversations.map(conv => {
                                            const otherId = conv.members.find(id => id !== user.id);
                                            const other = conv.memberData[otherId];
                                            const unread = conv.unreadCount?.[user.id] || 0;
                                            const active = activeRecipient?.id === otherId;
                                            return (
                                                <motion.button
                                                    key={conv.id}
                                                    layout="position"
                                                    type="button"
                                                    className={`mx-row mx-row-convo ${active ? 'is-active' : ''} ${unread > 0 ? 'is-unread' : ''}`}
                                                    onClick={() => setActiveRecipient({ id: otherId, ...other })}
                                                >
                                                    {active && (
                                                        <motion.span
                                                            layoutId="mx-convo-active"
                                                            className="mx-row-active-rail"
                                                            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                                                        />
                                                    )}
                                                    <Avatar name={other.name} size={46} online={other?.isOnline} ring />
                                                    <div className="mx-row-body">
                                                        <div className="mx-row-top">
                                                            <span className="mx-row-name">{other.name}</span>
                                                            <span className="mx-row-time">{formatRelativeShort(conv.updatedAt)}</span>
                                                        </div>
                                                        <div className="mx-row-bottom">
                                                            <span className="mx-row-preview">{conv.lastMessage || 'Say hello…'}</span>
                                                            {unread > 0 && (
                                                                <span className="mx-unread-pill">{unread > 99 ? '99+' : unread}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="mx-row-trash"
                                                        title="Delete conversation"
                                                        onClick={(e) => { e.stopPropagation(); deleteConvo(conv.id); }}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </motion.button>
                                            );
                                        })}
                                    </LayoutGroup>
                                )}
                            </div>
                        )}
                    </div>
                </aside>

                {/* ================= MAIN ================= */}
                <section className={`mx-main ${!activeRecipient ? 'mobile-hidden' : ''}`}>
                    {/* mode="popLayout" lets the new thread enter while the old
                        exits — no dead frame between conversations on fast
                        clicks. mode="wait" was the legacy choice (Linear/Vercel
                        moved off this for chat-style swaps). */}
                    <AnimatePresence mode="popLayout">
                        {activeRecipient ? (
                            <motion.div
                                key={activeRecipient.id}
                                className="mx-thread"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.18 }}
                            >
                                {/* ---- Thread header ---- */}
                                <header className="mx-thread-header">
                                    <div className="mx-thread-header-left">
                                        <button type="button" className="mx-icon-btn mx-back" onClick={() => setActiveRecipient(null)}>
                                            <ArrowLeft size={18} />
                                        </button>
                                        <Avatar name={activeRecipient.name} size={40} online={activeRecipient.isOnline} ring />
                                        <div className="mx-thread-header-info">
                                            <h3>{activeRecipient.name}</h3>
                                            <span className={`mx-presence ${activeRecipient.isOnline ? 'is-online' : ''}`}>
                                                {activeRecipient.isOnline ? 'Active now' : (otherIsTyping ? 'typing…' : 'Offline')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mx-thread-header-right">
                                        <div className="mx-menu-wrap">
                                            <button type="button" className="mx-icon-btn" onClick={() => setShowOptions(v => !v)} title="More">
                                                <MoreVertical size={18} />
                                            </button>
                                            <AnimatePresence>
                                                {showOptions && (
                                                    <>
                                                        <div className="mx-menu-overlay" onClick={() => setShowOptions(false)} />
                                                        <motion.div
                                                            className="mx-menu"
                                                            initial={{ opacity: 0, y: -4, scale: 0.98 }}
                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                            exit={{ opacity: 0, y: -4, scale: 0.98 }}
                                                            transition={{ duration: 0.16 }}
                                                        >
                                                            <div className="mx-menu-group">
                                                                <span className="mx-menu-label">Conversation</span>
                                                                <button type="button" onClick={() => { clearHistory(); setShowOptions(false); }}>
                                                                    <Sparkles size={15} /> Clear history
                                                                </button>
                                                                <button type="button" className="danger" onClick={() => { deleteConvo(activeRecipient.id); setShowOptions(false); }}>
                                                                    <Trash2 size={15} /> Delete conversation
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    </>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </header>

                                {/* ---- Messages scroller ---- */}
                                <div className="mx-messages-outer">
                                    <div className="mx-messages" ref={scrollerRef} onScroll={onScroll}>
                                        {loading && messages.length === 0 ? (
                                            <div className="mx-loading">
                                                <div className="mx-loading-skeleton"><span /><span /><span /></div>
                                                <p>Loading messages…</p>
                                            </div>
                                        ) : messages.length === 0 ? (
                                            <div className="mx-conversation-starter">
                                                <Avatar name={activeRecipient.name} size={72} ring />
                                                <h4>Say hi to {activeRecipient.name}</h4>
                                                <p>This is the start of your conversation.</p>
                                            </div>
                                        ) : (
                                            <div className="mx-timeline">
                                                {timeline.map(item =>
                                                    item.kind === 'date' ? (
                                                        <div key={item.key} className="mx-date-divider">
                                                            <span>{formatDateHeader(item.date)}</span>
                                                        </div>
                                                    ) : (
                                                        <MessageBubble
                                                            key={item.key}
                                                            item={item}
                                                            mine={item.msg.senderId === user.id}
                                                            recipientName={activeRecipient.name}
                                                            currentUserId={user.id}
                                                            onReply={handleReply}
                                                            onReact={handleReact}
                                                            onCopy={handleCopy}
                                                            onDelete={handleDelete}
                                                        />
                                                    )
                                                )}

                                                <AnimatePresence>
                                                    {otherIsTyping && (
                                                        <motion.div
                                                            key="typing"
                                                            className="mx-bubble-row is-theirs g-first g-last"
                                                            initial={{ opacity: 0, y: 6 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0 }}
                                                        >
                                                            <div className="mx-bubble-avatar-slot">
                                                                <Avatar name={activeRecipient.name} size={28} />
                                                            </div>
                                                            <div className="mx-bubble-stack">
                                                                <div className="mx-bubble mx-bubble-typing">
                                                                    <TypingDots />
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                <div ref={endSentinelRef} />
                                            </div>
                                        )}
                                    </div>

                                    <AnimatePresence>
                                        {showScrollFab && (
                                            <motion.button
                                                type="button"
                                                className="mx-scroll-fab"
                                                onClick={scrollToBottomSmooth}
                                                title="Jump to latest"
                                                initial={{ opacity: 0, y: 8, scale: 0.9 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 8, scale: 0.9 }}
                                                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                                            >
                                                <ChevronDown size={18} />
                                            </motion.button>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* ---- Composer ---- */}
                                <form className="mx-composer" onSubmit={handleSendMessage}>
                                    <AnimatePresence>
                                        {replyTarget && (
                                            <motion.div
                                                className="mx-reply-banner"
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <div className="mx-reply-banner-rail" />
                                                <div className="mx-reply-banner-body">
                                                    <span className="mx-reply-banner-label">
                                                        Replying to {replyTarget.senderId === user.id ? 'yourself' : (activeRecipient?.name || 'them')}
                                                    </span>
                                                    <span className="mx-reply-banner-text">{replyTarget.text}</span>
                                                </div>
                                                <button type="button" className="mx-reply-banner-close" onClick={() => setReplyTarget(null)}>
                                                    <X size={14} />
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="mx-composer-row">
                                        <textarea
                                            ref={composerRef}
                                            rows={1}
                                            placeholder="Write a message…"
                                            value={messageText}
                                            onChange={handleInputChange}
                                            onKeyDown={onComposerKeyDown}
                                            autoFocus
                                        />
                                        <motion.button
                                            type="submit"
                                            className="mx-send"
                                            disabled={!messageText.trim()}
                                            whileHover={messageText.trim() ? { scale: 1.04 } : undefined}
                                            whileTap={messageText.trim() ? { scale: 0.95 } : undefined}
                                            aria-label="Send"
                                        >
                                            <Send size={16} />
                                        </motion.button>
                                    </div>
                                    <div className="mx-composer-hint">
                                        <span><kbd>Enter</kbd> to send</span>
                                        <span><kbd>Shift</kbd> + <kbd>Enter</kbd> newline</span>
                                        {replyTarget && <span><kbd>Esc</kbd> cancel reply</span>}
                                    </div>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="welcome"
                                className="mx-welcome"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.22 }}
                            >
                                <div className="mx-welcome-orb" aria-hidden="true">
                                    <div className="mx-welcome-orb-inner" />
                                    <MessageSquare size={38} strokeWidth={1.4} />
                                </div>
                                <h1>Your Messages</h1>
                                <p>Share ideas, coordinate meetings, and co-create privately. Pick a thread from the left — or start a new one.</p>
                                <button type="button" className="mx-cta-btn" onClick={() => setShowUserList(true)}>
                                    <PenSquare size={15} /> New message
                                </button>
                                <div className="mx-welcome-shortcuts">
                                    <div><kbd>/</kbd> search</div>
                                    <div><kbd>Enter</kbd> send</div>
                                    <div><kbd>Esc</kbd> close</div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>
            </div>

            <AnimatePresence>
                {toast && (
                    <motion.div
                        className="mx-toast"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                    >
                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Chat;
