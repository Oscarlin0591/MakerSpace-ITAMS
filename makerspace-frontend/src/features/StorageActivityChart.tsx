/**
 * StorageActivityChart.tsx
 * Step line chart displaying quantity-over-time for a selected inventory item.
 * Reads from item_quantity_history snapshots; timestamps are sourced from
 * the `date` column on inventory_item (written on every PUT).
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
import { Spinner, Alert, Card, ButtonGroup, Button } from 'react-bootstrap';
import {
  getItemHistory,
  getAllItemHistory,
  type QuantitySnapshot,
  type ItemQuantitySnapshot,
} from '../service/item_service';
import type { InventoryItem } from '../types/index';
import { getCategory } from '../service/category';

type SeriesPoint = { ts: number; value: number };

type ActivityChartProps = {
  series?: SeriesPoint[];
  selectedItem: InventoryItem | null;
};

const TIMEFRAMES = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
  { label: '1Y', days: 365 },
] as const;

type TimeframeDays = (typeof TIMEFRAMES)[number]['days'];

const formatTick = (ts: number, days: TimeframeDays): string => {
  const d = new Date(ts);
  if (days <= 90) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

// Build step-line series from history snapshots for the chosen timeframe.
// Collapses all snapshots within the same calendar day into one point (last value of that day).
// The last snapshot before the window becomes the baseline at the window start,
// and the final known value is extended to the present so the line reaches today.
const buildSeries = (history: QuantitySnapshot[], days: TimeframeDays): SeriesPoint[] => {
  const now = Date.now();
  const cutoff = now - days * 24 * 60 * 60 * 1000;

  const baseline = [...history].filter((s) => new Date(s.recorded_at).getTime() < cutoff).at(-1);

  const inRange = history.filter((s) => new Date(s.recorded_at).getTime() >= cutoff);

  if (!baseline && inRange.length === 0) return [];

  // Group by YYYY-MM-DD, keeping the last snapshot of each day
  const dailyMap = new Map<string, { ts: number; quantity: number }>();
  inRange.forEach((s) => {
    const dayKey = s.recorded_at.slice(0, 10);
    dailyMap.set(dayKey, { ts: new Date(s.recorded_at).getTime(), quantity: s.quantity });
  });

  const points: SeriesPoint[] = [];

  if (baseline) {
    points.push({ ts: cutoff, value: baseline.quantity });
  }

  [...dailyMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([, { ts, quantity }]) => points.push({ ts, value: quantity }));

  // Extend the last known value to now so the step line reaches the present
  if (points.length > 0) {
    points.push({ ts: now, value: points[points.length - 1].value });
  }

  return points;
};

// Build step-line series representing the total quantity across ALL items.
// Collapses all events within the same calendar day into one point (end-of-day total).
const buildAggregateSeries = (
  history: ItemQuantitySnapshot[],
  days: TimeframeDays,
): SeriesPoint[] => {
  const now = Date.now();
  const cutoff = now - days * 24 * 60 * 60 * 1000;

  // Establish per-item baseline quantities from events before the window
  const baseline = new Map<number, number>();
  history
    .filter((s) => new Date(s.recorded_at).getTime() < cutoff)
    .forEach((s) => baseline.set(s.item_id, s.quantity));

  const inRange = history.filter((s) => new Date(s.recorded_at).getTime() >= cutoff);

  if (baseline.size === 0 && inRange.length === 0) return [];

  const points: SeriesPoint[] = [];
  const baselineTotal = [...baseline.values()].reduce((sum, q) => sum + q, 0);
  points.push({ ts: cutoff, value: baselineTotal });

  // Group events by YYYY-MM-DD
  const eventsByDay = new Map<string, ItemQuantitySnapshot[]>();
  inRange.forEach((s) => {
    const dayKey = s.recorded_at.slice(0, 10);
    if (!eventsByDay.has(dayKey)) eventsByDay.set(dayKey, []);
    eventsByDay.get(dayKey)!.push(s);
  });

  // Replay each day in order, updating running totals, emit one point per day
  const running = new Map(baseline);
  [...eventsByDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([, events]) => {
      events.forEach((s) => running.set(s.item_id, s.quantity));
      const total = [...running.values()].reduce((sum, q) => sum + q, 0);
      const lastTs = Math.max(...events.map((s) => new Date(s.recorded_at).getTime()));
      points.push({ ts: lastTs, value: total });
    });

  // Extend to present
  points.push({ ts: now, value: points[points.length - 1].value });

  return points;
};

export const ActivityChart: FC<ActivityChartProps> = ({ series, selectedItem }) => {
  const [chartData, setChartData] = useState<SeriesPoint[]>(series ?? []);
  const [loading, setLoading] = useState(!series);
  const [error, setError] = useState<string | null>(null);
  const [units, setUnits] = useState<string>('');
  const [timeframe, setTimeframe] = useState<TimeframeDays>(30);

  useEffect(() => {
    if (series && series.length > 0) {
      setChartData(series);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (selectedItem) {
          const [history, category] = await Promise.all([
            getItemHistory(selectedItem.itemID),
            getCategory(selectedItem.categoryID),
          ]);
          setUnits(category?.units ?? '');
          setChartData(buildSeries(history, timeframe));
        } else {
          // No item selected — show total inventory across all items
          setUnits('');
          const history = await getAllItemHistory();
          setChartData(buildAggregateSeries(history, timeframe));
        }
      } catch (err) {
        console.error('Error fetching item history:', err);
        setError('Failed to load activity data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [series, selectedItem, timeframe]);

  const timeframeSelector = (
    <ButtonGroup size="sm">
      {TIMEFRAMES.map(({ label, days }) => (
        <Button
          key={days}
          onClick={() => setTimeframe(days)}
          style={
            timeframe === days
              ? { backgroundColor: 'var(--qu-dark)', borderColor: 'var(--qu-dark)', color: '#fff' }
              : {
                  borderColor: 'var(--qu-dark)',
                  color: 'var(--qu-dark)',
                  backgroundColor: 'transparent',
                }
          }
        >
          {label}
        </Button>
      ))}
    </ButtonGroup>
  );

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

  if (chartData.length === 0) {
    return (
      <Card className="nested-item-card shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="nested-item-card-title mb-0">
              {selectedItem ? 'Quantity History' : 'Total Inventory'}
            </h5>
            {timeframeSelector}
          </div>
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: '300px' }}
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
              <p className="mb-0">No history available for this period.</p>
            </Alert>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="nested-item-card no-select shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="nested-item-card-title mb-0">
            {selectedItem ? 'Quantity History' : 'Total Inventory'}
          </h5>
          {timeframeSelector}
        </div>
        <ResponsiveContainer width="100%" aspect={1.618} maxHeight={400}>
          <LineChart data={chartData} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
            <CartesianGrid stroke={'var(--qu-light)'} strokeDasharray="5 5" opacity={0.4} />
            <XAxis
              dataKey="ts"
              type="number"
              scale="time"
              domain={['dataMin', 'dataMax']}
              tickCount={6}
              tickFormatter={(ts) => formatTick(ts, timeframe)}
              tick={{ fill: 'var(--qu-dark)', fontSize: 11 }}
              axisLine={{ stroke: 'var(--qu-dark)' }}
              tickLine={{ stroke: 'var(--qu-dark)' }}
            />
            <YAxis
              width={60}
              allowDecimals={false}
              label={{
                value: selectedItem && units.trim() ? `Units (${units})` : 'Quantity',
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
              labelFormatter={(ts: number) =>
                new Date(ts).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })
              }
              formatter={(value: number) => [
                `${value}${selectedItem && units ? ' ' + units : ''}`,
                selectedItem ? 'Quantity' : 'Total Quantity',
              ]}
            />
            <Line
              type="stepAfter"
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
