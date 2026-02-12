import axios from 'axios';
import { type Category, BACKEND_URL } from '../types/index';

export async function getCategories(): Promise<Array<Category>> {
  try {
    const response = await axios.get(`${BACKEND_URL}/category`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function getCategory(id: number): Promise<Category | null> {
  try {
    const response = await axios.get(`${BACKEND_URL}/category/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
}
