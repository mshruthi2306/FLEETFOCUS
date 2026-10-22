import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const NotificationContext = createContext();

export function useNotification() {
  return useContext(NotificationContext);
}

const ICONS = { success: '✓', warning: '⚠', error: '✕' };

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, message, type }].slice(-5));
  }, []);

  const dismiss = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  useEffect(() => {
    if (notifications.length === 0) return;
    const timers = notifications.map((n) =>
      setTimeout(() => dismiss(n.id), 5000)
    );
    return () => timers.forEach(clearTimeout);
  }, [notifications]);

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div className="notification-stack">
        {notifications.map((n) => (
          <div key={n.id} className={`notification notification-${n.type}`}>
            <span className="notification-icon">{ICONS[n.type]}</span>
            <span className="notification-message">{n.message}</span>
            <button className="notification-close" onClick={() => dismiss(n.id)}>
              ×
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}