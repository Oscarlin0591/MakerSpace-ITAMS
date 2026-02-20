// Backend server URL
export const BACKEND_URL = 'http://localhost:3000';

// API endpoints with /api prefix (used by all services)
export const API_BASE_URL = `${BACKEND_URL}/api`;

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

export type UserContextType = {
  isAdmin: boolean;
  isAuthenticated: boolean;
};

export type AuthResponse = {
  token: string;
  isAdmin: boolean;
};
