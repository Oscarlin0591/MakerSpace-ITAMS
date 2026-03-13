export class ItemCategory {
  categoryID: number;
  categoryName: string;
  units: string;

  constructor (categoryID: number, categoryName: string, units: string) {
    this.categoryID = categoryID;
    this.categoryName = categoryName;
    this.units = units;
  }
};