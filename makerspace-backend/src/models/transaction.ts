export class Transaction {
  transactionId: number;
  transactionSystem: string;
  timestamp: Date;

  constructor (transactionId: number, transactionSystem: string, timestamp: Date) {
    this.transactionId = transactionId;
    this.transactionSystem = transactionSystem;
    this.timestamp = timestamp;
  }
};