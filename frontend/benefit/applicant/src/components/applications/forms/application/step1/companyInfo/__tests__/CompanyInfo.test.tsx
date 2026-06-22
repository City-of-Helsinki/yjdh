import { renderHook, RenderResult, screen } from '@testing-library/react';
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
    purchasedService: {
      name: 'purchasedService',
      label: 'purchasedService',
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

      const associationBusinessActivitiesRadio = screen
        .getAllByRole('radio', {
          name: optionLabel,
        })
        .find(
          (radio) =>
            radio.getAttribute('name') ===
            defaultFields.associationHasBusinessActivities.name
        );

      expect(associationBusinessActivitiesRadio).toBeDefined();

      await user.click(associationBusinessActivitiesRadio as HTMLElement);

      expect(setFieldValueSpy).toHaveBeenCalledWith(
        'associationHasBusinessActivities',
        expectedValue
      );
    }
  );

  it('renders purchasedService radio buttons', () => {
    getComponent(
      getFormik({
        useAlternativeAddress: false,
        companyBankAccountNumber: '',
        purchasedService: null,
      })
    );

    const purchasedServiceRadios = screen
      .getAllByRole('radio')
      .filter(
        (radio) =>
          radio.getAttribute('name') === defaultFields.purchasedService.name
      );

    expect(purchasedServiceRadios).toHaveLength(2);
    expect(
      purchasedServiceRadios.some(
        (radio) => radio.getAttribute('value') === 'false'
      )
    ).toBe(true);
    expect(
      purchasedServiceRadios.some(
        (radio) => radio.getAttribute('value') === 'true'
      )
    ).toBe(true);
  });

  it('sets purchasedService to false when selecting Ei option', async () => {
    const formik = getFormik({
      useAlternativeAddress: false,
      companyBankAccountNumber: '',
      purchasedService: null,
    });
    const setFieldValueSpy = jest.spyOn(formik, 'setFieldValue');
    const user = setupUserAndRender(() => {
      getComponent(formik);
    });

    const purchasedServiceFalseRadio = screen
      .getAllByRole('radio', {
        name: 'Ei',
      })
      .find(
        (radio) =>
          radio.getAttribute('name') === defaultFields.purchasedService.name
      );

    expect(purchasedServiceFalseRadio).toBeDefined();

    await user.click(purchasedServiceFalseRadio as HTMLElement);

    expect(setFieldValueSpy).toHaveBeenCalledWith('purchasedService', false);
  });

  it('sets purchasedService to true when selecting Kyllä option', async () => {
    const formik = getFormik({
      useAlternativeAddress: false,
      companyBankAccountNumber: '',
      purchasedService: null,
    });
    const setFieldValueSpy = jest.spyOn(formik, 'setFieldValue');
    const user = setupUserAndRender(() => {
      getComponent(formik);
    });

    const purchasedServiceTrueRadio = screen
      .getAllByRole('radio', {
        name: 'Kyllä',
      })
      .find(
        (radio) =>
          radio.getAttribute('name') === defaultFields.purchasedService.name
      );

    expect(purchasedServiceTrueRadio).toBeDefined();

    await user.click(purchasedServiceTrueRadio as HTMLElement);

    expect(setFieldValueSpy).toHaveBeenCalledWith('purchasedService', true);
  });
});
