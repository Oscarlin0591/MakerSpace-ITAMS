/**
 * Dashboard.tsx
 * Home page used to display inventory data and analytics
 */
import StockLevelsChart from '../features/StockLevelsChart';
import { ActivityChart } from '../features/StorageActivityChart';
import { Container, Row, Col } from 'react-bootstrap';

export function Dashboard() {
  return (
    <Container fluid className="my-4">
      <Row className="g-4">
        <Col lg={6} md={12}>
          <ActivityChart />
        </Col>
        <Col lg={6} md={12}>
          <StockLevelsChart />
        </Col>
      </Row>
    </Container>
  );
}
