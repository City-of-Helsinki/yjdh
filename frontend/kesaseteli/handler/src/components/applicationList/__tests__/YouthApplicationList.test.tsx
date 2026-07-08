/* eslint-disable scanjs-rules/property_sessionStorage, scanjs-rules/identifier_sessionStorage */
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';

import fi from '../../../../public/locales/fi/common.json';
import useYouthApplicationsListQuery from '../../../hooks/backend/useYouthApplicationsListQuery';
import { ApplicationStatus } from '../../../types/application';
import YouthApplicationList from '../YouthApplicationList';

jest.mock('../../../hooks/backend/useYouthApplicationsListQuery');
const mockUseQuery = useYouthApplicationsListQuery as jest.Mock;

const mockPendingApps = [
  {
    id: 'pending-1',
    social_security_number: '111111-1111',
    first_name: 'Matti',
    last_name: 'Meikäläinen',
    status: 'submitted',
  },
];
const mockProcessedApps = [
  {
    id: 'processed-1',
    social_security_number: '222222-2222',
    first_name: 'Maija',
    last_name: 'Meikäläinen',
    status: 'accepted',
  },
];

describe('YouthApplicationList', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    mockUseQuery.mockImplementation((params) => {
      if (
        params?.status?.includes('accepted') ||
        params?.status?.includes('rejected')
      ) {
        return {
          data: { count: 8, results: mockProcessedApps },
          isLoading: false,
        };
      }
      return { data: { count: 3, results: mockPendingApps }, isLoading: false };
    });
  });

  it('shows pending and processed tab counts and renders first tab content by default', () => {
    renderComponent(<YouthApplicationList />);
    expect(
      screen.getByText(`${fi.applicationList.tabs.pending} (3)`)
    ).toBeInTheDocument();
    expect(
      screen.getByText(`${fi.applicationList.tabs.processed} (8)`)
    ).toBeInTheDocument();

    // Verify first tab content is displayed
    expect(screen.getByText('111111-1111')).toBeInTheDocument();
    expect(screen.getByText('Matti Meikäläinen')).toBeInTheDocument();
    expect(screen.queryByText('222222-2222')).not.toBeInTheDocument();
  });

  it('switches to the processed tab on click and renders processed content', async () => {
    renderComponent(<YouthApplicationList />);
    await userEvent.click(
      screen.getByText(`${fi.applicationList.tabs.processed} (8)`)
    );
    expect(
      screen.getByText(`${fi.applicationList.tabs.processed} (8)`)
    ).toBeVisible();

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
          ApplicationStatus.SUBMITTED,
          ApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
        ],
      })
    );
  });

  it('calls useYouthApplicationsListQuery with updated statuses when filters change', async () => {
    renderComponent(<YouthApplicationList />);

    const combobox = screen.getByRole('combobox', { name: /tila/i });
    await userEvent.click(combobox);

    // Select "Lisätietoja pyydetty" to check it
    await userEvent.click(
      screen.getByText(
        fi.applicationList.status.additional_information_requested
      )
    );

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        status: [
          ApplicationStatus.SUBMITTED,
          ApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED,
          ApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
        ],
      })
    );
  });

  it('does not trigger a new query with empty status list when all filters are deselected', async () => {
    renderComponent(<YouthApplicationList />);

    const combobox = screen.getByRole('combobox', { name: /tila/i });
    await userEvent.click(combobox);

    const listbox = screen.getByRole('listbox');

    // Deselect "Avoin" (submitted) -> should query with only [additional_information_provided]
    await userEvent.click(
      within(listbox).getByText(fi.applicationList.status.submitted)
    );
    // Deselect "Lisätiedot toimitettu" (additional_information_provided) -> empty selection, should not trigger query
    await userEvent.click(
      within(listbox).getByText(
        fi.applicationList.status.additional_information_provided
      )
    );

    expect(mockUseQuery).not.toHaveBeenCalledWith(
      expect.objectContaining({
        status: [],
      })
    );
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        status: [ApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED],
      })
    );
  });

  it('calls useYouthApplicationsListQuery with default processed statuses initially', () => {
    renderComponent(<YouthApplicationList />);
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        status: [ApplicationStatus.ACCEPTED, ApplicationStatus.REJECTED],
      })
    );
  });

  it('calls useYouthApplicationsListQuery with updated processed statuses when processed filters change', async () => {
    renderComponent(<YouthApplicationList />);

    // Switch to processed tab
    await userEvent.click(
      screen.getByText(`${fi.applicationList.tabs.processed} (8)`)
    );

    const combobox = screen.getByRole('combobox', { name: /tila/i });
    await userEvent.click(combobox);

    const listbox = screen.getByRole('listbox');

    // Deselect "Hyväksytty" (Accepted)
    await userEvent.click(
      within(listbox).getByText(fi.applicationList.status.accepted)
    );

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        status: [ApplicationStatus.REJECTED],
      })
    );
  });
});

/* eslint-enable scanjs-rules/property_sessionStorage, scanjs-rules/identifier_sessionStorage */
