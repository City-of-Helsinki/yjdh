import { RenderResult } from '@testing-library/react';
import renderComponent from 'benefit/applicant/__tests__/utils/render-component';
import { axe } from 'jest-axe';
import React from 'react';

import CompanyInfoView, { CompanyInfoViewProps } from '../CompanyInfoView';

describe('CompanyInfoView', () => {
  const initialProps: CompanyInfoViewProps = {
    data: {},
  };

  const getComponent = (
    props: Partial<CompanyInfoViewProps> = {}
  ): RenderResult =>
    renderComponent(<CompanyInfoView {...initialProps} {...props} />);

  it('should render with no accessibility violations', async () => {
    const { container } = getComponent();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
