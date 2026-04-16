import { Alert, Badge, Card, Col, Container, Row } from 'react-bootstrap';
import { Trash3, BellSlash } from 'react-bootstrap-icons';
import { useNotifications } from '../contexts/notifications';

export function NotificationPage() {
  const { notifications, deleteNotification, ignoreNotification } = useNotifications();

  const active = notifications.filter((n) => !n.ignored);
  const ignored = notifications.filter((n) => n.ignored);
  const ordered = [...active, ...ignored];

  return (
    <Container className="my-4">
      <Card>
        <Card.Header className="d-flex align-items-center">
          <h5 className="m-0">Notifications</h5>
          {active.length > 0 && (
            <Badge bg="danger" className="ms-2">
              {active.length}
            </Badge>
          )}
        </Card.Header>
        <Card.Body>
          {ordered.length === 0 && (
            <Alert variant="success" className="mb-0">
              No active notifications — all stock levels are healthy.
            </Alert>
          )}

          {ordered.map((n) => (
            <Card
              key={n.id}
              className="nested-item-card mb-3"
              style={n.ignored ? { opacity: 0.5 } : undefined}
            >
              <Card.Body className="d-flex justify-content-between align-items-start">
                <div>
                  <Card.Title className="mb-1">{n.itemName}</Card.Title>
                  <Card.Text className="mb-1">
                    <Badge bg="danger" className="me-2">
                      {n.quantity} In Stock
                    </Badge>
                    <span className="text-muted small">Threshold: {n.lowThreshold}</span>
                  </Card.Text>
                  <Card.Text className="mb-0 text-muted small">
                    Triggered:{' '}
                    {new Date(n.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </Card.Text>
                  {n.ignored && (
                    <Badge bg="secondary" className="mt-2">
                      Ignored
                    </Badge>
                  )}
                </div>

                <div className="d-flex gap-3 align-self-center">
                  {!n.ignored && (
                    <BellSlash
                      size="24px"
                      className="clickable text-secondary"
                      title="Ignore — suppress future toasts until item restocks and re-dips"
                      onClick={() => ignoreNotification(n.id)}
                    />
                  )}
                  <Trash3
                    size="24px"
                    className="clickable text-danger"
                    title="Delete notification"
                    onClick={() => deleteNotification(n.id)}
                  />
                </div>
              </Card.Body>
            </Card>
          ))}
        </Card.Body>
      </Card>
    </Container>
  );
}
