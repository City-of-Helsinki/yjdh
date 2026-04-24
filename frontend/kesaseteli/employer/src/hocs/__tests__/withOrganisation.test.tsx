import React from 'react';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import withOrganisation from '../withOrganisation';
import useAuth from 'shared/hooks/useAuth';
import useGoToPage from 'shared/hooks/useGoToPage';
import useCompanyQuery from 'kesaseteli/employer/hooks/backend/useCompanyQuery';

jest.mock('shared/hooks/useAuth', () => jest.fn());
jest.mock('shared/hooks/useGoToPage', () => jest.fn());
jest.mock('kesaseteli/employer/hooks/backend/useCompanyQuery', () => jest.fn());

describe('withOrganisation', () => {
  const MockComponent = () => <div>Mock Component</div>;
  const WrappedComponent = withOrganisation(MockComponent);
  const mockGoToPage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useGoToPage as jest.Mock).mockReturnValue(mockGoToPage);
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it('should redirect to /no-organisation when user gets 403 Forbidden and is NOT on /no-organisation', () => {
    const mockError = new Error('403 Forbidden');
    (useCompanyQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isSuccess: false,
      error: mockError,
    });
    renderComponent(<WrappedComponent />, { pathname: '/' });

    expect(mockGoToPage).toHaveBeenCalledWith('/no-organisation');
  });

  it('should NOT redirect to /no-organisation when user gets 403 Forbidden and is ALREADY on /no-organisation', () => {
    // This test reproduces the fix for the infinite loop issue.
    // Without the fix, the component would keep calling goToPage('/no-organisation')
    // even when already on the /no-organisation page, causing an infinite loop.
    const mockError = new Error('403 Forbidden');
    (useCompanyQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isSuccess: false,
      error: mockError,
    });
    renderComponent(<WrappedComponent />, { pathname: '/no-organisation' });

    expect(mockGoToPage).not.toHaveBeenCalled();
  });

  it('should redirect to /no-organisation when company has no name and is NOT on /no-organisation', () => {
    (useCompanyQuery as jest.Mock).mockReturnValue({
      data: { name: '' },
      isLoading: false,
      isSuccess: true,
      error: null,
    });
    renderComponent(<WrappedComponent />, { pathname: '/' });

    expect(mockGoToPage).toHaveBeenCalledWith('/no-organisation');
  });

  it('should render the component when company has a name', () => {
    (useCompanyQuery as jest.Mock).mockReturnValue({
      data: { name: 'Valid Company Oy' },
      isLoading: false,
      isSuccess: true,
      error: null,
    });
    const {
      renderResult: { getByText },
    } = renderComponent(<WrappedComponent />, { pathname: '/' });

    expect(getByText('Mock Component')).toBeInTheDocument();
    expect(mockGoToPage).not.toHaveBeenCalled();
  });
});
