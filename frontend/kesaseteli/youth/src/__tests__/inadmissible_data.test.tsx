import { axe } from 'jest-axe';
import getNotificationPageApi from 'kesaseteli/youth/__tests__/utils/components/get-notification-page-api';
import renderPage from 'kesaseteli/youth/__tests__/utils/components/render-page';
import InadmissibleDataPage from 'kesaseteli/youth/pages/inadmissible_data';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';
import { waitFor } from 'shared/__tests__/utils/test-utils';
import { DEFAULT_LANGUAGE } from 'shared/i18n/i18n';

describe('frontend/kesaseteli/youth/src/pages/inadmissible_data.tsx', () => {
  it('should not violate accessibility', async () => {
    const {
      renderResult: { container },
    } = renderComponent(<InadmissibleDataPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('redirects to main page when clicking the button', async () => {
    const spyPush = jest.fn();
    await renderPage(InadmissibleDataPage, { push: spyPush });
    const emailInUseApi = getNotificationPageApi('inadmissibleData');
    await emailInUseApi.expectations.pageIsLoaded();
    await emailInUseApi.actions.clickGoToFrontPageButton();
    await waitFor(() =>
      expect(spyPush).toHaveBeenCalledWith(`${DEFAULT_LANGUAGE}/`)
    );
  });
});
