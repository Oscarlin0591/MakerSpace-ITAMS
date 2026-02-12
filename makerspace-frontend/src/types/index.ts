// Works for both localhost development and production server
// In production, set VITE_API_URL environment variable, otherwise uses localhost
const isDevelopment = !import.meta.env.VITE_API_URL;
export const BACKEND_URL = isDevelopment 
  ? 'http://localhost:3000' 
  : import.meta.env.VITE_API_URL;

// Export for backward compatibility
export const API_BASE_URL = BACKEND_URL;

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
