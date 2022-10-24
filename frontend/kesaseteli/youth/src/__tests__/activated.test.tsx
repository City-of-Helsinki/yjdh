import { axe } from 'jest-axe';
import getNotificationPageApi from 'kesaseteli/youth/__tests__/utils/components/get-notification-page-api';
import renderComponent from 'kesaseteli/youth/__tests__/utils/components/render-component';
import renderPage from 'kesaseteli/youth/__tests__/utils/components/render-page';
import ActivatedPage from 'kesaseteli/youth/pages/activated';
import React from 'react';

describe('frontend/kesaseteli/youth/src/pages/activated.tsx', () => {
  it('should not violate accessibility', async () => {
    const {
      renderResult: { container },
    } = renderComponent(<ActivatedPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('loads the page', async () => {
    const spyPush = jest.fn();
    renderPage(ActivatedPage, { push: spyPush });
    const emailInUseApi = getNotificationPageApi('activated');
    await emailInUseApi.expectations.pageIsLoaded();
  });
});
