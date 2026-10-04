import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { usePolling } from '@/hooks/usePolling';
import {
  fetchNotifications,
  markNotificationRead as apiMarkRead,
  markAllNotificationsRead as apiMarkAllRead,
} from '@/lib/api/notifications';

const POLL_INTERVAL_MS = 15000;
const EMPTY_NOTIFICATIONS = [];

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [notificationsUserId, setNotificationsUserId] = useState(null);
  const [toast, setToast] = useState(null);
  const lastSeenIdRef = useRef(null);
  const toastTimerRef = useRef(null);

  const load = useCallback(async (isFirstLoad) => {
    if (!user) return;
    let list;
    try {
      list = await fetchNotifications();
    } catch {
      return;
    }
    setNotifications(list);
    setNotificationsUserId(user.id);

    if (list.length === 0) return;
    const newestId = list[0].id;
    if (!isFirstLoad && lastSeenIdRef.current != null && newestId > lastSeenIdRef.current) {
      const fresh = list.filter((n) => n.id > lastSeenIdRef.current);
      const latest = fresh[0];
      setToast(latest);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setToast(null), 4000);
    }
    lastSeenIdRef.current = newestId;
  }, [user]);

  useEffect(() => {
    if (!user) {
      lastSeenIdRef.current = null;
      return;
    }
    const timer = setTimeout(() => load(true), 0);
    return () => clearTimeout(timer);
  }, [user, load]);

  usePolling(() => load(false), POLL_INTERVAL_MS, !!user);

  const markRead = useCallback(async (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await apiMarkRead(id);
    } catch {
      // best-effort — next poll reconciles
    }
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await apiMarkAllRead();
    } catch {
      // best-effort — next poll reconciles
    }
  }, []);

  const visibleNotifications = user && notificationsUserId === user.id ? notifications : EMPTY_NOTIFICATIONS;
  const unreadCount = visibleNotifications.filter((n) => !n.read).length;

  const value = useMemo(
    () => ({ notifications: visibleNotifications, unreadCount, toast, dismissToast: () => setToast(null), refetch: () => load(false), markRead, markAllRead }),
    [visibleNotifications, unreadCount, toast, load, markRead, markAllRead],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}
