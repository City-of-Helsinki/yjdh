import '@testing-library/jest-dom';

import { render, RenderResult, screen } from '@testing-library/react';
import { ORGANIZATION_TYPES } from 'benefit-shared/constants';
import React from 'react';

import {
  Application,
  ApplicationFields,
} from '../../../../../types/application';
import CompanySection from '../CompanySection';

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'common:applications.sections.headings.company1': 'Työnantajan tiedot',
        'common:applications.sections.headings.company2':
          'Työnantajan yhteyshenkilö',
        'common:applications.sections.headings.company4': 'Muutosneuvottelut',
        'common:applications.sections.headings.company6': 'De-minimis -tuet',
        'common:applications.sections.fields.companyBusinessId.label':
          'Y-tunnus',
        'common:applications.sections.fields.address.label': 'Osoite',
        'common:applications.sections.fields.companyBankAccountNumber.label':
          'Tilinumero',
        'common:applications.sections.fields.alternativeAddress.label':
          'Toimitusosoite, johon päätös toimitetaan',
        'common:applications.sections.fields.associationHasBusinessActivities.label':
          'Harjoittaako työnantaja taloudellista toimintaa?',
        'common:applications.sections.fields.associationHasBusinessActivities.yes':
          'Kyllä',
        'common:applications.sections.fields.associationHasBusinessActivities.no':
          'Ei',
        'common:applications.sections.fields.companyNumberOfEmployees.label':
          'Henkilöstömäärä ennen työllistettyä',
        'common:applications.sections.fields.companyBusinessBrief.label':
          'Kuvaa työnantajan toiminnan luonne.',
        'common:applications.sections.attachments.types.businessBrief.title':
          'Toimintaa kuvaava liite',
        'common:applications.sections.fields.purchasedService.label':
          'Hankkiiko Helsingin kaupunki toimintaa ostopalveluna?',
        'common:applications.sections.fields.purchasedService.yes': 'Kyllä',
        'common:applications.sections.fields.purchasedService.no': 'Ei',
        'common:applications.sections.fields.companyContactPersonPhoneNumber.label':
          'Puhelin',
        'common:applications.sections.fields.companyContactPersonEmail.review':
          'Sähköposti',
        'common:applications.sections.fields.applicantLanguage.label':
          'Asiointikieli',
        'common:applications.sections.fields.deMinimisAidGranter.label':
          'Tuen myöntäjä',
        'common:applications.sections.fields.deMinimisAidAmount.review':
          'Tuen määrä',
        'common:applications.sections.fields.deMinimisAidAmount.reviewTotal':
          'Yhteensä',
        'common:applications.sections.fields.deMinimisAidGrantedAt.review':
          'Myöntämispäivä',
        'common:applications.sections.fields.coOperationNegotiations.label':
          'Onko organisaatiolla käynnissä tai edellisen 12 aikana päättynyt muutosneuvottelut?',
        'common:applications.sections.fields.coOperationNegotiations.yes':
          'Kyllä',
        'common:applications.sections.fields.coOperationNegotiations.no': 'Ei',
        'common:applications.sections.fields.coOperationNegotiations.description':
          'Selvitys',
        'common:languages.fi': 'Suomi',
      };

      return translations[key] ?? key;
    },
  }),
}));

jest.mock('styled-components', () => {
  const actual = jest.requireActual('styled-components');

  return {
    __esModule: true,
    ...actual,
    default: actual.default ?? actual,
    useTheme: () => ({
      spacing: {
        xs3: '4px',
      },
    }),
  };
});

jest.mock('ibantools', () => ({
  friendlyFormatIBAN: (value?: string) => `formatted-${value ?? ''}`,
}));

jest.mock('shared/utils/date.utils', () => ({
  convertToUIDateFormat: (value?: string) =>
    value ? value.split('-').reverse().join('.') : '',
}));

jest.mock('shared/utils/string.utils', () => ({
  formatFloatToEvenEuros: (value: string | number) => `${value} €`,
}));

jest.mock('shared/utils/application.utils', () => ({
  getFullName: (firstName?: string, lastName?: string) =>
    [firstName, lastName].filter(Boolean).join(' '),
}));

