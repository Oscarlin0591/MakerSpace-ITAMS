import { useParams, Link } from 'react-router-dom';
import { Container, Card, Button } from 'react-bootstrap';
import './ItemDetailsPage.css';

type ItemDetail = {
  id: string;
  name: string;
  description: string;
  total: number;
  lowThreshold: number;
  units: string;
  category: string;
  supplier: string;
  lastRestocked: string;
  location: string;
};

// Fake data for all items
const FAKE_ITEMS_DATA: { [key: string]: ItemDetail } = {
  filament: {
    id: 'filament',
    name: 'Filament',
    description: 'High-quality 3D printer filament for general use',
    total: 60,
    lowThreshold: 20,
    units: 'meters',
    category: 'Printing Materials',
    supplier: 'MakerMart Supplies',
    lastRestocked: '2025-11-25',
    location: 'Storage Unit 3',
  },
  vinyl: {
    id: 'vinyl',
    name: 'Vinyl',
    description: 'Premium vinyl sheets for cutting and design',
    total: 10,
    lowThreshold: 20,
    units: 'meters',
    category: 'Materials',
    supplier: 'CutMaster Inc',
    lastRestocked: '2025-11-20',
    location: 'Storage Unit 1',
  },
  wood: {
    id: 'wood',
    name: 'Wood',
    description: 'Assorted wood pieces for crafting and building',
    total: 20,
    lowThreshold: 8,
    units: 'pcs',
    category: 'Wood',
    supplier: 'Timber Works',
    lastRestocked: '2025-11-28',
    location: 'Storage Unit 2',
  },
  'abs-filament': {
    id: 'abs-filament',
    name: 'ABS Filament',
    description: 'Advanced ABS material for durable prints',
    total: 30,
    lowThreshold: 20,
    units: 'meters',
    category: 'Printing Materials',
    supplier: 'MakerMart Supplies',
    lastRestocked: '2025-11-26',
    location: 'Storage Unit 3',
  },
  'pla-filament': {
    id: 'pla-filament',
    name: 'PLA Filament',
    description: 'Eco-friendly PLA filament for biodegradable prints',
    total: 15,
    lowThreshold: 20,
    units: 'meters',
    category: 'Printing Materials',
    supplier: 'Eco Print Co',
    lastRestocked: '2025-11-24',
    location: 'Storage Unit 3',
  },
  'sbu-filament': {
    id: 'sbu-filament',
    name: 'SBU Filament',
    description: 'Specialty SBU material for specialized applications',
    total: 15,
    lowThreshold: 8,
    units: 'meters',
    category: 'Printing Materials',
    supplier: 'Specialty Materials Ltd',
    lastRestocked: '2025-11-22',
    location: 'Storage Unit 4',
  },
};

export function ItemDetailsPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const item = itemId ? FAKE_ITEMS_DATA[itemId.toLowerCase()] : null;

  if (!item) {
    return (
      <Container fluid className="item-details-container mt-5">
        <h2>Item Not Found</h2>
        <p>The item you're looking for doesn't exist.</p>
        <Link to="/home">
          <Button variant="primary">Back to Dashboard</Button>
        </Link>
      </Container>
    );
  }

  const isLow = item.total < item.lowThreshold;

  return (
    <Container fluid className="item-details-container mt-5">
      <Link to="/home" className="back-link">
        ← Back to Dashboard
      </Link>

      <Card className="item-details-card mt-4">
        <Card.Header className="item-details-header">
          <h1>{item.name}</h1>
          <span className={`stock-badge ${isLow ? 'low' : 'normal'}`}>
            {isLow ? 'Low Stock' : 'In Stock'}
          </span>
        </Card.Header>

        <Card.Body className="item-details-body">
          <div className="detail-section">
            <h3>Description</h3>
            <p>{item.description}</p>
          </div>

          <div className="detail-grid">
            <div className="detail-item">
              <h4>Current Stock</h4>
              <p className="detail-value">
                {item.total} {item.units}
              </p>
            </div>

            <div className="detail-item">
              <h4>Low Threshold</h4>
              <p className="detail-value">
                {item.lowThreshold} {item.units}
              </p>
            </div>

            <div className="detail-item">
              <h4>Category</h4>
              <p className="detail-value">{item.category}</p>
            </div>

            <div className="detail-item">
              <h4>Supplier</h4>
              <p className="detail-value">{item.supplier}</p>
            </div>

            <div className="detail-item">
              <h4>Last Restocked</h4>
              <p className="detail-value">{item.lastRestocked}</p>
            </div>

            <div className="detail-item">
              <h4>Location</h4>
              <p className="detail-value">{item.location}</p>
            </div>
          </div>

          <div className="detail-section mt-4">
            <h3>Quick Actions</h3>
            <div className="button-group">
              <Button variant="warning" className="me-2">
                Edit Item
              </Button>
              <Button variant="info" className="me-2">
                Restock
              </Button>
              <Button variant="danger">
                Remove from Stock
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
