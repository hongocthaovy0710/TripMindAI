import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Trip, Notification } from '../types';

interface AppContextType {
  favorites: string[];          // place/hotel IDs
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  savedTrips: Trip[];
  addTrip: (trip: Trip) => void;
  deleteTrip: (id: string) => void;
  updateTrip: (trip: Trip) => void;
  notifications: Notification[];
  addNotification: (msg: string, type?: Notification['type']) => void;
  markAllRead: () => void;
  unreadCount: number;
}

const AppContext = createContext<AppContextType | null>(null);

const FAV_KEY = 'tripmind_favorites';
const TRIPS_KEY = 'tripmind_trips';

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>(() => load(FAV_KEY, []));
  const [savedTrips, setSavedTrips] = useState<Trip[]>(() => load(TRIPS_KEY, []));
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      save(FAV_KEY, next);
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  const addTrip = useCallback((trip: Trip) => {
    setSavedTrips((prev) => {
      const next = [trip, ...prev.filter((t) => t.id !== trip.id)];
      save(TRIPS_KEY, next);
      return next;
    });
    setNotifications((prev) => [
      {
        id: crypto.randomUUID(),
        message: `AI đã tạo lịch trình cho chuyến đi ${trip.destination}!`,
        type: 'success',
        read: false,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  }, []);

  const deleteTrip = useCallback((id: string) => {
    setSavedTrips((prev) => {
      const next = prev.filter((t) => t.id !== id);
      save(TRIPS_KEY, next);
      return next;
    });
  }, []);

  const updateTrip = useCallback((trip: Trip) => {
    setSavedTrips((prev) => {
      const next = prev.map((t) => (t.id === trip.id ? trip : t));
      save(TRIPS_KEY, next);
      return next;
    });
  }, []);

  const addNotification = useCallback((msg: string, type: Notification['type'] = 'info') => {
    setNotifications((prev) => [
      {
        id: crypto.randomUUID(),
        message: msg,
        type,
        read: false,
        createdAt: new Date().toISOString(),
      },
      ...prev.slice(0, 19),
    ]);
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        favorites, toggleFavorite, isFavorite,
        savedTrips, addTrip, deleteTrip, updateTrip,
        notifications, addNotification, markAllRead, unreadCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
