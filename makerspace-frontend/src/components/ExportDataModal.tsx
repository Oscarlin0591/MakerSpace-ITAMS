/**
 * ExportDataModal.tsx
 * A modal that will pop up date selection options for user
 * to select the date range in which they would like inventory
 * data exported.
 * DatePicker Documentation:
 * https://reactdatepicker.com/#example-calendar-icon-using-external-lib
 */

import { Modal, Button, Form } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar } from 'react-bootstrap-icons';
import { CSVLink } from 'react-csv';
import styles from './ExportDataModal.module.css';

// Options for dropdown menu
const DATE_RANGE_OPTIONS = [
  { label: 'Select a range...', value: '' },
  { label: '7 Days', value: '7d' },
  { label: '1 Month', value: '1m' },
  { label: '3 Months', value: '3m' },
  { label: '1 Year', value: '1y' },
  { label: 'All', value: 'all' },
];

// DateRangeValue types include only these values
export type DateRangeValue = '7d' | '1m' | '3m' | '1y' | 'all' | '';

type ModalProps = {
  show: boolean;
  onCancel: () => void;
  onExport: (date: Date | null, range: DateRangeValue) => void;
  csvData: any[];
};

function ExportDataModal({ show, onCancel, onExport, csvData }: ModalProps) {
  const [date, setDate] = useState<Date | null>(null);
  const [range, setRange] = useState<DateRangeValue>('');

  // Clear modal on open
  useEffect(() => {
    if (show) {
      setDate(null);
      setRange('');
    }
  }, [show]);

  // Handle saving date/range
  const handleExport = () => {
    //TODO: Improve validation
    if (!date || !range) return;
    onExport(date, range);
  };

  console.log(csvData)

  // Function to calculate calendar selection start date based on range
  const getStartDate = () => {
    if (!date || !range) {
      return null;
    }

    const newStartDate = new Date(date);
    if (range === '7d') {
      newStartDate.setDate(newStartDate.getDate() - 7);
    } else if (range === '1m') {
      newStartDate.setMonth(newStartDate.getMonth() - 1);
    } else if (range === '3m') {
      newStartDate.setMonth(newStartDate.getMonth() - 3);
    } else if (range === '1y') {
      newStartDate.setFullYear(newStartDate.getFullYear() - 1);
    } else {
      return null;
    }

    return newStartDate;
  };

  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>Export Data</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formRange">
            <Form.Label>Range</Form.Label>
            <Form.Select
              value={range}
              autoFocus
              onChange={(e) => setRange(e.target.value as DateRangeValue)} // Update state on change
            >
              {DATE_RANGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group controlId="formDate" className="mt-3">
            <Form.Label>Date</Form.Label>
            <DatePicker
              showIcon
              icon={<Calendar />}
              selected={date}
              onChange={(selectedDate: Date | null) => setDate(selectedDate)}
              className="form-control"
              placeholderText="mm/dd/yyyy"
              autoComplete="off"
              maxDate={new Date()}
              startDate={getStartDate()}
              endDate={date}
              shouldCloseOnSelect={false}
              disabled={range === ''}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary">
          <CSVLink data={csvData} filename={'inventory-data.csv'} className={styles['CSVLink']}>
            Export
          </CSVLink>
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ExportDataModal;
