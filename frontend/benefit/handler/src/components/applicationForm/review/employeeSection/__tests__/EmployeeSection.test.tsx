import '@testing-library/jest-dom';

import { render, RenderResult, screen } from '@testing-library/react';
import {
  Application,
  ApplicationFields,
} from 'benefit/handler/types/application';
import { ORGANIZATION_TYPES } from 'benefit-shared/constants';
import React from 'react';

import EmployeeSection from '../EmployeeSection';

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'common:applications.sections.headings.employment1':
          'Työllistettävän tiedot',
        'common:applications.sections.fields.socialSecurityNumber.label':
          'Henkilötunnus',
        'common:applications.sections.fields.isLivingInHelsinki.review':
          'Onko työllistettävän kotikunta Helsinki työsuhteen alkaessa?',
        'common:applications.sections.fields.isLivingInHelsinki.yes': 'Kyllä',
        'common:applications.sections.fields.isLivingInHelsinki.no': 'Ei',
        'common:applications.sections.fields.associationImmediateManagerCheck.label':
          'Onko työllistettävälle osoitettu työnjohdollinen esihenkilö?',
        'common:applications.sections.fields.associationImmediateManagerCheck.yes':
          'Kyllä',
        'common:applications.sections.fields.associationImmediateManagerCheck.no':
          'Ei',
        'common:applications.sections.fields.otherFinancialSupportForEmployment.label':
          'Onko työllistettävän palkkaukseen myönnetty muuta tukea?',
        'common:applications.sections.fields.otherFinancialSupportForEmployment.yes':
          'Kyllä',
        'common:applications.sections.fields.otherFinancialSupportForEmployment.no':
          'Ei',
        'common:applications.sections.fields.otherSubsidisedEmployed.label':
          'Työskenteleekö organisaatiossa samaan aikaan muita vastaavalla tuella työllistettyjä?',
        'common:applications.sections.fields.otherSubsidisedEmployed.yes':
          'Kyllä',
        'common:applications.sections.fields.otherSubsidisedEmployed.no': 'Ei',
        'common:applications.sections.fields.otherSubsidisedNumber.label':
          'Ilmoita montako',
      };

      return translations[key] ?? key;
    },
  }),
}));

