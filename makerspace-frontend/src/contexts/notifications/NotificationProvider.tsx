import React, { useState, useCallback } from 'react';
import type { AppNotification, InventoryItem } from '../../types';
import { NotificationContext } from './NotificationContext';

const STORAGE_KEY = 'itams_notifications';

function load(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AppNotification[]) : [];
  } catch {
    return [];
  }
}

function save(notifications: AppNotification[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
}

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(load);

  const update = useCallback((next: AppNotification[]) => {
    save(next);
    setNotifications(next);
  }, []);

  /**
   * For each low-stock item:
   *  - No existing notification → create one, queue for toast
   *  - Existing ignored notification where quantity changed → reset it, queue for toast
   *  - Existing ignored notification, same quantity → skip (user already saw it)
   *  - Existing non-ignored notification → skip (already visible, toast already fired)
   */
  const syncNotifications = useCallback(
    (items: InventoryItem[]): InventoryItem[] => {
      const current = load();
      const toToast: InventoryItem[] = [];
      let changed = false;

      const next = [...current];

      items
        .filter((item) => item.quantity < item.lowThreshold)
        .forEach((item) => {
          const id = `low-stock-${item.itemID}`;
          const existing = next.find((n) => n.id === id);

          if (!existing) {
            next.push({
              id,
              itemID: item.itemID,
              itemName: item.itemName,
              quantity: item.quantity,
              lowThreshold: item.lowThreshold,
              createdAt: new Date().toISOString(),
              ignored: false,
            });
            toToast.push(item);
            changed = true;
          } else if (existing.ignored && existing.quantity !== item.quantity) {
            // Item restocked and dipped again — treat as fresh notification
            existing.quantity = item.quantity;
            existing.createdAt = new Date().toISOString();
            existing.ignored = false;
            toToast.push(item);
            changed = true;
          }
          // else: already notified (ignored or active) at same quantity — do nothing
        });

      if (changed) update(next);
      return toToast;
    },
    [update],
  );

  const deleteNotification = useCallback(
    (id: string) => {
      update(load().filter((n) => n.id !== id));
    },
    [update],
  );

  const ignoreNotification = useCallback(
    (id: string) => {
      update(load().map((n) => (n.id === id ? { ...n, ignored: true } : n)));
    },
    [update],
  );

  const clearIgnoreForItem = useCallback(
    (itemID: number) => {
      const id = `low-stock-${itemID}`;
      const current = load();
      const target = current.find((n) => n.id === id);
      if (target?.ignored) {
        update(current.map((n) => (n.id === id ? { ...n, ignored: false } : n)));
      }
    },
    [update],
  );

  return (
    <NotificationContext.Provider
      value={{ notifications, syncNotifications, deleteNotification, ignoreNotification, clearIgnoreForItem }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
