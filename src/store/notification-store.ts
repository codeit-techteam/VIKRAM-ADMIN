import { create } from "zustand";

import { MOCK_ENTERPRISE_NOTIFICATIONS } from "@/features/notification-center/mock/notifications.mock";
import type { EnterpriseNotification } from "@/features/notification-center/types";

interface NotificationState {
  notifications: EnterpriseNotification[];
  isInitialized: boolean;
  unreadCount: number;
  initialize: () => void;
  setNotifications: (notifications: EnterpriseNotification[]) => void;
  addNotification: (notification: EnterpriseNotification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  bulkMarkAsRead: (ids: string[]) => void;
  removeNotification: (id: string) => void;
  bulkDelete: (ids: string[]) => void;
  clearNotifications: () => void;
}

function computeUnreadCount(notifications: EnterpriseNotification[]): number {
  return notifications.filter((notification) => !notification.isRead).length;
}

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [],
  isInitialized: false,
  unreadCount: 0,
  initialize: () => {
    if (get().isInitialized) return;
    set({
      notifications: MOCK_ENTERPRISE_NOTIFICATIONS,
      unreadCount: computeUnreadCount(MOCK_ENTERPRISE_NOTIFICATIONS),
      isInitialized: true,
    });
  },
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: computeUnreadCount(notifications),
      isInitialized: true,
    }),
  addNotification: (notification) =>
    set((state) => {
      const notifications = [notification, ...state.notifications];
      return {
        notifications,
        unreadCount: computeUnreadCount(notifications),
        isInitialized: true,
      };
    }),
  markAsRead: (id) =>
    set((state) => {
      const notifications = state.notifications.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification,
      );
      return {
        notifications,
        unreadCount: computeUnreadCount(notifications),
      };
    }),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((notification) => ({
        ...notification,
        isRead: true,
      })),
      unreadCount: 0,
    })),
  bulkMarkAsRead: (ids) =>
    set((state) => {
      const idSet = new Set(ids);
      const notifications = state.notifications.map((notification) =>
        idSet.has(notification.id)
          ? { ...notification, isRead: true }
          : notification,
      );
      return {
        notifications,
        unreadCount: computeUnreadCount(notifications),
      };
    }),
  removeNotification: (id) =>
    set((state) => {
      const notifications = state.notifications.filter(
        (notification) => notification.id !== id,
      );
      return {
        notifications,
        unreadCount: computeUnreadCount(notifications),
      };
    }),
  bulkDelete: (ids) =>
    set((state) => {
      const idSet = new Set(ids);
      const notifications = state.notifications.filter(
        (notification) => !idSet.has(notification.id),
      );
      return {
        notifications,
        unreadCount: computeUnreadCount(notifications),
      };
    }),
  clearNotifications: () =>
    set({
      notifications: [],
      unreadCount: 0,
      isInitialized: true,
    }),
}));
