/**
 * SelectItemCard.tsx
 * Search menu with autocomplete options. Selecting an item displays
 * detailed information and its storage activity chart.
 */

import { useMemo, useState, useEffect } from 'react';
import { Badge, Card, Col, Form, Row, Spinner } from 'react-bootstrap';
import { getItems } from '../service/item_service';
import type { InventoryItem } from '../types/index';
import { ActivityChart } from './StorageActivityChart';

export default function SelectItemCard() {
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
        if (fetchedItems.length > 0) {
          setSearchTerm(fetchedItems[0].itemName);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_err) {
        setError('Failed to load items');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const [confirmedItem, setConfirmedItem] = useState<InventoryItem | null>(null);

  // Find item matching the search term exactly
  const selectedItem = useMemo(
    () => items.find((item) => item.itemName === searchTerm) ?? null,
    [searchTerm, items],
  );

  // Only update the displayed item when a valid match is found
  useEffect(() => {
    if (selectedItem != null) {
      setConfirmedItem(selectedItem);
    }
  }, [selectedItem]);

  if (loading)
    return (
      <Card className="border-0 shadow-sm">
        <Card.Body className="d-flex justify-content-center py-5">
          <Spinner animation="border" />
        </Card.Body>
      </Card>
    );

  return (
    <Card className="h-100">
      <Card.Header className="card-header d-flex align-items-center">
        <h5 className="m-0">{'Activity'}</h5>
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
            style={{ borderColor: 'var(--qu-dark)' }}
          />
          <datalist id="inventory-options">
            {items.map((item) => (
              <option key={item.itemID} value={item.itemName} />
            ))}
          </datalist>
        </Form.Group>

        {/* Conditional: Only shows if exactly one item matches the search string */}
        {confirmedItem && (
          <Card className="nested-item-card no-select shadow-sm mb-4">
            <Card.Body>
              <Row className="align-items-center">
                <Col>
                  <h5 className="nested-item-card-title mb-1">{confirmedItem.itemName}</h5>
                  <small className="text-muted">ID: {confirmedItem.itemID}</small>
                </Col>
                <Col xs="auto">
                  <Badge
                    bg={confirmedItem.quantity < confirmedItem.lowThreshold ? 'danger' : 'success'}
                  >
                    {confirmedItem.quantity} In Stock
                  </Badge>
                </Col>
              </Row>
              <hr />
              <Row className="small text-dark">
                <Col sm={6}>
                  <strong>Category:</strong> {confirmedItem.categoryID}
                </Col>
                <Col sm={6}>
                  <strong>Threshold:</strong> {confirmedItem.lowThreshold}
                </Col>
                <Col sm={12} className="mt-2">
                  <strong>Description:</strong>{' '}
                  {confirmedItem.description || 'No description provided.'}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}

        <ActivityChart selectedItem={confirmedItem} />
      </Card.Body>
    </Card>
  );
}
