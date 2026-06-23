import '@testing-library/jest-dom';

import { render, RenderResult, screen } from '@testing-library/react';
import React from 'react';

import {
  Application,
  ApplicationFields,
} from '../../../../../types/application';
import EmploymentSection from '../EmploymentSection';

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        'common:applications.sections.headings.employment2':
          'Työsuhteen tiedot',
        'common:applications.sections.headings.employment4': 'Työsuhteen kesto',
        'common:applications.sections.fields.jobTitle.label': 'Tehtävänimike',
        'common:applications.sections.fields.workingHours.review':
          'Työtunnit viikossa',
        'common:applications.sections.fields.workingHours.reviewText':
          'h / vko',
        'common:applications.sections.fields.monthlyPay.label':
          'Kuukausipalkka',
        'common:applications.sections.fields.monthlyPay.review': `${
          options?.monthlyPay ?? ''
        } kuukaudessa`,
        'common:applications.sections.fields.vacationMoney.label': 'Lomaraha',
        'common:applications.sections.fields.vacationMoney.review': `${
          options?.vacationMoney ?? ''
        } lomarahaa`,
        'common:applications.sections.fields.otherExpenses.label': 'Muut kulut',
        'common:applications.sections.fields.otherExpenses.review': `${
          options?.otherExpenses ?? ''
        } muita kuluja`,
        'common:applications.sections.fields.collectiveBargainingAgreement.review':
          'Työehtosopimus',
        'common:applications.sections.fields.paySubsidyGranted.review':
          'Palkkatuki myönnetty',
        'common:applications.sections.fields.paySubsidyGranted.paySubsidy':
          'Palkkatuki',
        'common:applications.sections.fields.apprenticeshipProgram.label':
          'Oppisopimus',
        'common:applications.sections.fields.apprenticeshipProgram.yes':
          'Kyllä',
        'common:applications.sections.fields.apprenticeshipProgram.no': 'Ei',
        'common:applications.sections.fields.roleOfEmployeeInOrganization.label':
          'Työllistettävän rooli organisaatiossa',
        'common:applications.sections.dateExplanation':
          'Työsuhteen aloitus- ja päättymispäivä',
        'common:applications.sections.fields.startDate.review': 'Alkaa',
        'common:applications.sections.fields.endDate.review': 'Päättyy',
      };

      return translations[key] ?? key;
    },
  }),
}));

jest.mock('benefit-shared/constants', () => ({
  TRUTHY_SUBSIDIES: new Set(['pay_subsidy']),
}));

jest.mock('shared/utils/date.utils', () => ({
  convertToUIDateFormat: (value?: string) =>
    value ? value.split('-').reverse().join('.') : '',
}));

