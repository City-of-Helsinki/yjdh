import { axe } from 'jest-axe';
import {
  expectToGetYouthApplicationStatus,
  expectToGetYouthApplicationStatusErrorFromBackend,
} from 'kesaseteli/youth/__tests__/utils/backend/backend-nocks';
import getAdditionalInfoPageApi from 'kesaseteli/youth/__tests__/utils/components/get-additional-info-page-api';
import renderPage from 'kesaseteli/youth/__tests__/utils/components/render-page';
import AdditionalInfoPage from 'kesaseteli/youth/pages/additional_info';
import headerApi from 'kesaseteli-shared/__tests__/utils/component-apis/header-api';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import { fakeAdditionalInfoApplication } from 'kesaseteli-shared/__tests__/utils/fake-objects';
import React from 'react';
import { waitFor } from 'shared/__tests__/utils/test-utils';
import { DEFAULT_LANGUAGE } from 'shared/i18n/i18n';

describe('frontend/kesaseteli/youth/src/pages/additional_info.tsx', () => {
  it('should not violate accessibility', async () => {
    const {
      renderResult: { container },
    } = renderComponent(<AdditionalInfoPage />, { query: {} });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it(`shows error toast when backend returns bad request`, async () => {
    expectToGetYouthApplicationStatusErrorFromBackend('123-abc', 400);
    await renderPage(AdditionalInfoPage, { query: { id: '123-abc' } });
    await headerApi.expectations.errorToastIsShown();
  });

  it(`redirects to 500 -error page when backend returns unexpected error`, async () => {
    expectToGetYouthApplicationStatusErrorFromBackend('123-abc', 500);
    const spyPush = jest.fn();
    await renderPage(AdditionalInfoPage, {
      push: spyPush,
      query: { id: '123-abc' },
    });
    await waitFor(() =>
      expect(spyPush).toHaveBeenCalledWith(`${DEFAULT_LANGUAGE}/500`)
    );
  });

  it(`shows that application is not found when id query param is not present`, async () => {
    await renderPage(AdditionalInfoPage, { query: {} });
    await getAdditionalInfoPageApi().expectations.applicationWasNotFound();
  });

  it(`shows that application is not found when backend returns 404`, async () => {
    expectToGetYouthApplicationStatusErrorFromBackend('123-abc', 404);
    await renderPage(AdditionalInfoPage, { query: { id: '123-abc' } });
    await getAdditionalInfoPageApi().expectations.applicationWasNotFound();
  });

  describe(`when application status is "additional_information_requested"`, () => {
    it('shows additional info form', async () => {
      expectToGetYouthApplicationStatus('123-abc', {
        status: 'additional_information_requested',
      });
      await renderPage(AdditionalInfoPage, {
        query: { id: '123-abc' },
      });
      const additionalInfoPageApi = getAdditionalInfoPageApi();
      await additionalInfoPageApi.expectations.formIsPresent();
    });
  });

  for (const status of [
    'additional_information_provided',
    'accepted',
    'rejected',
  ]) {
    describe(`when application status is "${status}"`, () => {
      it('shows that additional info is sent', async () => {
        expectToGetYouthApplicationStatus('123-abc', { status });
        await renderPage(AdditionalInfoPage, {
          query: { id: '123-abc' },
        });
        const additionalInfoPageApi = getAdditionalInfoPageApi();
        await additionalInfoPageApi.expectations.applicationWasSent();
      });
    });
  }

  for (const status of ['submitted', 'awaiting_manual_processing']) {
    describe(`when application status is "${status}"`, () => {
      it('shows that application is not found', async () => {
        expectToGetYouthApplicationStatus('123-abc', { status });
        await renderPage(AdditionalInfoPage, {
          query: { id: '123-abc' },
        });
        const additionalInfoPageApi = getAdditionalInfoPageApi();
        await additionalInfoPageApi.expectations.applicationWasNotFound();
      });
    });
  }
  describe(`when submitting form`, () => {
    it(`shows errors if empty values`, async () => {
      expectToGetYouthApplicationStatus('123-abc', {
        status: 'additional_information_requested',
      });
      await renderPage(AdditionalInfoPage, {
        query: { id: '123-abc' },
      });
      const additionalInfoPageApi = getAdditionalInfoPageApi();
      await additionalInfoPageApi.expectations.formIsPresent();
      additionalInfoPageApi.actions.clickSendButton();
      await additionalInfoPageApi.expectations.exceptionTypeDropDownHasError(
        /tieto puuttuu/i
      );
      await additionalInfoPageApi.expectations.textInputHasError(
        'additional_info_description',
        /tieto puuttuu/i
      );
    });

    describe(`sends filled form data to the backend`, () => {
      it(`with default language`, async () => {
        expectToGetYouthApplicationStatus('123-abc', {
          status: 'additional_information_requested',
        });
        await renderPage(AdditionalInfoPage, {
          query: { id: '123-abc' },
        });
        const { additional_info_description, additional_info_user_reasons } =
          fakeAdditionalInfoApplication();
        const additionalInfoPageApi = getAdditionalInfoPageApi({
          id: '123-abc',
        });
        await additionalInfoPageApi.expectations.formIsPresent();
        await additionalInfoPageApi.actions.clickAndSelectReasonsFromDropdown(
          additional_info_user_reasons
        );
        await additionalInfoPageApi.actions.inputDescription(
          additional_info_description as string
        );
        additionalInfoPageApi.actions.clickSendButton(200);
        await additionalInfoPageApi.expectations.applicationWasSent();
      });

      it(`with changed language`, async () => {
        expectToGetYouthApplicationStatus('123-abc', {
          status: 'additional_information_requested',
        });
        await renderPage(AdditionalInfoPage, {
          query: { id: '123-abc' },
          locale: 'sv',
        });
        const { additional_info_description, additional_info_user_reasons } =
          fakeAdditionalInfoApplication();
        const additionalInfoPageApi = getAdditionalInfoPageApi({
          language: 'sv',
          id: '123-abc',
        });
        await additionalInfoPageApi.expectations.formIsPresent();
        await additionalInfoPageApi.actions.clickAndSelectReasonsFromDropdown(
          additional_info_user_reasons
        );
        await additionalInfoPageApi.actions.inputDescription(
          additional_info_description as string
        );
        additionalInfoPageApi.actions.clickSendButton(200);
        await additionalInfoPageApi.expectations.applicationWasSent();
      });
    });
  });
});
