import { axe } from 'jest-axe';
import {
  expectToGetSchoolsErrorFromBackend,
  expectToGetSchoolsFromBackend,
  expectToGetSummerVoucherConfigurationFromBackend,
} from 'kesaseteli/youth/__tests__/utils/backend/backend-nocks';
import getIndexPageApi from 'kesaseteli/youth/__tests__/utils/components/get-index-page-api';
import renderPage from 'kesaseteli/youth/__tests__/utils/components/render-page';
import YouthIndex from 'kesaseteli/youth/pages';
import headerApi from 'kesaseteli-shared/__tests__/utils/component-apis/header-api';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';
import { waitFor } from 'shared/__tests__/utils/test-utils';

describe('frontend/kesaseteli/youth/src/pages/index.tsx', () => {
  describe('when application is open', () => {
    beforeEach(() => {
      expectToGetSummerVoucherConfigurationFromBackend();
    });

    it('should not violate accessibility', async () => {
      expectToGetSchoolsFromBackend();
      const {
        renderResult: { container },
      } = renderComponent(<YouthIndex />);
      const indexPageApi = getIndexPageApi();
      await indexPageApi.expectations.pageIsLoaded();
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('loads school list from backend', async () => {
      const loadSchools = expectToGetSchoolsFromBackend();
      renderPage(YouthIndex);
      await waitFor(() => {
        loadSchools.done();
      });
    });

    it('shows error toast if loading school list from backend fails', async () => {
      const loadSchools = expectToGetSchoolsErrorFromBackend(404);
      renderPage(YouthIndex);
      await waitFor(() => {
        loadSchools.done();
      });
      await headerApi.expectations.errorToastIsShown();
    });
  });

  describe('when application is closed', () => {
    it('shows application not open message', async () => {
      expectToGetSummerVoucherConfigurationFromBackend([]);
      renderPage(YouthIndex);
      const indexPageApi = getIndexPageApi();
      await indexPageApi.expectations.applicationIsNotOpen();
    });
  });
});
