import { createClient, type PostgrestSingleResponse } from "@supabase/supabase-js";
import { InventoryItem } from "../models/inventory_item";
import config from "../config.json";

const supabase = createClient(config.VITE_SUPABASE_URL, config.VITE_SUPABASE_PUBLISHABLE_KEY);

export async function getItem(id: number | void) : Promise<PostgrestSingleResponse<Array<InventoryItem>> | PostgrestSingleResponse<InventoryItem>> {
    if (typeof id === "number") {
        const data = await supabase.from("inventory_item").select().eq('item_id', id).single();
        const newItem : InventoryItem = new InventoryItem(data.data?.item_id, data.data?.item_name, data.data?.category_id, data.data?.quantity, data.data?.threshold);
        data.data = newItem;
        return data;
    } else {
        const data = await supabase.from("inventory_item").select();
        const itemArray : Array<InventoryItem> | void = [];
        data.data?.forEach((item) => {
            let newItem = new InventoryItem(item.item_id, item.item_name, item.category_id, item.quantity, item.threshold)
            itemArray.push(newItem);
        });
        data.data = itemArray;
        return data;
    }
}

export async function postItem(item: InventoryItem) {
    const categoryID = () => {switch (item.categoryName) {
        case ('Filament'):
            return 1;
        case ('Wood'):
            return 2;
        case ('Vinyl'):
            return 3;
        default:
            return 0;
    }}
    const newItem : InventoryItem = new InventoryItem(item.itemID, item.itemName, categoryID(), item.quantity, item.lowThreshold, item.color, item.categoryName);
    const { data, error } = await supabase.from('inventory_item')
    .insert({category_id: newItem.categoryID, item_name: newItem.itemName, quantity: newItem.quantity, threshold: newItem.lowThreshold, color: newItem.color})
    .select().single();

    return {success: !error, data, error};
}