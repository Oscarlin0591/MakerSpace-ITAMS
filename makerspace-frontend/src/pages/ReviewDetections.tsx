/**
 * ReviewDetections.tsx
 * Admin-only page for reviewing and approving/rejecting YOLO inference
 * results before they are written to the database.
 *
 * @ai-assisted Claude Code (Anthropic) — https://claude.ai/claude-code
 * AI used for full implementation of this page.
 */

import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Row, Spinner, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL, type PendingUpdate } from '../types';
import { approveUpdate, getPendingUpdates, rejectUpdate } from '../service/pendingUpdate_service';

function cameraLabel(idx: number | null): string {
  if (idx === null) return 'All Cameras';
  if (idx === 0) return 'Camera 0 (Creality)';
  if (idx === 1) return 'Camera 1 (Bambu)';
  return `Camera ${idx}`;
}

export function ReviewDetections() {
  const [updates, setUpdates] = useState<PendingUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [approvingAll, setApprovingAll] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_BASE_URL}/authorized-admin`).then(
      function () {},
      function () {
        navigate('/home');
      },
    );

    let mounted = true;

    const load = async (showSpinner: boolean) => {
      if (showSpinner) setLoading(true);
      setError(null);
      const result = await getPendingUpdates();
      if (mounted) {
        setUpdates(result);
        setLoading(false);
      }
    };

    load(true);
    const interval = setInterval(() => load(false), 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [navigate]);

  const handleApprove = async (id: string) => {
    setActionInProgress(id);
    const ok = await approveUpdate(id);
    if (ok) {
      setUpdates((prev) => prev.filter((u) => u.id !== id));
    } else {
      setError('Failed to approve update. Please try again.');
    }
    setActionInProgress(null);
  };

  const handleReject = async (id: string) => {
    setActionInProgress(id);
    const ok = await rejectUpdate(id);
    if (ok) {
      setUpdates((prev) => prev.filter((u) => u.id !== id));
    } else {
      setError('Failed to reject update. Please try again.');
    }
    setActionInProgress(null);
  };

  const handleApproveAll = async () => {
    setApprovingAll(true);
    const toApprove = [...updates];
    for (const update of toApprove) {
      await approveUpdate(update.id);
    }
    setUpdates([]);
    setApprovingAll(false);
  };

  const busy = actionInProgress !== null || approvingAll;

  return (
    <Container className="my-4">
      <Card>
        <Card.Header className="d-flex align-items-center">
          <Row className="align-items-center w-100 m-0">
            <Col className="p-0">
              <h5 className="m-0">
                Review Detections{' '}
                {updates.length > 0 && (
                  <Badge bg="warning" text="dark" pill style={{ fontSize: '0.75rem' }}>
                    {updates.length}
                  </Badge>
                )}
              </h5>
            </Col>
            {updates.length > 0 && (
              <Col className="text-end p-0">
                <Button
                  variant="success"
                  size="sm"
                  onClick={handleApproveAll}
                  disabled={busy}
                >
                  {approvingAll ? 'Approving...' : 'Approve All'}
                </Button>
              </Col>
            )}
          </Row>
        </Card.Header>
        <Card.Body>
          {loading && <Spinner animation="border" role="status" />}
          {error && <Alert variant="danger">{error}</Alert>}
          {!loading && !error && updates.length === 0 && (
            <p className="text-muted mb-0">No pending detections. The queue is empty.</p>
          )}
          {!loading && updates.length > 0 && (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Camera</th>
                  <th>Current Qty</th>
                  <th>Proposed Qty</th>
                  <th>Detected At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {updates.map((u) => (
                  <tr key={u.id}>
                    <td>{u.itemName}</td>
                    <td>{cameraLabel(u.cameraIndex)}</td>
                    <td>{u.currentQuantity}</td>
                    <td>
                      <strong
                        className={
                          u.proposedQuantity < u.currentQuantity ? 'text-danger' : 'text-success'
                        }
                      >
                        {u.proposedQuantity}
                      </strong>
                    </td>
                    <td>{new Date(u.timestamp).toLocaleString()}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleApprove(u.id)}
                          disabled={busy}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleReject(u.id)}
                          disabled={busy}
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ReviewDetections;
