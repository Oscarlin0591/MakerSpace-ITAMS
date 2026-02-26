import axios from 'axios';
import { API_BASE_URL } from '../types';

export async function authorizeUser(): Promise<boolean> {
  const response = await axios.get(
    `${API_BASE_URL}/authorized`
  ).catch((err) => {console.log(err.request)});
  return response ? response.data: false;
}
