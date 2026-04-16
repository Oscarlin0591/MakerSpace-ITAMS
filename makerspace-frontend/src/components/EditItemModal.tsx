/**
 * EditItemModal.tsx
 * A modal that pops up with a full form to edit an existing inventory item.
 * Submits a PUT request to update the item in the database.
 */

import { Modal, Button, Form, InputGroup, Row, Col } from 'react-bootstrap';
import { useState, useEffect, type ChangeEvent, type ReactNode } from 'react';
import type { InventoryItem, Category } from '../types';
import { putItem } from '../service/item_service';
import { useUser } from '../contexts/user';

type ModalProps = {
  show: boolean;
  onCancel: () => void;
  onSave: (updatedItem: InventoryItem) => void;
  item: InventoryItem | null;
  existingCategories: Category[];
};

function EditItemModal({ show, onCancel, onSave, item, existingCategories }: ModalProps) {
  const [editedItem, setEditedItem] = useState<InventoryItem | null>(null);
  const [validated, setValidated] = useState(false);
  const [saving, setSaving] = useState(false);

  const { isAdmin } = useUser();

  // Populate form with the selected item when modal opens
  useEffect(() => {
    if (show && item) {
      setEditedItem({ ...item });
      setValidated(false);
    }
  }, [show, item]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedItem((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const parsed = value === '' ? 0 : parseInt(value, 10);
    setEditedItem((prev) =>
      prev ? { ...prev, [name]: Number.isNaN(parsed) ? 0 : parsed } : prev,
    );
  };

  const handleSelectCategory = (e: ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value, 10);
    setEditedItem((prev) => (prev ? { ...prev, categoryID: id } : prev));
  };

  if (!editedItem) return null;

  // Validation
  const isNameInvalid = !editedItem.itemName;
  const isQuantityInvalid =
    isNaN(editedItem.quantity) || editedItem.quantity < 0 || editedItem.quantity > 9999;
  const isThresholdInvalid =
    isNaN(editedItem.lowThreshold) ||
    editedItem.lowThreshold < 0 ||
    editedItem.lowThreshold > 9999;
  const isCategoryInvalid = !editedItem.categoryID;

  const selectedCategory = existingCategories.find((c) => c.categoryID === editedItem.categoryID);

  const handleSave = async () => {
    setValidated(true);
    if (isNameInvalid || isQuantityInvalid || isThresholdInvalid || isCategoryInvalid) return;

    setSaving(true);
    try {
      await putItem(editedItem.itemID, editedItem);
      onSave(editedItem);
    } catch (err) {
      console.error('Failed to update item:', err);
    } finally {
      setSaving(false);
    }
  };

  const adminOnly = (element: ReactNode): ReactNode => {
    if (isAdmin) {
      return element;
    }
    else {
      return <></>
    }
  }

  return (
    <Modal show={show} onHide={onCancel} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit Item</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form noValidate>
          {/* Item Name */}
          {adminOnly(<Form.Group controlId="editItemName" className="mb-3">
            <Form.Label>Item Name</Form.Label>
            <Form.Control
              type="text"
              name="itemName"
              value={editedItem.itemName}
              onChange={handleChange}
              required
              autoFocus
              isInvalid={validated && isNameInvalid}
            />
            <Form.Control.Feedback type="invalid">
              Please provide an item name.
            </Form.Control.Feedback>
          </Form.Group>)}

          {/* Category Dropdown */}
          {adminOnly(<Form.Group controlId="editCategory" className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Select
              value={editedItem.categoryID?.toString() ?? ''}
              onChange={handleSelectCategory}
              isInvalid={validated && isCategoryInvalid}
            >
              <option value="">Select a category...</option>
              {existingCategories.map((category) => (
                <option key={category.categoryID} value={category.categoryID.toString()}>
                  {category.categoryName}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">Please select a category.</Form.Control.Feedback>
          </Form.Group>)}

          {/* Quantity and Low Threshold */}
          <Row className="mb-3">
            <Form.Group as={Col} controlId="editQuantity">
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
                {selectedCategory && <InputGroup.Text>{selectedCategory.units}</InputGroup.Text>}
                <Form.Control.Feedback type="invalid">Must be 0 or more.</Form.Control.Feedback>
              </InputGroup>
            </Form.Group>
            {adminOnly(<Form.Group as={Col} controlId="editLowThreshold">
              <Form.Label>Low Threshold</Form.Label>
              <InputGroup>
                <Form.Control
                  type="number"
                  name="lowThreshold"
                  min="0"
                  value={editedItem.lowThreshold}
                  onChange={handleNumberChange}
                  required
                  isInvalid={validated && isThresholdInvalid}
                />
                {selectedCategory && <InputGroup.Text>{selectedCategory.units}</InputGroup.Text>}
                <Form.Control.Feedback type="invalid">Must be 0 or more.</Form.Control.Feedback>
              </InputGroup>
            </Form.Group>)}
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EditItemModal;