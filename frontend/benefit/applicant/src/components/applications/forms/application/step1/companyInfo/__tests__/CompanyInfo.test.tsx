import { RenderResult, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import renderComponent from 'benefit/applicant/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/applicant/__tests__/utils/user-render-helper';
import { translateBackendErrorMessage } from 'benefit/applicant/utils/common';
import { useFormik } from 'formik';
import { axe } from 'jest-axe';
import React from 'react';

import i18n from '../../../../../../../../test/i18n/i18n-test';
import CompanyInfo, { CompanyInfoProps } from '../CompanyInfo';

jest.mock('../useCompanyInfo');
jest.mock('benefit/applicant/utils/common', () => {
  const actual = jest.requireActual('benefit/applicant/utils/common');
  return {
    ...actual,
    translateBackendErrorMessage: jest.fn(),
  };
});

// eslint-disable-next-line @typescript-eslint/no-var-requires, unicorn/prefer-module
const { default: useCompanyInfo } = require('../useCompanyInfo');

const t = i18n.t.bind(i18n);
const translationsBase = 'common:applications.sections.company';
const companyData = {
  name: 'Yritys Oy',
  businessId: '1234567-8',
  companyNumberOfEmployees: 50,
  companyBusinessBrief: 'Yrityksen kuvaus',
  streetAddress: 'Testikatu 1',
  postcode: '00100',
  city: 'Helsinki',
  organizationType: 'company',
};
const associationData = {
  ...companyData,
  name: 'Yhdistys ry',
  organizationType: 'association',
};

const mockCompanyInfo = (
  overrides: Partial<ReturnType<typeof useCompanyInfo>> = {}
): void => {
  (useCompanyInfo as jest.Mock).mockReturnValue({
    t,
    data: companyData,
    isLoading: false,
    shouldShowSkeleton: false,
    error: null,
    clearAlternativeAddressValues: jest.fn(),
    ...overrides,
  });
};

describe('CompanyInfo', () => {
  const defaultFields: CompanyInfoProps['fields'] = {
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
    companyNumberOfEmployees: {
      name: 'companyNumberOfEmployees',
      label: 'companyNumberOfEmployees',
    },
    companyBusinessBrief: {
      name: 'companyBusinessBrief',
      label: 'companyBusinessBrief',
    },
  };

  const getComponent = (
    formik: CompanyInfoProps['formik'],
    fields: CompanyInfoProps['fields'] = defaultFields
  ): RenderResult =>
    renderComponent(
      <CompanyInfo
        getErrorMessage={jest.fn()}
        fields={fields}
        formik={formik}
        translationsBase={translationsBase}
      />
    ).renderResult;

  const getFormik = (
    initialValues: Record<string, unknown> = {}
  ): CompanyInfoProps['formik'] =>
    renderHook(() =>
      useFormik({
        initialValues,
        onSubmit: jest.fn(),
      })
    ).result.current as CompanyInfoProps['formik'];

  beforeEach(() => {
    (translateBackendErrorMessage as jest.Mock).mockReturnValue(null);
    mockCompanyInfo();
  });

  it('renders backend error message when translateBackendErrorMessage returns content', () => {
    (translateBackendErrorMessage as jest.Mock).mockReturnValue(
      <div>Backend error text</div>
    );
    mockCompanyInfo({ error: { message: 'backend error' } });

    getComponent(getFormik());

    expect(screen.getByText('Backend error text')).toBeInTheDocument();
    expect(translateBackendErrorMessage).toHaveBeenCalled();
  });

  it('renders hint text when translateBackendErrorMessage returns nothing', () => {
    (translateBackendErrorMessage as jest.Mock).mockReturnValue(null);
    mockCompanyInfo({ error: { message: 'backend error' } });

    getComponent(getFormik());

    expect(
      screen.getByText(
        /merkityt tiedot on haettu yritys- ja yhteisötietojärjestelmästä/i
      )
    ).toBeInTheDocument();
  });

  it('should render with no accessibility violations', async () => {
    const { container } = getComponent(getFormik());
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('hides company detail values when shouldShowSkeleton is true', () => {
    mockCompanyInfo({ shouldShowSkeleton: true });

    getComponent(getFormik());

    expect(screen.queryByText('Yritys Oy')).not.toBeInTheDocument();
    expect(screen.queryByText('1234567-8')).not.toBeInTheDocument();
    expect(screen.queryByText('Testikatu 1')).not.toBeInTheDocument();
  });

  it('strips masked bank account value and sets normalized value on change', async () => {
    const stripVal = jest.fn(() => 'FI123456');
    const formik = getFormik({
      useAlternativeAddress: false,
      companyBankAccountNumber: '',
    });
    const setFieldValueSpy = jest.spyOn(formik, 'setFieldValue');

    const user = setupUserAndRender(() => {
      getComponent(formik, {
        ...defaultFields,
        companyBankAccountNumber: {
          ...defaultFields.companyBankAccountNumber,
          mask: {
            format: '****************',
            stripVal,
          },
        },
      });
    });

    const bankAccountInput = screen
      .getAllByRole('textbox')
      .find((input) => input.getAttribute('id') === 'companyBankAccountNumber');

    expect(bankAccountInput).toBeDefined();

    await user.type(bankAccountInput as HTMLElement, 'FI12 3456');

    expect(stripVal).toHaveBeenCalled();
    expect(setFieldValueSpy).toHaveBeenLastCalledWith(
      'companyBankAccountNumber',
      'FI123456'
    );
  });

  it.each([
    { optionLabel: 'Ei', expectedValue: false },
    { optionLabel: 'Kyllä', expectedValue: true },
  ])(
    'sets associationHasBusinessActivities to $expectedValue when selecting $optionLabel option',
    async ({ optionLabel, expectedValue }) => {
      mockCompanyInfo({ data: associationData });

      const formik = getFormik({
        useAlternativeAddress: false,
        companyBankAccountNumber: '',
        associationHasBusinessActivities: null,
      });
      const setFieldValueSpy = jest.spyOn(formik, 'setFieldValue');
      const user = setupUserAndRender(() => {
        getComponent(formik);
      });

      await user.click(
        screen.getByRole('radio', {
          name: optionLabel,
        })
      );

      expect(setFieldValueSpy).toHaveBeenCalledWith(
        'associationHasBusinessActivities',
        expectedValue
      );
    }
  );
});
