/**
 * Dashboard.tsx
 * Home page used to display inventory data and analytics
 */
import StockLevelsCard from '../features/StockLevelsCard';
import SelectItemCard from '../features/SelectItemCard';
import { Container, Row, Col } from 'react-bootstrap';

export function Dashboard() {

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
