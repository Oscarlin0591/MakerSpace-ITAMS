/**
 * StockLevelsCard.tsx
 * An interactive bar chart that displays general inventory
 * data and provides more detailed inventory information upon
 * clicking individual bars
 */

import { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
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
import { Alert, Card, Col, Row, Spinner } from 'react-bootstrap';
import { Download } from 'react-bootstrap-icons';
import { getItems } from '../service/item_service';
import { getCategories } from '../service/category';
import type { Category, InventoryItem } from '../types';
import { API_BASE_URL } from '../types';
import ExportDataModal from '../components/ExportDataModal';
import { type BackendTransaction, getTransactions } from '../service/transaction_service.ts';

type ChartData = {
  name: string;
  total: number;
  lowThreshold: number;
  units: string;
  tooltipInfo?: ChartData[];
};

// Aggregates raw items + categories into the shape recharts expects.
// Extracted so both the initial fetch and the SSE rebuild can call the same logic.
function buildChartData(items: InventoryItem[], categories: Category[]): ChartData[] {
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

export default function StockLevelsCard() {
  const [cookies] = useCookies(['token']);

  const [data, setData] = useState<ChartData[]>([]);
  // rawItems / rawCategories are kept so the SSE rebuild effect can recompute
  // the aggregated chart data without a full re-fetch on every inventory change.
  const [rawItems, setRawItems] = useState<InventoryItem[]>([]);
  const [rawCategories, setRawCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [transactions, setTransactions] = useState<BackendTransaction[]>([]);

  // Initial data load + SSE connection for live inventory_item changes.
  // Re-runs only when the session token changes (login / logout).
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchData() {
      try {
        const [items, categories] = await Promise.all([getItems(), getCategories()]);
        if (!cancelled) {
          // Store raw data so the rebuild effect can recompute on SSE updates
          setRawItems(items);
          setRawCategories(categories);
        }
      } catch (err) {
        if (!cancelled) setError(String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    getTransactions().then((txns) => { if (!cancelled) setTransactions(txns); });

    // Open SSE stream for live inventory updates.
    // EventSource cannot send custom headers, so the JWT is a query param.
    const token = cookies.token as string | undefined;
    let eventSource: EventSource | null = null;

    if (token) {
      eventSource = new EventSource(
        `${API_BASE_URL}/events?token=${encodeURIComponent(token)}`,
      );

      // An inventory_item INSERT/UPDATE/DELETE means bar heights may have changed.
      // Re-fetching items is simpler than mapping raw DB column names from the
      // SSE payload onto the aggregated ChartData structure.
      eventSource.addEventListener('inventory_change', async () => {
        try {
          const items = await getItems();
          if (!cancelled) setRawItems(items);
        } catch (err) {
          console.error('SSE inventory refresh failed:', err);
        }
      });

      eventSource.onerror = (err) => {
        console.error('SSE stream error:', err);
      };
    }

    return () => {
      cancelled = true;
      eventSource?.close();
    };
  }, [cookies.token]);

  // Rebuild chart data whenever raw items or categories change.
  // This fires on both the initial fetch and every SSE-triggered items refresh.
  useEffect(() => {
    if (rawCategories.length === 0) return;
    setData(buildChartData(rawItems, rawCategories));
  }, [rawItems, rawCategories]);

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
          backgroundColor: 'var(--app-bg)',
          border: '1px solid var(--qu-dark)',
          borderRadius: 6,
          padding: '8px 12px',
          color: 'var(--qu-dark)',
        }}
      >
        <p style={{ fontWeight: 700, marginBottom: 4 }}>{label}</p>
        {detailedItems && detailedItems.length > 0 ? (
          <ul className="list-unstyled mb-0">
            {detailedItems.map((item, index) => (
              <li key={index}>
                <span style={{ color: 'var(--qu-dark)', opacity: 0.7 }}>{item.name}:</span>
                <span
                  className="ms-2"
                  style={{
                    fontWeight: 600,
                    color: item.total < item.lowThreshold ? '#dc3545' : 'var(--qu-dark)',
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
    <Card className="h-100 no-select">
      <Card.Header className=" d-flex align-items-center">
        <Row className="align-items-center w-100 m-0">
          <Col className="p-0">
            <h5 className="m-0">Stock Levels</h5>
          </Col>
          <Col className="text-end p-0">
            <Download
              size={28}
              className="btn-card-header clickable"
              onClick={() => setShowExport(true)}
              title="Export"
            />
          </Col>
        </Row>
      </Card.Header>
      <Card.Body>
        <div className="d-flex justify-content-center align-items-center h-100">
          {loading && <Spinner animation="border" style={{ color: 'var(--qu-dark)' }} />}

          {error && (
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
          )}

          {!loading && !error && (
            <ResponsiveContainer width="100%" aspect={1.618} maxHeight={500}>
              <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={'var(--qu-light)'} opacity={0.4} />
                <XAxis
                  dataKey="name"
                  cursor="pointer"
                  tick={{ fill: 'var(--qu-dark)', fontSize: 12 }}
                  axisLine={{ stroke: 'var(--qu-dark)' }}
                  tickLine={{ stroke: 'var(--qu-dark)' }}
                />
                <YAxis
                  width={60}
                  label={{
                    value: 'Units',
                    angle: -90,
                    position: 'insideLeft',
                    offset: 10,
                    style: {
                      fill: 'var(--qu-dark)',
                      fontSize: 14,
                      fontWeight: 700,
                      textAnchor: 'middle',
                    },
                  }}
                  tick={{ fill: 'var(--qu-dark)', fontSize: 12 }}
                  axisLine={{ stroke: 'var(--qu-dark)' }}
                  tickLine={{ stroke: 'var(--qu-dark)' }}
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
                <Bar
                  dataKey="total"
                  fill={'var(--qu-dark)'}
                  radius={[3, 3, 0, 0]}
                  cursor="pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card.Body>

      <ExportDataModal
        show={showExport}
        data={transactions}
        onClose={() => setShowExport(false)}
      />
    </Card>
  );
}
