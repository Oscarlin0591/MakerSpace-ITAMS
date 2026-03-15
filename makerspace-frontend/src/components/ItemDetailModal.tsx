import { Modal, Button, Form, InputGroup } from 'react-bootstrap';
import type { InventoryItem } from '../types';
import { useEffect, useState, type ChangeEvent } from 'react';
import { putItem } from '../service/item_service';


type ItemDetailModalProps = {
  show: boolean;
  item: InventoryItem | null;
  onHide: () => void;
  onSave: (updatedItem: InventoryItem) => void;
};

export function ItemDetailModal({
  show,
  item,
  onHide,
  onSave
}: ItemDetailModalProps) {
  const [editedItem, setEditedItem] = useState<InventoryItem | null>()
  const [validated, setValidated] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (show && item) {
      setEditedItem({ ...item });
      setValidated(false);
    }
  }, [show, item]);

  const handleNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    const parsed = value === '' ? 0 : parseInt(value, 10);
    setEditedItem((prev) => prev ? {...prev, [name]: Number.isNaN(parsed) ? 0 : parsed } : prev,
    );
  };

  if (!editedItem) return null;

  const isQuantityInvalid = isNaN(editedItem.quantity) || editedItem.quantity < 0 || editedItem.quantity > 9999;

  const handleSave = async () => {
    setValidated(true);
    if (isQuantityInvalid) return;

    setSaving(true);
    try {
      await putItem(editedItem.itemID, editedItem);
      onSave(editedItem);
    } catch (err) {
      console.error("Failed to update item: " + err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{editedItem.itemName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form noValidate>
          <Form.Group controlId="detailQuantity" className="mb-3">
            <Form.Label>Quantity</Form.Label>
            <InputGroup>
              <Form.Control
                type="number"
                name="quantity"
                min="0"
                value={editedItem.quantity}
                onChange={handleNumberChange}
                required
                isInvalid={validated && isQuantityInvalid}
                />
              <Form.Control.Feedback type="invalid"> Must be between 0 and 9999</Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={saving}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
