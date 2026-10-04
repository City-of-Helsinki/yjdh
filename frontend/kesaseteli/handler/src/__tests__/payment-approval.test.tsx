import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import { ROUTES } from 'kesaseteli-shared/constants/routes';
import { useRouter } from 'next/router';
import React from 'react';

import useCurrentUserQuery from '../hooks/backend/useCurrentUserQuery';
import useUser from '../hooks/useUser';
import PaymentApprovalIndex from '../pages/payment-approval/index';

const mockReplace = jest.fn();

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('kesaseteli/handler/hooks/backend/useCurrentUserQuery');
jest.mock('kesaseteli/handler/hooks/useUser');
jest.mock(
  'kesaseteli/handler/components/applicationList/PaymentApprovalList',
  () => () =>
    <div data-testid="payment-approval-list">Payment Approval List</div>
);

const mockUseCurrentUserQuery = useCurrentUserQuery as jest.Mock;
const mockUseUser = useUser as jest.Mock;

const mockRouter = {
  replace: mockReplace,
  route: ROUTES.PAYMENT_APPROVAL,
  pathname: ROUTES.PAYMENT_APPROVAL,
  query: {},
  asPath: ROUTES.PAYMENT_APPROVAL,
};

describe('PaymentApprovalIndex', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('redirects to ROUTES.FORBIDDEN when user is confirmed non-approver', () => {
    mockUseUser.mockReturnValue({
      isAuthenticated: true,
      isApprover: false,
      isLoading: false,
    });
    mockUseCurrentUserQuery.mockReturnValue({
      isLoading: false,
      isError: false,
    });

    renderComponent(<PaymentApprovalIndex />, mockRouter as never);
    expect(mockReplace).toHaveBeenCalledWith(ROUTES.FORBIDDEN);
  });

  it('does NOT redirect and renders ErrorPage with refetch retry when currentUserQuery errors and user is not confirmed approver', async () => {
    const mockRefetch = jest.fn();
    mockUseUser.mockReturnValue({
      isAuthenticated: true,
      isApprover: false,
      isLoading: false,
    });
    mockUseCurrentUserQuery.mockReturnValue({
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    });

    renderComponent(<PaymentApprovalIndex />, mockRouter as never);
    expect(mockReplace).not.toHaveBeenCalled();

    // Verify ErrorPage content is rendered
    expect(
      screen.getByRole('button', { name: /lataa sivu uudelleen/i })
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: /lataa sivu uudelleen/i })
    );
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('renders PaymentApprovalList when user is confirmed approver', () => {
    mockUseUser.mockReturnValue({
      isAuthenticated: true,
      isApprover: true,
      isLoading: false,
    });
    mockUseCurrentUserQuery.mockReturnValue({
      isLoading: false,
      isError: false,
    });

    renderComponent(<PaymentApprovalIndex />, mockRouter as never);
    expect(screen.getByTestId('payment-approval-list')).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('renders PaymentApprovalList in mock mode even if currentUserQuery has error', () => {
    mockUseUser.mockReturnValue({
      isAuthenticated: true,
      isApprover: true,
      isLoading: false,
    });
    mockUseCurrentUserQuery.mockReturnValue({
      isLoading: false,
      isError: true,
    });

    renderComponent(<PaymentApprovalIndex />, mockRouter as never);
    expect(screen.getByTestId('payment-approval-list')).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('renders nothing and does not redirect while loading', () => {
    mockUseUser.mockReturnValue({
      isAuthenticated: true,
      isApprover: false,
      isLoading: true,
    });
    mockUseCurrentUserQuery.mockReturnValue({
      isLoading: true,
      isError: false,
    });

    const { renderResult } = renderComponent(
      <PaymentApprovalIndex />,
      mockRouter as never
    );
    expect(renderResult.container).toBeEmptyDOMElement();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
