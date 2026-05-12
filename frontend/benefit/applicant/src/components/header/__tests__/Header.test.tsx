import { screen } from '@testing-library/react';
import renderComponent from 'benefit/applicant/__tests__/utils/render-component';
import React from 'react';

import i18n from '../../../../test/i18n/i18n-test';
import useLogin from '../../../hooks/useLogin';
import useLogout from '../../../hooks/useLogout';
import useUserQuery from '../../../hooks/useUserQuery';
import Header from '../Header';
import { useHeader } from '../useHeader';

jest.mock('benefit/applicant/components/header/useHeader');
jest.mock('benefit/applicant/hooks/useLogin');
jest.mock('benefit/applicant/hooks/useLogout');
jest.mock('benefit/applicant/hooks/useUserQuery');

let mockMessengerProps: Record<string, unknown> = {};

jest.mock(
  'benefit/applicant/components/messenger/Messenger',
  () =>
    function MessengerMock({
      isOpen,
      canWriteNewMessages,
    }: Record<string, unknown>): React.ReactNode {
      mockMessengerProps = { isOpen, canWriteNewMessages };
      return isOpen ? <div data-testid="messenger" /> : null;
    }
);

const mockUseHeader = useHeader as jest.Mock;
const mockUseLogin = useLogin as jest.Mock;
const mockUseLogout = useLogout as jest.Mock;
const mockUseUserQuery = useUserQuery as jest.Mock;

const t = i18n.t.bind(i18n);

const defaultHeaderHook = {
  t,
  languageOptions: [],
  navigationItems: [],
  isNavigationVisible: true,
  hasMessenger: false,
  handleLanguageChange: jest.fn(),
  handleNavigationItemClick: jest.fn(),
  unreadMessagesCount: 0,
  setMessagesDrawerVisiblity: jest.fn(),
  isMessagesDrawerVisible: false,
  canWriteNewMessages: true,
  isTabActive: jest.fn(() => false),
};

const setupHook = (overrides: Record<string, unknown> = {}): void => {
  mockUseHeader.mockReturnValue({ ...defaultHeaderHook, ...overrides });
};

const setupUserQuery = (overrides: Record<string, unknown> = {}): void => {
  mockUseUserQuery.mockReturnValue({
    isLoading: false,
    isSuccess: false,
    data: undefined,
    ...overrides,
  });
};

const renderHeader = (
  routerOverrides: Record<string, unknown> = {}
): ReturnType<typeof renderComponent> =>
  renderComponent(<Header />, {
    locale: 'fi',
    defaultLocale: 'fi',
    asPath: '/',
    ...routerOverrides,
  });

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMessengerProps = {};
    setupHook();
    setupUserQuery();
    mockUseLogin.mockReturnValue(jest.fn());
    mockUseLogout.mockReturnValue(jest.fn());
  });

  it('renders the header with the translated app name', () => {
    renderHeader();

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getAllByText('Helsinki-lisä').length).toBeGreaterThan(0);
  });

  it('uses home route as title URL for fi locale', () => {
    renderHeader({ locale: 'fi' });

    expect(screen.getByRole('link', { name: 'Helsinki-lisä' })).toHaveAttribute(
      'href',
      '/'
    );
  });

  it('prefixes title URL with locale for non-fi locales', () => {
    renderHeader({ locale: 'en' });

    expect(screen.getByRole('link', { name: 'Helsinki-lisä' })).toHaveAttribute(
      'href',
      '/en/'
    );
  });

  it('does not render Messenger when not authenticated', () => {
    setupUserQuery({ isSuccess: false });

    renderHeader();

    expect(screen.queryByTestId('messenger')).not.toBeInTheDocument();
  });

  it('does not render Messenger when on the login page', () => {
    setupUserQuery({ isSuccess: true });
    setupHook({ hasMessenger: true });

    renderHeader({ asPath: '/login' });

    expect(screen.queryByTestId('messenger')).not.toBeInTheDocument();
  });

  it('renders Messenger open when authenticated, hasMessenger is true, and drawer is visible', () => {
    setupUserQuery({ isSuccess: true });
    setupHook({ hasMessenger: true, isMessagesDrawerVisible: true });

    renderHeader();

    expect(screen.getByTestId('messenger')).toBeInTheDocument();
    expect(mockMessengerProps.isOpen).toBe(true);
    expect(mockMessengerProps.canWriteNewMessages).toBe(true);
  });

  it('shows user full name in the header when authenticated', () => {
    setupUserQuery({
      isSuccess: true,
      data: { firstName: 'Matti', lastName: 'Meikäläinen' },
    });

    renderHeader();

    expect(
      screen.getByRole('button', { name: /Matti Meikäläinen/ })
    ).toBeInTheDocument();
  });
});
