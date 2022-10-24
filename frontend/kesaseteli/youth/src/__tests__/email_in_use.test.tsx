import { axe } from 'jest-axe';
import getNotificationPageApi from 'kesaseteli/youth/__tests__/utils/components/get-notification-page-api';
import renderComponent from 'kesaseteli/youth/__tests__/utils/components/render-component';
import renderPage from 'kesaseteli/youth/__tests__/utils/components/render-page';
import EmailInUsePage from 'kesaseteli/youth/pages/email_in_use';
import React from 'react';
import { waitFor } from 'shared/__tests__/utils/test-utils';
import { DEFAULT_LANGUAGE } from 'shared/i18n/i18n';

describe('frontend/kesaseteli/youth/src/pages/email_in_use.tsx', () => {
  it('should not violate accessibility', async () => {
    const {
      renderResult: { container },
    } = renderComponent(<EmailInUsePage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('redirects to main page when clicking the button', async () => {
    const spyPush = jest.fn();
    renderPage(EmailInUsePage, { push: spyPush });
    const emailInUseApi = getNotificationPageApi('emailInUse');
    await emailInUseApi.expectations.pageIsLoaded();
    await emailInUseApi.actions.clickGoToFrontPageButton();
    await waitFor(() =>
      expect(spyPush).toHaveBeenCalledWith(`${DEFAULT_LANGUAGE}/`)
    );
  });

  it('shows default activation link expiration time (12 hours)', async () => {
    renderPage(EmailInUsePage);
    const thankYouPageApi = getNotificationPageApi('emailInUse');
    await thankYouPageApi.expectations.pageIsLoaded();
    await thankYouPageApi.expectations.notificationMessageIsPresent(12);
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
      renderPage(EmailInUsePage);
      const emailInUseApi = getNotificationPageApi('emailInUse');
      await emailInUseApi.expectations.pageIsLoaded();
      await emailInUseApi.expectations.notificationMessageIsPresent(2);
    });
    afterEach(() => {
      process.env = originalEnv;
    });
  });
});
