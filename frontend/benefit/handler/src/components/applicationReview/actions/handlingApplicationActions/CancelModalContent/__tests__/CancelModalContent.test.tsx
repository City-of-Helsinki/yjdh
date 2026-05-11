import { screen } from '@testing-library/react';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/handler/__tests__/utils/user-render-helper';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import React from 'react';

import CancelModalContent from '../CancelModalContent';

const onClose = jest.fn();
const onSubmit = jest.fn();

const renderSubject = (): ReturnType<typeof renderComponent> =>
  renderComponent(<CancelModalContent onClose={onClose} onSubmit={onSubmit} />);

// UI Element Getters
const getCloseButton = (): HTMLElement =>
  screen.getByRole('button', { name: /sulje/i });

const getSubmitButton = (): HTMLElement =>
  screen.getByRole('button', { name: /peruuta/i });

const getTextarea = (): HTMLElement => screen.getByDisplayValue('');

describe('CancelModalContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders textarea and buttons', () => {
    renderSubject();

    expect(getTextarea()).toBeInTheDocument();
    expect(getCloseButton()).toBeInTheDocument();
    expect(getSubmitButton()).toBeInTheDocument();
  });

  it('disables submit button when empty and enables when text entered', async () => {
    const user = setupUserAndRender(() => renderSubject());

    const textarea = screen.getByDisplayValue('');
    const submitButton = getSubmitButton();

    // Initially disabled
    expect(submitButton).toBeDisabled();

    // Enabled after typing
    await user.type(textarea, 'Cancellation reason');
    expect(submitButton).toBeEnabled();

    // Disabled again when cleared
    await user.clear(textarea);
    expect(submitButton).toBeDisabled();
  });

  it('calls onSubmit with correct payload when submit button is clicked', async () => {
    const user = setupUserAndRender(() => renderSubject());

    const textarea = screen.getByDisplayValue('');

    await user.type(textarea, 'Application cancelled due to request');
    await user.click(getSubmitButton());

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      status: APPLICATION_STATUSES.CANCELLED,
      logEntryComment: 'Application cancelled due to request',
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = setupUserAndRender(() => renderSubject());

    await user.click(getCloseButton());

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
