export class InventoryItem  {
  itemID: number;
  itemName: string;
  categoryID?: number;
  categoryName?: string;
  // units?: string;
  quantity: number;
  lowThreshold: number;
  color?: string;
  date?: string;

  constructor (itemID:number, itemName: string, categoryID: number, quantity: number, lowThreshold: number, color?: string, categoryName?: string, date?: string) {
    this.itemID = itemID;
    this.itemName = itemName;
    this.categoryID = categoryID;
    this.categoryName = categoryName;
    // this.units = units;
    this.quantity = quantity;
    this.lowThreshold = lowThreshold;
    this.color = color;
    this.date = date;
  }
};