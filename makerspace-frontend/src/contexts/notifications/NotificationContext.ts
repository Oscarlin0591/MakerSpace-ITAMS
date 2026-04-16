import { createContext } from 'react';
import type { AppNotification, InventoryItem } from '../../types';

export type NotificationContextType = {
  notifications: AppNotification[];
  /** Call on Dashboard load — returns items that should be toasted (new or re-triggered). */
  syncNotifications: (items: InventoryItem[]) => InventoryItem[];
  deleteNotification: (id: string) => void;
  ignoreNotification: (id: string) => void;
  /** Call after a PUT sets quantity above threshold so the next dip fires a fresh notification. */
  clearIgnoreForItem: (itemID: number) => void;
};

export const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  syncNotifications: () => [],
  deleteNotification: () => {},
  ignoreNotification: () => {},
  clearIgnoreForItem: () => {},
});
