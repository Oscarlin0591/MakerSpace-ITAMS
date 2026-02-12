/**
 * AddItemModal.tsx
 * A modal that will pop up with form fields to be completed
 * by user to add a new item to the database
 */

import { Modal, Button, Form, InputGroup, Row, Col } from 'react-bootstrap';
import { useState, useEffect, type ChangeEvent } from 'react';
import type { NewItem, Category } from '../types';
import { postItem } from '../service/item_service';

type ModalProps = {
  show: boolean;
  onCancel: () => void;
  onSave: (newItem: NewItem) => void;
  existingCategories: Category[];
};

function AddItemModal({ show, onCancel, onSave, existingCategories }: ModalProps) {
  // Category dropdown states
  const [categorySelection, setCategorySelection] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [customUnits, setCustomUnits] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);

  // new item state - consider using this instead of so many methods
  const [newItem, setItem] = useState<NewItem>({
    itemName: '',
    categoryID: null,
    categoryName: '',
    units: '',
    quantity: 0,
    lowThreshold: 0,
    color: '',
  });

  //Validation state
  const [validated, setValidated] = useState(false);

  // handles modal changes
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setItem((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const parsed = value === '' ? 0 : parseInt(value, 10);
    setItem((prevData) => ({
      ...prevData,
      [name]: Number.isNaN(parsed) ? 0 : parsed,
    }));
  };

  const handleSelectCategory = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setCategorySelection(value);
    const sel = existingCategories.find((c) => c.categoryID.toString() === value);
    setItem((prevData) => ({
      ...prevData,
      categoryName: sel ? sel.categoryName : '',
    }));
  };

  // Clear form method
  const clearForm = () => {
    setItem({
      itemName: '',
      categoryID: null,
      categoryName: '',
      units: '',
      quantity: 0,
      lowThreshold: 0,
      color: '',
    });
    setCategorySelection('');
    setCustomCategory('');
    setCustomUnits('');
    setIsAddingNew(false);
    setValidated(false);
  };

  // Clear modal on open
  useEffect(() => {
    if (show) clearForm();
    // console.log('form cleared');
  }, [show]);

  // Get the selected dropdown category and values needed for display
  const selectedCategory = existingCategories.find(
    (category) => category.categoryID.toString() === categorySelection,
  );
  let unitsToDisplay = '';
  if (isAddingNew) {
    unitsToDisplay = customUnits;
  } else if (selectedCategory) {
    unitsToDisplay = selectedCategory.units;
  }

  // Data validation
  const isNameInvalid = !newItem.itemName;
  const numQuantity = newItem.quantity;
  // parseInt(quantity, 10);
  const isQuantityInvalid =
    // quantity.trim() === '' ||
    isNaN(numQuantity) || numQuantity < 0 || numQuantity > 9999;
  const numThreshold = newItem.lowThreshold;
  // parseInt(lowThreshold, 10);
  const isThresholdInvalid =
    // lowThreshold.trim() === '' ||
    isNaN(numThreshold) || numThreshold < 0 || numThreshold > 9999;
  const isExistingCategoryInvalid = !isAddingNew && !newItem.categoryName;
  const isNewCategoryInvalid = isAddingNew && (!customCategory || !customUnits);

  // Handle saving
  const handleSave = () => {
    setValidated(true);

    // Check validations
    if (
      isNameInvalid ||
      isQuantityInvalid ||
      isThresholdInvalid ||
      isExistingCategoryInvalid ||
      isNewCategoryInvalid
    ) {
      return;
    }

    const itemToSave: NewItem = {
      ...newItem,
      categoryName: isAddingNew ? customCategory : newItem.categoryName,
      units: isAddingNew ? customUnits : newItem.units,
      categoryID: isAddingNew ? null : categorySelection ? parseInt(categorySelection, 10) : null,
    };

    onSave(itemToSave);
    console.log(itemToSave);
    postItem(itemToSave);
  };

  return (
    <Modal show={show} onHide={onCancel} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Add New Item</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form noValidate>
          {/* Item Name */}
          <Form.Group controlId="formItemName" className="mb-3">
            <Form.Label>Item Name</Form.Label>
            <Form.Control
              type="text"
              name="itemName"
              value={newItem.itemName}
              onChange={handleChange}
              required
              autoFocus
              isInvalid={validated && isNameInvalid}
            />
            <Form.Control.Feedback type="invalid">
              Please provide an item name.
            </Form.Control.Feedback>
          </Form.Group>

          {/* Category Dropdown */}
          <Row className="mb-3">
            <Form.Group as={Col} controlId="formCategory">
              <Form.Label>Item Category</Form.Label>
              <Form.Select
                value={categorySelection}
                name="categorySelection"
                onChange={handleSelectCategory}
                required
                disabled={isAddingNew}
                isInvalid={validated && !isAddingNew && !categorySelection}
              >
                <option value="">Select a category...</option>
                {existingCategories.map((category) => (
                  <option key={category.categoryID} value={category.categoryID.toString()}>
                    {category.categoryName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Col md={4}>
              <Form.Label>New Category</Form.Label>
              <Form.Check
                type="switch"
                checked={isAddingNew}
                onChange={(e) => setIsAddingNew(e.target.checked)}
                className="fs-4"
              />
            </Col>
          </Row>

          {/* Custom Category */}
          {isAddingNew && (
            <Row className="mb-3">
              <Form.Group as={Col} controlId="formCustomCategory">
                <Form.Label>New Category Name</Form.Label>
                <Form.Control
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  required
                  isInvalid={validated && !customCategory}
                />
                <Form.Control.Feedback type="invalid">
                  Please provide a new category name.
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group as={Col} controlId="formCustomUnits">
                <Form.Label>Units (e.g., "g", "pcs", "meters")</Form.Label>
                <Form.Control
                  type="text"
                  value={customUnits}
                  onChange={(e) => setCustomUnits(e.target.value)}
                  required
                  isInvalid={validated && !customUnits}
                />
                <Form.Control.Feedback type="invalid">Please provide units.</Form.Control.Feedback>
              </Form.Group>
            </Row>
          )}

          {/* Quantity and Low Threshold */}
          <Row className="mb-3">
            <Form.Group as={Col} controlId="formQuantity">
              <Form.Label>Quantity</Form.Label>
              <InputGroup>
                <Form.Control
                  type="number"
                  name="quantity"
                  min="0"
                  value={newItem.quantity}
                  onChange={handleNumberChange}
                  required
                  isInvalid={validated && isQuantityInvalid}
                />
                {unitsToDisplay && <InputGroup.Text>{unitsToDisplay}</InputGroup.Text>}
                <Form.Control.Feedback type="invalid">Must be 0 or more.</Form.Control.Feedback>
              </InputGroup>
            </Form.Group>
            <Form.Group as={Col} controlId="formLowThreshold">
              <Form.Label>Low Threshold</Form.Label>
              <InputGroup>
                <Form.Control
                  type="number"
                  name="lowThreshold"
                  min="0"
                  value={newItem.lowThreshold}
                  onChange={handleNumberChange}
                  required
                  isInvalid={validated && isThresholdInvalid}
                />
                {unitsToDisplay && <InputGroup.Text>{unitsToDisplay}</InputGroup.Text>}
                <Form.Control.Feedback type="invalid">Must be 0 or more.</Form.Control.Feedback>
              </InputGroup>
            </Form.Group>
          </Row>

          {/* Optional Color */}
          <Form.Group controlId="formColor" className="mb-3">
            <Form.Label>Color (Optional)</Form.Label>
            <Form.Control
              type="text"
              name="color"
              value={newItem.color || ''}
              onChange={handleChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Add Item
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AddItemModal;
