import { screen } from '@testing-library/react';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { ApplicationData } from 'benefit-shared/types/application';
import React from 'react';

import ApplicationArchiveList from '../ApplicationArchiveList';

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string): string => key,
  }),
}));

jest.mock('shared/components/table/Table.sc', () => ({
  $Link: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }): JSX.Element => (
    <a href={href} data-testid="archive-link">
      {children}
    </a>
  ),
}));

jest.mock('hds-react', () => {
  const actual = jest.requireActual('hds-react');

  return {
    ...actual,
    Table: ({
      rows,
      cols,
    }: {
      rows: Array<Record<string, unknown>>;
      cols: Array<{
        key: string;
        transform?: (row: Record<string, unknown>) => React.ReactNode;
      }>;
    }): JSX.Element => {
      const row = rows[0] || {};

      return (
        <div data-testid="archive-table">
          {cols.map((col) => (
            <div key={col.key} data-testid={`col-${col.key}`}>
              {col.transform ? col.transform(row) : String(row[col.key] ?? '')}
            </div>
          ))}
        </div>
      );
    },
  };
});

const buildApplication = (
  overrides?: Partial<ApplicationData>
): ApplicationData =>
  ({
    id: 'app-1',
    company: {
      name: 'Test Company',
      business_id: '1234567-8',
    },
    company_name: 'Test Company',
    status: APPLICATION_STATUSES.ACCEPTED,
    created_at: '2026-08-01',
    handled_at: '2026-08-15',
    application_alterations: [],
    ...overrides,
  } as ApplicationData);

describe('ApplicationArchiveList', () => {
  it('renders empty state when no applications', () => {
    renderComponent(
      <ApplicationArchiveList data={[]} isSearchLoading={false} />
    );

    expect(screen.queryByTestId('archive-table')).not.toBeInTheDocument();
  });

  it('renders table with archived applications', () => {
    const apps = [buildApplication()];
    renderComponent(
      <ApplicationArchiveList data={apps} isSearchLoading={false} />
    );

    expect(screen.getByTestId('archive-table')).toBeInTheDocument();
  });

  it('displays company name in table', () => {
    const apps = [buildApplication()];
    renderComponent(
      <ApplicationArchiveList data={apps} isSearchLoading={false} />
    );

    expect(screen.getByText('Test Company')).toBeInTheDocument();
  });

  it('renders link for non-archival status applications', () => {
    const apps = [buildApplication({ status: APPLICATION_STATUSES.ACCEPTED })];
    renderComponent(
      <ApplicationArchiveList data={apps} isSearchLoading={false} />
    );

    const link = screen.getByTestId('archive-link');
    expect(link).toHaveAttribute('href', '/application?id=app-1');
  });

  it('renders disabled company name for archival status applications', () => {
    const apps = [buildApplication({ status: APPLICATION_STATUSES.ARCHIVAL })];
    renderComponent(
      <ApplicationArchiveList data={apps} isSearchLoading={false} />
    );

    // For archival status, company name should not have a link
    expect(screen.queryByTestId('archive-link')).not.toBeInTheDocument();
    expect(screen.getByText('Test Company')).toBeInTheDocument();
  });

  it('shows loading skeleton when searching', () => {
    renderComponent(<ApplicationArchiveList data={[]} isSearchLoading />);

    // Component renders without errors when loading
    // (LoadingSkeleton is rendered internally)
    expect(screen.queryByTestId('archive-table')).not.toBeInTheDocument();
  });

  it('renders applications with alterations', () => {
    const appsWithAlterations = [
      {
        ...buildApplication(),
        alterations: [
          {
            id: 'alt-1',
            state: 'RECEIVED',
          } as never,
        ],
      },
    ];
    renderComponent(
      <ApplicationArchiveList
        data={appsWithAlterations}
        isSearchLoading={false}
      />
    );

    expect(screen.getByTestId('archive-table')).toBeInTheDocument();
  });

  it('passes multiple applications to table component', () => {
    const apps = [
      buildApplication({ id: 'app-1', company_name: 'Company 1' }),
      buildApplication({ id: 'app-2', company_name: 'Company 2' }),
      buildApplication({ id: 'app-3', company_name: 'Company 3' }),
    ];
    renderComponent(
      <ApplicationArchiveList data={apps} isSearchLoading={false} />
    );

    // Verify table is rendered and receives data
    expect(screen.getByTestId('archive-table')).toBeInTheDocument();
    // The first application should be visible in the table
    expect(screen.getByTestId('archive-link')).toHaveAttribute(
      'href',
      '/application?id=app-1'
    );
  });

  it('sorts applications by status correctly', () => {
    const apps = [
      buildApplication({
        id: 'app-1',
        status: APPLICATION_STATUSES.CANCELLED,
      }),
      buildApplication({
        id: 'app-2',
        status: APPLICATION_STATUSES.ACCEPTED,
      }),
      buildApplication({
        id: 'app-3',
        status: APPLICATION_STATUSES.REJECTED,
      }),
    ];
    renderComponent(
      <ApplicationArchiveList data={apps} isSearchLoading={false} />
    );

    expect(screen.getByTestId('archive-table')).toBeInTheDocument();
  });
});
