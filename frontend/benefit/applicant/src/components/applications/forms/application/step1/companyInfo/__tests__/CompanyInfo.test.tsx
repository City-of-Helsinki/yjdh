import { RenderResult } from '@testing-library/react';
import renderComponent from 'benefit/applicant/__tests__/utils/render-component';
import { axe } from 'jest-axe';
import React from 'react';

import CompanyInfo from '../CompanyInfo';

describe('CompanyInfo', () => {
  const getComponent = (props = {}): RenderResult =>
    renderComponent(<CompanyInfo {...props} />);

  it('should render with no accessibility violations', async () => {
    const { container } = getComponent();
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
