import { useState, useEffect } from 'react';
import {
  subscribeToNotificationsRT,
  addNotificationToFirestore,
  deleteNotificationFromFirestore,
  clearAllNotificationsFromFirestore
} from '../services/firestore';

const defaultNotifications = [
  {
    id: 'notif-1',
    type: 'interest',
    title: 'New Interest Received',
    message: 'Dr. James Miller expressed interest in your "AI-Assisted Detection of Arrhythmia" post.',
    timestamp: '2026-02-27T09:30:00Z',
    read: false
  },
  {
    id: 'notif-2',
    type: 'meeting-request',
    title: 'Meeting Request',
    message: 'A meeting has been proposed for "Smart VR Environment for Stroke Rehabilitation".',
    timestamp: '2026-02-26T14:00:00Z',
    read: false
  },
  {
    id: 'notif-3',
    type: 'post-closed',
    title: 'Partner Found',
    message: '"Non-invasive Glucose Monitoring Wearable" has been marked as Partner Found.',
    timestamp: '2026-02-25T16:45:00Z',
    read: true
  }
];

export function useNotifications() {
  const [notifications, setNotifications] = useState(defaultNotifications);

  useEffect(() => {
    let unsubNotifs;
    let isActive = true;

    try {
      unsubNotifs = subscribeToNotificationsRT((firestoreNotifs) => {
        if (!isActive) return;
        firestoreNotifs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setNotifications(firestoreNotifs);
      });
    } catch (error) {
      console.error('Firebase init error for notifications:', error);
      if (isActive) {
        setTimeout(() => setNotifications(defaultNotifications), 0);
      }
    }

    return () => {
      isActive = false;
      if (unsubNotifs) unsubNotifs();
    };
  }, []);

  const addNotification = async (notif) => {
    const fullNotif = {
      id: `notif-${Date.now()}`,
      ...notif,
      timestamp: new Date().toISOString(),
      read: false
    };
    await addNotificationToFirestore(fullNotif);
  };

  const dismissNotification = async (id) => {
    await deleteNotificationFromFirestore(id);
  };

  const dismissAllNotifications = async () => {
    await clearAllNotificationsFromFirestore();
  };

  return { notifications, addNotification, dismissNotification, dismissAllNotifications };
}
