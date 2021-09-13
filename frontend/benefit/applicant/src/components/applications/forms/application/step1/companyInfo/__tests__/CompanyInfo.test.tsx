import { RenderResult } from '@testing-library/react';
import renderComponent from 'benefit/applicant/__tests__/utils/render-component';
import { axe } from 'jest-axe';
import React from 'react';

import CompanyInfo from '../CompanyInfo';

describe('CompanyInfo', () => {
  const getComponent = (): RenderResult =>
    renderComponent(
      <CompanyInfo
        getErrorMessage={() => ''}
        fields={{
          useAlternativeAddress: {
            name: 'useAlternativeAddress',
            label: 'useAlternativeAddress',
          },
          alternativeCompanyPostcode: {
            name: 'alternativeCompanyPostcode',
            label: 'alternativeCompanyPostcode',
          },
          alternativeCompanyStreetAddress: {
            name: 'alternativeCompanyStreetAddress',
            label: 'alternativeCompanyStreetAddress',
          },
          alternativeCompanyCity: {
            name: 'alternativeCompanyCity',
            label: 'alternativeCompanyCity',
          },
          companyBankAccountNumber: {
            name: 'companyBankAccountNumber',
            label: 'companyBankAccountNumber',
          },
          associationHasBusinessActivities: {
            name: 'associationHasBusinessActivities',
            label: 'associationHasBusinessActivities',
          },
        }}
        translationsBase=""
      />
    );

  it('should render with no accessibility violations', async () => {
    const { container } = getComponent();
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
