/**
 * EditItemModal.tsx
 * A modal that will pop up with a form field used
 * to adjust item quantities
 */

import { Modal, Button, Form, InputGroup } from 'react-bootstrap';
import { useState, useEffect } from 'react';

type ModalProps = {
  show: boolean;
  onCancel: () => void;
  onSave: (newQuantity: number) => void;
  itemName: string; // Name of item to be edited
  currentQuantity: number; // Current item quantity
  itemUnits?: string; // Optional units to be displayed alongside form
};

function EditItemModal({
  show,
  onCancel,
  onSave,
  itemName,
  currentQuantity,
  itemUnits,
}: ModalProps) {
  const [quantity, setQuantity] = useState('');
  const [validated, setValidated] = useState(false);

  // Update modal on open with current quantity of item
  useEffect(() => {
    if (show) {
      setQuantity(String(currentQuantity));
      setValidated(false);
    }
  }, [show, currentQuantity]);

  // Data validation
  const numQuantity = parseInt(quantity, 10); // Convert string to int
  const isInvalid =
    quantity.trim() === '' ||
    isNaN(numQuantity) ||
    numQuantity < 0 ||
    numQuantity > 9999;

  // handle saving
  const handleSave = () => {
    setValidated(true);
    if (isInvalid) return;

    onSave(numQuantity);
  };

  return (
    <Modal show={show} onHide={onCancel} centered size="sm">
      <Modal.Header closeButton>
        <Modal.Title>Edit {itemName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form noValidate>
          <Form.Group controlId="formItemQuantity">
            <Form.Label>New Quantity</Form.Label>
            <InputGroup>
              <Form.Control
                type="number"
                min="0"
                max="9999"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                autoFocus
                isInvalid={validated && isInvalid}
              />
              {itemUnits && <InputGroup.Text>{itemUnits}</InputGroup.Text>}
              <Form.Control.Feedback type="invalid">
                Please provide a valid quantity.
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EditItemModal;
