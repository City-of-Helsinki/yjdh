import { render, screen } from '@testing-library/react';
import { ROUTES } from 'benefit/handler/constants';
import useLogin from 'benefit/handler/hooks/useLogin';
import useLogout from 'benefit/handler/hooks/useLogout';
import useUserQuery from 'benefit/handler/hooks/useUserQuery';
import { useRouter } from 'next/router';
import React from 'react';

import i18n from '../../../../test/i18n/i18n-test';
import Header from '../Header';
import { useHeader } from '../useHeader';

const mockBaseHeader = jest.fn(
  ({ customItems }: { customItems?: React.ReactNode }) => (
    <div data-testid="base-header">{customItems}</div>
  )
);

jest.mock('benefit/handler/hooks/useLogin');
jest.mock('benefit/handler/hooks/useLogout');
jest.mock('benefit/handler/hooks/useUserQuery');
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('../useHeader', () => ({
  useHeader: jest.fn(),
}));
jest.mock('../HeaderNotifier', () => () => (
  <div data-testid="header-notifier">notifier</div>
));
jest.mock('../Header.sc', () => ({
  $BaseHeader: (props: { customItems?: React.ReactNode }) =>
    mockBaseHeader(props),
  $HeaderCustomItems: ({ children }: { children: React.ReactNode }) => (
    <ul data-testid="custom-items">{children}</ul>
  ),
}));
jest.mock('next/dynamic', () =>
  jest.fn(() => () => (
    <div data-testid="temporary-ahjo-mode-switch">ahjo-switch</div>
  ))
);

const mockUseHeader = useHeader as jest.MockedFunction<typeof useHeader>;
const mockUseLogin = useLogin as jest.MockedFunction<typeof useLogin>;
const mockUseLogout = useLogout as jest.MockedFunction<typeof useLogout>;
const mockUseUserQuery = useUserQuery as jest.MockedFunction<
  typeof useUserQuery
>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('Header', () => {
  const login = jest.fn();
  const logout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseHeader.mockReturnValue({
      t: i18n.t as unknown as ReturnType<typeof useHeader>['t'],
      languageOptions: [],
      isNavigationVisible: true,
      navigationItems: [{ label: 'Home', url: ROUTES.HOME }],
      handleLanguageChange: jest.fn(),
      handleNavigationItemClick: jest.fn(),
      handleTitleClick: jest.fn(),
    });
    mockUseLogin.mockReturnValue(login);
    mockUseLogout.mockReturnValue(logout);
    mockUseRouter.mockReturnValue({
      asPath: ROUTES.HOME,
    } as ReturnType<typeof useRouter>);
    mockUseUserQuery.mockReturnValue({
      isLoading: false,
      isSuccess: true,
      data: {
        first_name: 'Ada',
        last_name: 'Lovelace',
      },
    } as ReturnType<typeof useUserQuery>);
  });

  it('passes translated header props and authenticated login data to BaseHeader', () => {
    render(<Header />);

    const props = mockBaseHeader.mock.calls[0][0] as {
      title: string;
      titleUrl: string;
      skipToContentLabel: string;
      menuToggleAriaLabel: string;
      isNavigationVisible: boolean;
      navigationItems: Array<{ label: string; url: string }>;
      login: {
        isAuthenticated: boolean;
        loginLabel: string;
        logoutLabel: string;
        userAriaLabelPrefix: string;
        onLogin: () => void;
        onLogout: () => void;
        userName?: string;
      };
    };

    expect(props.title).toBe('Helsinki-lisä käsittelijä');
    expect(props.titleUrl).toBe(ROUTES.HOME);
    expect(props.skipToContentLabel).toBe('Hyppää pääsisältöön');
    expect(props.menuToggleAriaLabel).toBe('Valikko');
    expect(props.isNavigationVisible).toBe(true);
    expect(props.navigationItems).toEqual([
      { label: 'Home', url: ROUTES.HOME },
    ]);

    expect(props.login.isAuthenticated).toBe(true);
    expect(props.login.loginLabel).toBe('Kirjaudu sisään');
    expect(props.login.logoutLabel).toBe('Kirjaudu ulos');
    expect(props.login.userAriaLabelPrefix).toBe('Käyttäjä:');
    expect(props.login.onLogin).toBe(login);
    expect(props.login.onLogout).toBe(logout);
    expect(props.login.userName).toBe('Ada Lovelace');
  });

  it('forces unauthenticated login state on login page', () => {
    mockUseRouter.mockReturnValue({
      asPath: ROUTES.LOGIN,
    } as ReturnType<typeof useRouter>);

    render(<Header />);

    const props = mockBaseHeader.mock.calls[0][0] as {
      login: { isAuthenticated: boolean };
    };

    expect(props.login.isAuthenticated).toBe(false);
  });

  it('uses noop login/logout handlers while user query is loading and renders custom items', () => {
    mockUseUserQuery.mockReturnValue({
      isLoading: true,
      isSuccess: false,
      data: undefined,
    } as ReturnType<typeof useUserQuery>);

    render(<Header />);

    const props = mockBaseHeader.mock.calls[0][0] as {
      login: {
        isAuthenticated: boolean;
        onLogin: () => void;
        onLogout: () => void;
        userName?: string;
      };
    };

    expect(props.login.isAuthenticated).toBe(false);
    expect(props.login.userName).toBeUndefined();

    props.login.onLogin();
    props.login.onLogout();

    expect(login).not.toHaveBeenCalled();
    expect(logout).not.toHaveBeenCalled();

    expect(screen.getByTestId('header-notifier')).toBeInTheDocument();
    expect(
      screen.getByTestId('temporary-ahjo-mode-switch')
    ).toBeInTheDocument();
  });
});
