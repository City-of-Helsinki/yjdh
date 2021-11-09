import { RenderResult } from '@testing-library/react';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { APPLICATION_STATUSES } from 'benefit/handler/constants';
import { axe } from 'jest-axe';
import React from 'react';

import ApplicationList, { ApplicationListProps } from '../ApplicationList';

describe('ApplicationList', () => {
  const initialProps: ApplicationListProps = {
    heading: 'Application List',
    status: [APPLICATION_STATUSES.RECEIVED],
  };

  const getComponent = (
    props: Partial<ApplicationListProps> = {}
  ): RenderResult =>
    renderComponent(<ApplicationList {...initialProps} {...props} />)
      .renderResult;

  it('should render with no accessibility violations', async () => {
    const { container } = getComponent();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
