/**
 * EditItemModal.tsx
 * A modal that pops up with a full form to edit an existing inventory item.
 * Submits a PUT request to update the item in the database.
 *
 * @ai-assisted Claude Code (Anthropic) — https://claude.ai/claude-code
 * AI used for general code review during development, and for adding the
 * camera/YOLO Advanced section and null-camera cross-camera tracking support.
 */

import { Modal, Button, Form, InputGroup, Row, Col, Collapse } from 'react-bootstrap';
import { useState, useEffect, type ChangeEvent, type ReactNode } from 'react';
import type { InventoryItem, Category } from '../types';
import { putItem } from '../service/item_service';
import { useUser } from '../contexts/user';
import { useNotifications } from '../contexts/notifications';

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
  const [yoloLabelsInput, setYoloLabelsInput] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { isAdmin } = useUser();
  const { clearIgnoreForItem } = useNotifications();

  // Populate form with the selected item when modal opens
  useEffect(() => {
    if (show && item) {
      setEditedItem({ ...item });
      setYoloLabelsInput(item.yoloLabels ? item.yoloLabels.join(', ') : '');
      setShowAdvanced(false);
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

  // Camera without labels is invalid; labels without camera is valid (tracks across all cameras)
  const hasCameraId = editedItem.cameraId !== null && editedItem.cameraId !== undefined;
  const hasYoloLabels = yoloLabelsInput.trim() !== '';
  const isCameraLabelsMismatch = hasCameraId && !hasYoloLabels;

  const selectedCategory = existingCategories.find((c) => c.categoryID === editedItem.categoryID);

  const handleSave = async () => {
    setValidated(true);
    if (isNameInvalid || isQuantityInvalid || isThresholdInvalid || isCategoryInvalid || isCameraLabelsMismatch) return;

    const parsedLabels = hasYoloLabels
      ? yoloLabelsInput.split(',').map((l) => l.trim()).filter(Boolean)
      : null;

    const itemToSave: InventoryItem = { ...editedItem, yoloLabels: parsedLabels ?? undefined };

    setSaving(true);
    try {
      await putItem(editedItem.itemID, itemToSave);
      if (editedItem.quantity >= editedItem.lowThreshold) {
        clearIgnoreForItem(editedItem.itemID);
      }
      onSave(itemToSave);
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

          {/* Advanced Section for camera inference (admin only) */}
          {adminOnly(
            <div className="mb-3">
              <Button
                variant="link"
                className="p-0 text-decoration-none text-secondary"
                onClick={() => setShowAdvanced((v) => !v)}
                aria-expanded={showAdvanced}
              >
                {showAdvanced ? '▾' : '▸'} Advanced
              </Button>
              <Collapse in={showAdvanced}>
                <div>
                  <Row className="mt-3">
                    <Form.Group as={Col} controlId="editCameraId">
                      <Form.Label>Camera</Form.Label>
                      <Form.Select
                        value={editedItem.cameraId ?? ''}
                        onChange={(e) =>
                          setEditedItem((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  cameraId: e.target.value === '' ? undefined : parseInt(e.target.value, 10),
                                }
                              : prev
                          )
                        }
                        isInvalid={validated && isCameraLabelsMismatch}
                      >
                        <option value="">None (track across all cameras)</option>
                        <option value="0">Camera 0 (Creality)</option>
                        <option value="1">Camera 1 (Bambu)</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        YOLO labels are required when a camera is selected.
                      </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group as={Col} controlId="editYoloLabels">
                      <Form.Label>YOLO Labels</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="e.g. filament-box, filament-spool"
                        value={yoloLabelsInput}
                        onChange={(e) => setYoloLabelsInput(e.target.value)}
                        isInvalid={validated && isCameraLabelsMismatch}
                      />
                      <Form.Text className="text-muted">Comma-separated model label names.</Form.Text>
                      <Form.Control.Feedback type="invalid">
                        Required when a camera is selected.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Row>
                </div>
              </Collapse>
            </div>
          )}
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
