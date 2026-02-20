import axios from 'axios';
import { API_BASE_URL, type AuthResponse } from '../types';

export async function authenticateUser(username: string, password: string): Promise<AuthResponse> {
  const response = await axios.post(`${API_BASE_URL}/authenticate`, { username, password });
  return response.data;
}
