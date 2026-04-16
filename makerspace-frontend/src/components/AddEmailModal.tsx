/**
 * AddEmailModal.tsx
 * A modal that will pop up with an input field to allow
 * users to enter a new email into the mailing list.
 */

import { Modal, Button, Form, InputGroup } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { postEmail } from '../service/emailRecipient_service';
import type { NotificationRecipient } from '../types';
import { Stack } from 'react-bootstrap';

type ModalProps = {
  show: boolean;
  onCancel: () => void;
  onSave: (newEmail: NotificationRecipient) => void;
};

function AddEmailModal({ show, onCancel, onSave }: ModalProps) {
  const [email, setEmail] = useState(''); // User input email
  const [alerts, setAlerts] = useState<boolean>(false);
  const [daily, setDaily] = useState<boolean>(false);
  const [weekly, setWeekly] = useState<boolean>(false);
  const [validated, setValidated] = useState(false); // Used for validation and error message

  // Clear text on modal open
  useEffect(() => {
    if (show) {
      setEmail('');
      setValidated(false);
    }
  }, [show]);

  // Minor email validation
  // https://react-bootstrap.netlify.app/docs/forms/validation
  const isInvalid = !email || email.includes(' ') || email.includes('@');

  // Handle saving email
  const handleSave = async () => {
    setValidated(true);
    if (isInvalid) return;

    // Create full email from user input
    const fullEmail: NotificationRecipient = {
      email: `${email}@quinnipiac.edu`,
      alerts: alerts,
      daily: daily,
      weekly: weekly,
    };
    await postEmail(fullEmail);
    onSave(fullEmail);
  };

  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add Email</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form noValidate>
          <Form.Group controlId="emailForm">
            <InputGroup hasValidation>
              <Form.Control
                type="text"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                isInvalid={validated && isInvalid}
              />
              <InputGroup.Text>@Quinnipiac.edu</InputGroup.Text>
              <Form.Control.Feedback type="invalid">
                Please enter a valid email username.
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
        </Form>
        <Stack className="mt-3" direction="horizontal">
          <Form.Check
            type="switch"
            defaultChecked={alerts}
            label="Low stock alerts?"
            onChange={() => setAlerts(!alerts)}
          />
          <Form.Check
            type="switch"
            defaultChecked={daily}
            label="Daily notifications?"
            onChange={() => setDaily(!daily)}
          />
          <Form.Check
            type="switch"
            defaultChecked={weekly}
            label="Weekly notifications?"
            onChange={() => setWeekly(!weekly)}
          />
        </Stack>
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

export default AddEmailModal;
