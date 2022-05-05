import { axe } from 'jest-axe';
import {
  expectToCreateYouthApplication,
  expectToGetSchoolsErrorFromBackend,
  expectToGetSchoolsFromBackend,
  expectToReplyErrorWhenCreatingYouthApplication,
} from 'kesaseteli/youth/__tests__/utils/backend/backend-nocks';
import getIndexPageApi from 'kesaseteli/youth/__tests__/utils/components/get-index-page-api';
import renderPage from 'kesaseteli/youth/__tests__/utils/components/render-page';
import { REDIRECT_ERROR_TYPES } from 'kesaseteli/youth/components/constants/creation-error-types';
import YouthIndex from 'kesaseteli/youth/pages';
import headerApi from 'kesaseteli-shared/__tests__/utils/component-apis/header-api';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';
import { waitFor } from 'shared/__tests__/utils/test-utils';
import { DEFAULT_LANGUAGE, Language } from 'shared/i18n/i18n';

describe('frontend/kesaseteli/youth/src/pages/index.tsx', () => {
  it('should not violate accessibility', async () => {
    expectToGetSchoolsFromBackend();
    const {
      renderResult: { container },
    } = renderComponent(<YouthIndex />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('loads school list from backend', async () => {
    const loadSchools = expectToGetSchoolsFromBackend();
    await renderPage(YouthIndex);
    await waitFor(() => {
      loadSchools.done();
    });
  });
  it('shows error toast if loading school list from backend fails', async () => {
    const loadSchools = expectToGetSchoolsErrorFromBackend(404);
    await renderPage(YouthIndex);
    await waitFor(() => {
      loadSchools.done();
    });
    await headerApi.expectations.errorToastIsShown();
  });

  describe('validating application', () => {
    it('shows required validation errors', async () => {
      expectToGetSchoolsFromBackend();
      await renderPage(YouthIndex);
      const indexPageApi = getIndexPageApi();
      await indexPageApi.expectations.pageIsLoaded();
      await indexPageApi.actions.clickSaveButton();

      await indexPageApi.expectations.textInputHasError(
        'first_name',
        'required'
      );
      await indexPageApi.expectations.textInputHasError(
        'last_name',
        'required'
      );
      await indexPageApi.expectations.textInputHasError(
        'social_security_number',
        'required'
      );
      await indexPageApi.expectations.schoolsDropdownHasError('required');
      await indexPageApi.expectations.textInputHasError('email', 'required');
      await indexPageApi.expectations.textInputHasError(
        'phone_number',
        'required'
      );
      await indexPageApi.expectations.checkboxHasError(
        'termsAndConditions',
        'required'
      );
    });

    it('shows min length too short validation errors', async () => {
      expectToGetSchoolsFromBackend();
      await renderPage(YouthIndex);
      const indexPageApi = getIndexPageApi();
      await indexPageApi.expectations.pageIsLoaded();
      indexPageApi.actions.typeInput('postcode', '0123'); // min limit is 5
      await indexPageApi.actions.clickSaveButton();

      await indexPageApi.expectations.textInputHasError(
        'postcode',
        'minLength'
      );
    });

    it('shows max length exceeded validation errors', async () => {
      expectToGetSchoolsFromBackend();
      await renderPage(YouthIndex);
      const indexPageApi = getIndexPageApi();
      await indexPageApi.expectations.pageIsLoaded();

      indexPageApi.actions.typeInput('first_name', 'a'.repeat(129)); // max limit is 128
      indexPageApi.actions.typeInput('last_name', 'a'.repeat(129)); // max limit is 128
      indexPageApi.actions.typeInput('postcode', '123456'); // max limit is 5
      indexPageApi.actions.typeInput('phone_number', 'a'.repeat(65)); // max limit is 254
      indexPageApi.actions.typeInput('email', 'a'.repeat(255)); // max limit is 254
      await indexPageApi.actions.clickSaveButton();

      await indexPageApi.expectations.textInputHasError(
        'first_name',
        'maxLength'
      );
      await indexPageApi.expectations.textInputHasError(
        'last_name',
        'maxLength'
      );
      await indexPageApi.expectations.textInputHasError(
        'postcode',
        'maxLength'
      );
      await indexPageApi.expectations.textInputHasError(
        'phone_number',
        'maxLength'
      );
      await indexPageApi.expectations.textInputHasError('email', 'maxLength');
    });

    it('shows invalid format errors', async () => {
      expectToGetSchoolsFromBackend();
      await renderPage(YouthIndex);
      const indexPageApi = getIndexPageApi();
      await indexPageApi.expectations.pageIsLoaded();

      indexPageApi.actions.typeInput('first_name', '!#$%&()*+/:;<=>?@');
      indexPageApi.actions.typeInput('last_name', '~¡¿÷ˆ]+$');
      // Note! 170915-915L is a fake ssn. See more info (in finnish only):
      // https://www.tuomas.salste.net/doc/tunnus/henkilotunnus.html#keinotunnus
      indexPageApi.actions.typeInput('social_security_number', '170915-915L');
      indexPageApi.actions.typeInput('postcode', 'abcde');
      indexPageApi.actions.typeInput('phone_number', '+44-20-7011-5555');
      indexPageApi.actions.typeInput('email', 'aaaa@bbb');
      await indexPageApi.actions.clickSaveButton();

      await indexPageApi.expectations.textInputHasError(
        'first_name',
        'pattern'
      );
      await indexPageApi.expectations.textInputHasError('last_name', 'pattern');
      await indexPageApi.expectations.textInputHasError('postcode', 'pattern');
      await indexPageApi.expectations.textInputHasError(
        'social_security_number',
        'pattern'
      );
      await indexPageApi.expectations.textInputHasError(
        'phone_number',
        'pattern'
      );
      await indexPageApi.expectations.textInputHasError('email', 'pattern');
    });

    it('shows error messages for unlisted school', async () => {
      expectToGetSchoolsFromBackend();
      await renderPage(YouthIndex);
      const indexPageApi = getIndexPageApi();
      await indexPageApi.expectations.pageIsLoaded();
      await indexPageApi.expectations.inputIsNotPresent('unlistedSchool');
      await indexPageApi.actions.clickSaveButton();
      await indexPageApi.expectations.schoolsDropdownHasError('required');

      await indexPageApi.actions.toggleCheckbox('is_unlisted_school');
      await indexPageApi.expectations.schoolsDropdownIsDisabled();
      await indexPageApi.expectations.schoolsDropdownIsValid();
      await indexPageApi.expectations.inputIsPresent('unlistedSchool');
      await indexPageApi.actions.clickSaveButton();
      await indexPageApi.expectations.textInputHasError(
        'unlistedSchool',
        'required'
      );

      indexPageApi.actions.typeInput('unlistedSchool', 'a'.repeat(257)); // max limit is 257
      await indexPageApi.expectations.textInputHasError(
        'unlistedSchool',
        'maxLength'
      );

      indexPageApi.actions.typeInput('unlistedSchool', '!#$%&()*+/:;<=>?@');
      await indexPageApi.expectations.textInputHasError(
        'unlistedSchool',
        'pattern'
      );

      await indexPageApi.actions.toggleCheckbox('is_unlisted_school');
      await indexPageApi.expectations.schoolsDropdownIsEnabled();

      await indexPageApi.actions.clickSaveButton();
      await indexPageApi.expectations.schoolsDropdownHasError('required');
      await indexPageApi.expectations.inputIsNotPresent('unlistedSchool');
    });
  });

  describe('when valid application', () => {
    it('saves the application with listed school', async () => {
      expectToGetSchoolsFromBackend();
      await renderPage(YouthIndex);
      const indexPageApi = getIndexPageApi();
      await indexPageApi.expectations.pageIsLoaded();
      await indexPageApi.actions.fillTheFormWithListedSchoolAndSave({
        backendExpectation: expectToCreateYouthApplication,
      });
    });

    it('saves the application with unlisted school', async () => {
      expectToGetSchoolsFromBackend();
      await renderPage(YouthIndex);
      const indexPageApi = getIndexPageApi();
      await indexPageApi.expectations.pageIsLoaded();
      await indexPageApi.actions.fillTheFormWithUnlistedSchoolAndSave({
        backendExpectation: expectToCreateYouthApplication,
      });
    });

    it('saves the application with application language and redirects to thank you page', async () => {
      expectToGetSchoolsFromBackend();
      const language: Language = 'sv';
      const spyPush = jest.fn();
      await renderPage(YouthIndex, { locale: language, push: spyPush });
      const indexPageApi = getIndexPageApi();
      await indexPageApi.expectations.pageIsLoaded();

      await indexPageApi.actions.fillTheFormWithListedSchoolAndSave({
        language,
        backendExpectation: expectToCreateYouthApplication,
      });
      await waitFor(() =>
        expect(spyPush).toHaveBeenCalledWith(`${language}/thankyou`)
      );
    });

    it('shows error toaster when backend gives unknown bad request -error', async () => {
      expectToGetSchoolsFromBackend();
      await renderPage(YouthIndex);
      const indexPageApi = getIndexPageApi();
      await indexPageApi.expectations.pageIsLoaded();

      await indexPageApi.actions.fillTheFormWithListedSchoolAndSave({
        backendExpectation: expectToReplyErrorWhenCreatingYouthApplication(400),
      });
      await headerApi.expectations.errorToastIsShown();
    });

    it('redirects to error page when backend gives internal server error', async () => {
      expectToGetSchoolsFromBackend();
      const spyPush = jest.fn();
      await renderPage(YouthIndex, { push: spyPush });
      const indexPageApi = getIndexPageApi();
      await indexPageApi.expectations.pageIsLoaded();

      await indexPageApi.actions.fillTheFormWithListedSchoolAndSave({
        backendExpectation: expectToReplyErrorWhenCreatingYouthApplication(500),
      });
      await waitFor(() =>
        expect(spyPush).toHaveBeenCalledWith(`${DEFAULT_LANGUAGE}/500`)
      );
    });

    for (const errorType of REDIRECT_ERROR_TYPES) {
      it(`redirects to ${errorType} error page when backend returns respective bad request type`, async () => {
        expectToGetSchoolsFromBackend();
        const spyPush = jest.fn();
        await renderPage(YouthIndex, { push: spyPush });
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
            `${DEFAULT_LANGUAGE}/${errorType}`
          )
        );
      });
    }
    for (const errorType of REDIRECT_ERROR_TYPES) {
      it(`redirects to ${errorType} error page when backend returns respective bad request type`, async () => {
        expectToGetSchoolsFromBackend();
        const spyPush = jest.fn();
        await renderPage(YouthIndex, { push: spyPush });
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
            `${DEFAULT_LANGUAGE}/${errorType}`
          )
        );
      });
    }
  });
  describe('when recheck error', () => {
    it(`shows error summary and 'send it anyway' -link when backend returns 'please_recheck_data'-error`, async () => {
      expectToGetSchoolsFromBackend();
      const spyPush = jest.fn();
      await renderPage(YouthIndex, { push: spyPush });
      const indexPageApi = getIndexPageApi();
      await indexPageApi.expectations.pageIsLoaded();

      await indexPageApi.actions.fillTheFormWithListedSchoolAndSave({
        backendExpectation: expectToReplyErrorWhenCreatingYouthApplication(
          400,
          'please_recheck_data'
        ),
      });
      await indexPageApi.expectations.checkFormSummaryIsPresent();
      await indexPageApi.expectations.forceSubmitLinkIsPresent();
    });

    it(`hides 'send it anyway' -link when user changes form value`, async () => {
      expectToGetSchoolsFromBackend();
      const spyPush = jest.fn();
      await renderPage(YouthIndex, { push: spyPush });
      const indexPageApi = getIndexPageApi();
      await indexPageApi.expectations.pageIsLoaded();

      await indexPageApi.actions.fillTheFormWithListedSchoolAndSave({
        backendExpectation: expectToReplyErrorWhenCreatingYouthApplication(
          400,
          'please_recheck_data'
        ),
      });
      await indexPageApi.expectations.forceSubmitLinkIsPresent();
      indexPageApi.actions.typeInput('email', 'other@mail.com');
      indexPageApi.expectations.forceSubmitLinkIsNotPresent();
    });

    describe('when clicking force submit link', () => {
      it('saves the application with request_additional_information and redirects to thank you page', async () => {
        expectToGetSchoolsFromBackend();
        const language: Language = 'sv';
        const spyPush = jest.fn();
        await renderPage(YouthIndex, { locale: language, push: spyPush });
        const indexPageApi = getIndexPageApi();
        await indexPageApi.expectations.pageIsLoaded();

        await indexPageApi.actions.fillTheFormWithListedSchoolAndSave({
          language,
          backendExpectation: expectToReplyErrorWhenCreatingYouthApplication(
            400,
            'please_recheck_data'
          ),
        });
        await indexPageApi.actions.clickForceSubmitLink({
          language,
          backendExpectation: expectToCreateYouthApplication,
        });
        await waitFor(() =>
          expect(spyPush).toHaveBeenCalledWith(`${language}/thankyou`)
        );
      });

      it('shows error toaster when backend gives unknown bad request -error', async () => {
        expectToGetSchoolsFromBackend();
        await renderPage(YouthIndex);
        const indexPageApi = getIndexPageApi();
        await indexPageApi.expectations.pageIsLoaded();

        await indexPageApi.actions.fillTheFormWithListedSchoolAndSave({
          backendExpectation: expectToReplyErrorWhenCreatingYouthApplication(
            400,
            'please_recheck_data'
          ),
        });
        await indexPageApi.actions.clickForceSubmitLink({
          backendExpectation:
            expectToReplyErrorWhenCreatingYouthApplication(400),
        });
        await headerApi.expectations.errorToastIsShown();
      });

      it('redirects to error page when backend gives internal server error', async () => {
        expectToGetSchoolsFromBackend();
        const spyPush = jest.fn();
        await renderPage(YouthIndex, { push: spyPush });
        const indexPageApi = getIndexPageApi();
        await indexPageApi.expectations.pageIsLoaded();

        await indexPageApi.actions.fillTheFormWithListedSchoolAndSave({
          backendExpectation: expectToReplyErrorWhenCreatingYouthApplication(
            400,
            'please_recheck_data'
          ),
        });
        await indexPageApi.actions.clickForceSubmitLink({
          backendExpectation:
            expectToReplyErrorWhenCreatingYouthApplication(500),
        });
        await waitFor(() =>
          expect(spyPush).toHaveBeenCalledWith(`${DEFAULT_LANGUAGE}/500`)
        );
      });

      for (const errorType of REDIRECT_ERROR_TYPES) {
        it(`redirects to ${errorType} error page when backend returns respective bad request type`, async () => {
          expectToGetSchoolsFromBackend();
          const spyPush = jest.fn();
          await renderPage(YouthIndex, { push: spyPush });
          const indexPageApi = getIndexPageApi();
          await indexPageApi.expectations.pageIsLoaded();

          await indexPageApi.actions.fillTheFormWithListedSchoolAndSave({
            backendExpectation: expectToReplyErrorWhenCreatingYouthApplication(
              400,
              'please_recheck_data'
            ),
          });
          await indexPageApi.actions.clickForceSubmitLink({
            backendExpectation: expectToReplyErrorWhenCreatingYouthApplication(
              400,
              errorType
            ),
          });
          await waitFor(() =>
            expect(spyPush).toHaveBeenCalledWith(
              `${DEFAULT_LANGUAGE}/${errorType}`
            )
          );
        });
      }
    });
  });
});
