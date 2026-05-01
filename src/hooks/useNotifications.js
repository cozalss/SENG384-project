import { useState, useEffect, useCallback, useRef } from 'react';
import {
  subscribeToNotificationsRT,
  addNotificationToFirestore,
  deleteNotificationFromFirestore,
  clearAllNotificationsFromFirestore
} from '../services/firestore';

// Local-only fallback shown when the Firestore subscription cannot be
// established. These objects intentionally carry a sentinel `targetUserId`
// of `__demo__` so the broadcast filter in the subscriber never surfaces them
// to a real user — they are only written into local state when Firebase init
// throws, never persisted, and the demo banner explains the situation.
const defaultNotifications = [
  {
    id: 'notif-1',
    type: 'interest',
    title: 'New Interest Received',
    targetUserId: '__demo__',
    message: 'Dr. James Miller expressed interest in your "AI-Assisted Detection of Arrhythmia" post.',
    timestamp: '2026-02-27T09:30:00Z',
    read: false
  },
  {
    id: 'notif-2',
    type: 'meeting-request',
    title: 'Meeting Request',
    targetUserId: '__demo__',
    message: 'A meeting has been proposed for "Smart VR Environment for Stroke Rehabilitation".',
    timestamp: '2026-02-26T14:00:00Z',
    read: false
  },
  {
    id: 'notif-3',
    type: 'post-closed',
    title: 'Partner Found',
    targetUserId: '__demo__',
    message: '"Non-invasive Glucose Monitoring Wearable" has been marked as Partner Found.',
    timestamp: '2026-02-25T16:45:00Z',
    read: true
  }
];

export function useNotifications({ onNewNotification, userId } = {}) {
  // Start empty — default demo data is only a fallback if Firebase fails.
  // Prevents the visible "fake → real" swap flicker on refresh.
  const [notifications, setNotifications] = useState([]);
  // Track which notification IDs we have already "seen" so we only toast truly
  // new ones (not the entire first-snapshot firehose).
  const seenIdsRef = useRef(null);
  const onNewRef = useRef(onNewNotification);
  const userIdRef = useRef(userId);

  useEffect(() => {
    onNewRef.current = onNewNotification;
  }, [onNewNotification]);

  useEffect(() => {
    userIdRef.current = userId;
    // When the signed-in user changes (e.g. after login or logout), reset the
    // seen-set so the next snapshot delivery doesn't replay all historical
    // notifications as toasts for the new session.
    seenIdsRef.current = null;
  }, [userId]);

  useEffect(() => {
    let unsubNotifs;
    let isActive = true;
    let fallbackTimer;

    try {
      unsubNotifs = subscribeToNotificationsRT((firestoreNotifs) => {
        if (!isActive) return;
        // Filter to only notifications addressed to this user. A notification
        // with no `targetUserId` is broadcast (e.g. legacy demo entries or
        // system-wide announcements). Authored-against-self notifications are
        // also dropped since they only echo your own action.
        const me = userIdRef.current;
        const visible = firestoreNotifs.filter((n) => {
          if (!me) return !n.targetUserId; // signed-out: only broadcasts
          if (!n.targetUserId) return true; // broadcast to everyone
          return n.targetUserId === me;
        });
        visible.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setNotifications(visible);

        // Diff against the last-seen set. First snapshot populates the set
        // silently; subsequent snapshots fire onNewNotification for IDs that
        // weren't there before (new real-time arrivals).
        if (seenIdsRef.current === null) {
          seenIdsRef.current = new Set(visible.map((n) => n.id));
        } else {
          for (const n of visible) {
            if (!seenIdsRef.current.has(n.id)) {
              seenIdsRef.current.add(n.id);
              if (!n.read && typeof onNewRef.current === 'function') {
                try { onNewRef.current(n); } catch { /* no-op */ }
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('Firebase init error for notifications:', error);
      if (isActive) {
        fallbackTimer = setTimeout(() => {
          if (isActive) setNotifications(defaultNotifications);
        }, 0);
      }
    }

    return () => {
      isActive = false;
      if (fallbackTimer) clearTimeout(fallbackTimer);
      if (unsubNotifs) unsubNotifs();
    };
  }, []);

  const addNotification = useCallback(async (notif) => {
    const fullNotif = {
      id: `notif-${Date.now()}`,
      ...notif,
      timestamp: new Date().toISOString(),
      read: false
    };
    await addNotificationToFirestore(fullNotif);
  }, []);

  const dismissNotification = useCallback(async (id) => {
    await deleteNotificationFromFirestore(id);
  }, []);

  const dismissAllNotifications = useCallback(async () => {
    await clearAllNotificationsFromFirestore();
  }, []);

  return { notifications, addNotification, dismissNotification, dismissAllNotifications };
}
