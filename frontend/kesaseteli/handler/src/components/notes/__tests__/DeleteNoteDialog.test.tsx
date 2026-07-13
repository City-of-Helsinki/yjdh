import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';

import DeleteNoteDialog from '../DeleteNoteDialog';

describe('DeleteNoteDialog', () => {
  const mockClose = jest.fn();
  const mockConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders dialog content correctly when isOpen is true', () => {
    renderComponent(
      <DeleteNoteDialog
        id="note-1"
        isOpen
        onClose={mockClose}
        onConfirm={mockConfirm}
        isDeleting={false}
      />
    );

    expect(screen.getByText(/poistetaanko huomio\?/i)).toBeInTheDocument();
    expect(screen.getByText(/toimintoa ei voi peruuttaa/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /peruuta/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /poista/i })).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', async () => {
    renderComponent(
      <DeleteNoteDialog
        id="note-1"
        isOpen
        onClose={mockClose}
        onConfirm={mockConfirm}
        isDeleting={false}
      />
    );

    const cancelBtn = screen.getByRole('button', { name: /peruuta/i });
    await userEvent.click(cancelBtn);

    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm when delete button is clicked', async () => {
    renderComponent(
      <DeleteNoteDialog
        id="note-1"
        isOpen
        onClose={mockClose}
        onConfirm={mockConfirm}
        isDeleting={false}
      />
    );

    const deleteConfirmBtn = screen.getByRole('button', { name: /poista/i });
    await userEvent.click(deleteConfirmBtn);

    expect(mockConfirm).toHaveBeenCalledTimes(1);
  });

  it('shows loading state on delete button when isDeleting is true', () => {
    renderComponent(
      <DeleteNoteDialog
        id="note-1"
        isOpen
        onClose={mockClose}
        onConfirm={mockConfirm}
        isDeleting
      />
    );

    const deleteConfirmBtn = screen.getByRole('button', {
      name: /poistetaan/i,
    });
    expect(deleteConfirmBtn).toBeDisabled();
  });
});
