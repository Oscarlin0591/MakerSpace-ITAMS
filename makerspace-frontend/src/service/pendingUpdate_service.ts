import axios from 'axios';
import { API_BASE_URL, type PendingUpdate } from '../types/index';

export async function getPendingUpdates(): Promise<PendingUpdate[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/pending-updates`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching pending updates:', error);
    return [];
  }
}

export async function approveUpdate(id: string): Promise<boolean> {
  try {
    await axios.post(`${API_BASE_URL}/pending-updates/${id}/approve`);
    return true;
  } catch (error) {
    console.error('Error approving update:', error);
    return false;
  }
}

export async function rejectUpdate(id: string): Promise<boolean> {
  try {
    await axios.delete(`${API_BASE_URL}/pending-updates/${id}`);
    return true;
  } catch (error) {
    console.error('Error rejecting update:', error);
    return false;
  }
}
