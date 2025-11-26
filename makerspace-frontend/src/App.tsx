import './App.css';
// import StockLevelsChart from './features/StockLevelsChart';
// import { ActivityChart } from './features/StorageActivityChart';
import AddEmailModal from './components/AddEmailModal';
import AddItemModal from './components/AddItemModal';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import EditItemModal from './components/EditItemModal';
import ExportDataModal, {
  type DateRangeValue,
} from './components/ExportDataModal';
import type { Category, NewItem } from './types';
import { Button, Container } from 'react-bootstrap';
import {useEffect, useState} from 'react';
import {BrowserRouter, Routes, Route, Navigate, useNavigate} from 'react-router-dom';
import { Dashboard } from './Dashboard';
import { ManageInventory } from './ManageInventory';
import Login from './Login';
import MailingList from './MailingList';
import type { JSX } from "react/jsx-runtime";
import { useCookies } from 'react-cookie';
import LogOut from "./LogOut.tsx";

const FAKE_CATEGORIES: Category[] = [
    {categoryID: 1, categoryName: 'Wood', units: 'pcs'},
    {categoryID: 2, categoryName: 'Filament', units: 'g'},
    {categoryID: 3, categoryName: 'Vinyl', units: 'meters'},
];

const FAKE_ITEM: NewItem = {
    itemName: 'Ultimaker ABS',
    quantity: 12,
    lowThreshold: 1,
    units: 'meters',
};

function App() {
    // Modal show values
    const [showAddEmail, setShowAddEmail] = useState(false);
    const [showAddItem, setShowAddItem] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showExport, setShowExport] = useState(false);

    // Handlers
    const handleAddEmailSave = (newEmail: string) => {
        console.log('Saving email', newEmail);
        setShowAddEmail(false);
    };
    const handleAddItemSave = (newItem: NewItem) => {
        console.log('Saving item', newItem);
        setShowAddItem(false);
    };
    const handleDeleteItem = () => {
        console.log('Deleting item');
        setShowDelete(false);
    };
    const handleEditItemSave = (newQuantity: number) => {
        console.log(`Editing item ${FAKE_ITEM.itemName} to ${newQuantity}`);
        setShowEdit(false);
    };
    const handleExportData = (date: Date | null, range: DateRangeValue) => {
        console.log('Exporting data', {date, range});
        setShowExport(false);
    };

    const [cookies, setCookie, removeCookie] = useCookies(['loggedIn']);

    // Redirects to the login if the user is authenticated.
    function checkForAuthentication(element: JSX.Element) {
      if (cookies.loggedIn) {
          return element
      }
      else {
          return <Navigate to="/" />
      }
    }

    function logIn() {
        setCookie("loggedIn", true);
    }

    function logOut() {
        removeCookie("loggedIn");
    }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/manage-inventory" element={checkForAuthentication(<ManageInventory />)} />
        <Route path="/home" element={checkForAuthentication(<Dashboard />)} />
        <Route path="/" element={cookies.loggedIn ? <Navigate to="/home" /> : <Login setIsLoggedIn={logIn} />} />
        <Route path="/mailing-list" element={checkForAuthentication(<MailingList/>)} />
        <Route path="/logout" element={checkForAuthentication(<LogOut logOut={logOut}/>)} />

        <Route
          path="/test"
          element={checkForAuthentication(
            <Container fluid className="my-4">
              <h1>ITAMS Dashboard Component Testing</h1>

              <h2>Modal Test Buttons</h2>
              <div className="d-flex flex-row gap-2 mb-5 justify-content-center">
                <Button variant="primary" onClick={() => setShowAddItem(true)}>
                  Add New Item
                </Button>
                <Button variant="success" onClick={() => setShowAddEmail(true)}>
                  Add Email
                </Button>
                <Button variant="warning" onClick={() => setShowEdit(true)}>
                  Edit Item
                </Button>
                <Button variant="danger" onClick={() => setShowDelete(true)}>
                  Delete Item
                </Button>
                <Button variant="secondary" onClick={() => setShowExport(true)}>
                  Export Data
                </Button>
              </div>

              <h2></h2>
              <Dashboard></Dashboard>

              <AddEmailModal
                show={showAddEmail}
                onCancel={() => setShowAddEmail(false)}
                onSave={handleAddEmailSave}
              />
              <AddItemModal
                show={showAddItem}
                onCancel={() => setShowAddItem(false)}
                onSave={handleAddItemSave}
                existingCategories={FAKE_CATEGORIES}
              />
              <DeleteConfirmationModal
                show={showDelete}
                onCancel={() => setShowDelete(false)}
                onDelete={handleDeleteItem}
                itemName="Test Item"
              />
              <EditItemModal
                show={showEdit}
                onCancel={() => setShowEdit(false)}
                onSave={handleEditItemSave}
                itemName={FAKE_ITEM.itemName}
                currentQuantity={FAKE_ITEM.quantity}
                itemUnits={FAKE_ITEM.units}
              />
              <ExportDataModal
                show={showExport}
                onCancel={() => setShowExport(false)}
                onExport={handleExportData}
              />
            </Container>
          )}
        />
      </Routes>
    </BrowserRouter>
  );
}
export default App;