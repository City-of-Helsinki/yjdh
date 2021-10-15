import { RenderResult } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import renderComponent from 'benefit/applicant/__tests__/utils/render-component';
import { useFormik } from 'formik';
import { axe } from 'jest-axe';
import React from 'react';

import CompanyInfo, { CompanyInfoProps } from '../CompanyInfo';

describe('CompanyInfo', () => {
  const getComponent = (formik: CompanyInfoProps['formik']): RenderResult =>
    renderComponent(
      <CompanyInfo
        getErrorMessage={jest.fn()}
        fields={{
          useAlternativeAddress: {
            name: 'useAlternativeAddress',
            label: 'useAlternativeAddress',
          },
          companyDepartment: {
            name: 'companyDepartment',
            label: 'companyDepartment',
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
          associationImmediateManagerCheck: {
            name: 'associationHasBusinessActivities',
            label: 'associationHasBusinessActivities',
          },
        }}
        formik={formik}
        translationsBase=""
      />
    );

  it('should render with no accessibility violations', async () => {
    const { result } = renderHook(() =>
      useFormik({ initialValues: {}, onSubmit: jest.fn() })
    );

    const { container } = getComponent(result.current);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
