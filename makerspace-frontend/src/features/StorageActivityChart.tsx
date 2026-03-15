/**
 * StorageActivityChart.tsx
 * A line chart displaying item transactions over a period of time
 */

import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Spinner, Alert } from 'react-bootstrap';
import { getTransactions, type BackendTransaction } from '../service/transaction_service';
import type { InventoryItem } from '../types/index';
import { getCategory } from '../service/category';

const COLORS = {
  bg: '#f8f9fa',
  gold: '#ffb81c',
  light: '#4db3ff',
  dark: '#000b65',
};

type SeriesPoint = { name: string; value: number; date: string };

type ActivityChartProps = {
  series?: SeriesPoint[];
  timeframeInDays?: number;
  selectedItem: InventoryItem | null;
};

// Builds an array of series points over the entire month
const buildDays = (): SeriesPoint[] => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return Array.from({ length: daysInMonth }, (_, i) => {
    // Create a date for each day of the month
    const d = new Date(year, month, i + 1);

    return {
      name: String(d.getDate()), // Day number
      value: 0,
      date: d.toISOString().split('T')[0], // YYYY-MM-DD
    };
  });
};

// Return label for current month
const getMonthLabel = (data: SeriesPoint[]): string => {
  if (data.length === 0) return '';
  return new Date(data[0].date).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
};

export const ActivityChart: FC<ActivityChartProps> = ({
  series,
  timeframeInDays = 30,
  selectedItem,
}) => {
  const [chartData, setChartData] = useState<SeriesPoint[]>(series || []);
  const [loading, setLoading] = useState(!series);
  const [error, setError] = useState<string | null>(null);
  const [units, setUnits] = useState<string | null>(null);

  useEffect(() => {
    // If series is provided as prop, use it instead of fetching
    if (series && series.length > 0) {
      setChartData(series);
      return;
    }

    const fetchActivityData = async () => {
      try {
        setLoading(true);
        setError(null);

        const transactions = await getTransactions();

        // Filter transactions by selectedItem if provided
        const filteredTransactions = selectedItem
          ? transactions.filter(
              (trans: BackendTransaction) => trans.transactionId === selectedItem.itemID,
            )
          : transactions;

        // Setup all days so every day in the window is represented
        const days = buildDays();
        const daysMap = new Map<string, SeriesPoint>(
          days.map((point) => [point.date!, { ...point }]),
        );

        if (filteredTransactions && filteredTransactions.length > 0) {
          const now = new Date();
          const cutoffDate = new Date(now.getTime() - timeframeInDays * 24 * 60 * 60 * 1000);

          filteredTransactions.forEach((trans: BackendTransaction) => {
            const transDate = new Date(trans.timestamp);
            if (transDate >= cutoffDate) {
              const dateKey = transDate.toISOString().split('T')[0];
              const existing = daysMap.get(dateKey);
              if (existing) {
                existing.value += 1;
              }
            }
          });
        }

        setChartData(Array.from(daysMap.values()));
      } catch (err) {
        console.error('Error fetching activity data:', err);
        setError('Failed to load activity data. Please try again later.');
      } finally {
        setLoading(false);
      }

      if (selectedItem != null) {
        const category = await getCategory(selectedItem?.categoryID);
        console.log(category);
        if (category) {
          (category.units != null) ? setUnits(category.units) : setUnits('units')
        }
      }
    };

    fetchActivityData();

  }, [series, timeframeInDays, selectedItem]);

  // Loading spinner
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <Spinner animation="border" style={{ color: COLORS.dark }} />
      </div>
    );
  }

  // Error
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

  // Series is empty. Nothing to render
  if (chartData.length === 0) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: '400px', backgroundColor: COLORS.bg, borderRadius: 8 }}
      >
        <Alert
          variant="info"
          style={{
            borderColor: COLORS.light,
            color: COLORS.dark,
            maxWidth: 400,
            textAlign: 'center',
          }}
        >
          <Alert.Heading>No Data</Alert.Heading>
          <p className="mb-0">No data is available for this period.</p>
        </Alert>
      </div>
    );
  }

  // Render chart data
  return (
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
        {`${selectedItem?.itemName || 'All Items'} - ${getMonthLabel(chartData)}`}
      </h6>
      <ResponsiveContainer width="100%" aspect={1.618} maxHeight={400}>
        <LineChart data={chartData} margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
          <CartesianGrid stroke={COLORS.light} strokeDasharray="5 5" opacity={0.4} />
          <XAxis
            tickFormatter={(day) => (Number(day) % 5 === 0 || day === '1' ? day : '')}
            dataKey="name"
            label={{
              value: 'Day',
              position: 'insideBottom',
              offset: -6,
              style: { fill: COLORS.dark, fontSize: 12 },
            }}
            tick={{ fill: COLORS.dark, fontSize: 11 }}
            axisLine={{ stroke: COLORS.dark }}
            tickLine={{ stroke: COLORS.dark }}
            interval={0}
          />
          {/** TODO: Add proper units to y-axis label*/}
          <YAxis
            width={80}
            allowDecimals={false}
            label={{
              value: `${units}`,
              angle: -90,
              position: 'insideLeft',
              offset: 36,
              dy: 40,
              style: { fill: COLORS.dark, fontSize: 12 },
            }}
            tick={{ fill: COLORS.dark, fontSize: 12 }}
            axisLine={{ stroke: COLORS.dark }}
            tickLine={{ stroke: COLORS.dark }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: COLORS.bg,
              border: `1px solid ${COLORS.dark}`,
              borderRadius: 6,
              color: COLORS.dark,
            }}
            labelFormatter={(label, payload) => {
              const point = payload?.[0]?.payload as SeriesPoint | undefined;
              return point?.date
                ? new Date(point.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : `Day ${label}`;
            }}
            formatter={(value: number) => [`${value} transactions`]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={COLORS.dark}
            strokeWidth={2}
            dot={{ fill: COLORS.gold, stroke: COLORS.dark, strokeWidth: 1.5, r: 4 }}
            activeDot={{ fill: COLORS.gold, stroke: COLORS.dark, strokeWidth: 2, r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
