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

const mockPush = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

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
    ({ limit, offset }: { limit: number; offset: number }) => ({
      data: {
        count: apps.length,
        results: apps.slice(offset, offset + limit),
      },
      isLoading: false,
      error: null,
    })
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
    // empty message row should span all 5 columns
    expect(
      screen.getByRole('cell', { name: /ei aiempia hakemuksia/i })
    ).toHaveAttribute('colspan', '5');
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

  it('populates year dropdown with every year from PROGRAMME_START_YEAR to the current year', async () => {
    renderWithTheme([]);

    const currentYear = new Date().getFullYear();
    const combobox = screen.getByRole('combobox');

    // Default selection is the current year
    expect(combobox).toHaveTextContent(String(currentYear));

    // All years from 2022 to currentYear must be present as options
    const user = userEvent.setup();
    await user.click(combobox);

    for (let year = currentYear; year >= 2022; year -= 1) {
      expect(
        await screen.findByRole('option', { name: String(year) })
      ).toBeInTheDocument();
    }
  });

  it('renders edit button for draft applications and navigates when clicked', async () => {
    renderWithTheme(mockApplications);

    const user = userEvent.setup();
    // Only the draft application (app2) should have an edit button
    const editButton = screen.getByRole('button', {
      name: /muokkaa hakemusta: matti meikäläinen/i,
    });
    expect(editButton).toBeInTheDocument();

    // submitted application (app1) should NOT have an edit button
    expect(
      screen.queryByRole('button', { name: /muokkaa hakemusta: testi teppo/i })
    ).not.toBeInTheDocument();

    await user.click(editButton);
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('/application?id=app2')
    );
  });
});
