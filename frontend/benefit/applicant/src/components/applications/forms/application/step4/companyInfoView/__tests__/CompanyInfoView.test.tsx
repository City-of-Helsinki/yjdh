import { RenderResult } from '@testing-library/react';
import renderComponent from 'benefit/applicant/__tests__/utils/render-component';
import { axe } from 'jest-axe';
import React from 'react';

import CompanyInfoView, { CompanyInfoViewProps } from '../CompanyInfoView';

describe('CompanyInfoView', () => {
  const initialProps: CompanyInfoViewProps = {
    data: {
      company: {
        name: 'Test company',
        businessId: '123456-1234',
        companyForm: 'OY',
        streetAddress: 'Street address',
        postcode: '12345',
        city: 'Helsinki',
        bankAccountNumber: 'FI1234567890',
      },
    },
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
