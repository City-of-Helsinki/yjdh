import '@testing-library/jest-dom';

import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { APPLICATION_FIELD_KEYS } from 'benefit/handler/constants';
import DeMinimisContext from 'benefit/handler/context/DeMinimisContext';
import {
  Application,
  ApplicationFields,
} from 'benefit/handler/types/application';
import { ORGANIZATION_TYPES } from 'benefit-shared/constants';
import { FormikProps } from 'formik';
import React from 'react';

import i18n from '../../../../../../test/i18n/i18n-test';
import CompanySection from '../CompanySection';

const translationsBase = 'common:applications.sections';

function DeMinimisAidFormMock(): React.ReactElement {
  return React.createElement('div', { 'data-testid': 'de-minimis-aid-form' });
}

function DeMinimisAidsListMock(): React.ReactElement {
  return React.createElement('div', { 'data-testid': 'de-minimis-aids-list' });
}

jest.mock('../deMinimisAid/DeMinimisAidForm', () => DeMinimisAidFormMock);
jest.mock(
  '../deMinimisAid/list/DeMinimisAidsList',
  () => DeMinimisAidsListMock
);

const t = i18n.t.bind(i18n) as React.ComponentProps<typeof CompanySection>['t'];

const buildField = (
  name: string
): { name: string; label: string; placeholder: string } => ({
  name,
  label: name,
  placeholder: name,
});

const fields = {
  useAlternativeAddress: buildField('useAlternativeAddress'),
  companyDepartment: buildField('companyDepartment'),
  alternativeCompanyStreetAddress: buildField(
    'alternativeCompanyStreetAddress'
  ),
  alternativeCompanyPostcode: buildField('alternativeCompanyPostcode'),
  alternativeCompanyCity: buildField('alternativeCompanyCity'),
  companyBankAccountNumber: {
    ...buildField('companyBankAccountNumber'),
    mask: {
      format: '****',
      stripVal: (value: string) => value,
    },
  },
  associationHasBusinessActivities: buildField(
    'associationHasBusinessActivities'
  ),
  companyContactPersonFirstName: buildField('companyContactPersonFirstName'),
  companyContactPersonLastName: buildField('companyContactPersonLastName'),
  companyContactPersonPhoneNumber: buildField(
    'companyContactPersonPhoneNumber'
  ),
  companyContactPersonEmail: buildField('companyContactPersonEmail'),
  applicantLanguage: buildField('applicantLanguage'),
  deMinimisAid: buildField(APPLICATION_FIELD_KEYS.DE_MINIMIS_AID),
  coOperationNegotiations: buildField(
    APPLICATION_FIELD_KEYS.CO_OPERATION_NEGOTIATIONS
  ),
  coOperationNegotiationsDescription: buildField(
    APPLICATION_FIELD_KEYS.CO_OPERATION_NEGOTIATIONS_DESCRIPTION
  ),
} as unknown as ApplicationFields;

const baseApplication = {
  company: {
    name: 'Test company',
    businessId: '1234567-8',
    streetAddress: 'Test street 1',
    postcode: '00100',
    city: 'Helsinki',
    organizationType: 'company',
  },
} as unknown as Application;

const buildFormik = (
  overrides: Partial<FormikProps<Partial<Application>>['values']> = {}
): FormikProps<Partial<Application>> =>
  ({
    values: {
      applicantLanguage: undefined,
      useAlternativeAddress: false,
      companyDepartment: '',
      alternativeCompanyStreetAddress: '',
      alternativeCompanyPostcode: '',
      alternativeCompanyCity: '',
      companyBankAccountNumber: '',
      associationHasBusinessActivities: false,
      companyContactPersonFirstName: '',
      companyContactPersonLastName: '',
      companyContactPersonPhoneNumber: '',
      companyContactPersonEmail: '',
      deMinimisAid: false,
      coOperationNegotiations: false,
      coOperationNegotiationsDescription: '',
      ...overrides,
    },
    handleBlur: jest.fn(),
    handleChange: jest.fn(),
    setFieldValue: jest.fn(),
  } as unknown as FormikProps<Partial<Application>>);

