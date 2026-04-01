/**
 * MailingList.tsx
 * Mailing List page accessible to admins. Used to add/delete
 * emails that will receive weekly notifications of
 * low-stock inventory items
 */

import { Check, Envelope, PlusSquare, Trash3, X } from 'react-bootstrap-icons';
import { type ReactNode, useEffect, useState } from 'react';
import AddEmailModal from '../components/AddEmailModal.tsx';
import { Container, ListGroup, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, type NotificationRecipient } from '../types';
import axios from 'axios';
import { getEmails, deleteEmail, putEmail } from '../service/emailRecipient_service';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { Cross } from 'recharts';

function MailingList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [emails, setEmails] = useState<NotificationRecipient[]>([]);
  const [show, setShow] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [emailToDelete, setEmailToDelete] = useState<NotificationRecipient | null>(null);

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
      .then((result) => setEmails(result))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [navigate]);

  function addEmail(email: NotificationRecipient): void {
    setEmails((prev) => [...prev, email]);
  }

  function handleDeleteClick(email: NotificationRecipient): void {
    setEmailToDelete(email);
    setShowDelete(true);
  }

  async function handleConfirmDelete(): Promise<void> {
    if (!emailToDelete) return;
    await deleteEmail(emailToDelete.email);
    setEmails((prev) => prev.filter((e) => e.email !== emailToDelete.email));
    setShowDelete(false);
    setEmailToDelete(null);
  }

  function toggleAlert(email: NotificationRecipient): void {
    email.alerts = !email.alerts
    updateEmail(email)

  }

  function toggleDaily(email: NotificationRecipient): void {
    email.daily = !email.daily
    updateEmail(email)
  }

  function toggleWeekly(email: NotificationRecipient): void {
    email.weekly = !email.weekly
    updateEmail(email)
  }

  function updateEmail(email: NotificationRecipient): void {
    setEmails((prev) => prev.map(currEmail => currEmail.email == email.email ? email : currEmail));
    putEmail(email)
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
              {emails.sort((a, b) => {
                return a.email > b.email ? 1 : -1;
              }).map(
                (email: NotificationRecipient): ReactNode => (
                  <ListGroup.Item
                    key={email.email}
                    className="d-flex justify-content-between align-items-center"
                  >
                    {/*<div>*/}
                      <Envelope />
                      <div className="col-3">{email.email}</div>
                      <div className="col-2" onClick={() => toggleAlert(email)}>
                        <text>Low quantity alerts</text>
                        {email.alerts ? (<Check/>) : (<X/>)}
                      </div>
                      <div className="col-2" onClick={() => toggleDaily(email)}>
                        <text>Daily updates</text>
                        {email.daily ? (<Check/>) : (<X/>)}
                      </div>
                      <div className="col-2" onClick={() => toggleWeekly(email)}>
                        <text>Weekly updates</text>
                        {email.weekly ? (<Check/>) : (<X/>)}
                      </div>
                    {/*</div>*/}
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
          addEmail(newEmail);
        }}
      />

      <DeleteConfirmationModal
        show={showDelete}
        itemName={emailToDelete ? emailToDelete.email : ''}
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
