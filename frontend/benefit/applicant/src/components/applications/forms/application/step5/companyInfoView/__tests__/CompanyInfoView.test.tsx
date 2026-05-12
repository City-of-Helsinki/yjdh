import { RenderResult, screen } from '@testing-library/react';
import renderComponent from 'benefit/applicant/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/applicant/__tests__/utils/user-render-helper';
import { ORGANIZATION_TYPES } from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import { formatIBAN } from 'benefit-shared/utils/common';
import { axe } from 'jest-axe';
import React from 'react';
import { convertToUIDateFormat } from 'shared/utils/date.utils';

import CompanyInfoView, { CompanyInfoViewProps } from '../CompanyInfoView';

describe('CompanyInfoView', () => {
  const EDIT_BUTTON_TEXT = 'Muokkaa';
  const DE_MINIMIS_NO_TEXT =
    'Ei, työnantajalle ei ole myönnetty de minimis -tukia kuluvan vuoden ja kahden edellisen verovuoden aikana.';
  const COOPERATION_NEGOTIATIONS_YES_TEXT =
    'Kyllä, organisaatiolla on käynnissä olevat, tai päättyneet muutosneuvottelut edeltävän 12 kuukauden aikana.';
  const COOPERATION_NEGOTIATIONS_NO_TEXT =
    'Ei, organisaatiolla ei ole käynnissä tai edeltävän 12 kuukauden aikana päättyneitä muutosneuvotteluja.';
  const handleStepChange = jest.fn();
  const initialProps: CompanyInfoViewProps = {
    data: {
      company: {
        name: 'Test company',
        businessId: '123456-1234',
        organizationType: ORGANIZATION_TYPES.COMPANY,
        companyForm: 'OY',
        streetAddress: 'Street address',
        postcode: '12345',
        city: 'Helsinki',
      },
      companyBankAccountNumber: 'FI1234567890123456',
      companyContactPersonFirstName: 'Teppo',
      companyContactPersonLastName: 'Testaaja',
      companyContactPersonPhoneNumber: '0401234567',
      companyContactPersonEmail: 'teppo@example.com',
      applicantLanguage: 'fi',
      organizationType: ORGANIZATION_TYPES.COMPANY,
      deMinimisAidSet: [],
      coOperationNegotiations: false,
    } as Application,
    handleStepChange,
  };

  const buildData = (overrides: Partial<Application> = {}): Application =>
    ({
      ...initialProps.data,
      ...overrides,
    } as Application);

  const getComponent = (
    props: Partial<CompanyInfoViewProps> = {}
  ): RenderResult =>
    renderComponent(<CompanyInfoView {...initialProps} {...props} />)
      .renderResult;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with no accessibility violations', async () => {
    const { container } = getComponent();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('shows edit action and moves back to step 1 when clicked', async () => {
    const user = setupUserAndRender(() => {
      getComponent();
    });

    await user.click(
      screen.getByRole('button', {
        name: EDIT_BUTTON_TEXT,
      })
    );

    expect(handleStepChange).toHaveBeenCalledWith(1);
  });

  it('hides edit action in read-only mode', () => {
    getComponent({ isReadOnly: true });

    expect(
      screen.queryByRole('button', {
        name: EDIT_BUTTON_TEXT,
      })
    ).not.toBeInTheDocument();
  });

  it('renders company and contact information', () => {
    getComponent();
    const companyAddressField = screen.getByTestId(
      'application-field-companyAddress'
    );

    expect(
      screen.getByTestId('application-field-companyName')
    ).toHaveTextContent('Test company');
    expect(
      screen.getByTestId('application-field-companyBusinessId')
    ).toHaveTextContent('123456-1234');
    expect(companyAddressField).toHaveTextContent('Street address');
    expect(companyAddressField).toHaveTextContent('12345 Helsinki');
    expect(
      screen.getByTestId('application-field-companyBankAccountNumber')
    ).toHaveTextContent(formatIBAN('FI1234567890123456'));
    expect(
      screen.getByTestId('application-field-companyContactPersonFirstName')
    ).toHaveTextContent('Teppo');
    expect(
      screen.getByTestId('application-field-companyContactPersonLastName')
    ).toHaveTextContent('Testaaja');
    expect(
      screen.getByTestId('application-field-companyContactPersonPhoneNumber')
    ).toHaveTextContent('0401234567');
    expect(
      screen.getByTestId('application-field-companyContactPersonEmail')
    ).toHaveTextContent('teppo@example.com');
    expect(
      screen.getByTestId('application-field-applicantLanguage')
    ).toHaveTextContent('Suomi');
  });

  it('renders alternative company address when provided', () => {
    getComponent({
      data: buildData({
        companyDepartment: 'HR',
        alternativeCompanyStreetAddress: 'Other street 1',
        alternativeCompanyPostcode: '00100',
        alternativeCompanyCity: 'Espoo',
      }),
    });
    const alternativeAddressField = screen.getByTestId(
      'application-field-alternativeCompanyStreetAddress'
    );

    expect(alternativeAddressField).toHaveTextContent('HR');
    expect(alternativeAddressField).toHaveTextContent('Other street 1');
    expect(alternativeAddressField).toHaveTextContent('00100 Espoo');
  });

  it.each([
    {
      associationHasBusinessActivities: true,
      expectedText: 'Kyllä',
      testName: 'renders association business activities as yes',
    },
    {
      associationHasBusinessActivities: false,
      expectedText: 'Ei',
      testName: 'renders association business activities as no',
    },
  ])('$testName', ({ associationHasBusinessActivities, expectedText }) => {
    getComponent({
      data: buildData({
        organizationType: ORGANIZATION_TYPES.ASSOCIATION,
        associationHasBusinessActivities,
      }),
    });

    expect(
      screen.getByTestId('application-field-associationHasBusinessActivities')
    ).toHaveTextContent(expectedText);
  });

  it('renders de minimis aid rows when aids exist', () => {
    getComponent({
      data: buildData({
        deMinimisAidSet: [
          {
            granter: 'Business Finland',
            amount: 1234.56,
            grantedAt: '2024-05-15',
          },
        ],
      }),
    });

    expect(screen.getByText('Business Finland')).toBeInTheDocument();
    expect(
      screen.getByTestId('application-field-deMinimisAidsAmount')
    ).toHaveTextContent(/1\s234,56\s€/);
    expect(
      screen.getByText(convertToUIDateFormat('2024-05-15'))
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('application-field-deMinimisAidsNo')
    ).not.toBeInTheDocument();
  });

  it('renders empty de minimis aid message when no aids exist', () => {
    getComponent();

    expect(
      screen.getByTestId('application-field-deMinimisAidsNo')
    ).toHaveTextContent(DE_MINIMIS_NO_TEXT);
  });

  it.each([
    {
      coOperationNegotiations: true,
      description: 'Negotiations are ongoing',
      expectDescription: true,
      expectedText: COOPERATION_NEGOTIATIONS_YES_TEXT,
      testName:
        'renders cooperation negotiations description when negotiations exist',
    },
    {
      coOperationNegotiations: false,
      description: '',
      expectDescription: false,
      expectedText: COOPERATION_NEGOTIATIONS_NO_TEXT,
      testName:
        'hides cooperation negotiations description when negotiations do not exist',
    },
  ])(
    '$testName',
    ({
      coOperationNegotiations,
      description,
      expectDescription,
      expectedText,
    }) => {
      getComponent({
        data: buildData({
          coOperationNegotiations,
          coOperationNegotiationsDescription: description,
        }),
      });

      expect(
        screen.getByTestId('application-field-coOperationNegotiations')
      ).toHaveTextContent(expectedText);

      if (expectDescription) {
        expect(
          screen.getByTestId(
            'application-field-coOperationNegotiationsDescription'
          )
        ).toHaveTextContent(description);
      } else {
        expect(
          screen.queryByTestId(
            'application-field-coOperationNegotiationsDescription'
          )
        ).not.toBeInTheDocument();
      }
    }
  );
});