jest.mock('shared/utils/string.utils', () => ({
  formatFloatToEvenEuros: (value: string | number) => `${value} €`,
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

const fields = {
  employee: {
    jobTitle: {
      name: 'employee.jobTitle',
    },
  },
  startDate: {
    name: 'startDate',
  },
};

const baseData = {
  employee: {
    jobTitle: 'Software developer',
    workingHours: 37.5,
    monthlyPay: 3000,
    vacationMoney: 500,
    otherExpenses: 100,
    collectiveBargainingAgreement: 'IT service sector agreement',
  },
  paySubsidyGranted: 'pay_subsidy',
  apprenticeshipProgram: true,
  roleOfEmployeeInOrganization: 'First paragraph\nSecond paragraph',
  startDate: '2026-01-02',
  endDate: '2026-12-31',
};

const renderSubject = (dataOverrides = {}): RenderResult =>
  render(
    <EmploymentSection
      data={{ ...baseData, ...dataOverrides } as unknown as Application}
      translationsBase={translationsBase}
      dispatchStep={jest.fn()}
      fields={fields as unknown as ApplicationFields}
    />
  );

describe('review EmploymentSection', () => {
  it('renders section headings and edit buttons', () => {
    renderSubject();

    expect(screen.getByText('Työsuhteen tiedot')).toBeInTheDocument();
    expect(screen.getByText('Työsuhteen kesto')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'edit-employee.jobTitle' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'edit-startDate' })
    ).toBeInTheDocument();
  });

  it('renders employee job title and working hours', () => {
    const { container } = renderSubject();

    expect(screen.getByText('Tehtävänimike')).toBeInTheDocument();
    expect(screen.getByText('Software developer')).toBeInTheDocument();
    expect(screen.getByText('Työtunnit viikossa')).toBeInTheDocument();
    expect(container).toHaveTextContent(
      /Työtunnit viikossa[\S\s]*37,5 h \/ vko/
    );
  });

  it('renders dash when employee job title is missing', () => {
    const { container } = renderSubject({
      employee: {
        ...baseData.employee,
        jobTitle: '',
      },
    });

    expect(container).toHaveTextContent(/Tehtävänimike[\S\s]*-/);
  });

  it('renders money fields formatted as even euros', () => {
    const { container } = renderSubject();

    expect(screen.getByText('Kuukausipalkka')).toBeInTheDocument();
    expect(container).toHaveTextContent(
      /Kuukausipalkka[\S\s]*3000 € kuukaudessa/
    );

    expect(screen.getByText('Lomaraha')).toBeInTheDocument();
    expect(container).toHaveTextContent(/Lomaraha[\S\s]*500 € lomarahaa/);

    expect(screen.getByText('Muut kulut')).toBeInTheDocument();
    expect(container).toHaveTextContent(/Muut kulut[\S\s]*100 € muita kuluja/);
  });

  it('renders collective bargaining agreement', () => {
    const { container } = renderSubject();

    expect(screen.getByText('Työehtosopimus')).toBeInTheDocument();
    expect(container).toHaveTextContent(
      /Työehtosopimus[\S\s]*IT service sector agreement/
    );
  });

  it('renders truthy pay subsidy using translated value', () => {
    const { container } = renderSubject({
      paySubsidyGranted: 'pay_subsidy',
    });

    expect(screen.getByText('Palkkatuki myönnetty')).toBeInTheDocument();
    expect(container).toHaveTextContent(
      /Palkkatuki myönnetty[\S\s]*Palkkatuki/
    );
  });

  it('renders dash when pay subsidy is not truthy', () => {
    const { container } = renderSubject({
      paySubsidyGranted: 'not_granted',
    });

    expect(container).toHaveTextContent(/Palkkatuki myönnetty[\S\s]*-/);
  });

  it('renders apprenticeship program as yes', () => {
    const { container } = renderSubject({
      apprenticeshipProgram: true,
    });

    expect(screen.getByText('Oppisopimus')).toBeInTheDocument();
    expect(container).toHaveTextContent(/Oppisopimus[\S\s]*Kyllä/);
  });

  it('renders apprenticeship program as no', () => {
    const { container } = renderSubject({
      apprenticeshipProgram: false,
    });

    expect(screen.getByText('Oppisopimus')).toBeInTheDocument();
    expect(container).toHaveTextContent(/Oppisopimus[\S\s]*Ei/);
  });

  it('renders role of employee in organization split into paragraphs', () => {
    renderSubject({
      roleOfEmployeeInOrganization: 'First paragraph\nSecond paragraph',
    });

    expect(
      screen.getByText('Työllistettävän rooli organisaatiossa')
    ).toBeInTheDocument();
    expect(screen.getByText('First paragraph')).toBeInTheDocument();
    expect(screen.getByText('Second paragraph')).toBeInTheDocument();
  });

  it('renders dash when role of employee in organization is null', () => {
    const { container } = renderSubject({
      roleOfEmployeeInOrganization: null,
    });

    expect(container).toHaveTextContent(
      /Työllistettävän rooli organisaatiossa[\S\s]*-/
    );
  });

  it('renders date explanation and formatted start and end dates', () => {
    const { container } = renderSubject({
      startDate: '2026-01-02',
      endDate: '2026-12-31',
    });

    expect(
      screen.getByText('Työsuhteen aloitus- ja päättymispäivä')
    ).toBeInTheDocument();
    expect(screen.getByText('Alkaa')).toBeInTheDocument();
    expect(screen.getByText('Päättyy')).toBeInTheDocument();
    expect(container).toHaveTextContent(/Alkaa[\S\s]*02.01.2026/);
    expect(container).toHaveTextContent(/Päättyy[\S\s]*31.12.2026/);
  });

  it('renders dash when start and end dates are missing', () => {
    const { container } = renderSubject({
      startDate: undefined,
      endDate: undefined,
    });

    expect(container).toHaveTextContent(/Alkaa[\S\s]*-/);
    expect(container).toHaveTextContent(/Päättyy[\S\s]*-/);
  });

  it('uses empty section names for edit buttons when fields are missing', () => {
    render(
      <EmploymentSection
        data={baseData as unknown as Application}
        translationsBase={translationsBase}
        dispatchStep={jest.fn()}
        fields={{} as unknown as ApplicationFields}
      />
    );

    expect(screen.getAllByRole('button', { name: 'edit-' })).toHaveLength(2);
  });
});
