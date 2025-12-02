/**
 * Dashboard.tsx
 * Home page used to display inventory data and analytics
 */
import StockLevelsChart from '../features/StockLevelsChart';
import { ActivityChart } from '../features/StorageActivityChart';
import { Container, Row, Col, Card } from 'react-bootstrap';

export function Dashboard() {
  return (
    <Container fluid className="my-4">
      <Row className="h-100">
        <Col md={4} sm={12}>
          <Card className="mb-4">
            <Card.Header className="card-header d-flex align-items-center">
              <Row className="align-items-center w-100 m-0">
                <Col className="p-0">
                  <h6 className="m-0">Select Item</h6>
                </Col>
                <Col className="text-end p-0"></Col>
              </Row>
            </Card.Header>
            <Card.Body>
              {/* This will be an item selection box */}
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi tempora beatae
                architecto corrupti necessitatibus similique provident accusantium debitis, iste in,
                aut eum cumque ratione! Culpa odit omnis sit magnam doloremque!
              </p>
            </Card.Body>
          </Card>
          <Card>
            <Card.Header className="card-header d-flex align-items-center">
              <Row className="align-items-center w-100 m-0">
                <Col className="p-0">
                  <h6 className="m-0">Activity</h6>
                </Col>
                <Col className="text-end p-0"></Col>
              </Row>
            </Card.Header>
            <Card.Body>
              <ActivityChart />
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
                <Col className="text-end p-0"></Col>
              </Row>
            </Card.Header>
            <Card.Body>
              <StockLevelsChart />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