const buildContextValue = (
  setDeMinimisAids: jest.Mock
): React.ComponentProps<typeof DeMinimisContext.Provider>['value'] => ({
  deMinimisAids: [],
  setDeMinimisAids,
  unfinishedDeMinimisAidRow: false,
  setUnfinishedDeMinimisAidRow: jest.fn(),
});

type RenderOptions = {
  applicantLanguage?: 'fi' | 'en' | 'sv';
  formikOverrides?: Partial<FormikProps<Partial<Application>>['values']>;
  applicationOverrides?: Partial<Application['company']>;
  showDeminimisSection?: boolean;
};

const renderSubject = ({
  applicantLanguage,
  formikOverrides = {},
  applicationOverrides = {},
  showDeminimisSection = false,
}: RenderOptions = {}): {
  setFieldValue: jest.Mock;
  setDeMinimisAids: jest.Mock;
} => {
  const setFieldValue = jest.fn();
  const setDeMinimisAids = jest.fn();
  const formik = buildFormik({ applicantLanguage, ...formikOverrides });
  (formik as unknown as Record<string, unknown>).setFieldValue = setFieldValue;

  renderComponent(
    <DeMinimisContext.Provider value={buildContextValue(setDeMinimisAids)}>
      <CompanySection
        t={t}
        translationsBase={translationsBase}
        application={
          {
            company: {
              ...baseApplication.company,
              ...applicationOverrides,
            },
          } as unknown as Application
        }
        formik={formik}
        fields={fields}
        getErrorMessage={() => ''}
        languageOptions={[
          { label: 'Suomi', value: 'fi' },
          { label: 'Svenska', value: 'sv' },
        ]}
        showDeminimisSection={showDeminimisSection}
        deMinimisAidSet={[]}
      />
    </DeMinimisContext.Provider>
  );

  return { setFieldValue, setDeMinimisAids };
};

