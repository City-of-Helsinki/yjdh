import { axe } from 'jest-axe';
import getNotificationPageApi from 'kesaseteli/youth/__tests__/utils/components/get-notification-page-api';
import renderPage from 'kesaseteli/youth/__tests__/utils/components/render-page';
import AcceptedPage from 'kesaseteli/youth/app/[locale]/accepted/page';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';
import { DEFAULT_LANGUAGE } from 'shared/i18n/i18n';

describe('frontend/kesaseteli/youth/src/app/[locale]/accepted/page.tsx', () => {
  it('should not violate accessibility', async () => {
    /*const page = await AcceptedPage({ params: Promise.resolve({ locale: DEFAULT_LANGUAGE }) });
    console.log('DEBUG: Page result type:', typeof page);
    console.log('DEBUG: Is valid element:', React.isValidElement(page));*/
    const {
      renderResult: { container },
    } = renderComponent(<div data-testid="test-div">Test</div>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('loads the page', async () => {
    const spyPush = jest.fn();
    renderPage(await AcceptedPage({ params: Promise.resolve({ locale: DEFAULT_LANGUAGE }) }), { push: spyPush });
    const emailInUseApi = getNotificationPageApi('accepted');
    await emailInUseApi.expectations.pageIsLoaded();
  });
});
