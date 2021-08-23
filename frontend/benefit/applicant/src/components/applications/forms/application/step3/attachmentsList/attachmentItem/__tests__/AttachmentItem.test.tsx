import { RenderResult } from '@testing-library/react';
import renderComponent from 'benefit/applicant/__tests__/utils/render-component';
import { axe } from 'jest-axe';
import noop from 'lodash/noop';
import React from 'react';

import AttachmentItem, { AttachmentItemProps } from '../AttachmentItem';

describe('AttachmentItem', () => {
  const initialProps: AttachmentItemProps = {
    id: 'testId',
    name: 'attachment_name.pdf',
    removeText: 'Remove attachment',
    onClick: () => noop,
    onRemove: () => noop,
  };

  const getComponent = (
    props: Partial<AttachmentItemProps> = {}
  ): RenderResult =>
    renderComponent(<AttachmentItem {...initialProps} {...props} />);

  it('should render with no accessibility violations', async () => {
    const { container } = getComponent();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
