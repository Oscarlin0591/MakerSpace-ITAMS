/**
 * MailingList.tsx
 * Mailing List page accessible to admins. Used to add/delete
 * emails that will receive weekly notifications of
 * low-stock inventory items
 */

import { Envelope, PlusSquare, Trash3 } from 'react-bootstrap-icons';
import { type ReactNode, useEffect, useState } from 'react';
import AddEmailModal from '../components/AddEmailModal.tsx';
import { Container, ListGroup, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, type NotificationRecipient } from '../types';
import axios from 'axios';
import { getEmails, deleteEmail } from '../service/emailRecipient_service';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

function MailingList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [emails, setEmails] = useState<string[]>([]);
  const [show, setShow] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [emailToDelete, setEmailToDelete] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_BASE_URL}/authorized-admin`).then(
      function () {
        console.log('Success');
      },
      function () {
        navigate('/');
      },
    );

    setLoading(true);
    setError(null);

    getEmails()
      .then((result) => setEmails(result.map(email => email.email)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [navigate]);

  function addEmail(email: string): void {
    setEmails((prev) => [...prev, email]);
  }

  function handleDeleteClick(email: string): void {
    setEmailToDelete(email);
    setShowDelete(true);
  }

  async function handleConfirmDelete(): Promise<void> {
    if (!emailToDelete) return;
    await deleteEmail(emailToDelete);
    setEmails((prev) => prev.filter((e) => e !== emailToDelete));
    setShowDelete(false);
    setEmailToDelete(null);
  }

  return (
    <Container className="my-4">
      <Card>
        <Card.Header className="d-flex align-items-center">
          <Row className="align-items-center w-100 m-0">
            <Col className="p-0">
              <h5 className="m-0">Mailing List</h5>
            </Col>
            <Col className="text-end p-0">
              <PlusSquare
                size={28}
                className="btn-card-header clickable"
                onClick={(): void => setShow(true)}
                title="Add Email"
              />
            </Col>
          </Row>
        </Card.Header>
        <Card.Body>
          {loading && <Spinner animation="border" role="status" />}
          {error && <Alert variant="danger">Error: {error}</Alert>}
          {!loading && !error && (
            <ListGroup>
              {emails.map(
                (email: string): ReactNode => (
                  <ListGroup.Item
                    key={email}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div className="d-flex align-items-center gap-3">
                      <Envelope />
                      <div>{email}</div>
                    </div>
                    <Trash3 className="clickable" onClick={() => handleDeleteClick(email)} />
                  </ListGroup.Item>
                ),
              )}
            </ListGroup>
          )}
        </Card.Body>
      </Card>

      <AddEmailModal
        show={show}
        onCancel={(): void => setShow(false)}
        onSave={function (newEmail: NotificationRecipient): void {
          setShow(false);
          addEmail(newEmail.email);
        }}
      />

      <DeleteConfirmationModal
        show={showDelete}
        itemName={emailToDelete ?? ''}
        onCancel={() => {
          setShowDelete(false);
          setEmailToDelete(null);
        }}
        onDelete={handleConfirmDelete}
      />
    </Container>
  );
}

export default MailingList;
