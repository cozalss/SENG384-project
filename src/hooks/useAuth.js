import { useState, useEffect, useCallback } from 'react';
import { addUserToFirestore, updateUserInFirestore, addActivityLog } from '../services/firestore';

export function useAuth() {
  const [user, setUser] = useState(null);

  // Restore user session from localStorage
  useEffect(() => {
    const savedSession = localStorage.getItem('health_ai_user');
    if (savedSession) {
      setTimeout(() => {
        setUser(JSON.parse(savedSession));
      }, 0);
    }
  }, []);

  const logout = useCallback(async () => {
    if (user) {
      await addActivityLog({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: user.id,
        userName: user.name,
        role: user.role,
        actionType: 'LOGOUT',
        targetEntity: 'session',
        result: 'success',
        details: 'User logged out'
      });
    }
    setUser(null);
    localStorage.removeItem('health_ai_user');
  }, [user]);

  // Session timeout (30 min)
  useEffect(() => {
    if (!user) return;
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
  }, [user, logout]);

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

  const updateUser = async (updatedFields) => {
    const updatedUser = { ...user, ...updatedFields };
    setUser(updatedUser);
    localStorage.setItem('health_ai_user', JSON.stringify(updatedUser));
    // Update user in Firestore
    await updateUserInFirestore(user.id, updatedFields);
  };

  return { user, login, logout, updateUser };
}