jest.mock('shared/components/forms/section/FormSection.sc', () => ({
  $GridCell: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock('../../../ApplicationForm.sc', () => ({
  $SummaryTableHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  $SummaryTableLastLine: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  $SummaryTableValue: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  $ViewField: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  $ViewFieldBold: ({ children }: { children: React.ReactNode }) => (
    <strong>{children}</strong>
  ),
}));

jest.mock('../../summarySection/EditButton', () => ({
  __esModule: true,
  default: ({ section }: { section: string }) => (
    <button type="button">edit-{section}</button>
  ),
}));

jest.mock('../../summarySection/SummarySection', () => ({
  __esModule: true,
  default: ({
    children,
    header,
    action,
  }: {
    children: React.ReactNode;
    header: string;
    action?: React.ReactNode;
  }) => (
    <section>
      <h2>{header}</h2>
      {action}
      {children}
    </section>
  ),
}));

jest.mock(
  'benefit/handler/components/attachmentsListView/AttachmentsListView',
  () => ({
    __esModule: true,
    default: ({
      title,
      type,
      attachments,
    }: {
      title: string;
      type: string;
      attachments: unknown[];
    }) => (
      <div data-testid="attachments-list-view">
        <span>{title}</span>
        <span>{type}</span>
        <span>{attachments.length}</span>
      </div>
    ),
  })
);

const translationsBase = 'common:applications.sections';

const fields = {
  companyContactPersonFirstName: {
    name: 'companyContactPersonFirstName',
  },
  coOperationNegotiations: {
    name: 'coOperationNegotiations',
  },
  deMinimisAidSet: {
    name: 'deMinimisAidSet',
  },
};

const baseData = {
  company: {
    name: 'Test company',
    businessId: '1234567-8',
    streetAddress: 'Test street 1',
    postcode: '00100',
    city: 'Helsinki',
    organizationType: ORGANIZATION_TYPES.COMPANY,
  },
  companyBankAccountNumber: 'FI1212345600000785',
  companyContactPersonFirstName: 'Jane',
  companyContactPersonLastName: 'Doe',
  companyContactPersonPhoneNumber: '0401234567',
  companyContactPersonEmail: 'jane.doe@example.com',
  applicantLanguage: 'fi',
  coOperationNegotiations: false,
  attachments: [],
};

const renderSubject = (dataOverrides = {}): RenderResult =>
  render(
    <CompanySection
      data={{ ...baseData, ...dataOverrides } as unknown as Application}
      translationsBase={translationsBase}
      dispatchStep={jest.fn()}
      fields={fields as unknown as ApplicationFields}
    />
  );

describe('review CompanySection', () => {
  it('renders company number of employees', () => {
    renderSubject({
      companyNumberOfEmployees: 42,
    });

    expect(
      screen.getByText('Henkilöstömäärä ennen työllistettyä')
    ).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders dash when company number of employees is missing', () => {
    const { container } = renderSubject({
      companyNumberOfEmployees: null,
    });

    expect(container).toHaveTextContent(/Henkilöstömäärä ennen työllistettyä/);
    expect(container).toHaveTextContent(
      /Henkilöstömäärä ennen työllistettyä[\S\s]*-/
    );
  });

  it('renders company business brief split into paragraphs', () => {
    renderSubject({
      companyBusinessBrief: 'First paragraph\nSecond paragraph',
    });

    expect(
      screen.getByText('Kuvaa työnantajan toiminnan luonne.')
    ).toBeInTheDocument();
    expect(screen.getByText('First paragraph')).toBeInTheDocument();
    expect(screen.getByText('Second paragraph')).toBeInTheDocument();
  });

  it('renders dash when company business brief is missing', () => {
    const { container } = renderSubject({
      companyBusinessBrief: undefined,
    });

    expect(container).toHaveTextContent(/Kuvaa työnantajan toiminnan luonne\./);
    expect(container).toHaveTextContent(
      /Kuvaa työnantajan toiminnan luonne\.[\S\s]*-/
    );
  });

  it('renders business brief attachments list', () => {
    renderSubject({
      attachments: [
        {
          id: 'attachment-id',
          attachmentType: 'business_brief',
          name: 'business-brief.pdf',
        },
      ],
    });

    expect(screen.getByTestId('attachments-list-view')).toHaveTextContent(
      'Toimintaa kuvaava liite'
    );
    expect(screen.getByTestId('attachments-list-view')).toHaveTextContent(
      'business_brief'
    );
    expect(screen.getByTestId('attachments-list-view')).toHaveTextContent('1');
  });

  it('renders purchased service as yes', () => {
    const { container } = renderSubject({
      purchasedService: true,
    });

    expect(container).toHaveTextContent(
      /Hankkiiko Helsingin kaupunki toimintaa ostopalveluna\?/
    );
    expect(container).toHaveTextContent(
      /Hankkiiko Helsingin kaupunki toimintaa ostopalveluna\?.*Kyllä/s
    );
  });

  it('renders purchased service as no', () => {
    const { container } = renderSubject({
      purchasedService: false,
    });

    expect(container).toHaveTextContent(
      /Hankkiiko Helsingin kaupunki toimintaa ostopalveluna\?/
    );
    expect(container).toHaveTextContent(
      /Hankkiiko Helsingin kaupunki toimintaa ostopalveluna\?.*Ei/s
    );
  });

  it('renders purchased service as no when value is missing', () => {
    const { container } = renderSubject({
      purchasedService: undefined,
    });

    expect(container).toHaveTextContent(
      /Hankkiiko Helsingin kaupunki toimintaa ostopalveluna\?/
    );
    expect(container).toHaveTextContent(
      /Hankkiiko Helsingin kaupunki toimintaa ostopalveluna\?.*Ei/s
    );
  });

  it('renders association business activities for associations', () => {
    renderSubject({
      company: {
        ...baseData.company,
        organizationType: ORGANIZATION_TYPES.ASSOCIATION,
      },
      associationHasBusinessActivities: true,
    });

    expect(
      screen.getByText('Harjoittaako työnantaja taloudellista toimintaa?')
    ).toBeInTheDocument();
    expect(screen.getByText('Kyllä')).toBeInTheDocument();
  });

  it('does not render association business activities for non-associations', () => {
    renderSubject({
      company: {
        ...baseData.company,
        organizationType: ORGANIZATION_TYPES.COMPANY,
      },
      associationHasBusinessActivities: true,
    });

    expect(
      screen.queryByText('Harjoittaako työnantaja taloudellista toimintaa?')
    ).not.toBeInTheDocument();
  });
});
