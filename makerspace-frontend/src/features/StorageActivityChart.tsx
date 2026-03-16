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
import { Spinner, Alert, Card } from 'react-bootstrap';
import { getTransactions, type BackendTransaction } from '../service/transaction_service';
import type { InventoryItem } from '../types/index';
import { getCategory } from '../service/category';

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
  const [units, setUnits] = useState<string>('');

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

        const [transactions, category] = await Promise.all([
          getTransactions(),
          selectedItem ? getCategory(selectedItem.categoryID) : Promise.resolve(null),
        ]);
        setUnits(category?.units ?? '');

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
    };

    fetchActivityData();
  }, [series, timeframeInDays, selectedItem]);

  // Loading spinner
  if (loading) {
    return (
      <Card className="nested-item-card shadow-sm">
        <Card.Body
          className="d-flex justify-content-center align-items-center"
          style={{ height: '400px' }}
        >
          <Spinner animation="border" style={{ color: 'var(--qu-dark)' }} />
        </Card.Body>
      </Card>
    );
  }

  // Error
  if (error) {
    return (
      <Card className="nested-item-card shadow-sm">
        <Card.Body
          className="d-flex justify-content-center align-items-center"
          style={{ height: '400px' }}
        >
          <Alert
            variant="danger"
            style={{
              borderColor: 'var(--qu-dark)',
              color: 'var(--qu-dark)',
              maxWidth: 400,
              textAlign: 'center',
            }}
          >
            <Alert.Heading>Chart Unavailable</Alert.Heading>
            <p className="mb-0">{error}</p>
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  // Series is empty. Nothing to render
  if (chartData.length === 0) {
    return (
      <Card className="nested-item-card shadow-sm">
        <Card.Body
          className="d-flex justify-content-center align-items-center"
          style={{ height: '400px' }}
        >
          <Alert
            variant="info"
            style={{
              borderColor: 'var(--qu-light)',
              color: 'var(--qu-dark)',
              maxWidth: 400,
              textAlign: 'center',
            }}
          >
            <Alert.Heading>No Data</Alert.Heading>
            <p className="mb-0">No data is available for this period.</p>
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  // Render chart data
  return (
    <Card className="nested-item-card no-select shadow-sm">
      <Card.Body>
        <h5 className="nested-item-card-title mb-3">{getMonthLabel(chartData)}</h5>
        <ResponsiveContainer width="100%" aspect={1.618} maxHeight={400}>
          <LineChart data={chartData} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
            <CartesianGrid stroke={'var(--qu-light)'} strokeDasharray="5 5" opacity={0.4} />
            <XAxis
              tickFormatter={(day) => (Number(day) % 5 === 0 || day === '1' ? day : '')}
              dataKey="name"
              label={{
                value: 'Day',
                position: 'insideBottom',
                offset: -6,
                style: {
                  fill: 'var(--qu-dark)',
                  fontSize: 12,
                  fontWeight: 700,
                  textAnchor: 'middle',
                },
              }}
              tick={{ fill: 'var(--qu-dark)', fontSize: 11 }}
              axisLine={{ stroke: 'var(--qu-dark)' }}
              tickLine={{ stroke: 'var(--qu-dark)' }}
              interval={0}
            />
            <YAxis
              width={60}
              allowDecimals={false}
              label={{
                value: units.trim() ? `Units (${units})` : 'Units',
                angle: -90,
                position: 'insideLeft',
                offset: 30,
                style: {
                  fill: 'var(--qu-dark)',
                  fontSize: 12,
                  fontWeight: 700,
                  textAnchor: 'middle',
                },
              }}
              tick={{ fill: 'var(--qu-dark)', fontSize: 12 }}
              axisLine={{ stroke: 'var(--qu-dark)' }}
              tickLine={{ stroke: 'var(--qu-dark)' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--app-bg)',
                border: '1px solid var(--qu-dark)',
                borderRadius: 6,
                color: 'var(--qu-dark)',
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
              stroke={'var(--qu-dark)'}
              strokeWidth={2}
              dot={{ fill: 'var(--qu-gold)', stroke: 'var(--qu-dark)', strokeWidth: 1.5, r: 4 }}
              activeDot={{ fill: 'var(--qu-gold)', stroke: 'var(--qu-dark)', strokeWidth: 2, r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card.Body>
    </Card>
  );
};
