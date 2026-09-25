/* eslint-disable scanjs-rules/property_sessionStorage, scanjs-rules/identifier_sessionStorage */
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import { EmployerApplicationStatus } from 'kesaseteli-shared/constants/employer-application-status';
import React from 'react';

import useEmployerApplicationsListQuery from '../../../hooks/backend/useEmployerApplicationsListQuery';
import EmployerApplicationList from '../EmployerApplicationList';

jest.mock('../../../hooks/backend/useEmployerApplicationsListQuery');
const mockUseQuery = useEmployerApplicationsListQuery as jest.Mock;

const mockPendingApps = [
  {
    id: 'pending-1',
    company: { name: 'Company Pending Oy', business_id: '1234567-8' },
    status: EmployerApplicationStatus.SUBMITTED,
    summer_vouchers: [],
  },
];
const mockProcessedApps = [
  {
    id: 'processed-1',
    company: { name: 'Company Processed Oy', business_id: '8765432-1' },
    status: EmployerApplicationStatus.ACCEPTED_FOR_PAYMENT,
    summer_vouchers: [],
  },
];

describe('EmployerApplicationList', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    mockUseQuery.mockImplementation((params) => {
      if (
        params?.status?.includes(EmployerApplicationStatus.PAYMENT_REVIEW) ||
        params?.status?.includes(
          EmployerApplicationStatus.ACCEPTED_FOR_PAYMENT
        ) ||
        params?.status?.includes(
          EmployerApplicationStatus.RECEIVED_BY_PAYMENT_SYSTEM
        ) ||
        params?.status?.includes(EmployerApplicationStatus.REJECTED) ||
        params?.status?.includes(EmployerApplicationStatus.CANCELLED)
      ) {
        return {
          data: { count: 10, results: mockProcessedApps },
          isLoading: false,
        };
      }
      return { data: { count: 5, results: mockPendingApps }, isLoading: false };
    });
  });

  it('shows pending and processed tab counts and renders first tab content by default', () => {
    renderComponent(<EmployerApplicationList />);
    expect(screen.getByText('Käsiteltävät (5)')).toBeInTheDocument();
    expect(screen.getByText('Käsitellyt (10)')).toBeInTheDocument();

    // Verify first tab content is displayed
    expect(screen.getByText('Company Pending Oy')).toBeInTheDocument();
    expect(screen.getByText('Ei sarjanumeroa')).toBeInTheDocument();
    expect(screen.queryByText('Company Processed Oy')).not.toBeInTheDocument();
  });

  it('switches to the processed tab on click and renders processed content', async () => {
    renderComponent(<EmployerApplicationList />);
    await userEvent.click(screen.getByText('Käsitellyt (10)'));
    // The processed tab becomes active; verify it's selected/visible
    expect(screen.getByText('Käsitellyt (10)')).toBeVisible();

    // Verify processed tab content is displayed
    expect(screen.getByText('Company Processed Oy')).toBeInTheDocument();
    expect(screen.queryByText('Company Pending Oy')).not.toBeInTheDocument();
  });

  it('calls useEmployerApplicationsListQuery with default pending statuses initially', () => {
    renderComponent(<EmployerApplicationList />);
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        status: [
          EmployerApplicationStatus.SUBMITTED,
          EmployerApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
          EmployerApplicationStatus.APPLICATION_HANDLING,
          EmployerApplicationStatus.ERROR_IN_PAYMENT,
        ],
      })
    );
  });

  it('calls useEmployerApplicationsListQuery with updated statuses when filters change', async () => {
    renderComponent(<EmployerApplicationList />);

    const combobox = screen.getByRole('combobox', { name: /tila/i });
    await userEvent.click(combobox);

    // Select "Lisätietoja pyydetty" to check it
    await userEvent.click(screen.getByText('Lisätietoja pyydetty'));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        status: [
          EmployerApplicationStatus.SUBMITTED,
          EmployerApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED,
          EmployerApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
          EmployerApplicationStatus.APPLICATION_HANDLING,
          EmployerApplicationStatus.ERROR_IN_PAYMENT,
        ],
      })
    );
  });

  it('does not trigger a new query with empty status list when all filters are deselected', async () => {
    renderComponent(<EmployerApplicationList />);

    const combobox = screen.getByRole('combobox', { name: /tila/i });
    await userEvent.click(combobox);

    const listbox = screen.getByRole('listbox');

    await userEvent.click(within(listbox).getByText('Uusi hakemus'));
    await userEvent.click(within(listbox).getByText('Lisätiedot annettu'));
    await userEvent.click(within(listbox).getByText('Käsittelyssä'));
    await userEvent.click(within(listbox).getByText('Virhe maksussa'));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        status: [],
      }),
      expect.objectContaining({
        enabled: false,
      })
    );
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        status: [EmployerApplicationStatus.ERROR_IN_PAYMENT],
      })
    );
  });

  it('calls useEmployerApplicationsListQuery with default processed statuses initially', () => {
    renderComponent(<EmployerApplicationList />);
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        status: [
          EmployerApplicationStatus.PAYMENT_REVIEW,
          EmployerApplicationStatus.ACCEPTED_FOR_PAYMENT,
          EmployerApplicationStatus.RECEIVED_BY_PAYMENT_SYSTEM,
          EmployerApplicationStatus.REJECTED,
          EmployerApplicationStatus.CANCELLED,
        ],
      })
    );
  });

  it('calls useEmployerApplicationsListQuery with updated processed statuses when processed filters change', async () => {
    renderComponent(<EmployerApplicationList />);

    // Switch to processed tab
    await userEvent.click(screen.getByText('Käsitellyt (10)'));

    const combobox = screen.getByRole('combobox', { name: /tila/i });
    await userEvent.click(combobox);

    const listbox = screen.getByRole('listbox');

    // Deselect "Hyväksytty maksuun" (Accepted for payment)
    await userEvent.click(within(listbox).getByText('Hyväksytty maksuun'));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        status: [
          EmployerApplicationStatus.PAYMENT_REVIEW,
          EmployerApplicationStatus.RECEIVED_BY_PAYMENT_SYSTEM,
          EmployerApplicationStatus.REJECTED,
          EmployerApplicationStatus.CANCELLED,
        ],
      })
    );
  });
  it('automatically adds APPLICATION_HANDLING to status filter when assignee checkbox is checked in pending tab', async () => {
    renderComponent(<EmployerApplicationList />);

    // Switch to pending tab explicitly (just in case)
    await userEvent.click(screen.getByText('Käsiteltävät (5)'));

    // Deselect "Käsittelyssä" from the dropdown to test the behavior
    const combobox = screen.getByRole('combobox', { name: /tila/i });
    await userEvent.click(combobox);
    const listbox = screen.getByRole('listbox');
    await userEvent.click(within(listbox).getByText('Käsittelyssä'));

    // Verify it was removed
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        status: [
          EmployerApplicationStatus.SUBMITTED,
          EmployerApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
          EmployerApplicationStatus.ERROR_IN_PAYMENT,
        ],
      })
    );

    // Check the assignee checkbox
    const checkbox = screen.getByRole('checkbox', {
      name: /omassa käsittelyssäni/i,
    });
    await userEvent.click(checkbox);

    // Verify it added APPLICATION_HANDLING back
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        status: expect.arrayContaining([
          EmployerApplicationStatus.APPLICATION_HANDLING,
        ]),
        is_assigned_to_me: true,
      })
    );
  });
});

/* eslint-enable scanjs-rules/property_sessionStorage, scanjs-rules/identifier_sessionStorage */
