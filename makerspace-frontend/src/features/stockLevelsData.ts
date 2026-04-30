/**
 * stockLevelsData.ts
 * Pure helpers for transforming inventory and category records into chart data.
 *
 * @ai-assisted Codex (OpenAI) — https://openai.com/codex
 * AI used to extract and test the stock-level aggregation logic.
 */

import type { Category, InventoryItem } from '../types';

export type ChartData = {
  name: string;
  total: number;
  lowThreshold: number;
  units: string;
  tooltipInfo?: ChartData[];
};

export function buildChartData(items: InventoryItem[], categories: Category[]): ChartData[] {
  const categoryMap: { [key: number]: { name: string; units: string; items: InventoryItem[] } } =
    {};
  categories.forEach((cat) => {
    categoryMap[cat.categoryID] = { name: cat.categoryName, units: cat.units || 'units', items: [] };
  });
  items.forEach((it) => {
    const entry = categoryMap[it.categoryID] || {
      name: 'Uncategorized',
      units: 'units',
      items: [],
    };
    entry.items.push(it);
    categoryMap[it.categoryID] = entry;
  });
  return Object.values(categoryMap).map((c) => ({
    name: c.name,
    total: c.items.reduce((s, it) => s + (it.quantity || 0), 0),
    lowThreshold: c.items.reduce((s, it) => s + (it.lowThreshold || 0), 0),
    units: c.units,
    tooltipInfo: c.items.map((it) => ({
      name: it.itemName,
      total: it.quantity,
      lowThreshold: it.lowThreshold,
      units: c.units,
    })),
  }));
}
