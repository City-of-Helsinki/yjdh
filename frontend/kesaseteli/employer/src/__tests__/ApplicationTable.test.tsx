import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ApplicationTable from 'kesaseteli/employer/components/dashboard/ApplicationTable';
import useApplicationsQuery from 'kesaseteli/employer/hooks/backend/useApplicationsQuery';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';
import Application from 'shared/types/application';
import { convertToUIDateAndTimeFormat } from 'shared/utils/date.utils';

jest.mock('kesaseteli/employer/hooks/backend/useApplicationsQuery', () =>
  jest.fn()
);

const mockApplications: Application[] = [
  {
    id: 'app1',
    status: 'submitted',
    modified_at: '2026-02-26T10:00:00Z',
    summer_vouchers: [
      {
        id: 'v1',
        employee_name: 'Testi Teppo',
        summer_voucher_serial_number: '123456',
      },
    ],
  } as unknown as Application,
  {
    id: 'app2',
    status: 'draft',
    modified_at: '2026-02-25T12:00:00Z',
    summer_vouchers: [
      {
        id: 'v2',
        employee_name: 'Matti Meikäläinen',
        summer_voucher_serial_number: '654321',
      },
    ],
  } as unknown as Application,
];

const renderWithTheme = (apps: Application[]): void => {
  (useApplicationsQuery as jest.Mock).mockImplementation(
    (options?: { limit?: number; offset?: number }) => {
      if (
        options &&
        options.limit !== undefined &&
        options.offset !== undefined
      ) {
        const { limit, offset } = options;
        return {
          data: {
            count: apps.length,
            results: apps.slice(offset, offset + limit),
          },
          isLoading: false,
          error: null,
        };
      }
      return {
        data: apps,
        isLoading: false,
        error: null,
      };
    }
  );

  renderComponent(
    <ApplicationTable>
      <ApplicationTable.Header>
        Aiemmat kesäsetelihakemukset
      </ApplicationTable.Header>
      <ApplicationTable.FilterBar />
      <ApplicationTable.Table />
    </ApplicationTable>
  );
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('ApplicationTable', () => {
  it('renders all columns', () => {
    renderWithTheme([]);
    expect(screen.getByText('Työntekijän nimi')).toBeInTheDocument();
    expect(screen.getByText('Kesäsetelin sarjanumero')).toBeInTheDocument();
    expect(screen.getByText('Viimeksi päivitetty')).toBeInTheDocument();
    expect(screen.getByText('Tila')).toBeInTheDocument();
  });

  it('renders voucher data correctly', () => {
    const translations: Record<string, string> = {
      submitted: 'Lähetetty',
      draft: 'Luonnos',
    };
    renderWithTheme(mockApplications);
    for (const app of mockApplications) {
      const voucher = app.summer_vouchers[0];
      expect(screen.getByText(voucher.employee_name ?? '')).toBeInTheDocument();
      expect(
        screen.getByText(voucher.summer_voucher_serial_number)
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          convertToUIDateAndTimeFormat(
            (app as typeof app & { modified_at?: string }).modified_at || ''
          )
        )
      ).toBeInTheDocument();
      expect(screen.getByText(translations[app.status])).toBeInTheDocument();
    }
  });

  it('shows empty message when no vouchers', () => {
    renderWithTheme([]);
    expect(screen.getByText(/ei aiempia hakemuksia/i)).toBeInTheDocument();
  });

  it('paginates vouchers correctly (15 items per page)', () => {
    // Generate 17 mock applications
    const manyApplications: Application[] = Array.from(
      { length: 17 },
      (_, index) =>
        ({
          id: `app_${index}`,
          status: 'submitted',
          modified_at: '2026-02-26T10:00:00Z',
          summer_vouchers: [
            {
              id: `v_${index}`,
              employee_name: `Employee ${index}`,
              summer_voucher_serial_number: `10000${index}`,
            },
          ],
        } as unknown as Application)
    );

    renderWithTheme(manyApplications);

    // Verify first page items (Employee 0 to Employee 14) are rendered
    for (let i = 0; i < 15; i += 1) {
      expect(screen.getByText(`Employee ${i}`)).toBeInTheDocument();
    }

    // Verify second page items (Employee 15 and 16) are not on the first page
    expect(screen.queryByText('Employee 15')).not.toBeInTheDocument();
    expect(screen.queryByText('Employee 16')).not.toBeInTheDocument();

    // Verify that the pagination component is rendered
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('uses current year as fallback in availableYears when allApplications query returns no data', () => {
    (useApplicationsQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });

    renderComponent(
      <ApplicationTable>
        <ApplicationTable.FilterBar />
      </ApplicationTable>
    );

    // Expect year selector to default to current year option
    const currentYear = new Date().getFullYear().toString();
    const combobox = screen.getByRole('combobox');
    expect(combobox).toHaveTextContent(currentYear);
  });

  it('extracts year from created_at when submitted_at is not available', async () => {
    const mockApp = {
      id: 'app1',
      status: 'draft',
      created_at: '2024-05-15T12:00:00Z',
      summer_vouchers: [],
    };

    (useApplicationsQuery as jest.Mock).mockReturnValue({
      data: [mockApp],
      isLoading: false,
      error: null,
    });

    renderComponent(
      <ApplicationTable>
        <ApplicationTable.FilterBar />
      </ApplicationTable>
    );

    const user = userEvent.setup();
    const combobox = screen.getByRole('combobox');
    await user.click(combobox);

    const option = await screen.findByRole('option', { name: '2024' });
    expect(option).toBeInTheDocument();
  });
});
