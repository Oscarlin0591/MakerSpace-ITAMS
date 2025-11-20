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
} from 'recharts';
import type { Item } from '../types/index.ts';
import { Alert, Container, Spinner } from 'react-bootstrap';

type ChartData = {
  name: string;
  total: number;
  lowThreshold: number;
  units: string;
};

function StockLevelsChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data
  useEffect(() => {
    setLoading(true);
    setError(null);

    /**
     * TODO: async function?
     * Here's some fake data in the interim
     */
    const fakeChartData: ChartData[] = [
      {
        name: 'Filament',
        total: 60,
        lowThreshold: 20,
        units: 'meters',
      },
      {
        name: 'Vinyl',
        total: 10,
        lowThreshold: 20,
        units: 'meters',
      },
      {
        name: 'Wood',
        total: 20,
        lowThreshold: 8,
        units: 'pcs',
      },
    ];

    setData(fakeChartData); //TODO: set chart data with http response
    setLoading(false);
  }, []);

  // Loading spinner
  if (loading) return <Spinner animation="border" />;

  // Error alert
  if (error) return <Alert variant="danger">Error: {error}</Alert>;

  return (
    <>
      <h1>Stock Levels</h1>
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
          <Bar dataKey="total" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
}

export default StockLevelsChart;
