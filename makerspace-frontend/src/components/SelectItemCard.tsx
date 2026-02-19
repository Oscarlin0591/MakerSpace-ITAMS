import { useMemo, useState, useEffect } from 'react';
import { Card, Form, ListGroup, Modal, Button, Spinner } from 'react-bootstrap';
import { ActivityChart } from '../features/StorageActivityChart';
import { getItems } from '../service/item_service';
import type { InventoryItem } from '../types/index';

type SelectItemCardProps = {
  onItemSelect?: (item: InventoryItem) => void;
};

export default function SelectItemCard({ onItemSelect }: SelectItemCardProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<InventoryItem | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch items from backend on component mount
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedItems = await getItems();
        setItems(fetchedItems);
      } catch (err) {
        console.error('Error fetching items:', err);
        setError('Failed to load items');
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return items.filter(
      (it) => it.itemName.toLowerCase().includes(q) || it.categoryID.toString().includes(q)
    );
  }, [query, items]);

  function handleSelect(item: InventoryItem) {
    setSelected(item);
    setShowDetails(true);
    if (onItemSelect) {
      onItemSelect(item);
    }
  }

  if (loading) {
    return (
      <Card className="mb-4">
        <Card.Header className="card-header d-flex align-items-center">
          <h6 className="m-0">Select Item</h6>
        </Card.Header>
        <Card.Body className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
          <Spinner animation="border" />
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <Card className="mb-4">
        <Card.Header className="card-header d-flex align-items-center">
          <h6 className="m-0">Select Item</h6>
        </Card.Header>
        <Card.Body>
          {error && <div className="alert alert-danger">{error}</div>}
          <Form.Group>
            <Form.Control
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search items (e.g., PLA, Vinyl, Plywood)"
            />
          </Form.Group>

          {query.trim() === '' ? (
            <div className="text-muted small mt-3">Type to search for items (e.g., PLA, Vinyl, Plywood)</div>
          ) : results.length === 0 ? (
            <div className="text-muted small mt-3">No items found for "{query}"</div>
          ) : (
            <ListGroup className="mt-3">
              {results.map((r) => (
                <ListGroup.Item key={r.itemID} action onClick={() => handleSelect(r)}>
                  <div className="d-flex justify-content-between">
                    <div>
                      <strong>{r.itemName}</strong>
                      <div className="text-muted small">{r.categoryName || 'Category'}</div>
                    </div>
                    <div className="text-end">
                      <div>{r.quantity} units</div>
                      <div className="text-muted small" style={{ fontSize: '0.8em' }}>
                        Threshold: {r.lowThreshold}
                      </div>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
      </Card>

      <Card>
        <Card.Header className="card-header d-flex align-items-center">
          <h6 className="m-0">Activity</h6>
        </Card.Header>
        <Card.Body>
          {selected ? (
            <>
              <h6 className="mb-3">{selected.itemName}</h6>
              <ActivityChart />
            </>
          ) : (
            <div className="text-muted text-center py-5">Select an item to view activity</div>
          )}
        </Card.Body>
      </Card>

      <Modal show={showDetails} onHide={() => setShowDetails(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selected?.itemName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selected && (
            <div>
              <p>
                <strong>Quantity:</strong> {selected.quantity} units
              </p>
              <p>
                <strong>Low Threshold:</strong> {selected.lowThreshold}
              </p>
              <p>
                <strong>Category ID:</strong> {selected.categoryID}
              </p>
              {selected.categoryName && (
                <p>
                  <strong>Category Name:</strong> {selected.categoryName}
                </p>
              )}
              {selected.color && (
                <p>
                  <strong>Color:</strong> {selected.color}
                </p>
              )}
              {selected.description && (
                <p>
                  <strong>Description:</strong> {selected.description}
                </p>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetails(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
