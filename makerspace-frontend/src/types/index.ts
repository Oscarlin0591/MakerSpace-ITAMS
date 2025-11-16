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
