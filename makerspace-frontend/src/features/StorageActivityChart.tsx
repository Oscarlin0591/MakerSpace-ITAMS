import { CartesianGrid, Line, LineChart, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Spinner, Alert } from 'react-bootstrap';
import { getTransactions, type BackendTransaction } from '../service/transaction_service';

type SeriesPoint = { name: string; value: number; date?: string };

type ActivityChartProps = {
  series?: SeriesPoint[];
  timeframeInDays?: number;
};

export const ActivityChart: FC<ActivityChartProps> = ({ series, timeframeInDays = 30 }) => {
  const [chartData, setChartData] = useState<SeriesPoint[]>(series || []);
  const [loading, setLoading] = useState(!series);
  const [error, setError] = useState<string | null>(null);

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

        if (!transactions || transactions.length === 0) {
          // Use default data if no transactions
          setChartData([
            { name: 'Monday', value: 400 },
            { name: 'Tuesday', value: 300 },
            { name: 'Wednesday', value: 300 },
            { name: 'Thursday', value: 200 },
            { name: 'Friday', value: 278 },
            { name: 'Saturday', value: 189 },
          ]);
          return;
        }

        // Aggregate transactions by day
        const now = new Date();
        const cutoffDate = new Date(now.getTime() - timeframeInDays * 24 * 60 * 60 * 1000);

        const dailyActivity = new Map<string, number>();

        transactions.forEach((trans: BackendTransaction) => {
          const transDate = new Date(trans.timestamp);
          if (transDate >= cutoffDate) {
            const dateKey = transDate.toISOString().split('T')[0];
            dailyActivity.set(dateKey, (dailyActivity.get(dateKey) || 0) + 1);
          }
        });

        // Convert to chart format
        const activityData: SeriesPoint[] = Array.from(dailyActivity.entries())
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([date, count]) => ({
            name: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: count,
            date,
          }));

        if (activityData.length === 0) {
          setChartData([
            { name: 'Monday', value: 400 },
            { name: 'Tuesday', value: 300 },
            { name: 'Wednesday', value: 300 },
            { name: 'Thursday', value: 200 },
            { name: 'Friday', value: 278 },
            { name: 'Saturday', value: 189 },
          ]);
        } else {
          setChartData(activityData);
        }
      } catch (err) {
        console.error('Error fetching activity data:', err);
        setError('Failed to load activity chart');
        // Fall back to default data
        setChartData([
          { name: 'Monday', value: 400 },
          { name: 'Tuesday', value: 300 },
          { name: 'Wednesday', value: 300 },
          { name: 'Thursday', value: 200 },
          { name: 'Friday', value: 278 },
          { name: 'Saturday', value: 189 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivityData();
  }, [series, timeframeInDays]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) {
    return <Alert variant="warning">{error} - Showing default data</Alert>;
  }

  return (
    <ResponsiveContainer width="100%" aspect={1.618} maxHeight={400}>
      <LineChart data={chartData}>
        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
        <XAxis dataKey="name" />
        <YAxis width="auto" />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
};
