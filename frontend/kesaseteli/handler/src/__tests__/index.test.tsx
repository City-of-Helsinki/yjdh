import { axe } from 'jest-axe';
import {
  expectToGetYouthApplication,
  expectToGetYouthApplicationError,
} from 'kesaseteli/handler/__tests__/utils/backend/backend-nocks';
import getIndexPageApi from 'kesaseteli/handler/__tests__/utils/components/get-index-page-api';
import renderPage from 'kesaseteli/handler/__tests__/utils/components/render-page';
import HandlerIndex from 'kesaseteli/handler/pages';
import headerApi from 'kesaseteli-shared/__tests__/utils/component-apis/header-api';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import { fakeCreatedYouthApplication } from 'kesaseteli-shared/__tests__/utils/fake-objects';
import {
  YOUTH_APPLICATION_STATUS_COMPLETED,
  YOUTH_APPLICATION_STATUS_HANDLER_CANNOT_PROCEED,
  YOUTH_APPLICATION_STATUS_WAITING_FOR_HANDLER_ACTION,
} from 'kesaseteli-shared/constants/status-constants';
import React from 'react';
import { waitFor } from 'shared/__tests__/utils/test-utils';
import { DEFAULT_LANGUAGE } from 'shared/i18n/i18n';
import { convertToUIDateAndTimeFormat } from 'shared/utils/date.utils';

