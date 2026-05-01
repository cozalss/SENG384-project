import { useState, useEffect, useCallback, useRef } from 'react';
import {
  updateUserInFirestore,
  deleteUserFromFirestore,
  addActivityLog,
  arrayUnion,
  arrayRemove,
} from '../services/firestore';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Synchronous lazy initializer — runs once on first render, before any paint.
// Avoids the null→user flicker that caused /dashboard → /login → /dashboard
// redirect bounce on hard refresh.
const readSavedUser = () => {
  try {
    const saved = localStorage.getItem('health_ai_user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export function useAuth() {
  const [user, setUser] = useState(readSavedUser);
  const userRef = useRef(user);
  useEffect(() => { userRef.current = user; }, [user]);

  const logout = useCallback(async () => {
    const current = userRef.current;
    if (current) {
      await addActivityLog({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: current.id,
        userName: current.name,
        role: current.role,
        actionType: 'LOGOUT',
        targetEntity: 'session',
        result: 'success',
        details: 'User logged out'
      });
    }
    setUser(null);
    localStorage.removeItem('health_ai_user');
  }, []);

  // Session timeout (30 min). Only re-runs when session identity changes,
  // not on every profile field update.
  useEffect(() => {
    if (!user?.id) return;
    let timeout;
    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        logout();
      }, 30 * 60 * 1000);
    };
    const events = ['mousedown', 'keypress', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer();
    return () => {
      clearTimeout(timeout);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, [user?.id, logout]);

  const login = async (userData) => {
    setUser(userData);
    localStorage.setItem('health_ai_user', JSON.stringify(userData));
    // Update lastLogin in Firestore without overwriting the document
    await updateUserInFirestore(userData.id, { lastLogin: new Date().toISOString() });
    // Log login activity
    await addActivityLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: userData.id,
      userName: userData.name,
      role: userData.role,
      actionType: 'LOGIN',
      targetEntity: 'session',
      result: 'success',
      details: `User login from ${userData.city || 'unknown'}`
    });
  };

  // Whitelist of self-editable fields. The Profile + Dashboard surfaces only
  // need to touch these; anything else (role, email, passwordHash, status,
  // institution, registeredAt, lastLogin, id) is locked here so that a
  // devtools `updateUser({ role: 'Admin' })` cannot self-promote — even when
  // Firestore security rules are still being authored.
  const EDITABLE_USER_FIELDS = new Set([
    'name',
    'city',
    'country',
    'institution',
    'savedPosts',
  ]);

  // Accepts BOTH signatures for backwards compatibility:
  //  updateUser({ name: 'foo' })          → updates current session user
  //  updateUser(userId, { name: 'foo' })  → legacy shape from Profile
  const updateUser = async (arg1, arg2) => {
    let targetId, updatedFields;
    if (typeof arg1 === 'string') {
      targetId = arg1;
      updatedFields = arg2 || {};
    } else {
      targetId = user?.id;
      updatedFields = arg1 || {};
    }
    if (!targetId) return;

    // Restrict edits on the SELF surface. Admin-driven user mutations should
    // go through a dedicated admin-only path (currently only freeze/unfreeze
    // status, which is wired through updateUserInFirestore directly inside
    // AdminDashboard); everyone else only ever edits their own document and
    // is blocked from the protected fields.
    const safeFields = {};
    if (targetId === user?.id) {
      for (const key of Object.keys(updatedFields)) {
        if (EDITABLE_USER_FIELDS.has(key)) safeFields[key] = updatedFields[key];
      }
    } else if (user?.role === 'Admin') {
      // Admins can flip status (freeze) on other accounts, but should not be
      // rewriting role/email/passwordHash from this surface either.
      for (const key of Object.keys(updatedFields)) {
        if (key === 'status' || EDITABLE_USER_FIELDS.has(key)) safeFields[key] = updatedFields[key];
      }
    } else {
      return; // not self, not admin → drop silently
    }

    if (Object.keys(safeFields).length === 0) return;

    if (targetId === user?.id) {
      const updatedUser = { ...user, ...safeFields };
      setUser(updatedUser);
      localStorage.setItem('health_ai_user', JSON.stringify(updatedUser));
    }
    await updateUserInFirestore(targetId, safeFields);
  };

  // Atomic bookmark toggle. The previous flow read savedPosts from local
  // state, mutated the array, and wrote the whole list back via updateUser —
  // two tabs bookmarking concurrently would lose the second write because of
  // last-write-wins. arrayUnion / arrayRemove are atomic Firestore mutations
  // that preserve concurrent edits.
  const toggleSavedPost = useCallback(async (postId) => {
    if (!user?.id || !postId) return;
    const current = Array.isArray(user.savedPosts) ? user.savedPosts : [];
    const wasSaved = current.includes(postId);

    const optimistic = wasSaved
      ? current.filter((id) => id !== postId)
      : [...current, postId];
    const updated = { ...user, savedPosts: optimistic };
    setUser(updated);
    localStorage.setItem('health_ai_user', JSON.stringify(updated));

    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        savedPosts: wasSaved ? arrayRemove(postId) : arrayUnion(postId),
      });
    } catch (err) {
      console.error('toggleSavedPost failed; rolling back optimistic update:', err);
      const rolledBack = { ...user, savedPosts: current };
      setUser(rolledBack);
      localStorage.setItem('health_ai_user', JSON.stringify(rolledBack));
      throw err;
    }
    return !wasSaved;
  }, [user]);

  const deleteUser = async () => {
    if (!user) return;
    try {
      await addActivityLog({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: user.id,
        userName: user.name,
        role: user.role,
        actionType: 'ACCOUNT_DELETE',
        targetEntity: user.id,
        result: 'success',
        details: 'User exercised GDPR Article 17 (Right to Erasure)'
      });
      await deleteUserFromFirestore(user.id);
    } catch (err) {
      console.error('deleteUser error:', err);
    }
    setUser(null);
    localStorage.removeItem('health_ai_user');
  };

  return { user, login, logout, updateUser, deleteUser, toggleSavedPost };
}
