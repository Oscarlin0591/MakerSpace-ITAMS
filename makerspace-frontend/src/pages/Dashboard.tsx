/**
 * Dashboard.tsx
 * Home page used to display inventory data and analytics
 */
import { useEffect } from 'react';
import StockLevelsCard from '../features/StockLevelsCard';
import SelectItemCard from '../features/SelectItemCard';
import { Container, Row, Col } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getItems } from '../service/item_service';

export function Dashboard() {
  useEffect(() => {
    getItems().then((items) => {
      items
        .filter((item) => item.quantity < item.lowThreshold)
        .forEach((item) => {
          toast.warn(
            `Low stock: "${item.itemName}" is at ${item.quantity} (threshold: ${item.lowThreshold})`,
            { toastId: `low-stock-${item.itemID}` },
          );
        });
    });
  }, []);

  return (
    <Container fluid className="my-4">
      <ToastContainer position="top-right" autoClose={5000} newestOnTop={false} theme='colored'/>
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