describe('frontend/kesaseteli/handler/src/pages/index.tsx', () => {
  it('should not violate accessibility', async () => {
    const {
      renderResult: { container },
    } = renderComponent(<HandlerIndex />, { query: {} });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it(`shows error toast when backend returns bad request`, async () => {
    expectToGetYouthApplicationError('123-abc', 400);
    await renderPage(HandlerIndex, { query: { id: '123-abc' } });
    await headerApi.expectations.errorToastIsShown();
  });

  it(`redirects to 500 -error page when backend returns unexpected error`, async () => {
    expectToGetYouthApplicationError('123-abc', 500);
    const spyPush = jest.fn();
    await renderPage(HandlerIndex, { push: spyPush, query: { id: '123-abc' } });
    await waitFor(() =>
      expect(spyPush).toHaveBeenCalledWith(`${DEFAULT_LANGUAGE}/500`)
    );
  });

  it(`shows that application is not found when id query param is not present`, async () => {
    await renderPage(HandlerIndex, { query: {} });
    await getIndexPageApi().expectations.applicationWasNotFound();
  });

  it(`shows that application is not found when backend returns 404`, async () => {
    expectToGetYouthApplicationError('123-abc', 404);
    await renderPage(HandlerIndex, { query: { id: '123-abc' } });
    await getIndexPageApi().expectations.applicationWasNotFound();
  });

  it(`shows youth application data`, async () => {
    const application = fakeCreatedYouthApplication();
    expectToGetYouthApplication(application);
    await renderPage(HandlerIndex, { query: { id: application.id } });
    const indexPageApi = getIndexPageApi(application);
    await indexPageApi.expectations.pageIsLoaded();
    await indexPageApi.expectations.fieldValueIsPresent(
      'receipt_confirmed_at',
      convertToUIDateAndTimeFormat
    );
    await indexPageApi.expectations.nameIsPresent(application);
    await indexPageApi.expectations.fieldValueIsPresent(
      'social_security_number'
    );
    await indexPageApi.expectations.fieldValueIsPresent('postcode');
    await indexPageApi.expectations.fieldValueIsPresent('school');
    await indexPageApi.expectations.fieldValueIsPresent('phone_number');
    await indexPageApi.expectations.fieldValueIsPresent('email');
  });

  it(`shows youth application data with unlisted school`, async () => {
    const application = fakeCreatedYouthApplication({
      is_unlisted_school: true,
    });
    expectToGetYouthApplication(application);
    const spyPush = jest.fn();
    await renderPage(HandlerIndex, {
      push: spyPush,
      query: { id: application.id },
    });
    const indexPageApi = getIndexPageApi(application);
    await indexPageApi.expectations.pageIsLoaded();
    await indexPageApi.expectations.fieldValueIsPresent(
      'school',
      (school) => `${school ?? ''} (Koulua ei löytynyt listalta)`
    );
  });

  for (const status of YOUTH_APPLICATION_STATUS_WAITING_FOR_HANDLER_ACTION) {
    describe(`when application status is "${status}"`, () => {
      it('shows accept and reject buttons', async () => {
        const application = fakeCreatedYouthApplication({ status });
        expectToGetYouthApplication(application);
        await renderPage(HandlerIndex, {
          query: { id: application.id },
        });
        const indexPageApi = getIndexPageApi(application);
        await indexPageApi.expectations.pageIsLoaded();
        await indexPageApi.expectations.actionButtonsArePresent();
      });
    });
  }

  for (const status of YOUTH_APPLICATION_STATUS_HANDLER_CANNOT_PROCEED) {
    describe(`when application status is "${status}"`, () => {
      it('shows notification message and buttons are not present', async () => {
        const application = fakeCreatedYouthApplication({ status });
        expectToGetYouthApplication(application);
        await renderPage(HandlerIndex, {
          query: { id: application.id },
        });
        const indexPageApi = getIndexPageApi(application);
        await indexPageApi.expectations.pageIsLoaded();
        indexPageApi.expectations.actionButtonsAreNotPresent();
        await indexPageApi.expectations.statusNotificationIsPresent(status);
      });
    });
  }
  for (const status of YOUTH_APPLICATION_STATUS_COMPLETED) {
    const operationType = status === 'accepted' ? 'accept' : 'reject';
    describe(`when clicking cancel-button on ${operationType}-confirmation dialog`, () => {
      it(`cancels the operation ${operationType}`, async () => {
        const application = fakeCreatedYouthApplication({
          status: 'awaiting_manual_processing',
        });
        expectToGetYouthApplication(application);
        await renderPage(HandlerIndex, {
          query: { id: application.id },
        });
        const indexPageApi = getIndexPageApi(application);
        await indexPageApi.expectations.actionButtonsArePresent();
        indexPageApi.actions.clickCompleteButton(operationType);
        await indexPageApi.expectations.showsConfirmDialog(operationType);
        await indexPageApi.actions.clickCancelButton();
        await indexPageApi.expectations.actionButtonsArePresent();
      });
    });
    describe(`when clicking confirm button on ${operationType}-confirmation dialog`, () => {
      it(`shows a message that application is ${status}`, async () => {
        const application = fakeCreatedYouthApplication({
          status: 'awaiting_manual_processing',
        });
        expectToGetYouthApplication(application);
        await renderPage(HandlerIndex, {
          query: { id: application.id },
        });
        const indexPageApi = getIndexPageApi(application);
        await indexPageApi.expectations.actionButtonsArePresent();
        indexPageApi.actions.clickCompleteButton(operationType);
        await indexPageApi.expectations.showsConfirmDialog(operationType);
        await indexPageApi.actions.clickConfirmButton(operationType);
        await indexPageApi.expectations.statusNotificationIsPresent(status);
      });
      it(`shows error toast when backend returns bad request`, async () => {
        const application = fakeCreatedYouthApplication({
          status: 'awaiting_manual_processing',
        });
        expectToGetYouthApplication(application);
        await renderPage(HandlerIndex, {
          query: { id: application.id },
        });
        const indexPageApi = getIndexPageApi(application);
        await indexPageApi.expectations.actionButtonsArePresent();
        indexPageApi.actions.clickCompleteButton(operationType);
        await indexPageApi.expectations.showsConfirmDialog(operationType);
        await indexPageApi.actions.clickConfirmButton(operationType, 400);
        await headerApi.expectations.errorToastIsShown();
      });

      it(`redirects to 500 -error page when backend returns unexpected error`, async () => {
        const application = fakeCreatedYouthApplication({
          status: 'awaiting_manual_processing',
        });
        expectToGetYouthApplication(application);
        const spyPush = jest.fn();
        await renderPage(HandlerIndex, {
          push: spyPush,
          query: { id: application.id },
        });
        const indexPageApi = getIndexPageApi(application);
        await indexPageApi.expectations.actionButtonsArePresent();
        indexPageApi.actions.clickCompleteButton(operationType);
        await indexPageApi.expectations.showsConfirmDialog(operationType);
        await indexPageApi.actions.clickConfirmButton(operationType, 500);
        await waitFor(() =>
          expect(spyPush).toHaveBeenCalledWith(`${DEFAULT_LANGUAGE}/500`)
        );
      });
    });
  }
});
