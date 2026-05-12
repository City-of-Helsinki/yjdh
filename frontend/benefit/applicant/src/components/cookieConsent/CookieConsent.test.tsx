/* eslint-disable testing-library/render-result-naming-convention */
import { render, screen } from '@testing-library/react';
import { setupUserAndRender } from 'benefit/applicant/__tests__/utils/user-render-helper';
import CookieConsent from 'benefit/applicant/components/cookieConsent/CookieConsent';
import { ROUTES } from 'benefit/applicant/constants';
import useLocale from 'benefit/applicant/hooks/useLocale';
import { useTranslation } from 'benefit/applicant/i18n';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import React from 'react';
import { MAIN_CONTENT_ID } from 'shared/constants';
import useCookieConsentParams from 'shared/hooks/useCookieConsentParams';
import { getCookieConsentSiteSettings } from 'shared/utils/cookieConsentSettings';

import i18n from '../../../test/i18n/i18n-test';

jest.mock('benefit/applicant/hooks/useLocale', () => jest.fn());
jest.mock('benefit/applicant/i18n', () => ({ useTranslation: jest.fn() }));
jest.mock('next/navigation', () => ({ useSearchParams: jest.fn() }));
jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('shared/hooks/useCookieConsentParams', () => jest.fn());
jest.mock('shared/utils/cookieConsentSettings', () => ({
  getCookieConsentSiteSettings: jest.fn(),
}));

function CookieConsentContextProviderMock({
  children,
}: {
  children?: React.ReactNode;
}): React.ReactElement {
  return <div data-testid="cookie-consent-provider">{children}</div>;
}

function CookieBannerMock(): React.ReactElement {
  return <div data-testid="cookie-banner" />;
}

function CookieSettingsPageMock(): React.ReactElement {
  return <div data-testid="cookie-settings-page" />;
}

jest.mock('hds-react', () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const actual = jest.requireActual('hds-react');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    Button: actual.Button,
    CookieBanner: CookieBannerMock,
    CookieConsentContextProvider: CookieConsentContextProviderMock,
    CookieSettingsPage: CookieSettingsPageMock,
  };
});

const mockUseLocale = useLocale as jest.Mock;
const mockUseTranslation = useTranslation as jest.Mock;
const mockUseSearchParams = useSearchParams as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;
const mockUseCookieConsentParams = useCookieConsentParams as jest.Mock;
const mockGetCookieConsentSiteSettings =
  getCookieConsentSiteSettings as jest.Mock;

const t = i18n.t.bind(i18n);
const cookieConsentSiteName = 'Helsinki-lisä';

const renderCookieConsent = (
  props: { asPage?: boolean } = {}
): ReturnType<typeof render> => render(<CookieConsent {...props} />);

const getBackButton = (): HTMLElement =>
  screen.getByRole('button', { name: /takaisin/i });

const setupRouter = (): { push: jest.Mock; back: jest.Mock } => {
  const push = jest.fn(() => Promise.resolve(true));
  const back = jest.fn();
  mockUseRouter.mockReturnValue({ push, back });
  return { push, back };
};

describe('CookieConsent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocale.mockReturnValue('fi');
    mockUseTranslation.mockReturnValue({ t });
    mockUseSearchParams.mockReturnValue({ get: jest.fn(() => null) });
    mockUseCookieConsentParams.mockReturnValue({ mocked: true });
    mockGetCookieConsentSiteSettings.mockReturnValue({ site: 'settings' });
    setupRouter();
  });

  it('renders CookieBanner when not used as a page', () => {
    renderCookieConsent();

    expect(screen.getByTestId('cookie-consent-provider')).toBeInTheDocument();
    expect(screen.getByTestId('cookie-banner')).toBeInTheDocument();
    expect(
      screen.queryByTestId('cookie-settings-page')
    ).not.toBeInTheDocument();
  });

  it('renders CookieSettingsPage and back button when used as a page', () => {
    renderCookieConsent({ asPage: true });

    expect(screen.getByTestId('cookie-settings-page')).toBeInTheDocument();
    expect(getBackButton()).toBeInTheDocument();
    expect(screen.queryByTestId('cookie-banner')).not.toBeInTheDocument();
  });

  it('builds cookie consent site settings using translated site name and benefit app', () => {
    renderCookieConsent();

    expect(mockGetCookieConsentSiteSettings).toHaveBeenCalledWith({
      siteName: cookieConsentSiteName,
      app: 'benefit',
    });
  });

  it('passes locale and focus target to useCookieConsentParams', () => {
    renderCookieConsent();

    expect(mockUseCookieConsentParams).toHaveBeenCalledWith({
      siteSettings: { site: 'settings' },
      options: {
        focusTargetSelector: `#${MAIN_CONTENT_ID}`,
        language: 'fi',
      },
    });
  });

  it('calls router.back when back button is clicked without submittedApplication', async () => {
    const { back } = setupRouter();
    const user = setupUserAndRender(() => {
      renderCookieConsent({ asPage: true });
    });

    await user.click(getBackButton());

    expect(back).toHaveBeenCalled();
  });

  it('pushes back to submitted application when submittedApplication exists', async () => {
    const { push, back } = setupRouter();
    mockUseSearchParams.mockReturnValue({
      get: jest.fn(() => 'application-123'),
    });
    const user = setupUserAndRender(() => {
      renderCookieConsent({ asPage: true });
    });

    await user.click(getBackButton());

    expect(push).toHaveBeenCalledWith({
      pathname: ROUTES.APPLICATION_FORM,
      query: { id: 'application-123', isSubmitted: true },
    });
    expect(back).not.toHaveBeenCalled();
  });
});
/* eslint-enable testing-library/render-result-naming-convention */
