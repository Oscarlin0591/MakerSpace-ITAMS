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
import type { InventoryItem } from '../types/index.ts';
import { Alert, Spinner } from 'react-bootstrap';
import { ItemDetailModal } from '../components/ItemDetailModal';
import { getItems } from '../service/item_service';
import { getCategories } from '../service/category';

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
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string>('');

  const handleItemClick = (itemName: string) => {
    setSelectedItem(itemName);
    setShowModal(true);
  };

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch items and categories from backend
        const items = await getItems();
        const categories = await getCategories();

        // Create a map of category ID to category name and units
        const categoryMap = new Map<number, { name: string; units: string }>();
        categories.forEach((cat) => {
          categoryMap.set(cat.categoryID, { name: cat.categoryName, units: cat.units });
        });

        // Group items by category
        const groupedByCategory = new Map<string, { total: number; lowThreshold: number; units: string; items: InventoryItem[] }>();

        items.forEach((item: InventoryItem) => {
          const categoryInfo = categoryMap.get(item.categoryID);
          if (!categoryInfo) return;

          const categoryName = categoryInfo.name;
          if (!groupedByCategory.has(categoryName)) {
            groupedByCategory.set(categoryName, {
              total: 0,
              lowThreshold: 0,
              units: categoryInfo.units,
              items: [],
            });
          }

          const catData = groupedByCategory.get(categoryName)!;
          catData.total += item.quantity;
          catData.lowThreshold += item.lowThreshold;
          catData.items.push(item);
        });

        // Convert to chart data format
        const chartData: ChartData[] = Array.from(groupedByCategory.entries()).map(([categoryName, data]) => ({
          name: categoryName,
          total: data.total,
          lowThreshold: data.lowThreshold,
          units: data.units,
          tooltipInfo: data.items.map((item) => ({
            name: item.itemName,
            total: item.quantity,
            lowThreshold: item.lowThreshold,
            units: data.units,
          })),
        }));

        setData(chartData);
      } catch (err) {
        console.error('Error fetching chart data:', err);
        setError('Failed to load stock levels');
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
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
          <XAxis dataKey="name" cursor="pointer" onClick={(e) => {
            if (e && e.payload && e.payload.name) {
              handleItemClick(e.payload.name);
            }
          }} />
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

      <ItemDetailModal
        show={showModal}
        itemName={selectedItem}
        variants={[]}
        onHide={() => setShowModal(false)}
      />
    </>
  );
}

export default StockLevelsChart;
