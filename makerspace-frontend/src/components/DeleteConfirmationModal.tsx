/**
 * DeleteConfirmationModal.tsx
 * A modal that will pop up to confirm users intent to delete an item
 * from the database entirely.
 */

import { Modal, Button } from 'react-bootstrap';

type ModalProps = {
  show: boolean;
  itemName: string;
  onCancel: () => void;
  onDelete: () => void;
};

function DeleteConfirmationModal({ show, itemName, onCancel, onDelete }: ModalProps) {
  return (
    <Modal show={show} onHide={onCancel} centered size="sm">
      <Modal.Body>
        <p>
          Are you sure you want to delete this item?
          (<strong>{itemName}</strong>)
        </p>
        <div className="d-flex justify-content-end gap-2">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onDelete}>
            Delete
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default DeleteConfirmationModal;
