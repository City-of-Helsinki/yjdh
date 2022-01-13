import { axe } from 'jest-axe';
import getExpiredPageApi from 'kesaseteli/youth/__tests__/utils/components/get-expired-page-api';
import renderPage from 'kesaseteli/youth/__tests__/utils/components/render-page';
import ExpiredPage from 'kesaseteli/youth/pages/expired';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';
import { waitFor } from 'shared/__tests__/utils/test-utils';
import { DEFAULT_LANGUAGE } from 'shared/i18n/i18n';

describe('frontend/kesaseteli/youth/src/pages/expired.tsx', () => {
  it('should not violate accessibility', async () => {
    const {
      renderResult: { container },
    } = renderComponent(<ExpiredPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('redirects to main page when clicking the button', async () => {
    const spyPush = jest.fn();
    await renderPage(ExpiredPage, { push: spyPush });
    const expiredPageApi = getExpiredPageApi();
    await expiredPageApi.expectations.pageIsLoaded();
    await expiredPageApi.actions.clickGoToFrontPageButton();
    await waitFor(() =>
      expect(spyPush).toHaveBeenCalledWith(`${DEFAULT_LANGUAGE}/`)
    );
  });

  it('shows default activation link expiration time (12 hours)', async () => {
    await renderPage(ExpiredPage);
    const expiredPageApi = getExpiredPageApi();
    await expiredPageApi.expectations.pageIsLoaded();
    await expiredPageApi.expectations.notificationMessageIsPresent(12);
  });

  describe('When different activation link expiration time', () => {
    // How to mock process.env: https://medium.com/weekly-webtips/how-to-mock-process-env-when-writing-unit-tests-with-jest-80940f367c2c
    const originalEnv = process.env;
    beforeEach(() => {
      jest.resetModules();
    });
    it('shows different activation link expiration time', async () => {
      process.env = {
        ...originalEnv,
        NEXT_PUBLIC_ACTIVATION_LINK_EXPIRATION_SECONDS: String(3600 * 2),
      };
      await renderPage(ExpiredPage);
      const expiredPageApi = getExpiredPageApi();
      await expiredPageApi.expectations.pageIsLoaded();
      await expiredPageApi.expectations.notificationMessageIsPresent(2);
    });
    afterEach(() => {
      process.env = originalEnv;
    });
  });
});
