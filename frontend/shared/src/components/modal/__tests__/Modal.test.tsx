import { axe } from 'jest-axe';
import React from 'react';
import { render, RenderResult } from 'shared/__tests__/utils/test-utils';

import Modal, { ModalProps } from '../Modal';

describe('Modal', () => {
  const initialProps: ModalProps = {
    id: 'modal-id',
    submitButtonLabel: 'Submit',
    isOpen: true,
    handleSubmit: jest.fn(),
    handleToggle: jest.fn(),
  };

  const getComponent = (props: Partial<ModalProps> = {}): RenderResult =>
    render(<Modal {...initialProps} {...props} />);

  it('should render with no accessibility violations', async () => {
    const { container } = getComponent();
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
