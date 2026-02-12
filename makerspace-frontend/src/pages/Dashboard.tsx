/**
 * Dashboard.tsx
 * Home page used to display inventory data and analytics
 */
import StockLevelsChart from '../features/StockLevelsChart';
import SelectItemCard from '../components/SelectItemCard';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import ExportDataModal from '../components/ExportDataModal';
import { useEffect, useMemo, useState } from 'react';
import { type InventoryItem } from '../types';
import { getItems } from '../service/item_service';

export function Dashboard() {
  // const [selected, setSelected] = useState<InventoryItem | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [inventory, setInventory] = useState<Array<InventoryItem>>([]);

  useEffect(() => {
    getItems()
      .then((result) => {
        console.log('Items result:', result);
        // Ensure result is an array
        if (Array.isArray(result)) {
          setInventory(result);
        } else {
          console.error('Expected array, got:', typeof result);
          setInventory([]);
        }
      })
      .catch((error) => {
        console.error('Failed to fetch items:', error);
        setInventory([]);
      });
  }, []);

  const csvData = useMemo(
    () => [
      ['Item Id', 'Category Id', 'Item Name', 'Quantity', 'Threshold', 'Color'],
      ...(Array.isArray(inventory)
        ? inventory.map((item) => [
            `${item.itemID}`,
            `${item.categoryID}`,
            item.itemName,
            `${item.quantity}`,
            `${item.lowThreshold}`,
            item.color,
          ])
        : []),
    ],
    [inventory],
  );

  return (
    <Container fluid className="my-4">
      <Row className="h-100">
        <Col md={4} sm={12}>
          <SelectItemCard />
        </Col>
        <Col md={8} sm={12}>
          <Card>
            <Card.Header className="card-header d-flex align-items-center">
              <Row className="align-items-center w-100 m-0">
                <Col className="p-0">
                  <h6 className="m-0">Stock Levels</h6>
                </Col>
                <Col className="text-end p-0">
                  <Button
                    variant="primary"
                    onClick={() => {
                      setShowExport(true);
                    }}
                  >
                    Export
                  </Button>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body>
              <StockLevelsChart />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <ExportDataModal
        show={showExport}
        onCancel={() => setShowExport(false)}
        onExport={(dateRange, rangeType) => {
          console.log('Export requested for inventory', { dateRange, rangeType });
          setShowExport(false);
        }}
        csvData={csvData}
      />
    </Container>
  );
}
