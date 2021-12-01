import { axe } from 'jest-axe';
import getApplicationPageApi from 'kesaseteli/employer/__tests__/utils/components/get-application-page-api';
import renderPage from 'kesaseteli/employer/__tests__/utils/components/render-page';
import ApplicationPage from 'kesaseteli/employer/pages/application';
import { clearLocalStorage } from 'kesaseteli/employer/utils/localstorage.utils';
import {
  expectAuthorizedReply,
  expectToGetApplicationErrorFromBackend,
  expectToGetApplicationFromBackend,
  expectUnauthorizedReply,
} from 'kesaseteli-shared/__tests__/utils/backend/backend-nocks';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';
import { fakeApplication } from 'shared/__tests__/utils/fake-objects';
import { waitFor } from 'shared/__tests__/utils/test-utils';
import { DEFAULT_LANGUAGE, Language } from 'shared/i18n/i18n';

describe('frontend/kesaseteli/employer/src/pages/application.tsx', () => {
  afterEach(() => clearLocalStorage('application'));
  it('should not violate accessibility', async () => {
    const {
      renderResult: { container },
    } = renderComponent(<ApplicationPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  describe('loading data', () => {
    const id = '1234';
    const application = fakeApplication('1234');

    it('Should redirect when unauthorized', async () => {
      expectUnauthorizedReply();
      const spyPush = jest.fn();
      await renderPage(ApplicationPage, { push: spyPush });
      await waitFor(() => expect(spyPush).toHaveBeenCalledWith('/login'));
    });

    describe('when authorized', () => {
      it('Should route to index page with default lang when applicaton id and locale is missing', async () => {
        expectAuthorizedReply();
        const spyReplace = jest.fn();
        await renderPage(ApplicationPage, {
          replace: spyReplace,
          query: {},
        });
        await waitFor(() =>
          expect(spyReplace).toHaveBeenCalledWith(`${DEFAULT_LANGUAGE}/`)
        );
      });

      it('Should route to index page with locale when applicaton id is missing', async () => {
        expectAuthorizedReply();
        const locale: Language = 'en';
        const spyReplace = jest.fn();
        await renderPage(ApplicationPage, {
          replace: spyReplace,
          query: {},
          locale,
        });
        await waitFor(() =>
          expect(spyReplace).toHaveBeenCalledWith(`${locale}/`)
        );
      });

      describe('When loading application from backend returns error page', () => {
        it('Should redirect to errorPage', async () => {
          expectAuthorizedReply();
          expectToGetApplicationErrorFromBackend(id);
          const spyPush = jest.fn();
          await renderPage(ApplicationPage, { query: { id }, push: spyPush });
          await waitFor(() => {
            expect(spyPush).toHaveBeenCalledWith(`${DEFAULT_LANGUAGE}/500`);
          });
        });
      });

      describe('when loading application returns data', () => {
        it('shows validation errors and disables continue button when missing values', async () => {
          expectAuthorizedReply();
          expectToGetApplicationFromBackend(application);
          await renderPage(ApplicationPage, { query: { id } });
          const applicationPage = getApplicationPageApi(application);
          const required =
            /(tieto puuttuu tai on virheellinen)|(errors.required)/i;
          await applicationPage.step1.expectations.stepIsLoaded();
          applicationPage.step1.actions.typeContactPersonName('');
          await applicationPage.step1.expectations.inputHasError(
            'contact_person_name',
            required
          );
          applicationPage.step1.actions.typeContactPersonEmail('');
          await applicationPage.step1.expectations.inputHasError(
            'contact_person_email',
            required
          );
          applicationPage.step1.actions.typeStreetAddress('');
          await applicationPage.step1.expectations.inputHasError(
            'street_address',
            required
          );
          applicationPage.step1.actions.typeContactPersonPhone('');
          await applicationPage.step1.expectations.inputHasError(
            'contact_person_phone_number',
            required
          );
        });

        it('shows validation errors when invalid values', async () => {
          expectAuthorizedReply();
          expectToGetApplicationFromBackend(application);
          await renderPage(ApplicationPage, { query: { id } });
          const applicationPage = getApplicationPageApi(application);
          await applicationPage.step1.expectations.stepIsLoaded();
          applicationPage.step1.actions.typeContactPersonName('a'.repeat(257)); // max limit is 256
          await applicationPage.step1.expectations.inputHasError(
            'contact_person_name',
            /(syöttämäsi tieto on liian pitkä)|(errors.maxlength)/i
          );
          applicationPage.step1.actions.typeContactPersonEmail('john@doe');
          await applicationPage.step1.expectations.inputHasError(
            'contact_person_email',
            /(syöttämäsi tieto on virheellistä muotoa)|(errors.pattern)/i
          );
          applicationPage.step1.actions.typeStreetAddress('s'.repeat(257)); // max limit is 64
          await applicationPage.step1.expectations.inputHasError(
            'street_address',
            /(syöttämäsi tieto on liian pitkä)|(errors.maxlength)/i
          );
          applicationPage.step1.actions.typeContactPersonPhone('1'.repeat(65)); // max limit is 64
          await applicationPage.step1.expectations.inputHasError(
            'contact_person_phone_number',
            /(syöttämäsi tieto on liian pitkä)|(errors.maxlength)/i
          );
        });

        it('saves application when next button is clicked', async () => {
          expectAuthorizedReply();
          expectToGetApplicationFromBackend(application);
          await renderPage(ApplicationPage, { query: { id } });
          const applicationPage = getApplicationPageApi(application);
          await applicationPage.step1.expectations.stepIsLoaded();
          applicationPage.step1.expectations.displayCompanyData();
          applicationPage.step1.expectations.inputValueIsSet(
            'contact_person_name'
          );
          applicationPage.step1.expectations.inputValueIsSet(
            'contact_person_email'
          );
          applicationPage.step1.expectations.inputValueIsSet(
            'contact_person_phone_number'
          );
          const contact_person_name = 'John Doe';
          const contact_person_email = 'john@doe.com';
          const contact_person_phone_number = '+358503758288';
          const street_address = 'Pohjoisesplanadi 11-13, 00170 Helsinki';
          applicationPage.step1.actions.typeContactPersonName(
            contact_person_name
          );
          applicationPage.step1.actions.typeContactPersonEmail(
            contact_person_email
          );
          applicationPage.step1.actions.typeStreetAddress(street_address);
          applicationPage.step1.actions.typeContactPersonPhone(
            contact_person_phone_number
          );
          await applicationPage.step1.actions.clickNextButtonAndExpectToSaveApplication();
          await applicationPage.step2.expectations.stepIsLoaded();
        });

        it('can traverse between wizard steps', async () => {
          expectAuthorizedReply();
          expectToGetApplicationFromBackend(application);
          await renderPage(ApplicationPage, { query: { id } });
          const applicationPage = getApplicationPageApi(application);
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
