import { RenderResult } from '@testing-library/react';
import renderComponent from 'benefit/applicant/__tests__/utils/render-component';
import { axe } from 'jest-axe';
import React from 'react';

import EmployeeView, { EmployeeViewProps } from '../EmployeeView';

describe('EmployeeView', () => {
  const initialProps: EmployeeViewProps = {
    data: {},
  };

  const getComponent = (props: Partial<EmployeeViewProps> = {}): RenderResult =>
    renderComponent(<EmployeeView {...initialProps} {...props} />);

  it('should render with no accessibility violations', async () => {
    const { container } = getComponent();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
