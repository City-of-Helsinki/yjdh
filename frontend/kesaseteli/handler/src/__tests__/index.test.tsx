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
    const spyPush = jest.fn();
    await renderPage(HandlerIndex, { push: spyPush, query: { id: '123-abc' } });
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

  it(`shows youth application data wiht unlisted school`, async () => {
    const application = fakeCreatedYouthApplication({ isUnlistedSchool: true });
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
});
