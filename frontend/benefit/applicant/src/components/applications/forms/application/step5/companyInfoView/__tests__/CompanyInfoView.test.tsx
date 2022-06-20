import { RenderResult } from '@testing-library/react';
import renderComponent from 'benefit/applicant/__tests__/utils/render-component';
import { ORGANIZATION_TYPES } from 'benefit-shared/constants';
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
        organizationType: ORGANIZATION_TYPES.COMPANY,
      },
    },
    handleStepChange: jest.fn(),
  };

  const getComponent = (
    props: Partial<CompanyInfoViewProps> = {}
  ): RenderResult =>
    renderComponent(<CompanyInfoView {...initialProps} {...props} />)
      .renderResult;

  it('should render with no accessibility violations', async () => {
    const { container } = getComponent();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
