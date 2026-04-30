/**
 * itemRouter.ts
 * Handles all inventory item routes: CRUD operations, quantity history,
 * transaction snapshot writes, and low-stock threshold email trigger.
 *
 * @ai-assisted Claude Code (Anthropic) — https://claude.ai/claude-code
 * AI used for code review and threshold logic analysis.
 */

import { createClient, type PostgrestSingleResponse } from '@supabase/supabase-js';
import { InventoryItem } from '../models/inventory_item';
import config from '../config.json';

const supabase = createClient(config.VITE_SUPABASE_URL, config.VITE_SUPABASE_PUBLISHABLE_KEY);

export async function getItem(
  id: number | void,
): Promise<PostgrestSingleResponse<Array<InventoryItem>> | PostgrestSingleResponse<InventoryItem>> {
  if (typeof id === 'number') {
    const data = await supabase.from('inventory_item').select().eq('item_id', id).single();
    const newItem: InventoryItem = new InventoryItem(
      data.data?.item_id,
      data.data?.item_name,
      data.data?.category_id,
      data.data?.quantity,
      data.data?.threshold,
      data.data?.yolo_labels,
      data.data?.camera_id,
    );
    data.data = newItem;
    return data;
  } else {
    const data = await supabase.from('inventory_item').select();
    const itemArray: Array<InventoryItem> | void = [];
    data.data?.forEach((item) => {
      let newItem = new InventoryItem(
        item.item_id,
        item.item_name,
        item.category_id,
        item.quantity,
        item.threshold,
        item.yolo_labels,
        item.camera_id,
      );
      itemArray.push(newItem);
    });
    data.data = itemArray;
    return data;
  }
}

export async function postItem(item: InventoryItem) {
  const catID =
    item.categoryID ??
    (() => {
      switch (item.categoryName) {
        case 'Filament':
          return 1;
        case 'Wood':
          return 2;
        case 'Vinyl':
          return 3;
        default:
          return null;
      }
    })();
  const newItem: InventoryItem = new InventoryItem(
    item.itemID,
    item.itemName,
    catID ?? 0,
    item.quantity,
    item.lowThreshold,
    item.yoloLabels,
    item.cameraId,
    item.categoryName,
  );
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('inventory_item')
    .insert({
      category_id: catID ?? 99,
      item_name: newItem.itemName,
      quantity: newItem.quantity,
      threshold: newItem.lowThreshold,
      yolo_labels: newItem.yoloLabels ?? null,
      camera_id: newItem.cameraId ?? null,
      transaction_date: now,
    })
    .select()
    .single();

  if (!error && data) {
    const { error: historyError } = await supabase
      .from('transaction')
      .insert({ item_id: data.item_id, quantity: data.quantity, recorded_at: data.transaction_date ?? now });
    if (historyError) {
      console.error('Failed to insert transaction snapshot on create:', historyError);
    }
  }

  return { success: !error, data, error };
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
      yolo_labels: item.yoloLabels ?? null,
      camera_id: item.cameraId ?? null,
      transaction_date: now,
    })
    .eq('item_id', id)
    .select()
    .single();

  if (!error) {
    const { error: historyError } = await supabase
      .from('transaction')
      .insert({ item_id: id, quantity: item.quantity, recorded_at: data?.transaction_date ?? now });
    if (historyError) {
      console.error('Failed to insert transaction snapshot:', historyError);
    }
  }

  return { success: !error, data, error };
}

export async function deleteItem(id: number) {
  const { error: historyError } = await supabase.from('transaction').delete().eq('item_id', id);
  if (historyError) {
    console.error('Failed to delete transaction history:', historyError);
  }

  const { error } = await supabase.from('inventory_item').delete().eq('item_id', id);

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
export async function getItemsByCameraId(cameraId: number): Promise<InventoryItem[]> {
  const { data } = await supabase.from('inventory_item').select().eq('camera_id', cameraId);

  return (data ?? []).map(
    (item) =>
      new InventoryItem(
        item.item_id,
        item.item_name,
        item.category_id,
        item.quantity,
        item.threshold,
        item.yolo_labels,
        item.camera_id,
      ),
  );
}

export async function getItemsWithNullCamera(): Promise<InventoryItem[]> {
  const { data } = await supabase
    .from('inventory_item')
    .select()
    .is('camera_id', null)
    .not('yolo_labels', 'is', null);

  return (data ?? []).map(
    (item) =>
      new InventoryItem(
        item.item_id,
        item.item_name,
        item.category_id,
        item.quantity,
        item.threshold,
        item.yolo_labels,
        item.camera_id,
      ),
  );
}
