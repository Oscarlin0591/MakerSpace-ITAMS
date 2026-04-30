/**
 * stockLevelsData.test.ts
 * Unit tests for stock-level chart aggregation.
 *
 * @ai-assisted Codex (OpenAI) — https://openai.com/codex
 * AI used to add frontend business-logic unit tests.
 */

import { buildChartData } from '../../src/features/stockLevelsData';

describe('buildChartData', () => {
  it('aggregates item quantities and thresholds by category', () => {
    const result = buildChartData(
      [
        { itemID: 1, categoryID: 1, itemName: 'PLA', quantity: 4, lowThreshold: 2 },
        { itemID: 2, categoryID: 1, itemName: 'ABS', quantity: 3, lowThreshold: 1 },
        { itemID: 3, categoryID: 2, itemName: 'Plywood', quantity: 5, lowThreshold: 2 },
      ],
      [
        { categoryID: 1, categoryName: 'Filament', units: 'spools' },
        { categoryID: 2, categoryName: 'Wood', units: 'sheets' },
      ],
    );

    expect(result).toEqual([
      {
        name: 'Filament',
        total: 7,
        lowThreshold: 3,
        units: 'spools',
        tooltipInfo: [
          { name: 'PLA', total: 4, lowThreshold: 2, units: 'spools' },
          { name: 'ABS', total: 3, lowThreshold: 1, units: 'spools' },
        ],
      },
      {
        name: 'Wood',
        total: 5,
        lowThreshold: 2,
        units: 'sheets',
        tooltipInfo: [{ name: 'Plywood', total: 5, lowThreshold: 2, units: 'sheets' }],
      },
    ]);
  });

  it('keeps uncategorized items visible', () => {
    expect(
      buildChartData(
        [{ itemID: 1, categoryID: 99, itemName: 'Mystery part', quantity: 2, lowThreshold: 1 }],
        [],
      ),
    ).toEqual([
      {
        name: 'Uncategorized',
        total: 2,
        lowThreshold: 1,
        units: 'units',
        tooltipInfo: [{ name: 'Mystery part', total: 2, lowThreshold: 1, units: 'units' }],
      },
    ]);
  });
});
