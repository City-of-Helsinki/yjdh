/* eslint-disable scanjs-rules/property_sessionStorage, scanjs-rules/identifier_sessionStorage */
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import { EmployerApplicationStatus } from 'kesaseteli-shared/constants/employer-application-status';
import React from 'react';

import useEmployerApplicationsListQuery from '../../../hooks/backend/useEmployerApplicationsListQuery';
import PaymentApprovalList from '../PaymentApprovalList';

jest.mock('../../../hooks/backend/useEmployerApplicationsListQuery');
const mockUseQuery = useEmployerApplicationsListQuery as jest.Mock;

jest.mock('../../../hooks/backend/useApproverAcceptForPaymentMutation', () =>
  jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
  }))
);

jest.mock('../../../hooks/backend/useApproverRejectMutation', () =>
  jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
  }))
);

jest.mock('../../../hooks/backend/useApproverReturnToHandlerMutation', () =>
  jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
  }))
);

jest.mock('../../../hooks/backend/useApproverReturnToReviewMutation', () =>
  jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
  }))
);

const mockPendingApps = [
  {
    id: 'pending-1',
    company: { name: 'Company Pending Oy', business_id: '1234567-8' },
    status: EmployerApplicationStatus.PAYMENT_REVIEW,
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

describe('PaymentApprovalList', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    mockUseQuery.mockImplementation((params) => {
      if (
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
          data: { count: 1, results: mockProcessedApps },
          isLoading: false,
        };
      }
      if (params?.status?.includes(EmployerApplicationStatus.PAYMENT_REVIEW)) {
        return {
          data: { count: 1, results: mockPendingApps },
          isLoading: false,
        };
      }
      return {
        data: { count: 0, results: [] },
        isLoading: false,
      };
    });
  });

  it('renders 3 tabs with their counts', () => {
    renderComponent(<PaymentApprovalList />);
    expect(screen.getByText(/Käsiteltävät \(1\)/)).toBeInTheDocument();
    expect(screen.getByText(/Käsitellyt \(1\)/)).toBeInTheDocument();
    expect(screen.getByText(/Maksuvirheet \(0\)/)).toBeInTheDocument();
  });

  it('clears row selection when status filter is modified on the processed tab', async () => {
    renderComponent(<PaymentApprovalList />);

    // Switch to Processed tab
    await userEvent.click(screen.getByText(/Käsitellyt \(1\)/));
    expect(screen.getByText('Company Processed Oy')).toBeInTheDocument();

    const returnToReviewButton = screen.getByRole('button', {
      name: /palauta valitut maksatuksen tarkistukseen/i,
    });
    // Initially disabled because no rows are selected
    expect(returnToReviewButton).toBeDisabled();

    // Select the processed application row checkbox
    const rowCheckbox = screen.getByRole('checkbox', {
      name: /rivin valinta/i,
    });
    await userEvent.click(rowCheckbox);

    // Button should now be enabled
    expect(returnToReviewButton).toBeEnabled();

    // Open status filter dropdown and deselect a status to trigger filter change
    const combobox = screen.getByRole('combobox', { name: /tila/i });
    await userEvent.click(combobox);

    const listbox = screen.getByRole('listbox');
    await userEvent.click(within(listbox).getByText(/hyväksytty maksuun/i));

    // After filter change, row selection must be cleared and the button must be disabled
    expect(returnToReviewButton).toBeDisabled();
  });
});

/* eslint-enable scanjs-rules/property_sessionStorage, scanjs-rules/identifier_sessionStorage */
