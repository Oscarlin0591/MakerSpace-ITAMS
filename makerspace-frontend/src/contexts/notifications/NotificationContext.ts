import { createContext } from 'react';
import type { AppNotification, InventoryItem } from '../../types';

export type NotificationContextType = {
  notifications: AppNotification[];
  /** True when there are non-ignored notifications created after the last page view. */
  hasUnread: boolean;
  /** Count of non-ignored notifications created after the last page view. */
  unreadCount: number;
  /** Call on Dashboard load — returns items that should be toasted (new or re-triggered). */
  syncNotifications: (items: InventoryItem[]) => InventoryItem[];
  deleteNotification: (id: string) => void;
  ignoreNotification: (id: string) => void;
  /** Call after a PUT sets quantity above threshold so the next dip fires a fresh notification. */
  clearIgnoreForItem: (itemID: number) => void;
  /** Call when the notification page is viewed to clear the unread badge. */
  markAllRead: () => void;
};

export const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  hasUnread: false,
  unreadCount: 0,
  syncNotifications: () => [],
  deleteNotification: () => {},
  ignoreNotification: () => {},
  clearIgnoreForItem: () => {},
  markAllRead: () => {},
});
