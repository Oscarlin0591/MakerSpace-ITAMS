/**
 * Dashboard.tsx
 * Home page used to display inventory data and analytics
 */
import StockLevelsChart from '../features/StockLevelsChart';
import SelectItemCard from '../features/SelectItem';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import ExportDataModal from '../components/ExportDataModal';
import { useEffect, useState } from 'react';
import { type InventoryItem } from '../types';
import { getItems } from '../service/item_service';
import { ActivityChart } from '../features/StorageActivityChart';
import { type BackendTransaction, getTransactions } from '../service/transaction_service.ts';

export function Dashboard() {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [inventory, setInventory] = useState<Array<InventoryItem>>([]);
  const [transactions, setTransactions] = useState<BackendTransaction[]>([]);

  useEffect(() => {
    getItems()
      .then((result) => {
        // Ensure result is an array
        if (Array.isArray(result)) {
          setInventory(result);
        } else {
          // console.error('Expected array, got:', typeof result);
          setInventory([]);
        }
      })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .catch((_err) => {
        setInventory([]);
      });
    getTransactions().then((data) => setTransactions(data));
  }, []);

  return (
    <Container fluid className="my-4">
      <Row className="h-100">
        <Col md={4} sm={12}>
          <SelectItemCard onItemSelect={(item) => setSelectedItem(item)} />
          <Card>
            <Card.Header className="card-header d-flex align-items-center">
              <h6 className="m-0">{`Activity ${selectedItem ? ` - ${selectedItem.itemName}` : ''}`}</h6>
            </Card.Header>
            <Card.Body>
              <ActivityChart selectedItem={selectedItem} />
            </Card.Body>
          </Card>
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
                    variant="warning"
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
        data={transactions}
        onClose={() => setShowExport(false)}
      />
    </Container>
  );
}
