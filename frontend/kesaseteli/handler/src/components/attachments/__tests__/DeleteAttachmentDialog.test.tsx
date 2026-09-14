import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';
import type { KesaseteliAttachment } from 'shared/types/attachment';

import DeleteAttachmentDialog from '../DeleteAttachmentDialog';

const mockAttachment: KesaseteliAttachment = {
  id: 'attachment-id',
  application: 'app-id',
  attachment_type: 'employment_contract',
  attachment_file_name: 'test-contract.pdf',
  content_type: 'application/pdf',
  created_at: '2023-01-01T12:00:00Z',
  summer_voucher: 'voucher-id',
};

describe('DeleteAttachmentDialog', () => {
  it('should render the dialog correctly when isOpen is true', () => {
    renderComponent(
      <DeleteAttachmentDialog
        attachment={mockAttachment}
        isOpen
        isDeleting={false}
        onClose={jest.fn()}
        onConfirm={jest.fn()}
      />
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByText(/haluatko varmasti poistaa liitteen/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/olet poistamassa liitteen/i)).toBeInTheDocument();
  });

  it('should call onConfirm when the confirm button is clicked', async () => {
    const onConfirmMock = jest.fn();
    renderComponent(
      <DeleteAttachmentDialog
        attachment={mockAttachment}
        isOpen
        isDeleting={false}
        onClose={jest.fn()}
        onConfirm={onConfirmMock}
      />
    );
    const confirmButton = screen.getByTestId(
      `delete-attachment-confirm-button-${mockAttachment.id}`
    );
    await userEvent.click(confirmButton);
    expect(onConfirmMock).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when the cancel button is clicked', async () => {
    const onCloseMock = jest.fn();
    renderComponent(
      <DeleteAttachmentDialog
        attachment={mockAttachment}
        isOpen
        isDeleting={false}
        onClose={onCloseMock}
        onConfirm={jest.fn()}
      />
    );
    const cancelButton = screen.getByRole('button', { name: 'Peruuta' });
    await userEvent.click(cancelButton);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('should disable the confirm button when isDeleting is true', () => {
    renderComponent(
      <DeleteAttachmentDialog
        attachment={mockAttachment}
        isOpen
        isDeleting
        onClose={jest.fn()}
        onConfirm={jest.fn()}
      />
    );
    const confirmButton = screen.getByTestId(
      `delete-attachment-confirm-button-${mockAttachment.id}`
    );
    expect(confirmButton).toBeDisabled();
    expect(screen.getByText('Poistetaan...')).toBeInTheDocument();
  });
});
