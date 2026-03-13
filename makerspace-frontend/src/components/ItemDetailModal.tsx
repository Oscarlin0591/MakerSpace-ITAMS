import { Modal, Button } from 'react-bootstrap';

type ItemVariant = {
  name: string;
  total: number;
  lowThreshold: number;
  units: string;
};

type ItemDetailModalProps = {
  show: boolean;
  itemName: string;
  variants: ItemVariant[];
  onHide: () => void;
};

export function ItemDetailModal({
  show,
  itemName,
  variants,
  onHide,
}: ItemDetailModalProps) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{itemName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="variant-list">
          {variants.map((variant, idx) => (
            <div key={idx} className="variant-item">
              <div className="variant-name">
                <strong>{variant.name}</strong>
              </div>
              <div className="variant-details">
                <span className="detail">Stock: {variant.total} {variant.units}</span>
                <span className="detail">Low Threshold: {variant.lowThreshold} {variant.units}</span>
              </div>
            </div>
          ))}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
