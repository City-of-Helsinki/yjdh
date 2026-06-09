import './utils/i18n/i18n-test';

import { render, screen } from '@testing-library/react';
import { ROUTES } from 'kesaseteli-shared/constants/routes';
import useMatomo from 'kesaseteli-shared/hooks/useMatomo';
import { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import React from 'react';

import App from '../pages/_app';

// Mock CSS and design tokens imports
jest.mock('react-toastify/dist/ReactToastify.css', () => ({}));
jest.mock('hds-design-tokens', () => ({}));

// Mock next/dynamic to render synchronously during testing
function mockDynamicComponent(): React.ReactElement {
  return React.createElement(
    'div',
    { 'data-testid': 'cookie-consent-mock' },
    'Cookie Consent Banner'
  );
}

jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => mockDynamicComponent,
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('kesaseteli-shared/hooks/useMatomo');

// Mock components used in BaseApp / App
jest.mock('kesaseteli/youth/components/footer/Footer', () => () => (
  <div data-testid="footer">Footer</div>
));
jest.mock('kesaseteli/youth/components/header/Header', () => () => (
  <div data-testid="header">Header</div>
));
jest.mock(
  'shared/components/app/BaseApp',
  () =>
    ({ children }: { children: React.ReactNode }) =>
      <div data-testid="base-app">{children}</div>
);

describe('_app.tsx CookieConsent rendering', () => {
  const originalEnv = process.env;
  const mockRouter = {
    route: '/',
  };

  const dummyPageProps: AppProps = {
    Component: () => <div data-testid="dummy-page">Page Content</div>,
    pageProps: {},
    router: mockRouter as AppProps['router'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useMatomo as jest.Mock).mockReturnValue(false);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('renders cookie banner when NEXT_PUBLIC_SHOW_COOKIE_BANNER is "1" and route is not cookie settings', () => {
    process.env.NEXT_PUBLIC_SHOW_COOKIE_BANNER = '1';
    mockRouter.route = '/';

    render(<App {...dummyPageProps} />);

    expect(screen.getByTestId('cookie-consent-mock')).toBeInTheDocument();
  });

  it('renders cookie banner when useMatomo returns true and route is not cookie settings', () => {
    process.env.NEXT_PUBLIC_SHOW_COOKIE_BANNER = '0';
    (useMatomo as jest.Mock).mockReturnValue(true);
    mockRouter.route = '/';

    render(<App {...dummyPageProps} />);

    expect(screen.getByTestId('cookie-consent-mock')).toBeInTheDocument();
  });

  it('does not render cookie banner when NEXT_PUBLIC_SHOW_COOKIE_BANNER is "0" and useMatomo is false', () => {
    process.env.NEXT_PUBLIC_SHOW_COOKIE_BANNER = '0';
    (useMatomo as jest.Mock).mockReturnValue(false);
    mockRouter.route = '/';

    render(<App {...dummyPageProps} />);

    expect(screen.queryByTestId('cookie-consent-mock')).not.toBeInTheDocument();
  });

  it('does not render cookie banner when on the cookie settings route even if show banner is configured', () => {
    process.env.NEXT_PUBLIC_SHOW_COOKIE_BANNER = '1';
    (useMatomo as jest.Mock).mockReturnValue(true);
    mockRouter.route = ROUTES.COOKIE_SETTINGS;

    render(<App {...dummyPageProps} />);

    expect(screen.queryByTestId('cookie-consent-mock')).not.toBeInTheDocument();
  });
});
