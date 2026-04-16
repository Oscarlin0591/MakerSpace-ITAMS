export class Transaction {
  transactionId: number;
  item_id: number;
  recorded_at: string;
  quantity: number;

  constructor (transactionId: number, item_id: number, recorded_at: string, quantity: number) {
    this.transactionId = transactionId;
    this.item_id = item_id;
    this.recorded_at = recorded_at;
    this.quantity = quantity;
  }
};