import { RenderResult } from '@testing-library/react';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { ApplicationReviewViewProps } from 'benefit/handler/types/application';
import { axe } from 'jest-axe';
import React from 'react';

import EmployeeView from '../EmployeeView';

describe('EmployeeView', () => {
  const initialProps = {
    data: {
      employee: {
        firstName: 'test first name',
        lastName: 'test last name',
        socialSecurityNumber: '1111111-01',
        isLivingInHelsinki: true,
      },
    },
  };

  const getComponent = (
    props: Partial<ApplicationReviewViewProps> = {}
  ): RenderResult =>
    renderComponent(<EmployeeView {...initialProps} {...props} />).renderResult;

  it('should render with no accessibility violations', async () => {
    const { container } = getComponent();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
