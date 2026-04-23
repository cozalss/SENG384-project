import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Search, ArrowLeft, MessageSquare, MoreVertical, Sparkles, Check, CheckCheck, Trash2 } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import './Chat.css';

const Chat = ({ user }) => {
  const { 
    messages, 
    conversations, 
    activeRecipient, 
    setActiveRecipient, 
    send, 
    setTyping,
    loading,
    allUsers,
    otherIsTyping,
    clearHistory,
    deleteConvo
  } = useChat(user);

  const [showOptions, setShowOptions] = useState(false);

  const location = useLocation();
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserList, setShowUserList] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, otherIsTyping]);

  useEffect(() => {
    if (location.state?.recipient) {
      setActiveRecipient(location.state.recipient);
    }
  }, [location.state, setActiveRecipient]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setMessageText(val);
    if (val.trim()) {
      setTyping(true);
    } else {
      setTyping(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageText.trim()) {
      send(messageText);
      setMessageText('');
    }
  };

  const filteredUsers = allUsers.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredConversations = conversations.filter(conv => {
    const otherMemberId = conv.members.find(id => id !== user.id);
    const otherMember = conv.memberData[otherMemberId];
    if (!otherMember) return false;
    
    return (
      otherMember.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (conv.lastMessage && conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const groupedMessages = messages.reduce((acc, msg) => {
    const date = msg.timestamp?.toDate().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) || 'Today';
    if (!acc[date]) acc[date] = [];
    acc[date].push(msg);
    return acc;
  }, {});

  return (
    <div className="chat-page-container">
      <div className="chat-layout">
        {/* SIDEBAR */}
        <div className={`chat-sidebar ${activeRecipient ? 'mobile-hidden' : ''}`}>
          <div className="sidebar-header">
            <div className="sidebar-title-row">
              <h2>Messages</h2>
              <div className="sidebar-actions">
                <motion.button 
                  whileHover={{ scale: 1.1, backgroundColor: 'rgba(96, 165, 250, 0.2)' }}
                  whileTap={{ scale: 0.9 }}
                  className="icon-btn new-chat-btn"
                  onClick={() => setShowUserList(!showUserList)}
                >
                  <MessageSquare size={20} color="#60a5fa" />
                </motion.button>
              </div>
            </div>
            
            <div className="sidebar-search">
              <div className="search-bar">
                <Search size={16} />
                <input 
                  type="text" 
                  placeholder="Search messages..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="conversations-wrapper">
            <AnimatePresence mode="wait">
              {showUserList ? (
                <motion.div 
                  key="user-list"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="user-discovery-list"
                >
                  <div className="list-label">START A NEW CHAT</div>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(u => (
                      <motion.div 
                        key={u.id}
                        whileHover={{ x: 5, backgroundColor: 'var(--panel-light)' }}
                        className="sidebar-item user-item"
                        onClick={() => {
                          setActiveRecipient(u);
                          setShowUserList(false);
                        }}
                      >
                        <div className="avatar-wrapper">
                          <div className="avatar-initials">
                            {u.name.charAt(0)}
                          </div>
                          {u.isOnline && <div className="online-status"></div>}
                        </div>
                        <div className="item-info">
                          <div className="info-top">
                            <span className="name">{u.name}</span>
                          </div>
                          <div className="info-bottom">
                            <span className="last-msg">{u.role || 'Healthcare Professional'}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="empty-sidebar">
                      <p>No users found matching "{searchTerm}"</p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  key="convo-list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="convo-list"
                >
                  {filteredConversations.length > 0 ? (
                    filteredConversations.map(conv => {
                      const otherMemberId = conv.members.find(id => id !== user.id);
                      const otherMember = conv.memberData[otherMemberId];
                      const unread = conv.unreadCount?.[user.id] || 0;
                      
                      return (
                        <motion.div 
                          key={conv.id}
                          layout
                          className={`sidebar-item convo-item ${activeRecipient?.id === otherMemberId ? 'active' : ''} ${unread > 0 ? 'unread' : ''}`}
                          onClick={() => setActiveRecipient({ id: otherMemberId, ...otherMember })}
                        >
                          <div className="avatar-wrapper">
                            <div className="avatar-initials">
                              {otherMember.name.charAt(0)}
                            </div>
                            {unread > 0 && <div className="unread-dot">{unread}</div>}
                          </div>
                            <div className="item-info">
                              <div className="info-top">
                                <span className="name">{otherMember.name}</span>
                                <span className="time">
                                  {conv.updatedAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <div className="info-bottom">
                                <span className="last-msg">{conv.lastMessage || 'No messages yet'}</span>
                                <motion.button
                                  whileHover={{ scale: 1.1, color: '#ef4444' }}
                                  whileTap={{ scale: 0.9 }}
                                  className="delete-convo-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteConvo(conv.id);
                                  }}
                                  title="Delete Conversation"
                                >
                                  <Trash2 size={14} />
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                      );
                    })
                  ) : (
                    <div className="empty-sidebar">
                      <p>{searchTerm ? `No chats found matching "${searchTerm}"` : 'No conversations yet'}</p>
                      {!searchTerm && <button className="outline-btn" onClick={() => setShowUserList(true)}>Find Someone</button>}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* MAIN CHAT AREA */}
        <div className={`chat-main ${!activeRecipient ? 'mobile-hidden' : ''}`}>
          <AnimatePresence mode="wait">
            {activeRecipient ? (
              <motion.div 
                key={activeRecipient.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="chat-window-inner"
              >
                <div className="chat-top-header">
                  <div className="header-left">
                    <button className="back-btn" onClick={() => setActiveRecipient(null)}>
                      <ArrowLeft size={20} />
                    </button>
                    <div className="header-info">
                      <div className="avatar-small">
                        {activeRecipient.name.charAt(0)}
                      </div>
                      <div className="text-info">
                        <h3>{activeRecipient.name}</h3>
                        <span className="online-indicator">Online</span>
                      </div>
                    </div>
                  </div>
                  <div className="header-right">
                    <div className="options-container">
                      <button className="icon-btn" onClick={() => setShowOptions(!showOptions)}>
                        <MoreVertical size={20} color="#888" />
                      </button>
                      <AnimatePresence>
                        {showOptions && (
                          <>
                            <div className="options-overlay" onClick={() => setShowOptions(false)} />
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.8, y: -10, filter: 'blur(10px)' }}
                              animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                              exit={{ opacity: 0, scale: 0.8, y: -10, filter: 'blur(10px)' }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                              className="options-menu-premium"
                            >
                              <div className="menu-group">
                                <span className="group-label">Management</span>
                                <button onClick={() => { clearHistory(); setShowOptions(false); }}>
                                  <Sparkles size={16} />
                                  <span>Clear History</span>
                                </button>
                                <button className="danger" onClick={() => { deleteConvo(activeRecipient.id); setShowOptions(false); }}>
                                  <Trash2 size={16} />
                                  <span>Delete Conversation</span>
                                </button>
                              </div>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                <div className="messages-scroller">
                  {loading && messages.length === 0 ? (
                    <div className="loading-state">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles size={24} color="#60a5fa" />
                      </motion.div>
                      <p>Loading messages...</p>
                    </div>
                  ) : (
                    <div className="messages-list">
                      {Object.entries(groupedMessages).map(([date, msgs]) => (
                        <div key={date} className="date-group">
                          <div className="date-divider"><span>{date}</span></div>
                          {msgs.map((msg, i) => (
                            <motion.div 
                              key={msg.id || i}
                              initial={{ opacity: 0, scale: 0.9, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              className={`msg-bubble-wrapper ${msg.senderId === user.id ? 'mine' : 'theirs'}`}
                            >
                              <div className="msg-bubble">
                                <span className="text">{msg.text}</span>
                                <div className="msg-meta">
                                  <span className="time">
                                    {msg.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  {msg.senderId === user.id && (
                                    <span className="status">
                                      {msg.read ? <CheckCheck size={12} color="#fff" /> : <Check size={12} color="rgba(255,255,255,0.6)" />}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ))}
                      
                      {otherIsTyping && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="msg-bubble-wrapper theirs"
                        >
                          <div className="msg-bubble typing-bubble">
                            <div className="typing-dots">
                              <span></span><span></span><span></span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                <form className="chat-input-row" onSubmit={handleSendMessage}>
                  <div className="input-container">
                    <input 
                      type="text" 
                      placeholder="Message..." 
                      value={messageText}
                      onChange={handleInputChange}
                      autoFocus
                    />
                    {messageText.trim() && (
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        className="send-btn"
                      >
                        <Send size={18} color="currentColor" />
                      </motion.button>
                    )}
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="welcome-view"
              >
                <div className="welcome-content">
                  <div className="welcome-icon">
                    <MessageSquare size={56} color="var(--text-main)" strokeWidth={1.5} />
                  </div>
                  <h1>Messages</h1>
                  <p>Select someone to connect and start a conversation.</p>
                  <button onClick={() => setShowUserList(true)} className="gradient-btn">
                    Start a Conversation
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Chat;
