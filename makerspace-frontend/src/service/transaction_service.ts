import axios from 'axios';
import { type ItemTransaction } from '../types/index';

const BACKEND_URL = import.meta.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';

export type BackendTransaction = {
  transactionId: number;
  transactionSystem: string;
  timestamp: string;
};

export async function getTransactions(): Promise<Array<BackendTransaction>> {
  try {
    const response = await axios.get(`${BACKEND_URL}/transactions`);
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

export async function getTransaction(id: number): Promise<BackendTransaction | null> {
  try {
    const response = await axios.get(`${BACKEND_URL}/transactions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return null;
  }
}

// Legacy function for backward compatibility
export function getItems(): ItemTransaction[] {
  const sample: ItemTransaction[] = [
    {
      transactionId: 1,
      itemId: 1,
      quantityChanged: 3,
    },
    {
      transactionId: 2,
      itemId: 5,
      quantityChanged: -3,
    },
  ];
  return sample;
}

export function getItem(id: number): ItemTransaction | undefined {
  const sample: ItemTransaction[] = [
    {
      transactionId: 1,
      itemId: 1,
      quantityChanged: 3,
    },
    {
      transactionId: 2,
      itemId: 5,
      quantityChanged: -3,
    },
  ];
  return sample.find((p) => p.transactionId === id);
}
