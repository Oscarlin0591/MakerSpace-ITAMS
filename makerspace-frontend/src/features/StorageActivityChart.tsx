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
import { getItemHistory, getAllItemHistory, type QuantitySnapshot, type ItemQuantitySnapshot } from '../service/item_service';
import type { InventoryItem } from '../types/index';
import { getCategory } from '../service/category';

type SeriesPoint = { ts: number; value: number };

type ActivityChartProps = {
  series?: SeriesPoint[];
  selectedItem: InventoryItem | null;
};

const TIMEFRAMES = [
  { label: '7D',  days: 7   },
  { label: '30D', days: 30  },
  { label: '90D', days: 90  },
  { label: '1Y',  days: 365 },
] as const;

type TimeframeDays = (typeof TIMEFRAMES)[number]['days'];

const formatTick = (ts: number, days: TimeframeDays): string => {
  const d = new Date(ts);
  if (days <= 90) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

// Iterates every UTC calendar day from startDayKey (YYYY-MM-DD) through today inclusive.
function eachDay(startDayKey: string, callback: (dayKey: string, ts: number) => void) {
  const iter = new Date(startDayKey + 'T00:00:00Z');
  const todayKey = new Date().toISOString().slice(0, 10);
  while (true) {
    const dayKey = iter.toISOString().slice(0, 10);
    callback(dayKey, iter.getTime());
    if (dayKey === todayKey) break;
    iter.setUTCDate(iter.getUTCDate() + 1);
  }
}

// Build series for a single item.
// Emits one point per calendar day; days with no transaction carry the last known quantity.
const buildSeries = (history: QuantitySnapshot[], days: TimeframeDays): SeriesPoint[] => {
  const now = Date.now();
  const cutoff = now - days * 24 * 60 * 60 * 1000;

  const baseline = [...history]
    .filter((s) => new Date(s.recorded_at).getTime() < cutoff)
    .at(-1);

  const inRange = history.filter((s) => new Date(s.recorded_at).getTime() >= cutoff);

  if (!baseline && inRange.length === 0) return [];

  // Last value per day within the window
  const dailyMap = new Map<string, number>();
  inRange.forEach((s) => {
    dailyMap.set(s.recorded_at.slice(0, 10), s.quantity);
  });

  // Start from the cutoff day if we have a baseline; otherwise from the first data day
  const startDay = baseline
    ? new Date(cutoff).toISOString().slice(0, 10)
    : inRange[0].recorded_at.slice(0, 10);

  let carry = baseline?.quantity ?? dailyMap.get(startDay) ?? 0;
  const points: SeriesPoint[] = [];

  eachDay(startDay, (dayKey, ts) => {
    if (dailyMap.has(dayKey)) carry = dailyMap.get(dayKey)!;
    points.push({ ts, value: carry });
  });

  return points;
};

// Build series for total inventory across ALL items.
// Emits one point per calendar day; days with no transactions carry running totals forward.
const buildAggregateSeries = (history: ItemQuantitySnapshot[], days: TimeframeDays): SeriesPoint[] => {
  const now = Date.now();
  const cutoff = now - days * 24 * 60 * 60 * 1000;

  // Per-item quantities before the window
  const baseline = new Map<number, number>();
  history
    .filter((s) => new Date(s.recorded_at).getTime() < cutoff)
    .forEach((s) => baseline.set(s.item_id, s.quantity));

  const inRange = history.filter((s) => new Date(s.recorded_at).getTime() >= cutoff);

  if (baseline.size === 0 && inRange.length === 0) return [];

  // Group in-range events by day
  const eventsByDay = new Map<string, ItemQuantitySnapshot[]>();
  inRange.forEach((s) => {
    const dayKey = s.recorded_at.slice(0, 10);
    if (!eventsByDay.has(dayKey)) eventsByDay.set(dayKey, []);
    eventsByDay.get(dayKey)!.push(s);
  });

  const startDay = baseline.size > 0
    ? new Date(cutoff).toISOString().slice(0, 10)
    : inRange[0].recorded_at.slice(0, 10);

  const running = new Map(baseline);
  const points: SeriesPoint[] = [];

  eachDay(startDay, (dayKey, ts) => {
    eventsByDay.get(dayKey)?.forEach((s) => running.set(s.item_id, s.quantity));
    const total = [...running.values()].reduce((sum, q) => sum + q, 0);
    points.push({ ts, value: total });
  });

  return points;
};

export const ActivityChart: FC<ActivityChartProps> = ({ series, selectedItem }) => {
  const [chartData, setChartData] = useState<SeriesPoint[]>(series ?? []);
  const [loading, setLoading] = useState(!series);
  const [error, setError] = useState<string | null>(null);
  const [units, setUnits] = useState<string>('');
  const [timeframe, setTimeframe] = useState<TimeframeDays>(30);

  // Full unfiltered history cached here — re-fetched only when selectedItem changes,
  // not on every timeframe button click.
  const [rawHistory, setRawHistory] = useState<QuantitySnapshot[] | ItemQuantitySnapshot[] | null>(null);

  // Fetch full history whenever the selected item changes
  useEffect(() => {
    if (series && series.length > 0) {
      setChartData(series);
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        if (selectedItem) {
          const [history, category] = await Promise.all([
            getItemHistory(selectedItem.itemID),
            getCategory(selectedItem.categoryID),
          ]);
          setUnits(category?.units ?? '');
          setRawHistory(history);
        } else {
          setUnits('');
          const history = await getAllItemHistory();
          setRawHistory(history);
        }
      } catch (err) {
        console.error('Error fetching item history:', err);
        setError('Failed to load activity data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [series, selectedItem]);

  // Rebuild chart points whenever history or timeframe changes — no extra fetch needed
  useEffect(() => {
    if (!rawHistory) return;
    if (selectedItem) {
      setChartData(buildSeries(rawHistory as QuantitySnapshot[], timeframe));
    } else {
      setChartData(buildAggregateSeries(rawHistory as ItemQuantitySnapshot[], timeframe));
    }
  }, [rawHistory, timeframe, selectedItem]);

  const timeframeSelector = (
    <ButtonGroup size="sm">
      {TIMEFRAMES.map(({ label, days }) => (
        <Button
          key={days}
          onClick={() => setTimeframe(days)}
          style={
            timeframe === days
              ? { backgroundColor: 'var(--qu-dark)', borderColor: 'var(--qu-dark)', color: '#fff' }
              : { borderColor: 'var(--qu-dark)', color: 'var(--qu-dark)', backgroundColor: 'transparent' }
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
            style={{ borderColor: 'var(--qu-dark)', color: 'var(--qu-dark)', maxWidth: 400, textAlign: 'center' }}
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
              style={{ borderColor: 'var(--qu-light)', color: 'var(--qu-dark)', maxWidth: 400, textAlign: 'center' }}
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
              domain={[Date.now() - timeframe * 24 * 60 * 60 * 1000, Date.now()]}
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
              type="linear"
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
