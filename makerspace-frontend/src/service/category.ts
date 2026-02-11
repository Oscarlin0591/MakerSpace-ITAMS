import axios from "axios";
import { type Category } from "../types";
import { BACKEND_URL } from '../types/index';

export async function getCategories(): Promise<Array<Category>> {
  const response = await axios.get(`${BACKEND_URL}/category`);

  // console.log(response.data)
  return response.data;
}

export async function getCategory(id: number): Promise<Category> {
  const response = await axios.get(`${BACKEND_URL}/category/${id}`);
  return response.data;
}