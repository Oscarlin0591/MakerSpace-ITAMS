import { useMemo, useState, useEffect } from 'react';
import { Card, Form, ListGroup, Spinner } from 'react-bootstrap';
import { getItems } from '../service/item_service';
import type { InventoryItem } from '../types/index';

type SelectItemCardProps = {
  onItemSelect?: (item: InventoryItem) => void;
};

export default function SelectItemCard({ onItemSelect }: SelectItemCardProps) {
  const [query, setQuery] = useState('');
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
      (it) => it.itemName.toLowerCase().includes(q) || it.categoryID.toString().includes(q),
    );
  }, [query, items]);

  function handleSelect(item: InventoryItem) {
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
        <Card.Body
          className="d-flex justify-content-center align-items-center"
          style={{ height: '200px' }}
        >
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
            <div className="text-muted small mt-3">
              Type to search for items (e.g., PLA, Vinyl, Plywood)
            </div>
          ) : results.length === 0 ? (
            <div className="text-muted small mt-3">No items found for "{query}"</div>
          ) : (
            <ListGroup className="mt-3">
              {results.map((r) => (
                <ListGroup.Item key={r.itemID} action onClick={() => handleSelect(r)}>
                  <div className="d-flex justify-content-between">
                    <div>
                      <strong>{r.itemName}</strong>
                      <div className="text-muted small">{r.categoryID || 'Category'}</div>
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
    </>
  );
}
