import { create } from "zustand";
import { Socket } from "socket.io-client";

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  listenForNotifications: (socket: Socket) => void;
  addNotification: (notificationData: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markAllAsRead: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  listenForNotifications: (socket) => {
    socket.on('new_notification', (data: { title: string; message: string }) => {
      get().addNotification(data);
    });

    socket.on('low_stock_notification', (data: { title: string; message: string }) => {
      get().addNotification(data);
    });
  },

  addNotification: (notificationData) => {
    const newNotification: Notification = {
      ...notificationData,
      id: `notif-${Date.now()}`,
      read: false,
      createdAt: new Date(),
    };
    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },
}));