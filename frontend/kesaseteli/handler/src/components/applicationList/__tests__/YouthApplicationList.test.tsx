import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';

import fi from '../../../../public/locales/fi/common.json';
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
});
