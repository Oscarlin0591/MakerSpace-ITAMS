/**
 * SelectItemCard.tsx
 * Search menu with autocomplete options. Selecting an item displays
 * detailed information and its storage activity chart.
 * Defaults to a placeholder card and aggregate inventory chart until an item is selected.
 */

import { useMemo, useState, useEffect } from 'react';
import { Badge, Card, Col, Form, Row, Spinner } from 'react-bootstrap';
import { getItems } from '../service/item_service';
import type { InventoryItem } from '../types/index';
import { ActivityChart } from './StorageActivityChart';

const PLACEHOLDER: InventoryItem = {
  itemID: -1,
  itemName: 'Search for an item',
  categoryID: 0,
  quantity: 0,
  lowThreshold: 0,
};

export default function SelectItemCard() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmedItem, setConfirmedItem] = useState<InventoryItem | null>(null);

  // Fetch items from backend on component mount — no auto-selection
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

  // Find item matching the search term exactly
  const selectedItem = useMemo(
    () => items.find((item) => item.itemName === searchTerm) ?? null,
    [searchTerm, items],
  );

  // Update confirmed item on exact match; reset to null (placeholder) when search is cleared
  useEffect(() => {
    if (selectedItem != null) {
      setConfirmedItem(selectedItem);
    } else if (searchTerm === '') {
      setConfirmedItem(null);
    }
  }, [selectedItem, searchTerm]);

  // Display data: use confirmed item or fall back to placeholder
  const displayItem = confirmedItem ?? PLACEHOLDER;
  const isPlaceholder = confirmedItem === null;

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
        <h5 className="m-0">Item Details</h5>
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

        {/* Item detail card — shows placeholder until a real item is confirmed */}
        <Card
          className="nested-item-card no-select shadow-sm mb-4"
          style={isPlaceholder ? { opacity: 0.5 } : undefined}
        >
          <Card.Body>
            <Row>
              <Col className="align-self-center">
                <h5 className="nested-item-card-title mb-1">{displayItem.itemName}</h5>
                {!isPlaceholder && (
                  <small className="text-muted">ID: {confirmedItem!.itemID}</small>
                )}
              </Col>
              <Col xs="auto" className="align-self-end">
                <Badge
                  bg={
                    isPlaceholder
                      ? 'secondary'
                      : confirmedItem!.quantity < confirmedItem!.lowThreshold
                        ? 'danger'
                        : 'success'
                  }
                >
                  {displayItem.quantity} In Stock
                </Badge>
              </Col>
            </Row>
            {!isPlaceholder && (
              <>
                <hr />
                <Row className="small text-dark">
                  <Col sm={6}>
                    <strong>Category:</strong> {confirmedItem!.categoryID}
                  </Col>
                  <Col sm={6}>
                    <strong>Threshold:</strong> {confirmedItem!.lowThreshold}
                  </Col>
                  <Col sm={12} className="mt-2">
                    <strong>Description:</strong>{' '}
                    {confirmedItem!.description || 'No description provided.'}
                  </Col>
                </Row>
              </>
            )}
          </Card.Body>
        </Card>

        {/* Pass null when placeholder is active — chart defaults to aggregate total inventory */}
        <ActivityChart selectedItem={confirmedItem} />
      </Card.Body>
    </Card>
  );
}
