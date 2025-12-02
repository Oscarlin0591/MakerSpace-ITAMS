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

  const fakeChartData: ChartData[] = [
    {
      name: 'Filament',
      total: 60,
      lowThreshold: 20,
      units: 'kg',
      tooltipInfo: [
        { name: 'Makerbot ABS', total: 5, lowThreshold: 6, units: 'kg' },
        { name: 'Makerbot PLA', total: 3, lowThreshold: 0, units: 'kg' },
        { name: 'Bambu PETG', total: 4, lowThreshold: 1, units: 'kg' },
        { name: 'Bambu ABS', total: 2, lowThreshold: 3, units: 'kg' },
      ],
    },
    {
      name: 'Vinyl',
      total: 10,
      lowThreshold: 20,
      units: 'meters',
      tooltipInfo: [
        { name: 'Vynyl White', total: 14, lowThreshold: 3, units: 'rolls' },
        { name: 'Vynyl Black', total: 9, lowThreshold: 2, units: 'rolls' },
        { name: 'Vynyl Red', total: 6, lowThreshold: 2, units: 'rolls' },
        { name: 'Vynyl Gold', total: 1, lowThreshold: 2, units: 'rolls' },
      ],
    },
    {
      name: 'Wood',
      total: 20,
      lowThreshold: 8,
      units: 'pcs',
      tooltipInfo: [
        { name: 'Birch', total: 12, lowThreshold: 4, units: 'pcs' },
        { name: 'Basswood', total: 20, lowThreshold: 25, units: 'pcs' },
        { name: 'Walnut', total: 3, lowThreshold: 1, units: 'pcs' },
      ],
    },
  ];

  // Fetch data
  useEffect(() => {
    setLoading(true);
    setError(null);

    setData(fakeChartData);
    setLoading(false);
  }, []);

  // Loading spinner
  if (loading) return <Spinner animation="border" />;

  // Error alert
  if (error) return <Alert variant="danger">Error: {error}</Alert>;

  // Custom tooltips for barchart hover
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
      <div className="bg-white border rounded p-2">
        <p className="fw-bold mb-0">{`${label}`}</p>
        {detailedItems && detailedItems.length > 0 ? (
          <ul className="list-unstyled mb-0">
            {detailedItems.map((item, index) => (
              <li key={index}>
                <span className="text-secondary">{item.name}:</span>
                <span
                  className={`ms-2 ${
                    item.total < item.lowThreshold ? 'text-danger' : 'text-success'
                  }`}
                >
                  {item.total} {item.units}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted small">No detailed items available</p>
        )}
      </div>
    );
  };

  return (
    <>
      <ResponsiveContainer width="100%" aspect={1.618} maxHeight={500}>
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 0,
            left: 0,
            bottom: 0,
          }}
        >
          <XAxis dataKey="name" />
          <YAxis />
          <CartesianGrid strokeDasharray={'3 3'} />
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
          <Bar dataKey="total" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
}

export default StockLevelsChart;
