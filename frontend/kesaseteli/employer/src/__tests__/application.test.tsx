import { axe } from 'jest-axe';
import {
  expectAuthorizedReply,
  expectToGetApplicationErrorFromBackend, expectToLogout,
  expectUnauthorizedReply,
} from 'kesaseteli/employer/__tests__/utils/backend/backend-nocks';
import getApplicationPageApi, { ApplicationPageApi } from 'kesaseteli/employer/__tests__/utils/components/get-application-page-api';
import renderComponent from 'kesaseteli/employer/__tests__/utils/components/render-component';
import renderPage from 'kesaseteli/employer/__tests__/utils/components/render-page';
import ApplicationPage from 'kesaseteli/employer/pages/application';
import nock from 'nock';
import React from 'react';
import { QueryClient } from 'react-query';
import getErrorPageApi, { GetErrorPageApi } from 'shared/__tests__/component-apis/get-error-page-api';
import { waitForLoadingSpinnerToComplete } from 'shared/__tests__/utils/component.utils';
import createReactQueryTestClient from 'shared/__tests__/utils/react-query/create-react-query-test-client';
import { waitFor } from 'shared/__tests__/utils/test-utils';
import { DEFAULT_LANGUAGE, Language } from 'shared/i18n/i18n';

describe('frontend/kesaseteli/employer/src/pages/application.tsx', () => {
  let queryClient: QueryClient;

  afterEach(() => {
    nock.cleanAll();
  });

  it('should not violate accessibility', async () => {
    const { container } = renderComponent(<ApplicationPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  describe('loading data', () => {
    const id = '1234';
    let applicationApi: ApplicationPageApi;
    queryClient = createReactQueryTestClient();

    beforeEach(() => {
      queryClient.clear();
      applicationApi = getApplicationPageApi(queryClient, id);
    });

    it('Should redirect when unauthorized', async () => {
      expectUnauthorizedReply();
      const spyPush = jest.fn();
      renderPage(ApplicationPage, queryClient, { push: spyPush });
      await waitFor(() => expect(spyPush).toHaveBeenCalledWith('/login'));
    });

    describe('when authorized', () => {
      beforeEach(() => {
        expectAuthorizedReply();
      });

      it('Should route to index page with default lang when applicaton id and locale is missing', async () => {
        const spyReplace = jest.fn();
        renderPage(ApplicationPage, queryClient, {
          replace: spyReplace,
          query: {},
        });
        await waitFor(() =>
          expect(spyReplace).toHaveBeenCalledWith(`${DEFAULT_LANGUAGE}/`)
        );
      });

      it('Should route to index page with locale when applicaton id is missing', async () => {
        const locale: Language = 'en';
        const spyReplace = jest.fn();
        renderPage(ApplicationPage, queryClient, {
          replace: spyReplace,
          query: {},
          locale,
        });
        await waitFor(() =>
          expect(spyReplace).toHaveBeenCalledWith(`${locale}/`)
        );
      });

      describe('When loading application from backend returns error page', () => {
        let errorPage: GetErrorPageApi;
        beforeEach(() => {
          expectToGetApplicationErrorFromBackend(id);
          errorPage = getErrorPageApi()
        });
        it('Should show errorPage', async () => {
          renderPage(ApplicationPage, queryClient, { query: { id } });
          await errorPage.expectations.displayErrorPage();
        });
        describe('when clicking home button', () => {
          it('Should have return button to home page', async () => {
            const locale: Language = 'en';
            const spyReplace = jest.fn();
            renderPage(ApplicationPage, queryClient, {
              replace: spyReplace,
              query: { id },
              locale,
            });
            await errorPage.expectations.displayErrorPage();
            errorPage.actions.clickGoToHomePageButton();
            await waitFor(() =>
              expect(spyReplace).toHaveBeenCalledWith(`${locale}/`)
            );
          });
        })
        describe('when clicking Logout button', () => {
          it('Should logout', async () => {
            const locale: Language = 'en';
            const spyPush = jest.fn();
            renderPage(ApplicationPage, queryClient, {
              push: spyPush,
              query: { id },
              locale,
            });
            await errorPage.expectations.displayErrorPage();
            errorPage.actions.clickLogoutButton(expectToLogout());
            await errorPage.expectations.allApiRequestsDone();
            await waitFor(() =>
              expect(queryClient.getQueryData('user')).toBeUndefined()
            );
            expect(spyPush).toHaveBeenCalledWith('/login?logout=true')
          });
        })
      })

      describe('when loading application returns data', () => {
        let applicationPage: ReturnType<typeof applicationApi.replyOk>;
        beforeEach(() => {
          applicationPage = applicationApi.replyOk();
        });
        it('shows validation errors and disables continue button when missing values', async () => {
          renderPage(ApplicationPage, queryClient, { query: { id } });
          await waitForLoadingSpinnerToComplete();
          applicationPage.step1.expectations.stepIsLoaded();
          applicationPage.step1.actions.typeInvoicerName('');
          applicationPage.step1.actions.typeInvoicerEmail('´');
          applicationPage.step1.actions.typeInvoicerPhone('');
          applicationPage.step1.actions.clickContinueButton();
          await applicationPage.step1.expectations.inputHasError(
            /(nimi puuttuu)|(errors.invoicer_name)/i
          );
          await applicationPage.step1.expectations.inputHasError(
            /(sähköposti on virheellinen)|(errors.invoicer_email)/i
          );
          await applicationPage.step1.expectations.inputHasError(
            /(puhelinnumero on virheellinen)|(errors.invoicer_phone_number)/i
          );
          await applicationPage.step1.expectations.continueButtonIsDisabled();
        });

        it('shows validation errors when invalid values', async () => {
          renderPage(ApplicationPage, queryClient, { query: { id } });
          await waitForLoadingSpinnerToComplete();
          applicationPage.step1.expectations.stepIsLoaded();
          applicationPage.step1.actions.typeInvoicerName('a'.repeat(257)); // max limit is 256
          await applicationPage.step1.expectations.inputHasError(
            /(nimi puuttuu)|(errors.invoicer_name)/i
          );
          applicationPage.step1.actions.typeInvoicerEmail('john@doe');
          await applicationPage.step1.expectations.inputHasError(
            /(sähköposti on virheellinen)|(errors.invoicer_email)/i
          );
          applicationPage.step1.actions.typeInvoicerPhone('1'.repeat(65)); // max limit is 64
          await applicationPage.step1.expectations.inputHasError(
            /(puhelinnumero on virheellinen)|(errors.invoicer_phone_number)/i
          );
        });

        it('saves application and goes to step 2 when next button is clicked', async () => {
          renderPage(ApplicationPage, queryClient, { query: { id } });
          await waitForLoadingSpinnerToComplete();
          applicationPage.step1.expectations.stepIsLoaded();
          applicationPage.step1.expectations.displayCompanyData();
          applicationPage.step1.expectations.inputValueIsSet('invoicer_name');
          applicationPage.step1.expectations.inputValueIsSet('invoicer_email');
          applicationPage.step1.expectations.inputValueIsSet(
            'invoicer_phone_number'
          );
          const invoicer_name = 'John Doe';
          const invoicer_email = 'john@doe.com';
          const invoicer_phone_number = '+358503758288';
          applicationPage.step1.actions.typeInvoicerName(invoicer_name);
          applicationPage.step1.actions.typeInvoicerEmail(invoicer_email);
          applicationPage.step1.actions.typeInvoicerPhone(
            invoicer_phone_number
          );
          applicationPage.step1.actions.clickContinueButton({
            invoicer_name,
            invoicer_email,
            invoicer_phone_number,
          });
          await applicationPage.step1.expectations.allApiRequestsDone();
          applicationPage.step2.expectations.stepIsLoaded();
        });
      });
    });
  });
});