jest.mock('shared/components/forms/section/FormSection.sc', () => ({
  $GridCell: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock('../../../ApplicationForm.sc', () => ({
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

const translationsBase = 'common:applications.sections';

const baseCompany: NonNullable<Application['company']> = {
  name: 'Test company',
  businessId: '1234567-8',
  companyForm: 'Oy',
  streetAddress: 'Test street 1',
  postcode: '00100',
  city: 'Helsinki',
  organizationType: ORGANIZATION_TYPES.COMPANY,
};

const fields = {
  employee: {
    firstName: {
      name: 'employee.firstName',
    },
  },
} as unknown as ApplicationFields;

const baseData = {
  employee: {
    firstName: 'Jane',
    lastName: 'Doe',
    socialSecurityNumber: '010190-123A',
    isLivingInHelsinki: true,
  },
  company: baseCompany,
  otherFinancialSupportForEmployment: false,
  otherSubsidisedEmployed: false,
  otherSubsidisedNumber: null,
} as unknown as Application;

const renderSubject = (
  dataOverrides: Partial<Application> = {}
): RenderResult =>
  render(
    <EmployeeSection
      data={
        {
          ...baseData,
          ...dataOverrides,
        } as Application
      }
      translationsBase={translationsBase}
      dispatchStep={jest.fn()}
      fields={fields}
    />
  );

describe('review EmployeeSection', () => {
  it('renders section heading and edit button', () => {
    renderSubject();

    expect(screen.getByText('Työllistettävän tiedot')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'edit-employee.firstName' })
    ).toBeInTheDocument();
  });

  it('renders employee name and social security number', () => {
    renderSubject();

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('Henkilötunnus')).toBeInTheDocument();
    expect(screen.getByText('010190-123A')).toBeInTheDocument();
  });

  it('renders living in Helsinki as yes', () => {
    const { container } = renderSubject({
      employee: {
        ...baseData.employee,
        isLivingInHelsinki: true,
      },
    });

    expect(container).toHaveTextContent(
      /Onko työllistettävän kotikunta Helsinki työsuhteen alkaessa\?[\S\s]*Kyllä/
    );
  });

  it('renders living in Helsinki as no', () => {
    const { container } = renderSubject({
      employee: {
        ...baseData.employee,
        isLivingInHelsinki: false,
      },
    });

    expect(container).toHaveTextContent(
      /Onko työllistettävän kotikunta Helsinki työsuhteen alkaessa\?[\S\s]*Ei/
    );
  });

  it('renders association immediate manager check for associations', () => {
    const { container } = renderSubject({
      company: {
        ...baseCompany,
        organizationType: ORGANIZATION_TYPES.ASSOCIATION,
      },
      associationImmediateManagerCheck: true,
    });

    expect(
      screen.getByText(
        'Onko työllistettävälle osoitettu työnjohdollinen esihenkilö?'
      )
    ).toBeInTheDocument();
    expect(container).toHaveTextContent(
      /Onko työllistettävälle osoitettu työnjohdollinen esihenkilö\?[\S\s]*Kyllä/
    );
  });

  it('does not render association immediate manager check for non-associations', () => {
    renderSubject({
      company: {
        ...baseCompany,
        organizationType: ORGANIZATION_TYPES.COMPANY,
      },
      associationImmediateManagerCheck: true,
    });

    expect(
      screen.queryByText(
        'Onko työllistettävälle osoitettu työnjohdollinen esihenkilö?'
      )
    ).not.toBeInTheDocument();
  });

  it('renders other financial support for employment as yes', () => {
    const { container } = renderSubject({
      otherFinancialSupportForEmployment: true,
    });

    expect(
      screen.getByText(
        'Onko työllistettävän palkkaukseen myönnetty muuta tukea?'
      )
    ).toBeInTheDocument();
    expect(container).toHaveTextContent(
      /Onko työllistettävän palkkaukseen myönnetty muuta tukea\?[\S\s]*Kyllä/
    );
  });

  it('renders other financial support for employment as no', () => {
    const { container } = renderSubject({
      otherFinancialSupportForEmployment: false,
    });

    expect(
      screen.getByText(
        'Onko työllistettävän palkkaukseen myönnetty muuta tukea?'
      )
    ).toBeInTheDocument();
    expect(container).toHaveTextContent(
      /Onko työllistettävän palkkaukseen myönnetty muuta tukea\?[\S\s]*Ei/
    );
  });

  it('renders other subsidised employed as yes', () => {
    const { container } = renderSubject({
      otherSubsidisedEmployed: true,
      otherSubsidisedNumber: '12',
    });

    expect(
      screen.getByText(
        'Työskenteleekö organisaatiossa samaan aikaan muita vastaavalla tuella työllistettyjä?'
      )
    ).toBeInTheDocument();
    expect(container).toHaveTextContent(
      /Työskenteleekö organisaatiossa samaan aikaan muita vastaavalla tuella työllistettyjä\?[\S\s]*Kyllä/
    );
  });

  it('renders other subsidised employed as no', () => {
    const { container } = renderSubject({
      otherSubsidisedEmployed: false,
      otherSubsidisedNumber: null,
    });

    expect(
      screen.getByText(
        'Työskenteleekö organisaatiossa samaan aikaan muita vastaavalla tuella työllistettyjä?'
      )
    ).toBeInTheDocument();
    expect(container).toHaveTextContent(
      /Työskenteleekö organisaatiossa samaan aikaan muita vastaavalla tuella työllistettyjä\?[\S\s]*Ei/
    );
  });

  it('renders other subsidised number when other subsidised employed is true', () => {
    renderSubject({
      otherSubsidisedEmployed: true,
      otherSubsidisedNumber: '12',
    });

    expect(screen.getByText('Ilmoita montako')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('does not render other subsidised number when other subsidised employed is false', () => {
    renderSubject({
      otherSubsidisedEmployed: false,
      otherSubsidisedNumber: '12',
    });

    expect(screen.queryByText('Ilmoita montako')).not.toBeInTheDocument();
    expect(screen.queryByText('12')).not.toBeInTheDocument();
  });
});
