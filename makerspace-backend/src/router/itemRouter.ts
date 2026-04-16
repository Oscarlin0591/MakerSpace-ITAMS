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
    const catID = item.categoryID ?? (() => {
        switch (item.categoryName) {
            case 'Filament': return 1;
            case 'Wood': return 2;
            case 'Vinyl': return 3;
            default: return null;
        }
    })();
    const newItem : InventoryItem = new InventoryItem(item.itemID, item.itemName, catID ?? 0, item.quantity, item.lowThreshold, item.color, item.categoryName);
    const { data, error } = await supabase.from('inventory_item')
    .insert({category_id: catID ?? 99, item_name: newItem.itemName, quantity: newItem.quantity, threshold: newItem.lowThreshold, color: newItem.color ?? null})
    .select().single();

    return {success: !error, data, error};
}

export async function putItem(id: number, item: InventoryItem) {
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from('inventory_item')
        .update({
            category_id: item.categoryID,
            item_name: item.itemName,
            quantity: item.quantity,
            threshold: item.lowThreshold,
            color: item.color ?? null,
            date: now,
        })
        .eq('item_id', id)
        .select()
        .single();

    if (!error) {
        const { error: historyError } = await supabase
            .from('transaction')
            .insert({ item_id: id, quantity: item.quantity, recorded_at: data?.date ?? now });
        if (historyError) {
            console.error('Failed to insert transaction snapshot:', historyError);
        }
    }

    return { success: !error, data, error };
}

export async function deleteItem(id: number) {
    const { error } = await supabase
        .from('inventory_item')
        .delete()
        .eq('item_id', id);

    return { success: !error, error };
}

export async function getItemHistory(itemId: number) {
    const data = await supabase
        .from('transaction')
        .select('quantity, recorded_at')
        .eq('item_id', itemId)
        .order('recorded_at', { ascending: true });

    return data;
}

export async function getAllItemHistory() {
    const data = await supabase
        .from('transaction')
        .select('item_id, quantity, recorded_at')
        .order('recorded_at', { ascending: true });

    return data;
}