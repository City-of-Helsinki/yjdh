import { axe } from 'jest-axe';
import {
  expectToCreateYouthApplication,
  expectToReplyErrorWhenCreatingYouthApplication,
} from 'kesaseteli/youth/__tests__/utils/backend/backend-nocks';
import getIndexPageApi from 'kesaseteli/youth/__tests__/utils/components/get-index-page-api';
import renderPage from 'kesaseteli/youth/__tests__/utils/components/render-page';
import YouthIndex from 'kesaseteli/youth/pages';
import headerApi from 'kesaseteli-shared/__tests__/utils/component-apis/header-api';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';
import { waitFor } from 'shared/__tests__/utils/test-utils';
import { DEFAULT_LANGUAGE, Language } from 'shared/i18n/i18n';

const texts = {
  required: /tieto puuttuu/i,
  maxLength: /syöttämäsi tieto on liian pitkä/i,
  wrongFormat: /syöttämäsi tieto on virheellistä muotoa/i,
};

describe('frontend/kesaseteli/youth/src/pages/index.tsx', () => {
  it('should not violate accessibility', async () => {
    const {
      renderResult: { container },
    } = renderComponent(<YouthIndex />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  describe('validating application', () => {
    it('shows required validation errors', async () => {
      await renderPage(YouthIndex);
      const indexPageApi = getIndexPageApi();
      await indexPageApi.expectations.pageIsLoaded();
      await indexPageApi.actions.clickSaveButton();

      await indexPageApi.expectations.textInputHasError(
        'first_name',
        texts.required
      );
      await indexPageApi.expectations.textInputHasError(
        'last_name',
        texts.required
      );
      await indexPageApi.expectations.textInputHasError(
        'social_security_number',
        texts.required
      );
      await indexPageApi.expectations.schoolDropdownHasError(texts.required);
      await indexPageApi.expectations.textInputHasError(
        'email',
        texts.required
      );
      await indexPageApi.expectations.textInputHasError(
        'phone_number',
        texts.required
      );
      await indexPageApi.expectations.checkboxHasError(
        /olen lukenut palvelun käyttöehdot ja hyväksyn ne/i,
        texts.required
      );
    });

    it('shows max length exceeded validation errors', async () => {
      await renderPage(YouthIndex);
      const indexPageApi = getIndexPageApi();
      await indexPageApi.expectations.pageIsLoaded();

      indexPageApi.actions.typeInput('first_name', 'a'.repeat(257)); // max limit is 257
      indexPageApi.actions.typeInput('last_name', 'a'.repeat(257)); // max limit is 257
      indexPageApi.actions.typeInput('phone_number', 'a'.repeat(65)); // max limit is 254
      indexPageApi.actions.typeInput('email', 'a'.repeat(255)); // max limit is 254
      await indexPageApi.actions.clickSaveButton();

      await indexPageApi.expectations.textInputHasError(
        'first_name',
        texts.maxLength
      );
      await indexPageApi.expectations.textInputHasError(
        'last_name',
        texts.maxLength
      );
      await indexPageApi.expectations.textInputHasError(
        'phone_number',
        texts.maxLength
      );
      await indexPageApi.expectations.textInputHasError(
        'email',
        texts.maxLength
      );
    });

    it('shows invalid format errors', async () => {
      await renderPage(YouthIndex);
      const indexPageApi = getIndexPageApi();
      await indexPageApi.expectations.pageIsLoaded();

      indexPageApi.actions.typeInput('first_name', '!#$%&()*+/:;<=>?@');
      indexPageApi.actions.typeInput('last_name', '~¡¿÷ˆ]+$');
      indexPageApi.actions.typeInput('social_security_number', '111111-111D');
      indexPageApi.actions.typeInput('phone_number', '+44-20-7011-5555');
      indexPageApi.actions.typeInput('email', 'aaaa@bbb');
      await indexPageApi.actions.clickSaveButton();

      await indexPageApi.expectations.textInputHasError(
        'first_name',
        texts.wrongFormat
      );
      await indexPageApi.expectations.textInputHasError(
        'last_name',
        texts.wrongFormat
      );
      await indexPageApi.expectations.textInputHasError(
        'phone_number',
        texts.wrongFormat
      );
      await indexPageApi.expectations.textInputHasError(
        'email',
        texts.wrongFormat
      );
    });

    it('shows error messages for unlisted school', async () => {
      await renderPage(YouthIndex);
      const indexPageApi = getIndexPageApi();
      await indexPageApi.expectations.pageIsLoaded();
      await indexPageApi.expectations.inputIsNotPresent('unlisted_school');
      await indexPageApi.actions.clickSaveButton();
      await indexPageApi.expectations.schoolDropdownHasError(texts.required);

      await indexPageApi.actions.toggleCheckbox('is_unlisted_school');
      await indexPageApi.expectations.schoolDropdownIsDisabled();
      await indexPageApi.expectations.schoolDropdownIsValid();
      await indexPageApi.expectations.inputIsPresent('unlisted_school');
      await indexPageApi.actions.clickSaveButton();
      await indexPageApi.expectations.textInputHasError(
        'unlisted_school',
        texts.required
      );

      indexPageApi.actions.typeInput('unlisted_school', 'a'.repeat(257)); // max limit is 257
      await indexPageApi.expectations.textInputHasError(
        'unlisted_school',
        texts.maxLength
      );

      indexPageApi.actions.typeInput('unlisted_school', '!#$%&()*+/:;<=>?@');
      await indexPageApi.expectations.textInputHasError(
        'unlisted_school',
        texts.wrongFormat
      );

      await indexPageApi.actions.toggleCheckbox('is_unlisted_school');
      await indexPageApi.expectations.schoolDropdownIsEnabled();

      await indexPageApi.actions.clickSaveButton();
      await indexPageApi.expectations.schoolDropdownHasError(texts.required);
      await indexPageApi.expectations.inputIsNotPresent('unlisted_school');
    });
  });

  describe('when valid application', () => {
    it('saves the application with listed school', async () => {
      await renderPage(YouthIndex);
      const indexPageApi = getIndexPageApi();
      await indexPageApi.expectations.pageIsLoaded();

      await indexPageApi.actions.fillTheFormWithListedSchoolAndSave({
        backendExpectation: expectToCreateYouthApplication,
      });
    });

    it('saves the application with unlisted school', async () => {
      await renderPage(YouthIndex);
      const indexPageApi = getIndexPageApi();
      await indexPageApi.expectations.pageIsLoaded();
      await indexPageApi.actions.fillTheFormWithUnlistedSchoolAndSave({
        backendExpectation: expectToCreateYouthApplication,
      });
    });

    it('saves the application with application language', async () => {
      const language: Language = 'sv';
      await renderPage(YouthIndex, { locale: language });
      const indexPageApi = getIndexPageApi();
      await indexPageApi.expectations.pageIsLoaded();

      await indexPageApi.actions.fillTheFormWithListedSchoolAndSave({
        language,
        backendExpectation: expectToCreateYouthApplication,
      });
    });

    it('shows error toaster when backend gives bad request -error', async () => {
      await renderPage(YouthIndex);
      const indexPageApi = getIndexPageApi();
      await indexPageApi.expectations.pageIsLoaded();

      await indexPageApi.actions.fillTheFormWithListedSchoolAndSave({
        backendExpectation: expectToReplyErrorWhenCreatingYouthApplication(400),
      });
      await headerApi.expectations.errorToastIsShown();
    });

    it('redirects to error page when backend gives internal server error', async () => {
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
  });
});
