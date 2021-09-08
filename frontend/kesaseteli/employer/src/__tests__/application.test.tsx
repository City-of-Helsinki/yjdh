import { axe } from 'jest-axe';
import {
  expectAuthorizedReply,
  expectToGetApplicationErrorFromBackend,
  expectToGetApplicationFromBackend,
  expectUnauthorizedReply,
} from 'kesaseteli/employer/__tests__/utils/backend/backend-nocks';
import getApplicationPageApi from 'kesaseteli/employer/__tests__/utils/components/get-application-page-api';
import renderComponent from 'kesaseteli/employer/__tests__/utils/components/render-component';
import renderPage from 'kesaseteli/employer/__tests__/utils/components/render-page';
import ApplicationPage from 'kesaseteli/employer/pages/application';
import React from 'react';
import errorPageApi from 'shared/__tests__/component-apis/error-page-api';
import { fakeApplication } from 'shared/__tests__/utils/fake-objects';
import createReactQueryTestClient from 'shared/__tests__/utils/react-query/create-react-query-test-client';
import { waitFor } from 'shared/__tests__/utils/test-utils';
import { DEFAULT_LANGUAGE, Language } from 'shared/i18n/i18n';

describe('frontend/kesaseteli/employer/src/pages/application.tsx', () => {
  it('should not violate accessibility', async () => {
    const { container } = renderComponent(<ApplicationPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  describe('loading data', () => {
    const id = '1234';
    const application = fakeApplication('1234');

    it('Should redirect when unauthorized', async () => {
      const queryClient = createReactQueryTestClient();
      expectUnauthorizedReply();
      const spyPush = jest.fn();
      await renderPage(ApplicationPage, queryClient, { push: spyPush });
      await waitFor(() => expect(spyPush).toHaveBeenCalledWith('/login'));
    });

    describe('when authorized', () => {
      it('Should route to index page with default lang when applicaton id and locale is missing', async () => {
        const queryClient = createReactQueryTestClient();
        expectAuthorizedReply();
        const spyReplace = jest.fn();
        await renderPage(ApplicationPage, queryClient, {
          replace: spyReplace,
          query: {},
        });
        await waitFor(() =>
          expect(spyReplace).toHaveBeenCalledWith(`${DEFAULT_LANGUAGE}/`)
        );
      });

      it('Should route to index page with locale when applicaton id is missing', async () => {
        const queryClient = createReactQueryTestClient();
        expectAuthorizedReply();
        const locale: Language = 'en';
        const spyReplace = jest.fn();
        await renderPage(ApplicationPage, queryClient, {
          replace: spyReplace,
          query: {},
          locale,
        });
        await waitFor(() =>
          expect(spyReplace).toHaveBeenCalledWith(`${locale}/`)
        );
      });

      describe('When loading application from backend returns error page', () => {
        it('Should show errorPage', async () => {
          const queryClient = createReactQueryTestClient();
          expectAuthorizedReply();
          expectToGetApplicationErrorFromBackend(id);
          await renderPage(ApplicationPage, queryClient, { query: { id } });
          await errorPageApi.expectations.displayErrorPage();
        });
      });

      describe('when loading application returns data', () => {
        it('shows validation errors and disables continue button when missing values', async () => {
          const queryClient = createReactQueryTestClient();
          expectAuthorizedReply();
          expectToGetApplicationFromBackend(application);
          await renderPage(ApplicationPage, queryClient, { query: { id } });
          const applicationPage = getApplicationPageApi(
            queryClient,
            application
          );
          await applicationPage.step1.expectations.stepIsLoaded();
          applicationPage.step1.actions.typeInvoicerName('');
          await applicationPage.step1.expectations.inputHasError(
            /(nimi puuttuu)|(errors.invoicer_name)/i
          );
          applicationPage.step1.actions.typeInvoicerEmail('');
          await applicationPage.step1.expectations.inputHasError(
            /(sähköposti on virheellinen)|(errors.invoicer_email)/i
          );
          applicationPage.step1.actions.typeInvoicerPhone('');
          await applicationPage.step1.expectations.inputHasError(
            /(puhelinnumero on virheellinen)|(errors.invoicer_phone_number)/i
          );
        });

        it('shows validation errors when invalid values', async () => {
          const queryClient = createReactQueryTestClient();
          expectAuthorizedReply();
          expectToGetApplicationFromBackend(application);
          await renderPage(ApplicationPage, queryClient, { query: { id } });
          const applicationPage = getApplicationPageApi(
            queryClient,
            application
          );
          await applicationPage.step1.expectations.stepIsLoaded();
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
          const queryClient = createReactQueryTestClient();
          expectAuthorizedReply();
          expectToGetApplicationFromBackend(application);
          await renderPage(ApplicationPage, queryClient, { query: { id } });
          const applicationPage = getApplicationPageApi(
            queryClient,
            application
          );
          await applicationPage.step1.expectations.stepIsLoaded();
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
          await applicationPage.step1.actions.clickNextButton();
          await applicationPage.step2.expectations.stepIsLoaded();
        });

        it('can traverse between wizard steps', async () => {
          const queryClient = createReactQueryTestClient();
          expectAuthorizedReply();
          expectToGetApplicationFromBackend(application);
          await renderPage(ApplicationPage, queryClient, { query: { id } });
          const applicationPage = getApplicationPageApi(
            queryClient,
            application
          );
          await applicationPage.step1.expectations.stepIsLoaded();
          await applicationPage.step1.actions.clickNextButton();
          await applicationPage.step2.expectations.stepIsLoaded();
          await applicationPage.step2.actions.clickNextButton();
          await applicationPage.step3.expectations.stepIsLoaded();
          await applicationPage.step3.actions.clickPreviousButton();
          await applicationPage.step2.expectations.stepIsLoaded();
          await applicationPage.step2.actions.clickPreviousButton();
          await applicationPage.step1.expectations.stepIsLoaded();
        });
      });
    });
  });
});
