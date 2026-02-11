import { useMemo, useState } from 'react';
import { Card, Form, ListGroup, Modal, Button } from 'react-bootstrap';
import { ActivityChart } from '../features/StorageActivityChart';

type InventoryItem = {
  id: string;
  name: string;
  category: string;
  parent?: string;
  quantity: number;
  unit?: string;
  description?: string;
};

const FAKE_INVENTORY: InventoryItem[] = [
  { id: '1', name: 'PLA - Makerbot', category: 'Filament', parent: 'Filament', quantity: 12, unit: 'kg' },
  { id: '2', name: 'ABS - Hatchbox', category: 'Filament', parent: 'Filament', quantity: 8, unit: 'kg' },
  { id: '3', name: 'Oracal 651 - White', category: 'Vinyl', parent: 'Vinyl', quantity: 24, unit: 'sheets' },
  { id: '4', name: 'Plywood - 1/4in', category: 'Wood', parent: 'Wood', quantity: 10, unit: 'sheets' },
  { id: '5', name: 'PLA - eSun', category: 'Filament', parent: 'Filament', quantity: 5, unit: 'kg' },
  { id: '6', name: 'Vinyl - Black', category: 'Vinyl', parent: 'Vinyl', quantity: 15, unit: 'sheets' },
];

function seededRandom(seed: number) {
  // simple LCG
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateActivityDataFor(name: string) {
  const seed = Array.from(name).reduce((a, c) => a + c.charCodeAt(0), 0);
  const rnd = seededRandom(seed);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((d) => ({ name: d, value: Math.round(rnd() * 100) }));
}

export default function SelectItemCard() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<InventoryItem | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [activitySeries, setActivitySeries] = useState<{ name: string; value: number }[] | undefined>(undefined);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return FAKE_INVENTORY.filter((it) => it.name.toLowerCase().includes(q) || it.category.toLowerCase().includes(q));
  }, [query]);

  function handleSelect(item: InventoryItem) {
    setSelected(item);
    setActivitySeries(generateActivityDataFor(item.name));
    setShowDetails(true);
  }

  return (
    <>
      <Card className="mb-4">
        <Card.Header className="card-header d-flex align-items-center">
          <h6 className="m-0">Select Item</h6>
        </Card.Header>
        <Card.Body>
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
                <ListGroup.Item key={r.id} action onClick={() => handleSelect(r)}>
                  <div className="d-flex justify-content-between">
                    <div>
                      <strong>{r.name}</strong>
                      <div className="text-muted small">{r.category} • {r.unit ?? 'units'}</div>
                    </div>
                    <div className="text-end">
                      <div>{r.quantity} {r.unit}</div>
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
          <ActivityChart series={activitySeries} />
        </Card.Body>
      </Card>

      <Modal show={showDetails} onHide={() => setShowDetails(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{selected?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><strong>Category:</strong> {selected?.category}</p>
          <p><strong>Quantity:</strong> {selected?.quantity} {selected?.unit}</p>
          <p className="text-muted">This is a quick summary with fake/sample data for the selected item.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetails(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
