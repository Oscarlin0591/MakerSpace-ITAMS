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
import calendarIcon from '../assets/calendar_today.svg';

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
  onSave: (date: Date | null, range: DateRangeValue) => void;
};

function ExportDataModal({ show, onCancel, onSave }: ModalProps) {
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
    onSave(date, range);
  };

  // Function to calculate calendar selection start date based on range
  const getStartDate = () => {
    if (!date || !range) {
      return null;
    }

    const newStartDate = new Date(date);
    switch (range) {
      case '7d':
        newStartDate.setDate(newStartDate.getDate() - 7);
        break;
      case '1m':
        newStartDate.setMonth(newStartDate.getMonth() - 1);
        break;
      case '3m':
        newStartDate.setMonth(newStartDate.getMonth() - 3);
        break;
      case '1y':
        newStartDate.setFullYear(newStartDate.getFullYear() - 1);
        break;
      case 'all':
      default:
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
              icon={
                <img
                  src={calendarIcon}
                  alt="calendar"
                  style={{ width: '20px', height: '20px' }}
                />
              }
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
        <Button variant="primary" onClick={handleExport}>
          Export
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ExportDataModal;
