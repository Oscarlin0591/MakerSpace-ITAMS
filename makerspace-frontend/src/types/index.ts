export type Category = {
  categoryID: number;
  categoryName: string;
  units: string;
};

export type NewCategory = {
  categoryName: string;
  units: string;
};

export type Item = {
  itemID: number;
  categoryID: number;
  itemName: string;
  quantity: number;
  lowThreshold: number;
  color?: string;
};

export type NewItem = {
  itemName: string;
  categoryID?: number;
  categoryName?: string;
  units?: string;
  quantity: number;
  lowThreshold: number;
  color?: string;
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
