// Brandon McCrave 11/16/2025 Initial Creation
import { useEffect, useState } from 'react';
import './ManageInventory.css';
import EditItemModal from '../components/EditItemModal';
import { Button } from 'react-bootstrap';
import { type InventoryItem } from '../types';
import { getItem, getItems } from '../service/item_service';

// const INVENTORY_ITEMS: Array<InventoryItem> = new Array<InventoryItem>;

// [
//   { itemID: 1, categoryID: 1, itemName: 'Item 1', description: 'Description 1', quantity: 10, lowThreshold: 2},
//   { itemID: 2, categoryID: 1, itemName: 'Item 2', description: 'Description 2', quantity: 5, lowThreshold: 2},
//   { itemID: 3, categoryID: 1, itemName: 'Item 3', description: 'Description 3', quantity: 8, lowThreshold: 2},
// ];

export function ManageInventory() {
  const [showEdit, setShowEdit] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [INVENTORY_ITEMS, setInventoryItems] = useState<Array<InventoryItem>>(
    []
  );

  useEffect(() => {
    getItems().then((result) => {
      setInventoryItems(result);
    });

    //debug for single item
    getItem(1).then((result) => {
      console.log(result);
    });
  }, []);

  const handleEditClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowEdit(true);
  };

  const handleEditItemSave = (newQuantity: number) => {
    if (selectedItem) {
      console.log(`Editing item ${selectedItem.itemName} to ${newQuantity}`);
    }
    setShowEdit(false);
    setSelectedItem(null);
  };

  return (
    <div className="manage-inventory-root">
      <header className="manage-inventory-header">
        <div className="ManageInventory-Header-Title">
          <h1>Manage Inventory</h1>
        </div>

        <nav className="dashboard-links d-flex">
          <a href="/home" className="mi-nav-link">
            Home
          </a>
          <a href="/mailing-list" className="mi-nav-link">
            Notifications
          </a>
          <a
            href="/manage-inventory"
            className="mi-nav-link mi-nav-link-active"
          >
            Manage Inventory
          </a>
          <a href="/" className="mi-nav-link">
            Logout
          </a>
        </nav>
      </header>

      <main className="manage-inventory">
        <h2>Inventory Management</h2>

        {/* Inventory list */}
        {INVENTORY_ITEMS.map((item) => (
          <div key={item.itemID} className="card mi-inventory-card mb-4">
            <div className="card-body d-flex justify-content-between align-items-start">
              <div>
                <h5 className="card-title mb-1">{item.itemName}</h5>
                <p className="card-text mb-2">{item.description}</p>
                <p className="card-text mb-0">Item amount: {item.quantity}</p>
              </div>

              <div className="mi-card-actions d-flex flex-column align-items-end">
                <button
                  type="button"
                  className="btn btn-link p-0 mb-2 mi-collapse-btn"
                  aria-label="collapse card"
                >
                  &#9660;
                </button>

                <Button variant="primary" onClick={() => handleEditClick(item)}>
                  Edit Item
                </Button>
              </div>
            </div>
          </div>
        ))}

        {/* Edit modal (shared) */}
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
      </main>
    </div>
  );
}
