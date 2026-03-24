import { axe } from 'jest-axe';
import getNotificationPageApi from 'kesaseteli/youth/__tests__/utils/components/get-notification-page-api';
import renderPage from 'kesaseteli/youth/__tests__/utils/components/render-page';
import ActivatedPage from 'kesaseteli/youth/app/[locale]/activated/page';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';
import { DEFAULT_LANGUAGE } from 'shared/i18n/i18n';

describe('frontend/kesaseteli/youth/src/app/[locale]/activated/page.tsx', () => {
  it('should not violate accessibility', async () => {
    const {
      renderResult: { container },
    } = renderComponent(await ActivatedPage({ params: Promise.resolve({ locale: DEFAULT_LANGUAGE }) }));
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('loads the page', async () => {
    const spyPush = jest.fn();
    renderPage(await ActivatedPage({ params: Promise.resolve({ locale: DEFAULT_LANGUAGE }) }), { push: spyPush });
    const emailInUseApi = getNotificationPageApi('activated');
    await emailInUseApi.expectations.pageIsLoaded();
  });
});
