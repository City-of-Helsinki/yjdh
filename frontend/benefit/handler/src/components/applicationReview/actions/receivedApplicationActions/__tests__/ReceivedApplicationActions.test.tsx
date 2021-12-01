import { RenderResult } from '@testing-library/react';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { axe } from 'jest-axe';
import React from 'react';

import ReceivedApplicationActions, {
  Props,
} from '../ReceivedApplicationActions';

describe('ReceivedApplicationActions', () => {
  const initialProps: Props = {
    application: {},
  };

  const getComponent = (props: Partial<Props> = {}): RenderResult =>
    renderComponent(<ReceivedApplicationActions {...initialProps} {...props} />)
      .renderResult;

  it('should render with no accessibility violations', async () => {
    const { container } = getComponent();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
