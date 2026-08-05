import { fireEvent, render, waitFor } from '@testing-library/react';
import { CookieBanner, CookieConsentContextProvider } from 'hds-react';
import * as React from 'react';

import {
  getCookieConsentSiteSettings,
  RequiredGroups,
} from '../cookieConsentSettings';

/**
 * Regression tests for the Kesäseteli CSRF cookie being deleted by the cookie
 * consent banner.
 *
 * hds-react deletes every stored cookie that is not declared in a consented
 * group when the user chooses "Accept required cookies only" or "Accept
 * selected cookies". The deletion happens in
 * `cookieConsentCore.js#handleButtonEvents` ->
 * `cookieHandler.removeConsentWithdrawnCookiesBeforeSave` ->
 * `monitorAndCleanBrowserStorages.deleteKeys`. That path is independent of the
 * `monitorInterval` / `remove` site settings, which only gate the monitor loop,
 * so setting `monitorInterval: 0` does not prevent it.
 *
 * When `yjdhcsrftoken` is not declared, it is deleted while the host-only
 * `sessionid` survives. The user stays authenticated but can no longer make any
 * unsafe request, and the backend answers 403 "CSRF Failed: CSRF cookie not
 * set." until the user logs out and back in.
 */

const CSRF_COOKIE_NAME = 'yjdhcsrftoken';
const CONSENT_COOKIE_NAME = 'helfi-cookie-consents';
const API_HOST = 'kesaseteli.api.hel.fi';

const localized = (value: string): Record<'fi' | 'sv' | 'en', string> => ({
  fi: value,
  sv: value,
  en: value,
});

const readCookie = (name: string): string | undefined =>
  document.cookie
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.slice(name.length + 1);

const clearAllCookies = (): void => {
  document.cookie
    .split(';')
    .map((cookie) => cookie.split('=')[0].trim())
    .filter(Boolean)
    .forEach((name) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });
};

/**
 * Required groups equivalent to the Kesäseteli defaults, optionally also
 * declaring the CSRF cookie.
 */
const buildRequiredGroups = ({
  declareCsrfCookie,
}: {
  declareCsrfCookie: boolean;
}): RequiredGroups => [
  {
    groupId: 'shared',
    title: localized('Shared'),
    description: localized('Shared cookies'),
    cookies: [
      {
        name: CONSENT_COOKIE_NAME,
        host: API_HOST,
        storageType: 1,
        description: localized('Cookie consent'),
        expiration: localized('1 year'),
      },
      ...(declareCsrfCookie
        ? [
            {
              name: CSRF_COOKIE_NAME,
              host: API_HOST,
              storageType: 1 as const,
              description: localized('CSRF token'),
              expiration: localized('1 year'),
            },
          ]
        : []),
    ],
  },
];

const getShadowRoot = (): ShadowRoot | null =>
  document.querySelector('.hds-cc__target')?.shadowRoot ?? null;

/**
 * hds-react keeps its banner element and its `window.hds.cookieConsent`
 * instance outside the React tree, so they survive React unmounting and would
 * otherwise leak the previous test's site settings into the next test.
 */
const teardownCookieConsent = (): void => {
  document
    .querySelectorAll('.hds-cc__target, #hds-cc-aria-live, #hds-cc__spacer')
    .forEach((element) => element.remove());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (window as any).hds;
};

const renderBanner = async (
  requiredGroups?: RequiredGroups
): Promise<ShadowRoot> => {
  render(
    <CookieConsentContextProvider
      siteSettings={getCookieConsentSiteSettings({
        siteName: 'Kesäseteli',
        app: 'kesaseteli',
        requiredGroups,
      })}
      options={{}}
    >
      <CookieBanner />
    </CookieConsentContextProvider>
  );

  await waitFor(() => {
    expect(
      getShadowRoot()?.querySelector('button[data-approved="required"]')
    ).toBeInTheDocument();
  });

  return getShadowRoot() as ShadowRoot;
};

const acceptRequiredCookiesOnly = async (
  shadowRoot: ShadowRoot
): Promise<void> => {
  fireEvent.click(
    shadowRoot.querySelector(
      'button[data-approved="required"]'
    ) as HTMLButtonElement
  );
  // The consent cookie is written by the same handler that performs the
  // deletion, so its presence marks the end of that code path.
  await waitFor(() => {
    expect(readCookie(CONSENT_COOKIE_NAME)).toBeDefined();
  });
};

describe('cookie consent and the CSRF cookie', () => {
  beforeEach(() => {
    clearAllCookies();
    document.cookie = `${CSRF_COOKIE_NAME}=test-csrf-token; path=/`;
  });

  afterEach(() => {
    teardownCookieConsent();
    clearAllCookies();
    document.body.innerHTML = '';
  });

  it('deletes the CSRF cookie when it is not declared in the required groups', async () => {
    const shadowRoot = await renderBanner(
      buildRequiredGroups({ declareCsrfCookie: false })
    );
    expect(readCookie(CSRF_COOKIE_NAME)).toBe('test-csrf-token');

    await acceptRequiredCookiesOnly(shadowRoot);

    expect(readCookie(CSRF_COOKIE_NAME)).toBeUndefined();
  });

  it('keeps the CSRF cookie when it is declared in the required groups', async () => {
    const shadowRoot = await renderBanner(
      buildRequiredGroups({ declareCsrfCookie: true })
    );
    expect(readCookie(CSRF_COOKIE_NAME)).toBe('test-csrf-token');

    await acceptRequiredCookiesOnly(shadowRoot);

    expect(readCookie(CSRF_COOKIE_NAME)).toBe('test-csrf-token');
  });

  it('keeps the CSRF cookie with the Kesäseteli default required groups', async () => {
    // Uses the real defaults, i.e. exactly what the employer, youth and handler
    // apps ship: `_app.tsx` renders <CookieConsent siteName={...} /> without
    // passing `requiredGroups`, so `getDefaultKesaseteliRequiredGroups` applies.
    const shadowRoot = await renderBanner();
    expect(readCookie(CSRF_COOKIE_NAME)).toBe('test-csrf-token');

    await acceptRequiredCookiesOnly(shadowRoot);

    expect(readCookie(CSRF_COOKIE_NAME)).toBe('test-csrf-token');
  });
});
