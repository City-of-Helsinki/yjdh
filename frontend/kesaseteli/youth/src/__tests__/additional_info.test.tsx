import { axe } from 'jest-axe';
import {
  expectToGetYouthApplicationStatus,
  expectToGetYouthApplicationStatusErrorFromBackend,
} from 'kesaseteli/youth/__tests__/utils/backend/backend-nocks';
import getAdditionalInfoPageApi from 'kesaseteli/youth/__tests__/utils/components/get-additional-info-page-api';
import renderComponent from 'kesaseteli/youth/__tests__/utils/components/render-component';
import renderPage from 'kesaseteli/youth/__tests__/utils/components/render-page';
import AdditionalInfoPage from 'kesaseteli/youth/pages/additional_info';
import headerApi from 'kesaseteli-shared/__tests__/utils/component-apis/header-api';
import { fakeAdditionalInfoApplication } from 'kesaseteli-shared/__tests__/utils/fake-objects';
import YouthApplicationStatusType from 'kesaseteli-shared/types/youth-application-status-type';
import React from 'react';
import { waitFor } from 'shared/__tests__/utils/test-utils';
import { DEFAULT_LANGUAGE } from 'shared/i18n/i18n';

describe('frontend/kesaseteli/youth/src/pages/additional_info.tsx', () => {
  const APPLICATION_ID = 'abc-123';

  it('should not violate accessibility', async () => {
    const {
      renderResult: { container },
    } = renderComponent(<AdditionalInfoPage />, { query: {} });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it(`shows error toast when backend returns bad request`, async () => {
    expectToGetYouthApplicationStatusErrorFromBackend(APPLICATION_ID, 400);
    renderPage(AdditionalInfoPage, { query: { id: APPLICATION_ID } });
    await headerApi.expectations.errorToastIsShown();
  });

  it(`redirects to 500 -error page when backend returns unexpected error`, async () => {
    expectToGetYouthApplicationStatusErrorFromBackend(APPLICATION_ID, 500);
    const spyPush = jest.fn();
    renderPage(AdditionalInfoPage, {
      push: spyPush,
      query: { id: APPLICATION_ID },
    });
    await waitFor(() =>
      expect(spyPush).toHaveBeenCalledWith(`${DEFAULT_LANGUAGE}/500`)
    );
  });

  it(`shows that application is not found when id query param is not present`, async () => {
    renderPage(AdditionalInfoPage, { query: {} });
    await getAdditionalInfoPageApi().expectations.notificationIsPresent(
      'notFound'
    );
  });

  it(`shows that application is not found when backend returns 404`, async () => {
    expectToGetYouthApplicationStatusErrorFromBackend(APPLICATION_ID, 404);
    renderPage(AdditionalInfoPage, { query: { id: APPLICATION_ID } });
    await getAdditionalInfoPageApi().expectations.notificationIsPresent(
      'notFound'
    );
  });

  describe(`when application status is "additional_information_requested"`, () => {
    it('shows additional info form', async () => {
      expectToGetYouthApplicationStatus(APPLICATION_ID, {
        status: 'additional_information_requested',
      });
      renderPage(AdditionalInfoPage, {
        query: { id: APPLICATION_ID },
      });
      const additionalInfoPageApi = getAdditionalInfoPageApi();
      await additionalInfoPageApi.expectations.formIsPresent();
    });
  });

  for (const status of [
    'additional_information_provided',
    'accepted',
    'rejected',
  ] as YouthApplicationStatusType[]) {
    describe(`when application status is "${status as string}"`, () => {
      it('shows that additional info is sent', async () => {
        expectToGetYouthApplicationStatus(APPLICATION_ID, { status });
        renderPage(AdditionalInfoPage, {
          query: { id: APPLICATION_ID },
        });
        const additionalInfoPageApi = getAdditionalInfoPageApi();
        await additionalInfoPageApi.expectations.notificationIsPresent('sent');
      });
    });
  }

  for (const status of [
    'submitted',
    'awaiting_manual_processing',
  ] as YouthApplicationStatusType[]) {
    describe(`when application status is "${status as string}"`, () => {
      it('shows that application is not found', async () => {
        expectToGetYouthApplicationStatus(APPLICATION_ID, { status });
        renderPage(AdditionalInfoPage, {
          query: { id: APPLICATION_ID },
        });
        const additionalInfoPageApi = getAdditionalInfoPageApi();
        await additionalInfoPageApi.expectations.notificationIsPresent(
          'notFound'
        );
      });
    });
  }
  describe(`when submitting form`, () => {
    it(`shows errors if empty values`, async () => {
      expectToGetYouthApplicationStatus(APPLICATION_ID, {
        status: 'additional_information_requested',
      });
      renderPage(AdditionalInfoPage, {
        query: { id: APPLICATION_ID },
      });
      const additionalInfoPageApi = getAdditionalInfoPageApi(APPLICATION_ID);
      await additionalInfoPageApi.expectations.formIsPresent();
      await additionalInfoPageApi.actions.clickSendButton();
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
        expectToGetYouthApplicationStatus(APPLICATION_ID, {
          status: 'additional_information_requested',
        });
        renderPage(AdditionalInfoPage, {
          query: { id: APPLICATION_ID },
        });
        const { additional_info_description, additional_info_user_reasons } =
          fakeAdditionalInfoApplication();
        const additionalInfoPageApi = getAdditionalInfoPageApi(APPLICATION_ID);
        await additionalInfoPageApi.expectations.formIsPresent();
        await additionalInfoPageApi.actions.clickAndSelectReasonsFromDropdown(
          additional_info_user_reasons
        );
        await additionalInfoPageApi.actions.inputDescription(
          additional_info_description
        );
        await additionalInfoPageApi.actions.clickSendButton(200);
        await additionalInfoPageApi.expectations.notificationIsPresent('sent');
      });

      it(`with changed language`, async () => {
        expectToGetYouthApplicationStatus(APPLICATION_ID, {
          status: 'additional_information_requested',
        });
        renderPage(AdditionalInfoPage, {
          query: { id: APPLICATION_ID },
          locale: 'sv',
        });
        const { additional_info_description, additional_info_user_reasons } =
          fakeAdditionalInfoApplication();
        const additionalInfoPageApi = getAdditionalInfoPageApi(APPLICATION_ID, {
          language: 'sv',
        });
        await additionalInfoPageApi.expectations.formIsPresent();
        await additionalInfoPageApi.actions.clickAndSelectReasonsFromDropdown(
          additional_info_user_reasons
        );
        await additionalInfoPageApi.actions.inputDescription(
          additional_info_description
        );
        await additionalInfoPageApi.actions.clickSendButton(200);
        await additionalInfoPageApi.expectations.notificationIsPresent('sent');
      });
    });
  });
});
