import {
  expectToCreateYouthApplication,
  expectToGetSchoolsFromBackend,
  expectToGetSummerVoucherConfigurationFromBackend,
  expectToReplyErrorWhenCreatingYouthApplication,
} from 'kesaseteli/youth/__tests__/utils/backend/backend-nocks';
import getIndexPageApi from 'kesaseteli/youth/__tests__/utils/components/get-index-page-api';
import renderPage from 'kesaseteli/youth/__tests__/utils/components/render-page';
import { REDIRECT_ERROR_TYPES } from 'kesaseteli/youth/components/constants/creation-error-types';
import YouthIndex from 'kesaseteli/youth/pages';
import headerApi from 'kesaseteli-shared/__tests__/utils/component-apis/header-api';
import { waitFor } from 'shared/__tests__/utils/test-utils';
import { DEFAULT_LANGUAGE, Language } from 'shared/i18n/i18n';

describe('frontend/kesaseteli/youth/src/pages/index.tsx', () => {
  describe('when application is open', () => {
    beforeEach(() => {
      expectToGetSummerVoucherConfigurationFromBackend();
    });

    describe('when valid application', () => {
      it('saves the application with listed school', async () => {
        expectToGetSchoolsFromBackend();
        const spyPush = jest.fn();
        renderPage(YouthIndex, { push: spyPush });
        const indexPageApi = getIndexPageApi();
        await indexPageApi.expectations.pageIsLoaded();
        await indexPageApi.actions.fillTheFormWithListedSchoolAndSave({
          backendExpectation: expectToCreateYouthApplication,
        });
        await waitFor(() =>
          expect(spyPush).toHaveBeenCalledWith(
            `/${DEFAULT_LANGUAGE}/thankyou`,
            undefined,
            { shallow: false }
          )
        );
      });

      it('saves the application with unlisted school', async () => {
        expectToGetSchoolsFromBackend();
        const spyPush = jest.fn();
        renderPage(YouthIndex, { push: spyPush });
        const indexPageApi = getIndexPageApi();
        await indexPageApi.expectations.pageIsLoaded();
        await indexPageApi.actions.fillTheFormWithUnlistedSchoolAndSave({
          backendExpectation: expectToCreateYouthApplication,
        });
        await waitFor(() =>
          expect(spyPush).toHaveBeenCalledWith(
            `/${DEFAULT_LANGUAGE}/thankyou`,
            undefined,
            { shallow: false }
          )
        );
      });

      it('saves the application with application language and redirects to thank you page', async () => {
        expectToGetSchoolsFromBackend();
        const language: Language = 'sv';
        const spyPush = jest.fn();
        renderPage(YouthIndex, { locale: language, push: spyPush });
        const indexPageApi = getIndexPageApi();
        await indexPageApi.expectations.pageIsLoaded();

        await indexPageApi.actions.fillTheFormWithListedSchoolAndSave({
          language,
          backendExpectation: expectToCreateYouthApplication,
        });
        await waitFor(() =>
          expect(spyPush).toHaveBeenCalledWith(
            `/${language}/thankyou`,
            undefined,
            { shallow: false }
          )
        );
      });

      it('shows error toaster when backend gives unknown bad request -error', async () => {
        expectToGetSchoolsFromBackend();
        renderPage(YouthIndex);
        const indexPageApi = getIndexPageApi();
        await indexPageApi.expectations.pageIsLoaded();

        await indexPageApi.actions.fillTheFormWithListedSchoolAndSave({
          backendExpectation:
            expectToReplyErrorWhenCreatingYouthApplication(400),
        });
        await headerApi.expectations.errorToastIsShown();
      });

      it('redirects to error page when backend gives internal server error', async () => {
        expectToGetSchoolsFromBackend();
        const spyPush = jest.fn();
        renderPage(YouthIndex, { push: spyPush });
        const indexPageApi = getIndexPageApi();
        await indexPageApi.expectations.pageIsLoaded();

        await indexPageApi.actions.fillTheFormWithListedSchoolAndSave({
          backendExpectation:
            expectToReplyErrorWhenCreatingYouthApplication(500),
        });
        await waitFor(() =>
          expect(spyPush).toHaveBeenCalledWith(
            `/${DEFAULT_LANGUAGE}/500`,
            undefined,
            { shallow: false }
          )
        );
      });

      for (const errorType of REDIRECT_ERROR_TYPES) {
        it(`redirects to ${errorType} error page when backend returns respective bad request type`, async () => {
          expectToGetSchoolsFromBackend();
          const spyPush = jest.fn();
          renderPage(YouthIndex, { push: spyPush });
          const indexPageApi = getIndexPageApi();
          await indexPageApi.expectations.pageIsLoaded();

          await indexPageApi.actions.fillTheFormWithListedSchoolAndSave({
            backendExpectation: expectToReplyErrorWhenCreatingYouthApplication(
              400,
              errorType
            ),
          });
          await waitFor(() =>
            expect(spyPush).toHaveBeenCalledWith(
              `/${DEFAULT_LANGUAGE}/${errorType}`
            )
          );
        });
      }
    });
  });
});
