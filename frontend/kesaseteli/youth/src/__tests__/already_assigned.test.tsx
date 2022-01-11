import { axe } from 'jest-axe';
import getAlreadyAssignedPageApi from 'kesaseteli/youth/__tests__/utils/components/get-already-assigned-page-api';
import renderPage from 'kesaseteli/youth/__tests__/utils/components/render-page';
import AlreadyAssignedPage from 'kesaseteli/youth/pages/already_assigned';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';
import { waitFor } from 'shared/__tests__/utils/test-utils';
import { DEFAULT_LANGUAGE } from 'shared/i18n/i18n';

describe('frontend/kesaseteli/youth/src/pages/already_assigned.tsx', () => {
  it('should not violate accessibility', async () => {
    const {
      renderResult: { container },
    } = renderComponent(<AlreadyAssignedPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('redirects to main page when clicking the button', async () => {
    const spyPush = jest.fn();
    await renderPage(AlreadyAssignedPage, { push: spyPush });
    const alreadyAssignedPageApi = getAlreadyAssignedPageApi();
    await alreadyAssignedPageApi.expectations.pageIsLoaded();
    await alreadyAssignedPageApi.actions.clickGoToFrontPageButton();
    await waitFor(() =>
      expect(spyPush).toHaveBeenCalledWith(`${DEFAULT_LANGUAGE}/`)
    );
  });
});
