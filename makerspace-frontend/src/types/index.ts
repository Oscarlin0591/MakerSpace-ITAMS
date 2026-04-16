// Use relative paths in production (works with nginx proxy)
// Use absolute localhost URL in development
const API_BASE_URL = import.meta.env.VITE_API_URL;
if (!API_BASE_URL) {
  throw new Error(
    'Missing environment variable VITE_API_URL. Create makerspace-frontend/.env following the .env.example',
  );
}
export { API_BASE_URL };

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
  yoloLabels?: string[];
  cameraId?: number;
};

export type NewItem = {
  itemName: string;
  categoryID?: number | null;
  categoryName?: string;
  units?: string | null;
  quantity: number;
  lowThreshold: number;
  yoloLabels?: string[] | null;
  cameraId?: number | null;
};

export type User = {
  username: string;
  hash: string;
  is_admin: boolean;
};

export type Transaction = {
  transactionId: number;
  transactionSystem: string;
  timestamp: Date;
};

export type NotificationRecipient = {
  email: string;
  alerts: boolean;
  daily: boolean;
  weekly: boolean;
};

export type UserContextType = {
  isAdmin: boolean;
  isAuthenticated: boolean;
};

export type AuthResponse = {
  token: string;
  isAdmin: boolean;
};

export type AppNotification = {
  id: string;          // `low-stock-${itemID}` — one active notification per item
  itemID: number;
  itemName: string;
  quantity: number;
  lowThreshold: number;
  createdAt: string;
  ignored: boolean;    // suppresses toasts; cleared when item restocks then re-dips
};
