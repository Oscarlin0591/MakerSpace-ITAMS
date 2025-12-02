import axios from 'axios';
import { type InventoryItem } from '../types/index';
import { BACKEND_URL } from '../types/index';

export async function getItems(): Promise<Array<InventoryItem>> {
  const response = await axios.get(`${BACKEND_URL}/items`);

  // console.log(response.data)
  return response.data;
  // .then((items : Array<InventoryItem>) => {return items});
}

export async function getItem(id: number): Promise<InventoryItem | undefined> {
  const response = await axios.get(`${BACKEND_URL}/items/${id}`);
  return response.data;
}
