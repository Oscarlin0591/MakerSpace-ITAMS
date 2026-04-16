/**
 * ExportDataModal.tsx
 * A modal that will pop up date selection options for user
 * to select the date range in which they would like inventory
 * data exported.
 * DatePicker Documentation:
 * https://reactdatepicker.com/#example-calendar-icon-using-external-lib
 */

import { Button, Col, Form, InputGroup, Modal, Row } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar } from 'react-bootstrap-icons';
import { CSVLink } from 'react-csv';
import styles from './ExportDataModal.module.css';
import { type BackendTransaction } from '../service/transaction_service.ts';

// Options for dropdown menu
const DATE_RANGE_OPTIONS = ['Days', 'Weeks', 'Months', 'Years'];

type ModalProps = {
  data: BackendTransaction[];
  show: boolean;
  onClose: () => void;
};

function ExportDataModal({ data, show, onClose }: ModalProps) {
  const [startDate, setStartDate] = useState<Date>(getInitialDate());
  const [rangeUnit, setRangeUnit] = useState<string>('Days');
  const [rangeNumber, setRangeNumber] = useState<number>(1);

  // Clear modal on open
  useEffect(() => {
    if (show) {
      setStartDate(getInitialDate());
      setRangeUnit('Days');
      setRangeNumber(1);
    }
  }, [show]);

  // Handle saving startDate/range
  // const handleExport = () => {
  //   //TODO: Improve validation
  //   if (!startDate || !range) return;
  //   onExport(startDate, range);
  // };

  function getInitialDate() {
    const date = new Date(Date.now());
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  // Function to calculate calendar selection start startDate based on range
  const getEndDate = () => {
    const newEndDate = new Date(startDate);
    if (rangeUnit === 'Days') {
      newEndDate.setDate(newEndDate.getDate() + rangeNumber);
    } else if (rangeUnit === 'Weeks') {
      newEndDate.setDate(newEndDate.getDate() + rangeNumber * 7);
    } else if (rangeUnit === 'Months') {
      newEndDate.setMonth(newEndDate.getMonth() + rangeNumber);
    } else if (rangeUnit === 'Years') {
      newEndDate.setFullYear(newEndDate.getFullYear() + rangeNumber);
    } else {
      return startDate;
    }
    newEndDate.setMilliseconds(newEndDate.getMilliseconds() - 1);

    return newEndDate;
  };

  function filterData() {
    if (!data) return [];
    return data.filter((transaction: BackendTransaction) => {
      const date = new Date(transaction.recorded_at);
      return startDate <= date && date <= getEndDate();
    });
  }

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Export Data</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Form.Group as={Col} controlId="formDate" className="mt-3">
              <Form.Label>Date</Form.Label>
              <DatePicker
                showIcon
                icon={<Calendar />}
                selected={startDate}
                onChange={(selectedDate: Date | null) =>
                  selectedDate ? setStartDate(selectedDate) : null
                }
                className="form-control"
                placeholderText="mm/dd/yyyy"
                autoComplete="off"
                maxDate={new Date()}
                startDate={startDate}
                endDate={getEndDate()}
                shouldCloseOnSelect={false}
              />
            </Form.Group>
          </Row>
          <Row>
            <Form.Group as={Col} controlId="editQuantity">
              <Form.Label>Quantity</Form.Label>
              <InputGroup>
                <Form.Control
                  type="number"
                  name="quantity"
                  min="1"
                  value={rangeNumber}
                  onChange={(e) => setRangeNumber(parseInt(e.target.value))}
                  required
                  // isInvalid={validated && isQuantityInvalid}
                />
                {/*{selectedCategory && <InputGroup.Text>{selectedCategory.units}</InputGroup.Text>}*/}
                {/*<Form.Control.Feedback type="invalid">Must be 0 or more.</Form.Control.Feedback>*/}
              </InputGroup>
            </Form.Group>
            <Form.Group as={Col} controlId="formRange">
              <Form.Label>Unit</Form.Label>
              <Form.Select
                value={rangeUnit}
                autoFocus
                onChange={(e) => setRangeUnit(e.target.value)} // Update state on change
              >
                {DATE_RANGE_OPTIONS.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary">
          <CSVLink
            data={filterData()}
            filename={'inventory-data.csv'}
            className={styles['CSVLink']}
            onClick={onClose}
          >
            Export
          </CSVLink>
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ExportDataModal;
