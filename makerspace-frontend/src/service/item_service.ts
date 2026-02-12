import axios from 'axios';
import { type InventoryItem, type NewItem, API_BASE_URL } from '../types/index';

export async function getItems(): Promise<Array<InventoryItem>> {
  try {
    const response = await axios.get(`${API_BASE_URL}/items`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching items:', error);
    return [];
  }
}

export async function getItem(id: number): Promise<InventoryItem | null> {
  try {
    const response = await axios.get(`${API_BASE_URL}/items/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching item:', error);
    return null;
  }
}

export async function postItem(item: NewItem) {
  try {
    const response = await axios.post(`${API_BASE_URL}/items`, { newItem: item });
    return response.data;
  } catch (error) {
    console.error('Error posting item:', error);
    throw error;
  }
}
