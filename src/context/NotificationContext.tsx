import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Notification, NotificationType } from '../types';

interface NotificationContextData {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (title: string, description: string, type: NotificationType) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextData>({} as NotificationContextData);

// Mock inicial para demonstração
const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Pagamento Recebido',
    description: 'Você recebeu um pagamento de R$ 1.200,00 via Pix.',
    type: 'success',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 min atrás
    isRead: false,
  },
  {
    id: '2',
    title: 'Conta a Vencer',
    description: 'A fatura do cartão de crédito vence amanhã.',
    type: 'warning',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 horas atrás
    isRead: false,
  },
  {
    id: '3',
    title: 'Meta Atingida',
    description: 'Parabéns! Você atingiu sua meta de economia mensal.',
    type: 'info',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 dia atrás
    isRead: true,
  },
];

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const addNotification = (title: string, description: string, type: NotificationType) => {
    const newNotification: Notification = {
      id: crypto.randomUUID(),
      title,
      description,
      type,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
