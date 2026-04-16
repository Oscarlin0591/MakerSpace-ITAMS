/**
 * Dashboard.tsx
 * Home page used to display inventory data and analytics
 */
import { useEffect } from 'react';
import StockLevelsCard from '../features/StockLevelsCard';
import SelectItemCard from '../features/SelectItemCard';
import { Container, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { getItems } from '../service/item_service';
import { useNotifications } from '../contexts/notifications';

export function Dashboard() {
  const { syncNotifications } = useNotifications();

  useEffect(() => {
    getItems().then((items) => {
      const toToast = syncNotifications(items);
      toToast.forEach((item) => {
        toast.warn(
          `Low stock: "${item.itemName}" is at ${item.quantity} (threshold: ${item.lowThreshold})`,
          { toastId: `low-stock-${item.itemID}` },
        );
      });
    });
  }, [syncNotifications]);

  return (
    <Container fluid className="my-4">
      <Row className="h-100">
        <Col md={4} sm={12} className="mb-3 mb-md-0 item-detail-card">
          <SelectItemCard />
        </Col>
        <Col md={8} sm={12} className="mb-5 mb-md-0">
          <StockLevelsCard />
        </Col>
      </Row>
    </Container>
  );
}
