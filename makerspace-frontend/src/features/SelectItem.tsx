/**
 * SelectItem.tsx
 * Search menu with autocomplete options. Selecting an item displays
 * detailed information and updates the StorageActivityChart.tsx
 */

import { useMemo, useState, useEffect } from 'react';
import { Badge, Card, Col, Form, Row, Spinner } from 'react-bootstrap';
import { getItems } from '../service/item_service';
import type { InventoryItem } from '../types/index';

const COLORS = {
  bg: '#f8f9fa',
  gold: '#ffb81c',
  light: '#4db3ff',
  dark: '#000b65',
};

type SelectItemCardProps = {
  onItemSelect?: (item: InventoryItem) => void;
};

export default function SelectItemCard({ onItemSelect }: SelectItemCardProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch items from backend on component mount
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const fetchedItems = await getItems();
        setItems(fetchedItems);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_err) {
        setError('Failed to load items');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  // Find item matching the search term
  const selectedItem = useMemo(() => {
    const found = items.find((item) => item.itemName === searchTerm);
    if (found && onItemSelect) onItemSelect(found);
    return found || null;
  }, [searchTerm, items, onItemSelect]);

  if (loading)
    return (
      <Card className="border-0 shadow-sm">
        <Card.Body className="d-flex justify-content-center py-5">
          <Spinner animation="border" />
        </Card.Body>
      </Card>
    );

  return (
    <Card className="mb-4">
      <Card.Header className="card-header d-flex align-items-center">
        <h6 className="m-0">Search Inventory</h6>
      </Card.Header>
      <Card.Body>
        {error && <div className="alert alert-danger">{error}</div>}

        <Form.Group className="mb-4">
          <Form.Control
            type="text"
            list="inventory-options"
            placeholder="Type tool or material name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ borderColor: COLORS.dark }}
          />
          <datalist id="inventory-options">
            {items.map((item) => (
              <option key={item.itemID} value={item.itemName} />
            ))}
          </datalist>
        </Form.Group>

        {/* Conditional: Only shows if exactly one item matches the search string */}
        {selectedItem && (
          <Card
            className="border-0 shadow-sm"
            style={{ backgroundColor: '#fdfdfd', borderLeft: `4px solid ${COLORS.dark}` }}
          >
            <Card.Body>
              <Row className="align-items-center">
                <Col>
                  <h5 style={{ fontWeight: 700, marginBottom: '2px' }}>{selectedItem.itemName}</h5>
                  <small className="text-muted">ID: {selectedItem.itemID}</small>
                </Col>
                <Col xs="auto">
                  <Badge
                    bg={selectedItem.quantity < selectedItem.lowThreshold ? 'danger' : 'success'}
                  >
                    {selectedItem.quantity} In Stock
                  </Badge>
                </Col>
              </Row>
              <hr />
              <Row className="small text-dark">
                <Col sm={6}>
                  <strong>Category:</strong> {selectedItem.categoryID}
                </Col>
                <Col sm={6}>
                  <strong>Threshold:</strong> {selectedItem.lowThreshold}
                </Col>
                <Col sm={12} className="mt-2">
                  <strong>Description:</strong>{' '}
                  {selectedItem.description || 'No description provided.'}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}
      </Card.Body>
    </Card>
  );
}
