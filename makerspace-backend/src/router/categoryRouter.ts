import { createClient, type PostgrestSingleResponse } from "@supabase/supabase-js";
import { ItemCategory } from "../models/item_category";
import config from "../config.json";

const supabase = createClient(config.VITE_SUPABASE_URL, config.VITE_SUPABASE_PUBLISHABLE_KEY);

export async function getCategory(id: number | void) : Promise<PostgrestSingleResponse<Array<ItemCategory>> | PostgrestSingleResponse<ItemCategory>> {
    if (typeof id === "number") {
        const data = await supabase.from("category").select().eq('category_id', id).single();
        const newCategory : ItemCategory = new ItemCategory(data.data?.category_id, data.data?.category_name, data.data?.units);
        data.data = newCategory;
        return data;
    } else {
        const data = await supabase.from("category").select();
        const itemArray : Array<ItemCategory> | void = [];
        data.data?.forEach((category) => {
            let newCategory = new ItemCategory(category.category_id, category.category_name, category.units)
            itemArray.push(newCategory);
        });
        data.data = itemArray;
        return data;
    }
}