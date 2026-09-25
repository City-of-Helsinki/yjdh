/* eslint-disable scanjs-rules/property_sessionStorage, scanjs-rules/identifier_sessionStorage */
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import { YouthApplicationStatus } from 'kesaseteli-shared/constants/youth-application-status';
import React from 'react';

import useYouthApplicationsListQuery from '../../../hooks/backend/useYouthApplicationsListQuery';
import YouthApplicationList from '../YouthApplicationList';

jest.mock('../../../hooks/backend/useYouthApplicationsListQuery');
const mockUseQuery = useYouthApplicationsListQuery as jest.Mock;

const mockPendingApps = [
  {
    id: 'pending-1',
    social_security_number: '111111-1111',
    first_name: 'Matti',
    last_name: 'Meikäläinen',
    status: YouthApplicationStatus.SUBMITTED,
  },
  {
    id: 'pending-2',
    social_security_number: '',
    first_name: 'Teppo',
    last_name: 'Testaaja',
    status: YouthApplicationStatus.SUBMITTED,
  },
];
const mockProcessedApps = [
  {
    id: 'processed-1',
    social_security_number: '222222-2222',
    first_name: 'Maija',
    last_name: 'Meikäläinen',
    status: YouthApplicationStatus.ACCEPTED,
  },
];

describe('YouthApplicationList', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    mockUseQuery.mockImplementation((params) => {
      if (
        params?.status?.includes(YouthApplicationStatus.ACCEPTED) ||
        params?.status?.includes(YouthApplicationStatus.REJECTED)
      ) {
        return {
          data: { count: 8, results: mockProcessedApps },
          isLoading: false,
        };
      }
      return { data: { count: 4, results: mockPendingApps }, isLoading: false };
    });
  });

  it('shows pending and processed tab counts and renders first tab content by default', () => {
    renderComponent(<YouthApplicationList />);
    expect(screen.getByText('Käsiteltävät (4)')).toBeInTheDocument();
    expect(screen.getByText('Käsitellyt (8)')).toBeInTheDocument();

    // Verify first tab content is displayed
    expect(screen.getByText('111111-1111')).toBeInTheDocument();
    expect(screen.getByText('Matti Meikäläinen')).toBeInTheDocument();
    expect(screen.getByText('Ei hetua')).toBeInTheDocument();
    expect(screen.queryByText('222222-2222')).not.toBeInTheDocument();
  });

  it('switches to the processed tab on click and renders processed content', async () => {
    renderComponent(<YouthApplicationList />);
    await userEvent.click(screen.getByText('Käsitellyt (8)'));
    expect(screen.getByText('Käsitellyt (8)')).toBeVisible();

    // Verify processed tab content is displayed
    expect(screen.getByText('222222-2222')).toBeInTheDocument();
    expect(screen.getByText('Maija Meikäläinen')).toBeInTheDocument();
    expect(screen.queryByText('111111-1111')).not.toBeInTheDocument();
  });

  it('calls useYouthApplicationsListQuery with default pending statuses initially', () => {
    renderComponent(<YouthApplicationList />);
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        status: [
          YouthApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
          YouthApplicationStatus.APPLICATION_HANDLING,
        ],
      })
    );
  });

  it('calls useYouthApplicationsListQuery with updated statuses when filters change', async () => {
    renderComponent(<YouthApplicationList />);

    const combobox = screen.getByRole('combobox', { name: /tila/i });
    await userEvent.click(combobox);

    // Select "Lisätietoja pyydetty" to check it
    await userEvent.click(screen.getByText('Lisätietoja pyydetty'));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        status: [
          YouthApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED,
          YouthApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
          YouthApplicationStatus.APPLICATION_HANDLING,
        ],
      })
    );
  });

  it('does not trigger a new query with empty status list when all filters are deselected', async () => {
    renderComponent(<YouthApplicationList />);

    const combobox = screen.getByRole('combobox', { name: /tila/i });
    await userEvent.click(combobox);

    const listbox = screen.getByRole('listbox');

    // Deselect "Lisätiedot annettu" (additional_information_provided)
    await userEvent.click(within(listbox).getByText('Lisätiedot annettu'));
    // Deselect "Käsittelyssä" (application_handling) -> empty selection, should not trigger query
    await userEvent.click(within(listbox).getByText('Käsittelyssä'));

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
        status: [
          YouthApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
          YouthApplicationStatus.APPLICATION_HANDLING,
        ],
      })
    );
  });

  it('calls useYouthApplicationsListQuery with default processed statuses initially', () => {
    renderComponent(<YouthApplicationList />);
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        status: [
          YouthApplicationStatus.ACCEPTED,
          YouthApplicationStatus.REJECTED,
        ],
      })
    );
  });

  it('calls useYouthApplicationsListQuery with updated processed statuses when processed filters change', async () => {
    renderComponent(<YouthApplicationList />);

    // Switch to processed tab
    await userEvent.click(screen.getByText('Käsitellyt (8)'));

    const combobox = screen.getByRole('combobox', { name: /tila/i });
    await userEvent.click(combobox);

    const listbox = screen.getByRole('listbox');

    // Deselect "Hyväksytty" (Accepted)
    await userEvent.click(within(listbox).getByText('Hyväksytty'));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        status: [YouthApplicationStatus.REJECTED],
      })
    );
  });
  it('automatically adds APPLICATION_HANDLING to status filter when assignee checkbox is checked in pending tab', async () => {
    renderComponent(<YouthApplicationList />);

    // Switch to pending tab explicitly (just in case)
    await userEvent.click(screen.getByText(/käsiteltävät/i));

    // Deselect "Käsittelyssä" from the dropdown to test the behavior
    const combobox = screen.getByRole('combobox', { name: /tila/i });
    await userEvent.click(combobox);
    const listbox = screen.getByRole('listbox');
    await userEvent.click(within(listbox).getByText('Käsittelyssä'));

    // Verify it was removed
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        status: [YouthApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED],
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
          YouthApplicationStatus.APPLICATION_HANDLING,
        ]),
        is_assigned_to_me: true,
      })
    );
  });
});

/* eslint-enable scanjs-rules/property_sessionStorage, scanjs-rules/identifier_sessionStorage */
