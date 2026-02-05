import axios from 'axios';
import {type User} from '../types';
import { BACKEND_URL } from '../types';

export async function getUsers(): Promise<Array<User>> {
  const response = await axios.get(`${BACKEND_URL}/users`);
  return response.data;
}