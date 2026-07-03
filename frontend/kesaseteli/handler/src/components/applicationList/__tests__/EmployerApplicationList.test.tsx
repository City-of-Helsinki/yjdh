import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';

import fi from '../../../../public/locales/fi/common.json';
import useEmployerApplicationsListQuery from '../../../hooks/backend/useEmployerApplicationsListQuery';
import EmployerApplicationList from '../EmployerApplicationList';

jest.mock('../../../hooks/backend/useEmployerApplicationsListQuery');
const mockUseQuery = useEmployerApplicationsListQuery as jest.Mock;

const mockPendingApps = [
  {
    id: 'pending-1',
    company: { name: 'Company Pending Oy', business_id: '1234567-8' },
    status: 'submitted',
    summer_vouchers: [],
  },
];
const mockProcessedApps = [
  {
    id: 'processed-1',
    company: { name: 'Company Processed Oy', business_id: '8765432-1' },
    status: 'accepted',
    summer_vouchers: [],
  },
];

describe('EmployerApplicationList', () => {
  beforeEach(() => {
    mockUseQuery.mockImplementation((params) => {
      if (
        params?.status?.includes('accepted') ||
        params?.status?.includes('rejected')
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
    expect(
      screen.getByText(`${fi.applicationList.tabs.pending} (5)`)
    ).toBeInTheDocument();
    expect(
      screen.getByText(`${fi.applicationList.tabs.processed} (10)`)
    ).toBeInTheDocument();

    // Verify first tab content is displayed
    expect(screen.getByText('Company Pending Oy')).toBeInTheDocument();
    expect(screen.queryByText('Company Processed Oy')).not.toBeInTheDocument();
  });

  it('switches to the processed tab on click and renders processed content', async () => {
    renderComponent(<EmployerApplicationList />);
    await userEvent.click(
      screen.getByText(`${fi.applicationList.tabs.processed} (10)`)
    );
    // The processed tab becomes active; verify it's selected/visible
    expect(
      screen.getByText(`${fi.applicationList.tabs.processed} (10)`)
    ).toBeVisible();

    // Verify processed tab content is displayed
    expect(screen.getByText('Company Processed Oy')).toBeInTheDocument();
    expect(screen.queryByText('Company Pending Oy')).not.toBeInTheDocument();
  });
});
