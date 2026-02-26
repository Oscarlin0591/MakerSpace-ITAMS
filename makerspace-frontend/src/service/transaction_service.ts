import axios from 'axios';
import { API_BASE_URL } from '../types/index';

export type BackendTransaction = {
  transactionId: number;
  transactionSystem: string;
  timestamp: string;
};

export async function getTransactions(): Promise<Array<BackendTransaction>> {
  try {
    const response = await axios.get(`${API_BASE_URL}/transactions`);
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

export async function getTransaction(id: number): Promise<BackendTransaction | null> {
  try {
    const response = await axios.get(`${API_BASE_URL}/transactions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return null;
  }
}