describe('CompanySection', () => {
  describe('company info', () => {
    it('renders company name, business id, street address, postcode and city', () => {
      renderSubject();

      expect(screen.getByText('Test company')).toBeInTheDocument();
      expect(screen.getByText('1234567-8')).toBeInTheDocument();
      expect(screen.getByText('Test street 1')).toBeInTheDocument();
      expect(screen.getByText('00100')).toBeInTheDocument();
      expect(screen.getByText('Helsinki')).toBeInTheDocument();
    });
  });

  describe('contact person fields', () => {
    it('renders all contact person inputs', () => {
      renderSubject();

      expect(
        screen.getByLabelText(/companycontactpersonfirstname/i)
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(/companycontactpersonlastname/i)
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(/companycontactpersonphonenumber/i)
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(/companycontactpersonemail/i)
      ).toBeInTheDocument();
    });
  });

  describe('alternative address', () => {
    it('hides alternative address fields when useAlternativeAddress is false', () => {
      renderSubject({ formikOverrides: { useAlternativeAddress: false } });

      expect(
        screen.queryByLabelText(/companydepartment/i)
      ).not.toBeInTheDocument();
      expect(
        screen.queryByLabelText(/alternativecompanystreetaddress/i)
      ).not.toBeInTheDocument();
    });

    it('shows alternative address fields when useAlternativeAddress is true', () => {
      renderSubject({ formikOverrides: { useAlternativeAddress: true } });

      expect(screen.getByLabelText(/companydepartment/i)).toBeInTheDocument();
      expect(
        screen.getByLabelText(/alternativecompanystreetaddress/i)
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(/alternativecompanypostcode/i)
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(/alternativecompanycity/i)
      ).toBeInTheDocument();
    });
  });

  describe('association business activities', () => {
    it('shows business activities radio group for association organizations', () => {
      renderSubject({
        applicationOverrides: {
          organizationType: ORGANIZATION_TYPES.ASSOCIATION,
        },
      });

      expect(
        screen.getByRole('group', { name: /associationhasbusinessactivities/i })
      ).toBeInTheDocument();
    });

    it('hides business activities radio group for non-association organizations', () => {
      renderSubject({
        applicationOverrides: { organizationType: ORGANIZATION_TYPES.COMPANY },
      });

      expect(
        screen.queryByRole('group', {
          name: /associationhasbusinessactivities/i,
        })
      ).not.toBeInTheDocument();
    });

    it('calls setFieldValue with false when "No" business activities radio is selected', async () => {
      const { setFieldValue } = renderSubject({
        applicationOverrides: {
          organizationType: ORGANIZATION_TYPES.ASSOCIATION,
        },
        formikOverrides: { associationHasBusinessActivities: true },
      });

      const group = screen.getByRole('group', {
        name: /associationhasbusinessactivities/i,
      });
      await userEvent.click(within(group).getByRole('radio', { name: /ei/i }));

      expect(setFieldValue).toHaveBeenCalledWith(
        'associationHasBusinessActivities',
        false
      );
    });

    it('calls setFieldValue with true when "Yes" business activities radio is selected', async () => {
      const { setFieldValue } = renderSubject({
        applicationOverrides: {
          organizationType: ORGANIZATION_TYPES.ASSOCIATION,
        },
        formikOverrides: { associationHasBusinessActivities: false },
      });

      const group = screen.getByRole('group', {
        name: /associationhasbusinessactivities/i,
      });
      await userEvent.click(
        within(group).getByRole('radio', { name: /kyllä/i })
      );

      expect(setFieldValue).toHaveBeenCalledWith(
        'associationHasBusinessActivities',
        true
      );
    });
  });

  describe('de minimis section', () => {
    it('hides de minimis section when showDeminimisSection is false', () => {
      renderSubject({ showDeminimisSection: false });

      expect(
        screen.queryByTestId('de-minimis-aid-form')
      ).not.toBeInTheDocument();
    });

    it('shows de minimis radio group when showDeminimisSection is true', () => {
      renderSubject({ showDeminimisSection: true });

      expect(
        screen.getByRole('group', { name: /deminimisaid/i })
      ).toBeInTheDocument();
    });

    it('hides de minimis form and list when deMinimisAid is false', () => {
      renderSubject({
        showDeminimisSection: true,
        formikOverrides: { deMinimisAid: false },
      });

      expect(
        screen.queryByTestId('de-minimis-aid-form')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('de-minimis-aids-list')
      ).not.toBeInTheDocument();
    });

    it('shows de minimis form and list when deMinimisAid is true', () => {
      renderSubject({
        showDeminimisSection: true,
        formikOverrides: { deMinimisAid: true },
      });

      expect(screen.getByTestId('de-minimis-aid-form')).toBeInTheDocument();
      expect(screen.getByTestId('de-minimis-aids-list')).toBeInTheDocument();
    });

    it('calls setFieldValue and setDeMinimisAids when "No" de minimis radio is selected', async () => {
      const { setFieldValue, setDeMinimisAids } = renderSubject({
        showDeminimisSection: true,
        formikOverrides: { deMinimisAid: true },
      });

      const group = screen.getByRole('group', { name: /deminimisaid/i });
      await userEvent.click(within(group).getByRole('radio', { name: /ei/i }));

      expect(setFieldValue).toHaveBeenCalledWith('deMinimisAid', false);
      expect(setDeMinimisAids).toHaveBeenCalledWith([]);
    });

    it('calls setFieldValue when "Yes" de minimis radio is selected', async () => {
      const { setFieldValue } = renderSubject({
        showDeminimisSection: true,
        formikOverrides: { deMinimisAid: false },
      });

      const group = screen.getByRole('group', { name: /deminimisaid/i });
      await userEvent.click(
        within(group).getByRole('radio', { name: /kyllä/i })
      );

      expect(setFieldValue).toHaveBeenCalledWith('deMinimisAid', true);
    });
  });

  describe('co-operation negotiations', () => {
    it('hides description textarea when coOperationNegotiations is false', () => {
      renderSubject({ formikOverrides: { coOperationNegotiations: false } });

      expect(
        screen.queryByLabelText(/cooperationnegotiationsdescription/i)
      ).not.toBeInTheDocument();
    });

    it('shows description textarea when coOperationNegotiations is true', () => {
      renderSubject({ formikOverrides: { coOperationNegotiations: true } });

      expect(
        screen.getByLabelText(/cooperationnegotiationsdescription/i)
      ).toBeInTheDocument();
    });

    it('calls setFieldValue with false and clears description when "No" is selected', async () => {
      const { setFieldValue } = renderSubject({
        formikOverrides: { coOperationNegotiations: true },
      });

      const group = screen.getByRole('group', {
        name: /cooperationnegotiations/i,
      });
      await userEvent.click(within(group).getByRole('radio', { name: /ei/i }));

      expect(setFieldValue).toHaveBeenCalledWith(
        'coOperationNegotiations',
        false
      );
      expect(setFieldValue).toHaveBeenCalledWith(
        APPLICATION_FIELD_KEYS.CO_OPERATION_NEGOTIATIONS_DESCRIPTION,
        ''
      );
    });

    it('calls setFieldValue with true when "Yes" is selected', async () => {
      const { setFieldValue } = renderSubject({
        formikOverrides: { coOperationNegotiations: false },
      });

      const group = screen.getByRole('group', {
        name: /cooperationnegotiations/i,
      });
      await userEvent.click(
        within(group).getByRole('radio', { name: /kyllä/i })
      );

      expect(setFieldValue).toHaveBeenCalledWith(
        'coOperationNegotiations',
        true
      );
    });
  });

  describe('bank account number onChange', () => {
    it('calls setFieldValue with stripVal result when mask is defined', () => {
      const setFieldValue = jest.fn();
      const stripVal = jest.fn((v: string) => `stripped_${v}`);
      const customFields = {
        ...fields,
        companyBankAccountNumber: {
          ...buildField('companyBankAccountNumber'),
          mask: { format: '****', stripVal },
        },
      } as unknown as ApplicationFields;
      const formik = buildFormik();
      (formik as unknown as Record<string, unknown>).setFieldValue =
        setFieldValue;

      renderComponent(
        <DeMinimisContext.Provider value={buildContextValue(jest.fn())}>
          <CompanySection
            t={t}
            translationsBase={translationsBase}
            application={baseApplication}
            formik={formik}
            fields={customFields}
            getErrorMessage={() => ''}
            languageOptions={[]}
            showDeminimisSection={false}
            deMinimisAidSet={[]}
          />
        </DeMinimisContext.Provider>
      );

      fireEvent.change(screen.getByLabelText(/companybankacc/i), {
        target: { value: 'FI12' },
      });

      expect(stripVal).toHaveBeenCalledWith('FI12');
      expect(setFieldValue).toHaveBeenCalledWith(
        'companyBankAccountNumber',
        'stripped_FI12'
      );
    });
  });

  describe('applicant language select value', () => {
    it('uses Finnish fallback option when applicant language is missing', () => {
      renderSubject();

      expect(
        screen.getByRole('combobox', { name: /applicantlanguage/i })
      ).toHaveTextContent('Suomi');
    });

    it('uses formik applicant language when it exists', () => {
      renderSubject({ applicantLanguage: 'sv' });

      expect(
        screen.getByRole('combobox', { name: /applicantlanguage/i })
      ).toHaveTextContent('Svenska');
    });

    it('calls setFieldValue with selected language value when language is changed', async () => {
      const { setFieldValue } = renderSubject();

      await userEvent.click(
        screen.getByRole('combobox', { name: /applicantlanguage/i })
      );
      await userEvent.click(screen.getByRole('option', { name: /svenska/i }));

      expect(setFieldValue).toHaveBeenCalledWith('applicantLanguage', 'sv');
    });
  });
});
