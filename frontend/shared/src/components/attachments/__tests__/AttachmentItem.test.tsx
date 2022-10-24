import { axe } from 'jest-axe';
import noop from 'lodash/noop';
import React from 'react';
import renderComponent from 'shared/__tests__/utils/render-component/render-component';

import AttachmentItem, { AttachmentItemProps } from '../AttachmentItem';

const render = renderComponent(undefined, 'http://localhost:8000');

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
  ): ReturnType<typeof render> =>
    render(<AttachmentItem {...initialProps} {...props} />);

  it('should render with no accessibility violations', async () => {
    const {
      renderResult: { container },
    } = getComponent();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
