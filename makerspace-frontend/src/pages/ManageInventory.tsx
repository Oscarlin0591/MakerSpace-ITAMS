/**
 * ManageInventory.tsx
 * The Manage Inventory page will allow users to edit quantities
 * of inventory items. Admins will have additional options
 * to add/delete items that are tracked.
 */

import { PencilSquare } from 'react-bootstrap-icons';
import { useEffect, useState } from 'react';
import EditItemModal from '../components/EditItemModal';
import { Alert, Button, Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import { type Category, type InventoryItem } from '../types';
import { getItems } from '../service/item_service';
import AddItemModal from '../components/AddItemModal';
import { getCategories } from '../service/category';

export function ManageInventory() {
  const [loading, setLoading] = useState(true); // Used for spinner
  const [error, setError] = useState<string | null>(null); // Used to catch/display error msg

  const [showEdit, setShowEdit] = useState(false); // Show EditItemModal
  const [showAdd, setShowAdd] = useState(false); // Show AddItemModal
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [INVENTORY_ITEMS, setInventoryItems] = useState<Array<InventoryItem>>([]);
  const [CATEGORIES, setCategories] = useState<Array<Category>>([]);

  //TODO: Get user priv from session
  const isAdmin = true;

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
      
      getCategories().then((result) => {
        setCategories(result)
      })
      .catch((error) => {
        setError(error.message);
      })
  }, []);

  // Handle 'edit item' click event
  const handleEditClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowEdit(true);
  };

  //TODO: Implement saving existing item quantity
  const handleEditItemSave = (newQuantity: number) => {
    if (selectedItem) {
      console.log(`Editing item ${selectedItem.itemName} to ${newQuantity}`);
    }
    setShowEdit(false);
    setSelectedItem(null);
  };

  //TODO: Implement saving new item + category
  const handleAddItemSave = () => {
    if (selectedItem) {
      console.log(`Adding item ${selectedItem.itemName}`);
    }
    setShowAdd(false);
    setSelectedItem(null);
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

                  <PencilSquare
                    size="32px"
                    className="align-self-center clickable"
                    onClick={() => handleEditClick(item)}
                  />
                </Card.Body>
              </Card>
            ))}
        </Card.Body>
      </Card>

      <EditItemModal
        show={showEdit}
        onCancel={() => {
          setShowEdit(false);
          setSelectedItem(null);
        }}
        onSave={handleEditItemSave}
        itemName={selectedItem?.itemName ?? ''}
        currentQuantity={selectedItem?.quantity ?? 0}
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
