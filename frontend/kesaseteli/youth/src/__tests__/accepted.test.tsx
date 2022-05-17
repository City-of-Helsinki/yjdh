import { axe } from 'jest-axe';
import getNotificationPageApi from 'kesaseteli/youth/__tests__/utils/components/get-notification-page-api';
import renderPage from 'kesaseteli/youth/__tests__/utils/components/render-page';
import AcceptedPage from 'kesaseteli/youth/pages/accepted';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';

describe('frontend/kesaseteli/youth/src/pages/accepted.tsx', () => {
  it('should not violate accessibility', async () => {
    const {
      renderResult: { container },
    } = renderComponent(<AcceptedPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('loads the page', async () => {
    const spyPush = jest.fn();
    await renderPage(AcceptedPage, { push: spyPush });
    const emailInUseApi = getNotificationPageApi('accepted');
    await emailInUseApi.expectations.pageIsLoaded();
  });
});
