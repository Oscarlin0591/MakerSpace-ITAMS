import axios from 'axios';
import { API_BASE_URL, type NotificationRecipient } from '../types/index';

export async function getEmails(): Promise<NotificationRecipient[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/notifications`);
    return Array.isArray(response.data)
      ? response.data
      : [];
  } catch (error) {
    console.error('Error fetching emails:', error);
    return [];
  }
}

export async function postEmail(email: NotificationRecipient) {
  try {
    const response = await axios.post(`${API_BASE_URL}/notifications`, { email });
    return response.data;
  } catch (error) {
    console.error('Error posting email:', error);
    throw error;
  }
}

export async function putEmail(email: NotificationRecipient) {
  try {
    const response = await axios.put(`${API_BASE_URL}/notifications/${encodeURIComponent(email.email)}`, { email });
    return response.data;
  } catch (error) {
    console.error('Error posting email:', error);
    throw error;
  }
}

export async function deleteEmail(email: string) {
  try {
    const response = await axios.delete(`${API_BASE_URL}/notifications/${encodeURIComponent(email)}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting email:', error);
    throw error;
  }
}

// import { type NotificationRecipient } from '../types/index';

// const sample: NotificationRecipient[] = [
//   {
//     email: 'email1',
//   },
//   {
//     email: 'email2',
//   },
// ];

// export function getItems(): NotificationRecipient[] {
//   return sample;
// }

// export function getItem(email: string): NotificationRecipient | undefined {
//   return sample.find((p) => p.email === email);
// }
