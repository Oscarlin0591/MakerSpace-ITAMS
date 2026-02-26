/**
 * StockLevelsChart.tsx
 * An interactive bar chart that displays general inventory
 * data and provides more detailed inventory information upon
 * clicking individual bars
 */

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  type TooltipContentProps,
} from 'recharts';
import { Alert, Spinner } from 'react-bootstrap';
import { getItems } from '../service/item_service';
import { getCategories } from '../service/category';
import type { Category, InventoryItem } from '../types';

const COLORS = {
  bg: '#f8f9fa',
  gold: '#ffb81c',
  light: '#4db3ff',
  dark: '#000b65',
};

type ChartData = {
  name: string;
  total: number;
  lowThreshold: number;
  units: string;
  tooltipInfo?: ChartData[];
};

function StockLevelsChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchData() {
      try {
        const [items, categories] = await Promise.all([getItems(), getCategories()]);

        // Aggregate totals by category
        const categoryMap: {
          [key: number]: { name: string; units: string; items: InventoryItem[] };
        } = {};
        categories.forEach((cat: Category) => {
          categoryMap[cat.categoryID] = {
            name: cat.categoryName,
            units: cat.units || 'units',
            items: [],
          };
        });

        items.forEach((it: InventoryItem) => {
          const entry = categoryMap[it.categoryID] || {
            name: 'Uncategorized',
            units: 'units',
            items: [],
          };
          entry.items.push(it);
          categoryMap[it.categoryID] = entry;
        });

        const chartData: ChartData[] = Object.values(categoryMap).map((c) => ({
          name: c.name,
          total: c.items.reduce((s: number, it: InventoryItem) => s + (it.quantity || 0), 0),
          lowThreshold: c.items.reduce(
            (s: number, it: InventoryItem) => s + (it.lowThreshold || 0),
            0,
          ),
          units: c.units,
          tooltipInfo: c.items.map((it: InventoryItem) => ({
            name: it.itemName,
            total: it.quantity,
            lowThreshold: it.lowThreshold,
            units: c.units,
          })),
        }));

        if (!cancelled) setData(chartData);
      } catch (err) {
        if (!cancelled) setError(String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  // Loading spinner
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <Spinner animation="border" style={{ color: COLORS.dark }} />
      </div>
    );
  }

  // Error alert
  if (error) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: '400px', backgroundColor: COLORS.bg, borderRadius: 8 }}
      >
        <Alert
          variant="danger"
          style={{
            borderColor: COLORS.dark,
            color: COLORS.dark,
            maxWidth: 400,
            textAlign: 'center',
          }}
        >
          <Alert.Heading>Chart Unavailable</Alert.Heading>
          <p className="mb-0">{error}</p>
        </Alert>
      </div>
    );
  }

  // Custom tooltip for bar chart hover
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipContentProps<string | number, string>) => {
    const isVisible = active && payload && payload.length;
    if (!isVisible) return null;

    // Get data for hovered bar from payload[0]
    const chartItem = payload[0].payload as ChartData;
    const detailedItems = chartItem.tooltipInfo;

    return (
      <div
        style={{
          backgroundColor: COLORS.bg,
          border: `1px solid ${COLORS.dark}`,
          borderRadius: 6,
          padding: '8px 12px',
          color: COLORS.dark,
        }}
      >
        <p style={{ fontWeight: 700, marginBottom: 4 }}>{label}</p>
        {detailedItems && detailedItems.length > 0 ? (
          <ul className="list-unstyled mb-0">
            {detailedItems.map((item, index) => (
              <li key={index}>
                <span style={{ color: COLORS.dark, opacity: 0.7 }}>{item.name}:</span>
                <span
                  className="ms-2"
                  style={{
                    fontWeight: 600,
                    color: item.total < item.lowThreshold ? '#dc3545' : COLORS.dark,
                  }}
                >
                  {item.total} {item.units}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted small mb-0">No detailed items available</p>
        )}
      </div>
    );
  };

  return (
    <>
      <div style={{ backgroundColor: COLORS.bg, borderRadius: 8, padding: '8px 0' }}>
        <h6
          style={{
            textAlign: 'center',
            color: COLORS.dark,
            fontWeight: 700,
            letterSpacing: '0.04em',
            marginBottom: 4,
          }}
        >
          Stock Levels by Category
        </h6>
        <ResponsiveContainer width="100%" aspect={1.618} maxHeight={500}>
          <BarChart data={data} margin={{ top: 20, right: 24, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.light} opacity={0.4} />
            <XAxis
              dataKey="name"
              cursor="pointer"
              tick={{ fill: COLORS.dark, fontSize: 12 }}
              axisLine={{ stroke: COLORS.dark }}
              tickLine={{ stroke: COLORS.dark }}
            />
            <YAxis
              width={80}
              label={{
                value: 'Units',
                angle: -90,
                position: 'insideLeft',
                offset: 30,
                style: { fill: COLORS.dark, fontSize: 14 },
              }}
              tick={{ fill: COLORS.dark, fontSize: 12 }}
              axisLine={{ stroke: COLORS.dark }}
              tickLine={{ stroke: COLORS.dark }}
            />
            <Tooltip
              content={
                <CustomTooltip
                  active={true}
                  activeIndex={undefined}
                  payload={[]}
                  coordinate={undefined}
                  accessibilityLayer={false}
                />
              }
            />
            <Bar dataKey="total" fill={COLORS.dark} radius={[3, 3, 0, 0]} cursor="pointer" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

export default StockLevelsChart;
