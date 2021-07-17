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
          companyBankAccountNumber: {
            name: 'companyBankAccountNumber',
            label: 'companyBankAccountNumber',
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
