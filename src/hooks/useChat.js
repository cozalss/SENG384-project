import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  sendMessage, 
  subscribeToMessagesRT, 
  subscribeToConversationsRT,
  getOrCreateConversation,
  markAsRead,
  getUsers,
  setTypingStatus,
  updateUserStatus,
  deleteConversation,
  conversationsRef
} from '../services/firestore';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase';

export function useChat(currentUser) {
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeRecipient, setActiveRecipient] = useState(null);
  const [activeConvoId, setActiveConvoId] = useState(null);
  const [activeConvoData, setActiveConvoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const typingTimeoutRef = useRef(null);

  // Presence logic: Set online when hook mount
  useEffect(() => {
    if (!currentUser) return;
    updateUserStatus(currentUser.id, true);
    
    const handleVisibilityChange = () => {
      updateUserStatus(currentUser.id, document.visibilityState === 'visible');
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      updateUserStatus(currentUser.id, false);
    };
  }, [currentUser]);

  // Fetch all users for discovery
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await getUsers();
        setAllUsers(users.filter(u => u.id !== currentUser?.id));
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    if (currentUser) fetchUsers();
  }, [currentUser]);

  // Subscribe to user's conversations
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToConversationsRT(currentUser.id, (convos) => {
      setConversations(convos);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Get or Create conversation
  useEffect(() => {
    const initConvo = async () => {
      if (!currentUser || !activeRecipient) {
        setActiveConvoId(null);
        setMessages([]);
        setLoading(false);
        setActiveConvoData(null);
        return;
      }

      setLoading(true);
      try {
        const convo = await getOrCreateConversation(currentUser, activeRecipient);
        setActiveConvoId(convo.id);
        await markAsRead(convo.id, currentUser.id);
        if (!convo.lastMessage) setLoading(false);
      } catch (err) {
        console.error("Error initializing conversation:", err);
        setLoading(false);
      }
    };

    initConvo();
  }, [currentUser, activeRecipient]);

  // Subscribe to messages AND conversation data (for typing status)
  useEffect(() => {
    if (!activeConvoId) return;

    // 1. Messages pulse
    const unsubMsgs = subscribeToMessagesRT(activeConvoId, (msgs) => {
      setMessages(msgs);
      setLoading(false);
    });

    // 2. Convo metadata pulse (typing indicators)
    const unsubConvo = onSnapshot(doc(db, "conversations", activeConvoId), (snap) => {
      if (snap.exists()) {
        setActiveConvoData(snap.data());
      }
    });

    return () => {
      unsubMsgs();
      unsubConvo();
    };
  }, [activeConvoId]);

  // Typing action
  const setTyping = useCallback((isTyping) => {
    if (!activeConvoId || !currentUser) return;
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    setTypingStatus(activeConvoId, currentUser.id, isTyping);
    
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        setTypingStatus(activeConvoId, currentUser.id, false);
      }, 3000); // Stop typing after 3s of inactivity
    }
  }, [activeConvoId, currentUser]);

  const send = useCallback(async (text) => {
    if (!activeConvoId || !currentUser || !text.trim()) return;
    
    try {
      setTyping(false); // Immediate stop typing on send
      await sendMessage(activeConvoId, currentUser.id, text, currentUser.name);
    } catch (error) {
      console.error("Message send error:", error);
    }
  }, [activeConvoId, currentUser, setTyping]);

  // Compute other user status
  const otherIsTyping = useMemo(() => {
    if (!activeConvoData || !activeRecipient || !currentUser) return false;
    return activeConvoData.isTyping?.[activeRecipient.id] || false;
  }, [activeConvoData, activeRecipient, currentUser]);

  const clearHistory = useCallback(async () => {
    if (!activeConvoId) return;
    if (!window.confirm("Are you sure you want to clear this chat history?")) return;
    
    try {
      setMessages([]);
      console.log("Chat history cleared locally for demo");
    } catch (err) {
      console.error("Error clearing history:", err);
    }
  }, [activeConvoId]);

  const deleteConvo = useCallback(async (convoId) => {
    if (!window.confirm("Are you sure you want to delete this conversation?")) return;
    
    try {
      await deleteConversation(convoId);
      if (activeConvoId === convoId) {
        setActiveRecipient(null);
        setActiveConvoId(null);
        setMessages([]);
      }
    } catch (err) {
      console.error("Error deleting conversation:", err);
    }
  }, [activeConvoId]);

  return {
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
  };
}
