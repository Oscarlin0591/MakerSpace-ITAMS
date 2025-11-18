// Brandon McCrave 11/16/2025 Initial Creation
import React from 'react';
import './ManageInventory.css';

type InventoryItem = {
  id: number;
  name: string;
  description: string;
  amount: number;
};

const INVENTORY_ITEMS: InventoryItem[] = [
  { id: 1, name: 'Item 1', description: 'Description 1', amount: 10 },
  { id: 2, name: 'Item 2', description: 'Description 2', amount: 5 },
  { id: 3, name: 'Item 3', description: 'Description 3', amount: 8 },
];

export function ManageInventory() {
    return (
        <header className ="manage-inventory-header">
            <div className ="ManageInventory-Header-Title">
                <h1>Manage Inventory</h1>
            </div>

        <div className="manage-inventory">
            <h2>Inventory Management</h2>
            
            <div className='inventory-options'>
                <button className='add-item-button'>Add Item</button>
                <button className='remove-item-button'>Remove Item</button>
                <button className='update-item-button'>Update Item</button>
            </div>


    <nav className="dashboard-links d-flex">
          <a href="#home" className="mi-nav-link">
            Home
          </a>
          <a href="#notifications" className="mi-nav-link">
            Notifications
          </a>
          <a href="#manage" className="mi-nav-link mi-nav-link-active">
            Manage Inventory
          </a>
          <a href="#logout" className="mi-nav-link">
            Logout
          </a>
        </nav>
        
          {INVENTORY_ITEMS.map((item) => (
            <div className="card mi-inventory-card mb-4">
              <div className="card-body d-flex justify-content-between align-items-start">
                <div>
                  <h5 className="card-title mb-1"></h5>
                  <p className="card-text mb-4"></p>
                  <p className="card-text mb-0">Item amount: </p>
                </div>

                <div className="mi-card-actions d-flex flex-column align-items-end">
                  <button
                    type="button"
                    className="btn btn-link p-0 mb-2 mi-collapse-btn"
                    aria-label="collapse card"
                  >
                    ^
                  </button>

                  <button
                    type="button"
                    className="btn btn-link p-0 mi-edit-btn"
                    onClick={() => console.log('Edit item')}
                  >
                  </button>
                </div>
              </div>
            </div>
          ))}


        </div>
        </header>
    );
}   