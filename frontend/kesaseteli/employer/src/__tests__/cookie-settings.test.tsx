import { TextEncoder, TextDecoder } from 'util';

(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

import React from 'react';

// Mock next/dynamic to render synchronously during testing
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => {
    return function MockDynamicComponent() {
      return React.createElement('div', { 'data-testid': 'cookie-consent-mock' }, 'Evästeasetukset');
    };
  },
}));

import renderPage from 'kesaseteli/employer/__tests__/utils/components/render-page';
import CookieSettingsPage from 'kesaseteli/employer/pages/cookie-settings';
import { screen, waitFor } from 'shared/__tests__/utils/test-utils';

describe('frontend/kesaseteli/employer/src/pages/cookie-settings.tsx', () => {
  it('Should render cookie settings page and not redirect when unauthorized', async () => {
    const spyPush = jest.fn();

    renderPage(CookieSettingsPage, {
      pathname: '/cookie-settings',
      route: '/cookie-settings',
      asPath: '/cookie-settings',
      push: spyPush,
    });

    // Verify it renders the mocked cookie consent component containing "Evästeasetukset"
    await waitFor(() => {
      expect(screen.getByTestId('cookie-consent-mock')).toBeInTheDocument();
      expect(spyPush).not.toHaveBeenCalled();
    });
  });
});
