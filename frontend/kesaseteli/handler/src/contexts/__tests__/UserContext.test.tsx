import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ROUTES } from 'kesaseteli-shared/constants/routes';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import useUserQuery from 'kesaseteli/handler/hooks/backend/useUserQuery';
import { useRouter } from 'next/router';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import User from 'shared/types/user';

import { useUser, UserProvider } from '../UserContext';

jest.mock('kesaseteli/handler/hooks/backend/useUserQuery');
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const mockUser: User = {
  id: 'user-123',
  given_name: 'Test',
  family_name: 'User',
  name: 'Test User',
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return {
    queryClient,
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  };
};

const TestComponent: React.FC = () => {
  const { user, isLoading, isFetching, isAuthenticated, clearUser } = useUser();
  return (
    <div>
      <span data-testid="user-name">{user?.name ?? 'none'}</span>
      <span data-testid="is-loading">{String(isLoading)}</span>
      <span data-testid="is-fetching">{String(isFetching)}</span>
      <span data-testid="is-authenticated">{String(isAuthenticated)}</span>
      <button onClick={clearUser} data-testid="clear-user-btn">
        Clear User
      </button>
    </div>
  );
};

describe('UserContext and UserProvider', () => {
  const mockRouter = {
    route: '',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('throws error when useUser is used outside UserProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const BuggyComponent = () => {
      useUser();
      return null;
    };
    expect(() => render(<BuggyComponent />)).toThrow(
      'useUser must be used within a UserProvider'
    );
    consoleSpy.mockRestore();
  });

  it('renders children immediately on anonymous routes without querying user', () => {
    mockRouter.route = ROUTES.LOGIN;
    (useUserQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isSuccess: false,
      isError: false,
    });

    const { wrapper } = createWrapper();
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>,
      { wrapper }
    );

    expect(useUserQuery).toHaveBeenCalledWith({ enabled: false });
    expect(screen.getByTestId('user-name')).toHaveTextContent('none');
    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
    expect(screen.queryByTestId('page-loading-spinner')).not.toBeInTheDocument();
  });

  it('renders loading spinner on protected routes when user query is loading initially', () => {
    mockRouter.route = ROUTES.DASHBOARD;
    (useUserQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: true,
      isSuccess: false,
      isError: false,
    });

    const { wrapper } = createWrapper();
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>,
      { wrapper }
    );

    expect(useUserQuery).toHaveBeenCalledWith({ enabled: true });
    expect(screen.getByTestId('page-loading-spinner')).toBeInTheDocument();
    expect(screen.queryByTestId('user-name')).not.toBeInTheDocument();
  });

  it('renders spinner on protected routes when query errors and no cached user exists', () => {
    mockRouter.route = ROUTES.DASHBOARD;
    (useUserQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isSuccess: false,
      isError: true,
    });

    const { wrapper } = createWrapper();
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>,
      { wrapper }
    );

    expect(screen.getByTestId('page-loading-spinner')).toBeInTheDocument();
    expect(screen.queryByTestId('user-name')).not.toBeInTheDocument();
  });

  it('renders children and provides context values once user is loaded', () => {
    mockRouter.route = ROUTES.DASHBOARD;
    (useUserQuery as jest.Mock).mockReturnValue({
      data: mockUser,
      isLoading: false,
      isFetching: false,
      isSuccess: true,
      isError: false,
    });

    const { wrapper } = createWrapper();
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>,
      { wrapper }
    );

    expect(screen.queryByTestId('page-loading-spinner')).not.toBeInTheDocument();
    expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
    expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    expect(screen.getByTestId('is-fetching')).toHaveTextContent('false');
    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
  });

  it('renders children during background fetch (isFetching: true) if user data exists', () => {
    mockRouter.route = ROUTES.DASHBOARD;
    (useUserQuery as jest.Mock).mockReturnValue({
      data: mockUser,
      isLoading: false,
      isFetching: true,
      isSuccess: true,
      isError: false,
    });

    const { wrapper } = createWrapper();
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>,
      { wrapper }
    );

    expect(screen.queryByTestId('page-loading-spinner')).not.toBeInTheDocument();
    expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
    expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    expect(screen.getByTestId('is-fetching')).toHaveTextContent('true');
  });

  it('renders children during background fetch error if user data still exists', () => {
    mockRouter.route = ROUTES.DASHBOARD;
    (useUserQuery as jest.Mock).mockReturnValue({
      data: mockUser,
      isLoading: false,
      isFetching: false,
      isSuccess: true,
      isError: true,
    });

    const { wrapper } = createWrapper();
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>,
      { wrapper }
    );

    expect(screen.queryByTestId('page-loading-spinner')).not.toBeInTheDocument();
    expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
    expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    expect(screen.getByTestId('is-fetching')).toHaveTextContent('false');
  });

  it('purges query cache when clearUser is called', async () => {
    mockRouter.route = ROUTES.DASHBOARD;
    (useUserQuery as jest.Mock).mockReturnValue({
      data: mockUser,
      isLoading: false,
      isFetching: false,
      isSuccess: true,
      isError: false,
    });

    const { queryClient, wrapper } = createWrapper();
    const removeQueriesSpy = jest.spyOn(queryClient, 'removeQueries');

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>,
      { wrapper }
    );

    await userEvent.click(screen.getByTestId('clear-user-btn'));
    expect(removeQueriesSpy).toHaveBeenCalledWith(BackendEndpoint.USER);
  });
});
