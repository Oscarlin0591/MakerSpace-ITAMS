/**
 * DeleteConfirmationModal.tsx
 * A modal that will pop up to confirm users intent to delete an item
 * from the database entirely
 */

import { Modal, Button } from "react-bootstrap";

type ModalProps = {
  show: boolean;
  itemName: string;
  onCancel: () => void;
  onDelete: () => void;
};

function DeleteConfirmationModal({
  show,
  itemName,
  onCancel,
  onDelete,
}: ModalProps) {
  return (
    // Uses react-bootstrap Modal component
    // https://react-bootstrap.netlify.app/docs/components/modal/
    <Modal show={show} onHide={onCancel} centered size="sm">
      <Modal.Header closeButton>
        <Modal.Title>Delete item?</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Are you sure you want to delete this item?
          <strong> {itemName}</strong>
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onDelete}>
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default DeleteConfirmationModal;
