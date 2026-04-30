/**
 * DeleteConfirmationModal.test.tsx
 * React Testing Library coverage for delete confirmation interactions.
 *
 * @ai-assisted Codex (OpenAI) — https://openai.com/codex
 * AI used to add frontend component interaction tests.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { jest } from '@jest/globals';
import DeleteConfirmationModal from '../../src/components/DeleteConfirmationModal';

describe('DeleteConfirmationModal', () => {
  it('shows the selected item and calls the correct handlers', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();
    const onDelete = jest.fn();

    render(
      <DeleteConfirmationModal
        show={true}
        itemName="PLA spool"
        onCancel={onCancel}
        onDelete={onDelete}
      />,
    );

    expect(screen.getByText('PLA spool')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    await user.click(screen.getByRole('button', { name: /delete/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
