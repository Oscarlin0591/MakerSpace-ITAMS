import axios from 'axios';
import {type User} from '../types';
import { BACKEND_URL } from '../types';

export async function getUsers(): Promise<Array<User>> {
  const response = await axios.get(`${BACKEND_URL}/users`);
  return response.data;
}

export async function authenticateUser(username: string, password: string): Promise<string> {
  const response = await axios.post(`${BACKEND_URL}/authenticate/`, {username, password});
  return response.data;
}