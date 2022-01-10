import { axe } from 'jest-axe';
import getAlreadyActivatedPageApi from 'kesaseteli/youth/__tests__/utils/components/get-already-activated-page-api';
import renderPage from 'kesaseteli/youth/__tests__/utils/components/render-page';
import AlreadyActivatedPage from 'kesaseteli/youth/pages/already_activated';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';
import { waitFor } from 'shared/__tests__/utils/test-utils';
import { DEFAULT_LANGUAGE } from 'shared/i18n/i18n';

describe('frontend/kesaseteli/youth/src/pages/already_activated.tsx', () => {
  it('should not violate accessibility', async () => {
    const {
      renderResult: { container },
    } = renderComponent(<AlreadyActivatedPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('redirects to main page when clicking the button', async () => {
    const spyPush = jest.fn();
    await renderPage(AlreadyActivatedPage, { push: spyPush });
    const alreadyActivatedPageApi = getAlreadyActivatedPageApi();
    await alreadyActivatedPageApi.expectations.pageIsLoaded();
    await alreadyActivatedPageApi.actions.clickGoToFrontPageButton();
    await waitFor(() =>
      expect(spyPush).toHaveBeenCalledWith(`${DEFAULT_LANGUAGE}/`)
    );
  });
});
