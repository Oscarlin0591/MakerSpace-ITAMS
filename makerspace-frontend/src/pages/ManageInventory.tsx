/**
 * ManageInventory.tsx
 * The Manage Inventory page will allow users to edit quantities
 * of inventory items. Admins will have additional options
 * to add/delete items that are tracked.
 */

import { PencilSquare, Trash3 } from 'react-bootstrap-icons';
import { useEffect, useState } from 'react';
import EditItemModal from '../components/EditItemModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { Alert, Button, Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import { type Category, type InventoryItem } from '../types';
import { getItems, deleteItem } from '../service/item_service';
import AddItemModal from '../components/AddItemModal';
import { getCategories } from '../service/category';
import { useUser } from '../contexts/user';

export function ManageInventory() {
  const [loading, setLoading] = useState(true); // Used for spinner
  const [error, setError] = useState<string | null>(null); // Used to catch/display error msg

  const [showEdit, setShowEdit] = useState(false); // Show EditItemModal
  const [showAdd, setShowAdd] = useState(false); // Show AddItemModal
  const [showDelete, setShowDelete] = useState(false); // Show DeleteConfirmationModal
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [INVENTORY_ITEMS, setInventoryItems] = useState<Array<InventoryItem>>([]);
  const [CATEGORIES, setCategories] = useState<Array<Category>>([]);

  const { isAdmin } = useUser();

  useEffect(() => {
    setLoading(true);
    setError(null);

    getItems()
      .then((result) => {
        setInventoryItems(result);
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });

    getCategories()
      .then((result) => {
        setCategories(result);
      })
      .catch((error) => {
        setError(error.message);
      });
  }, []);

  // Handle 'edit item' click event
  const handleEditClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowEdit(true);
  };

  // Update the edited item in local state without a full page refresh
  const handleEditItemSave = (updatedItem: InventoryItem) => {
    setInventoryItems((prev) =>
      prev.map((item) => (item.itemID === updatedItem.itemID ? updatedItem : item)),
    );
    setShowEdit(false);
    setSelectedItem(null);
  };

  // Open the delete confirmation modal for the selected item
  const handleDeleteClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowDelete(true);
  };

  // Confirmed delete — call API then remove from local state
  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    await deleteItem(selectedItem.itemID);
    setInventoryItems((prev) => prev.filter((i) => i.itemID !== selectedItem.itemID));
    setShowDelete(false);
    setSelectedItem(null);
  };

  // Re-fetch items from DB after adding so the new item appears immediately
  const handleAddItemSave = () => {
    setShowAdd(false);
    setSelectedItem(null);
    getItems().then((result) => setInventoryItems(result));
    getCategories().then((result) => setCategories(result));
  };

  return (
    <Container className="my-4">
      <Card>
        <Card.Header className="card-header-tall d-flex align-items-center">
          <Row className="align-items-center w-100 m-0">
            <Col className="p-0">
              <h4 className="m-0">Manage Inventory</h4>
            </Col>
            {isAdmin && (
              <Col className="text-end p-0">
                <Button size="sm" onClick={() => setShowAdd(true)}>
                  + Add Item
                </Button>
              </Col>
            )}
          </Row>
        </Card.Header>
        <Card.Body>
          {loading && <Spinner animation="border" role="status" />}
          {error && <Alert variant="danger">Error: {error}</Alert>}
          {!loading &&
            !error &&
            INVENTORY_ITEMS.map((item) => (
              <Card key={item.itemID} className="mb-3">
                <Card.Body className="d-flex justify-content-between align-items-start">
                  <div>
                    <Card.Title className="mb-1">{item.itemName}</Card.Title>
                    <Card.Text className="mb-2">{item.description}</Card.Text>
                    <Card.Text className="mb-0">Item amount: {item.quantity}</Card.Text>
                  </div>

                  <div className="d-flex gap-3 align-self-center">
                    <PencilSquare
                      size="28px"
                      className="clickable"
                      onClick={() => handleEditClick(item)}
                    />
                    {isAdmin && (
                      <Trash3
                        size="28px"
                        className="clickable text-danger"
                        onClick={() => handleDeleteClick(item)}
                      />
                    )}
                  </div>
                </Card.Body>
              </Card>
            ))}
        </Card.Body>
      </Card>

      <DeleteConfirmationModal
        show={showDelete}
        itemName={selectedItem?.itemName ?? ''}
        onCancel={() => {
          setShowDelete(false);
          setSelectedItem(null);
        }}
        onDelete={handleConfirmDelete}
      />

      <EditItemModal
        show={showEdit}
        onCancel={() => {
          setShowEdit(false);
          setSelectedItem(null);
        }}
        onSave={handleEditItemSave}
        item={selectedItem}
        existingCategories={CATEGORIES}
      />
      <AddItemModal
        show={showAdd}
        onCancel={() => {
          setShowAdd(false);
          setSelectedItem(null);
        }}
        onSave={handleAddItemSave}
        existingCategories={
          CATEGORIES
          //   [
          //   //TODO: Get actual existing categories
          //   { categoryID: 1, categoryName: 'Filament', units: 'kg' },
          //   { categoryID: 2, categoryName: 'Vinyl', units: 'pcs' },
          //   { categoryID: 3, categoryName: 'Wood', units: 'pcs' },
          // ]
        }
      />
    </Container>
  );
}
