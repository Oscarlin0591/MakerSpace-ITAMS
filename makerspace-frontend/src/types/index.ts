// Use relative paths in production (works with nginx proxy)
// Use absolute localhost URL in development
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export type Category = {
  categoryID: number;
  categoryName: string;
  units: string;
};

export type NewCategory = {
  categoryName: string;
  units: string;
};

export type InventoryItem = {
  itemID: number;
  categoryID: number;
  itemName: string;
  description?: string;
  quantity: number;
  lowThreshold: number;
  color?: string;
};

export type NewItem = {
  itemName: string;
  categoryID?: number | null;
  categoryName?: string;
  units?: string | null;
  quantity: number;
  lowThreshold: number;
  color?: string | null;
};

export type User = {
  username: string;
  hash: string;
  is_admin: boolean;
};

export type ItemTransaction = {
  transactionId: number;
  itemId: number;
  quantityChanged: number;
};

export type Transaction = {
  transactionId: number;
  transactionSystem: string;
  timestamp: Date;
};

export type NotificationRecipient = {
  email: string;
};
