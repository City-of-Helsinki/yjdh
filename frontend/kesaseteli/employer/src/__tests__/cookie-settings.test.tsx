import renderPage from 'kesaseteli/employer/__tests__/utils/components/render-page';
import CookieSettingsPage from 'kesaseteli/employer/pages/cookie-settings';
import React from 'react';
import { screen, waitFor } from 'shared/__tests__/utils/test-utils';
import { TextDecoder, TextEncoder } from 'util';

Object.assign(global, { TextEncoder, TextDecoder });

function mockMockDynamicComponent(): React.ReactElement {
  return React.createElement(
    'div',
    { 'data-testid': 'cookie-consent-mock' },
    'Evästeasetukset'
  );
}

// Mock next/dynamic to render synchronously during testing
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => mockMockDynamicComponent,
}));

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
    });
    expect(spyPush).not.toHaveBeenCalled();
  });
});
