import { axe } from 'jest-axe';
import React from 'react';
import { render, RenderResult } from 'shared/__tests__/utils/test-utils';

import Modal, { ModalProps } from '../Modal';

describe('Modal', () => {
  const initialProps: ModalProps = {
    id: 'modal-id',
    cancelButtonLabel: 'Cancel',
    submitButtonLabel: 'Submit',
    isOpen: true,
    handleSubmit: jest.fn(),
    handleToggle: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  const getComponent = (props: Partial<ModalProps> = {}): RenderResult =>
    render(<Modal {...initialProps} {...props} />);

  it('should render with no accessibility violations', async () => {
    const { container } = getComponent();
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('should call handleSubmit & handleToggle when the submit button is clicked', () => {
    const { getByTestId } = getComponent();
    const submitButton = getByTestId('modalSubmit');

    submitButton.click();

    expect(initialProps.handleSubmit).toHaveBeenCalledTimes(1);
    expect(initialProps.handleToggle).toHaveBeenCalledTimes(1);
  });

  it('should call handleToggle when the cancel button is clicked', () => {
    const { getByTestId } = getComponent();
    const cancelButton = getByTestId('modalCancel');

    cancelButton.click();

    expect(initialProps.handleToggle).toHaveBeenCalledTimes(1);
  });
});
