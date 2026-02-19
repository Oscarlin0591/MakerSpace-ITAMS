/**
 * MailingList.tsx
 * Mailing List page accessible to admins. Used to add/delete
 * emails that will receive weekly notifications of
 * low-stock inventory items
 */

import { Envelope, Trash3 } from 'react-bootstrap-icons';
import { type ReactNode, useEffect, useState } from 'react';
import AddEmailModal from '../components/AddEmailModal.tsx';
import { Container, ListGroup, Button, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { Navigate, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../types';
import axios from 'axios';

function MailingList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [emails, setEmails] = useState<string[]>([
    'example@quinnipiac.com',
    'johndoe@quinnipiac.com',
  ]);
  const [show, setShow] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    //TODO: Implement fetch, promise, and spinner
    axios.get(`${API_BASE_URL}/authorized-admin`).then(
      function() {
        console.log("Succeeded")
      }, function() {
        console.log("Failed")
        navigate("/")
      }
    )
    setLoading(true);
    setError(null);
    setLoading(false);
  }, []);

  //TODO: Get user priv from session
  const isAdmin = true;

  // Re-route non-administrators
  if (!isAdmin) {
    return <Navigate to="/home" replace />;
  }

  function addEmail(email: string): void {
    setEmails((prev) => [...prev, email]);
  }

  function removeEmail(emailToRemove: string): void {
    setEmails((prev) => prev.filter((e) => e !== emailToRemove));
  }

  return (
    <Container className="my-4">
      <Card>
        <Card.Header className="card-header-tall d-flex align-items-center">
          <Row className="align-items-center w-100 m-0">
            <Col className="p-0">
              <h4 className="m-0">Mailing List</h4>
            </Col>
            <Col className="text-end p-0">
              <Button size="sm" onClick={(): void => setShow(true)}>
                + Add Email
              </Button>
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
                    <Trash3 className="clickable" onClick={() => removeEmail(email)} />
                  </ListGroup.Item>
                )
              )}
            </ListGroup>
          )}
        </Card.Body>
      </Card>

      <AddEmailModal
        show={show}
        onCancel={(): void => setShow(false)}
        onSave={function (newEmail: string): void {
          setShow(false);
          addEmail(newEmail);
        }}
      />
    </Container>
  );
}

export default MailingList;
