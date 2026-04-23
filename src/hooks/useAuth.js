import { useState, useEffect, useCallback, useRef } from 'react';
import { updateUserInFirestore, deleteUserFromFirestore, addActivityLog } from '../services/firestore';

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
    if (targetId === user?.id) {
      const updatedUser = { ...user, ...updatedFields };
      setUser(updatedUser);
      localStorage.setItem('health_ai_user', JSON.stringify(updatedUser));
    }
    await updateUserInFirestore(targetId, updatedFields);
  };

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

  return { user, login, logout, updateUser, deleteUser };
}
